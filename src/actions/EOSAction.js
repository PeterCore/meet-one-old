import Eos from "eosjs";

import { contributorInfo, IS_DEBUG } from '../env';
import { netNewAccount, getEOSNetworks, getHistoryNetwork, getEOSTokens, getExchangeList } from "../net/DiscoveryNet";
import { getAccountTokens, getEOSPrice, getTokenListPrice, getAccountTokensPromise } from "../net/3thNet";
import eosActionTypes from "../reducers/eos/eosActionTypes";
import chainActionTypes from "../reducers/chain/chainActionTypes";
import { getNetType, getSupportTokens, getCurrentNetwork } from "../actions/ChainAction";
import { getStore } from "../setup";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import AnalyticsUtil from "../util/AnalyticsUtil";
import Util from "../util/Util";

const CryptoJS = require( "crypto-js" );


// 根据节点配置中的domains随机取用一个地址 - 似乎现在的domains都是一个，没什么卵用
const _getUrl = ( nodeAddressList ) => {
    nodeAddressList.sort( function ( a, b ) {
        return 0.5 - Math.random()
    } );
    return nodeAddressList[ 0 ]
};

// 格式化eos返回的描述资产的字符串
const _parseAsset = asset => asset.split(' ')[0];

/**
 * 重新获取EOSJS的实例（全局状态）
 */
export function updateEOS(account, privateKey, callback) {
    return (dispatch) => {
        // 判断一下，如果私钥相同的话，就不去重新 config
        const store = getStore();
        const eos_prev = store.getState().eosStore.globalEOS;
        if (privateKey && eos_prev && eos_prev.accountPrivateKeyData === privateKey) {
            console.log('skip to new eosjs object');
            callback && callback(null, eos_prev);
            return;
        }
        // 获取当前选中的节点
        const currentNetWork = getCurrentNetwork();

        // 账户权限类型判断
        let isOwner = false, transactionOptions;
        if (account) {
            if (account.permissions) {
                account.permissions.forEach(perm => {
                    perm.required_auth.keys.forEach(key => {
                        if (perm.perm_name === 'owner') {
                            if (key.key === account.accountPublicKey) {
                                isOwner = true;
                            }
                        }
                    })
                });
            }
            if (isOwner) {
                // 如果操作是 owner key 则设置为 owner
                transactionOptions = {
                    authorization:  account.account_name + '@owner',
                    broadcast: true,
                    sign: true
                }
            } else {
                // 默认会是 active
                transactionOptions = {
                    authorization:  account.account_name + '@active',
                    broadcast: true,
                    sign: true
                }
            }
        }

        try {
            const eos = Eos({
                keyProvider: privateKey,
                httpEndpoint: _getUrl( currentNetWork['domains']),
                expireInSeconds: 60,
                broadcast: true,
                debug: false,
                sign: true,
                chainId: currentNetWork.chain_id,
            });
            eos.meetone_transactionOptions = transactionOptions;
            eos.meetone_isOwner = isOwner;
            eos.accountPrivateKeyData = privateKey;
            dispatch({
                type: eosActionTypes.EOS_UPDATE_EOS,
                eos
            });
            callback && callback( null, eos );
        } catch (error) {
            callback && callback( error, null );
        }

    }
}

export function getEOS() {
    return getStore().getState().eosStore.globalEOS;
}

function GetEOS(callback) {
    callback && callback( null, getEOS() );
}

/**
 * 判断两个地址是否重复的逻辑
 * @param {String} address 需要检查的地址 - 公钥地址
 */
function _isHasSameAddressWallet( address, accountName) {
    const store = getStore();
    const currentNetType = getNetType();

    const accounts = store.getState().eosStore.accounts.slice();
    for ( let index = 0; index < accounts.length; index++ ) {
        // 现在不存储私钥地址，故改成先对比公钥地址
        // 如果一个账户分配给多个公钥地址权限的话，不同公钥地址可以添加同一个账户名进来，只判断账户名字
        // 增加侧链后，还要判断是否同种链
        if (accounts[index].accountName === accountName && accounts[index].walletType === currentNetType) {
            return true
        }
    }
    return false;
}

/**
 * 添加钱包
 */
export function addEOSWallet( accountPrivateKey, accountName, password, passwordHint, callback ) {
    return ( dispatch ) => {
        let { ecc } = Eos.modules;
        let isValidPrivateKey = ecc.isValidPrivate( accountPrivateKey );
        if ( !isValidPrivateKey ) {
            callback && callback( Error( I18n.t( Keys.HomePage_InvalidPrivateKey ) ), null );
            return;
        }

        let accountPublicKey = ecc.privateToPublic( accountPrivateKey );

        if ( password.length <= 0 ) {
            callback && callback( Error( I18n.t( Keys.password_shot_length_tip ) ), null );
            return;
        }

        // 需要做一次判断是否重复
        if (_isHasSameAddressWallet(accountPublicKey, accountName)) {
            callback && callback( Error( I18n.t( Keys.wallet_already_exist ) ), null );
            return;
        }

        let accountPrivateKeyData = _setPrivateKey(accountPrivateKey, password);

        dispatch( {
            type: eosActionTypes.EOS_ACCOUNT_ADD,
            data: {
                accountPublicKey,
                accountName,
                passwordHint,
                aloha: accountPrivateKeyData, //根据私钥与密码加密后的数据
            }
        } );

        callback && callback( null, null );
    };
}

/**
 * 接受索引参数的添加钱包方法、一次导入多个钱包时候
 */
export function addEOSWalletWithIndex( primaryKey, accountPrivateKey, accountName, password, passwordHint, callback ) {
    return ( dispatch ) => {
        let { ecc } = Eos.modules;
        let isValidPrivateKey = ecc.isValidPrivate( accountPrivateKey );
        if ( !isValidPrivateKey ) {
            callback && callback( Error( I18n.t( Keys.HomePage_InvalidPrivateKey ) ), null );
            return;
        }

        let accountPublicKey = ecc.privateToPublic( accountPrivateKey );

        if ( password.length <= 0 ) {
            callback && callback( Error( I18n.t( Keys.password_shot_length_tip ) ), null );
            return;
        }

        let accountPrivateKeyData = _setPrivateKey(accountPrivateKey, password);

        dispatch( {
            type: eosActionTypes.EOS_ACCOUNT_ADD,
            data: {
                accountPublicKey,
                accountName,
                passwordHint,
                aloha: accountPrivateKeyData, //根据私钥与密码加密后的数据
                primaryKey
            }
        } );

        callback && callback( null, null );
    };
}

// BOS 快捷导入
export function addBOSWalletFromEOS( primaryKey, accountPublicKey, aloha, accountName, passwordHint, callback ) {
    return ( dispatch ) => {
        dispatch( {
            type: eosActionTypes.EOS_ACCOUNT_ADD,
            data: {
                accountPublicKey,
                accountName,
                passwordHint,
                aloha,
                primaryKey
            }
        } );
        callback && callback( null, null );
    };
}

/**
 * 删除钱包
 */
export function deleteEOSWallet( account, password, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch({
            type: eosActionTypes.EOS_ACCOUNT_REMOVE,
            data: {
                account: account,
            }
        });
        callback && callback(null, null);
    };
}

// NOTE: 当前版本暂时不支持切换网络了, 或许之后会有用，先留着
export function changeEOSWalletNetwork( account, password, network, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }

        dispatch({
            type: eosActionTypes.EOS_ACCOUNT_NETWORK_CHANGE, data: {
                account: account,
                eosNetwork: network
            }
        });
        callback && callback(null, null);
    };
}

/**
 * 修改密码逻辑
 */
export function changeEOSWalletPassword(account, oldPassword, newPassword, passwordHint, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, oldPassword, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        // 生成新的加密后的私钥
        let accountPrivateKeyData = _setPrivateKey(accountPrivateKey, newPassword);
        dispatch({
            type: eosActionTypes.EOS_ACCOUNT_PASSWORD_CHANGE,
            data: {
                account,
                passwordHint,
                aloha: accountPrivateKeyData, //根据私钥与密码加密后的数据
            }
        });
        callback && callback( null, null );
    };
}

/**
 * 导出私钥
 */
export function exportEOSWalletPrivateKey( account, password, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        // 如果没有私钥，则密码错误
        if (!accountPrivateKey) {
            return;
        }
        let {ecc} = Eos.modules;
        // 判断是否是正确的私钥格式
        let isValidPrivateKey = ecc.isValidPrivate(accountPrivateKey);
        if (!isValidPrivateKey) {
            callback && callback( Error( I18n.t( Keys.HomePage_InvalidPrivateKey ) ), null );
            return;
        }

        callback && callback( null, {
            accountPrivateKey
        });
    };
}


/**
 * 通过私钥计算出公钥
 */
export function getKeyAccountByPrivateKey( accountPrivateKey, callback ) {
    return ( dispatch ) => {
        let { ecc } = Eos.modules;
        let isValidPrivateKey = ecc.isValidPrivate( accountPrivateKey );
        if ( !isValidPrivateKey ) {
            callback && callback( Error( I18n.t( Keys.HomePage_InvalidPrivateKey ) ), null );
            return;
        }

        let accountPublicKey = ecc.privateToPublic( accountPrivateKey );

        GetEOS(( err, eos ) => {
            if ( eos ) {
                eos.getKeyAccounts( { 'public_key': accountPublicKey } )
                    .then( ( response ) => {
                        if ( response.account_names && response.account_names.length === 0 ) {
                            callback && callback( Error( I18n.t( Keys.HomePage_NoAccountFound ) ), null )
                        }
                        else {
                            callback && callback( null, response );
                        }
                    } )
                    .catch( err => {
                        callback && callback( err, null );
                    } )
            }
        } );
    };
}

/**
 * 获取账号名
 */
export function getAccount( account, callback ) {
    return ( dispatch ) => {
        GetEOS( ( err, eos ) => {
            if ( eos ) {
                const netType = getNetType();
                Promise.all([
                    eos.getAccount( { 'account_name': account.accountName } ),
                    getAccountTokensPromise({ "account": account.accountName })
                ]).then( results => {
                    const accountData = results[0];
                    const balance_staked = results[1].body.account ? results[1].body.account.balance_staked : 0;
                    const { cpu_weight, net_weight } = accountData.self_delegated_bandwidth ? accountData.self_delegated_bandwidth : {
                        cpu_weight: '0 EOS',
                        net_weight: '0 EOS'
                    };
                    const stake_to_self = Number( net_weight.split( ' ' )[ 0 ] ) + Number( cpu_weight.split( ' ' )[ 0 ] );
                    let stake_to_others;
                    if (balance_staked && netType === 'EOS') {
                        stake_to_others = balance_staked - stake_to_self;
                    } else {
                        stake_to_others = 0;
                    }
                    const combinedData = Object.assign(accountData, {
                        stake_to_others: stake_to_others
                    })

                    dispatch( { type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO, account: account, data: combinedData } );

                    callback && callback( null, response );

                }).catch( err => {
                    callback && callback( err, null );
                } )
            } else {
                callback && callback( err, null );
            }
        } );
    };

}

/**
 * 这个方法主要是用来判断账户名是否可以注册
 * @author JohnTrump
 */
// 这个判断很脆弱，网络报错也有可能认为未被注册，在合约自助注册可能造成用户困扰，现在把 err 传到那边多做判断。其他地方影响没那么大,暂时没有加强判断。
export function verifyAccountRegistered (account, data, success, faild) {
    return (dispatch) => {
        GetEOS( (err, eos) => {
            if (eos) {
                eos.getAccount({'account_name': data.accountName})
                    .then( response => {
                        faild && faild();
                    })
                    .catch (err => {
                        success && success(err, null);
                    })
            } else {
                success && success(err, null);
            }
        });
    }
}

// 单纯的查询账号信息
export function getAccountInfo (accountName, callback) {
    return (dispatch) => {
        GetEOS( (err, eos) => {
            if (!err) {
                eos.getAccount({'account_name': accountName})
                    .then( response => {
                        callback && callback(null, response);
                    })
                    .catch (err => {
                        callback && callback(err, null);
                    })
            } else {
                callback && callback(err, null);
            }
        });
    }
}

// 查询账号部署的合约代码
export function getAccountContract (accountName, callback) {
    return (dispatch) => {
        GetEOS( (err, eos) => {
            if (eos) {
                eos.getAbi(accountName)
                    .then(result => {
                        callback && callback(null, result);
                    })
                    .catch (err => {
                        callback && callback(err, null);
                    })
            } else {
                callback && callback(err, null);
            }
        });
    }
}

/**
 *  获取当前的RAM价格
 *  单位 EOS/kb
 */
export function getCurrentRAMPrice(account ,callback) {
    return (dispatch) => {
        GetEOS( (err, eos) => {
            if (eos) {
                eos.getTableRows({
                    json: true,
                    code: 'eosio',
                    scope: 'eosio',
                    table: 'rammarket'
                }).then(res => {
                    const ramInfo = res.rows[0];
                    let ramInfoResult = [_parseAsset(ramInfo.quote.balance), _parseAsset(ramInfo.base.balance)];
                    const price = ((ramInfoResult[0] /ramInfoResult[1]).toFixed(8) * 1024).toFixed(6)
                    dispatch({
                        type: eosActionTypes.EOS_UPDATE_RAM_PRICE,
                        data: price
                    })

                    callback && callback(null, price);
                }).catch(err => {
                    callback && callback(err, null);
                });
            } else {
                callback && callback(err, null);
            }
        });
    }
}

/**
 * 获取当前REX价格
 */
export function getCurrentREXPrice(callback) {
    return (dispatch) => {
        GetEOS((err, eos) => {
            if (eos) {
                eos.getTableRows({
                    json: true,
                    code: 'eosio',
                    scope: 'eosio',
                    table: 'rexpool',
                    limit: 1
                }).then(res => {
                    const rexInfo = res.rows[0];
                    const price = _parseAsset(rexInfo.total_rex) / _parseAsset(rexInfo.total_lendable);
                    const rental = (
                        ( 1 * Number(_parseAsset(rexInfo.total_unlent))) / ( 1 + Number(_parseAsset(rexInfo.total_rent)))
                    );
                    dispatch({
                        type: eosActionTypes.EOS_UPDATE_REX_PRICE,
                        data: price
                    });
                    dispatch({
                        type: eosActionTypes.EOS_UPDATE_RENTAL_PRICE,
                        data: rental
                    });
                    callback && callback(null, {price, rental});
                }).catch(err => {
                    callback && callback(err, null);
                });
            } else {
                callback && callback(err, null);
            }
        })
    }
}

// 获取当前帐号下的REX数量
export function getCurrentAccountREX(account, callback) {
    return (dispatch) => {
        const {accountName} = account;
        GetEOS((err, eos) => {
            if (eos) {
                eos.getTableRows({
                    json: true,
                    code: 'eosio',
                    table: 'rexbal',
                    scope: 'eosio',
                    lower_bound: accountName,
                    upper_bound: accountName,
                    limit: 1
                }).then(res => {
                    const response  = res.rows && res.rows[0] || null;
                    dispatch({
                        type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO,
                        account: account,
                        data: {
                            rexInfo: response
                        }
                    });
                    callback && callback(null, response);
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        })
    }
}

// 获取当前帐号下的fund情况
export function getCurrentAccountFund(account, callback) {
    return (dispatch) => {
        const {accountName} = account;
        GetEOS((err, eos) => {
            if (eos) {
                eos.getTableRows({
                    json: true,
                    code: 'eosio',
                    table: 'rexfund',
                    scope: 'eosio',
                    lower_bound: accountName,
                    upper_bound: accountName,
                    limit: 1
                }).then(res => {
                    const response = res.rows && res.rows[0] || null;
                    dispatch({
                        type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO,
                        account: account,
                        data: {
                            fundInfo: response
                        }
                    });
                    callback && callback(null, response);
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        })
    }
}

// 购买REX
export function buyREX(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        // const accountName = '11helloworld';
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: quant
                        }
                    }, {
                        account: 'eosio',
                        name: 'buyrex',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            amount: quant
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getCurrencyBalance(account));
                    // 更新当前REX数量
                    dispatch(getCurrentAccountREX(account));
                    dispatch(getCurrentAccountFund(account));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }))
    }
}

// 出售REX
export function sellREX(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'sellrex',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            rex: quant
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getCurrencyBalance(account));
                    // 更新当前REX数量
                    dispatch(getCurrentAccountREX(account));
                    dispatch(getCurrentAccountFund(account, (err, res) => {
                        dispatch(withdraw(account, password, res.balance));
                    }));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }))
    }
}

// 往fund中充值
export function deposit(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: '0.0001 EOS'
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }))
    }
}

// 从fund中提款
export function withdraw(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'withdraw',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: quant
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getCurrencyBalance(account));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

// Stake资源兑换成REX
export function unstaketorex(account, password, from_cpu, from_net, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'unstaketorex',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            receiver: accountName,
                            from_net: from_net,
                            from_cpu: from_cpu,
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getAccount(account,null));
                    // 更新当前REX数量
                    dispatch(getCurrentAccountREX(account));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }))
    }
}

// 租赁CPU
export function rentcpu(account, password, loan_payment, callback) {

    const amount = Util.toAssertSymbol(loan_payment);

    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: amount
                        }
                    }, {
                        account: 'eosio',
                        name: 'rentcpu',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            receiver: accountName,
                            loan_payment: amount,
                            loan_fund: '0.0000 EOS',
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getAccount(account,null));
                    dispatch(getCurrencyBalance(account,null));
                    dispatch(getRefunds(account,null));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

// 租赁NET
export function rentnet(account, password, loan_payment, callback) {

    const amount = Util.toAssertSymbol(loan_payment);

    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: amount
                        }
                    }, {
                        account: 'eosio',
                        name: 'rentnet',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            receiver: accountName,
                            loan_payment: amount,
                            loan_fund: '0.0000 EOS',
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getAccount(account,null));
                    dispatch(getCurrencyBalance(account,null));
                    dispatch(getRefunds(account,null));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

// 同时租用CPU与NET
export function rent(account, password, loan_payment_cpu, loan_payment_net, callback) {
    const amount = Util.toAssertSymbol(loan_payment_cpu + loan_payment_net);
    const amount_cpu = Util.toAssertSymbol(loan_payment_cpu);
    const amount_net = Util.toAssertSymbol(loan_payment_net);

    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        const {accountName} = account;
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction({
                    actions: [{
                        account: 'eosio',
                        name: 'deposit',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            owner: accountName,
                            amount: amount
                        }
                    }, {
                        account: 'eosio',
                        name: 'rentnet',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            receiver: accountName,
                            loan_payment: amount_net,
                            loan_fund: '0.0000 EOS',
                        }
                    }, {
                        account: 'eosio',
                        name: 'rentcpu',
                        authorization: [{
                            actor: accountName,
                            permission: eos.meetone_isOwner ? 'owner' : 'active'
                        }],
                        data: {
                            from: accountName,
                            receiver: accountName,
                            loan_payment: amount_cpu,
                            loan_fund: '0.0000 EOS',
                        }
                    }]
                }).then(result => {
                    callback && callback(null, result);
                    // 更新当前余额
                    dispatch(getAccount(account,null));
                    dispatch(getCurrencyBalance(account,null));
                    dispatch(getRefunds(account,null));
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

/**
 * 出售RAM
 */
export function sellRAM(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction(tr => {  // 添加权限判断
                    tr.sellram({
                        "account": account.accountName,
                        "bytes": quant
                    }, eos.meetone_transactionOptions)
                }).then(res => {
                    AnalyticsUtil.onEventWithLabel('WAtransaction', 'sellram')
                    callback && callback(null, res);
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

/**
 * 购买RAM
 */
export function buyRAM(account, password, quant, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction(tr => {   // 添加权限判断
                    tr.buyram({
                        "payer": account.accountName,
                        "receiver":account.accountName,
                        "quant": quant
                    }, eos.meetone_transactionOptions);
                }).then(res => {
                    AnalyticsUtil.onEventWithLabel('WAtransaction', 'buyram')
                    // 更新EOS账户信息
                    callback && callback(null, res);
                }).catch(err => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }));
    }
}

/**
 * 获取当前帐号余额
 */
export function getCurrencyBalance( account, callback ) {
    return ( dispatch ) => {
        GetEOS( ( err, eos ) => {
            if ( eos ) {
                eos.getCurrencyBalance( { "code": "eosio.token", "account": account.accountName } )
                    .then( ( response ) => {
                        let balance = 0;
                        if ( response && response.length > 0 ) {
                            balance = Number( response[ 0 ].split( ' ' )[ 0 ] );
                        }

                        dispatch( {
                            type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO,
                            account: account,
                            data: { currencyBalance: balance }
                        } );

                        callback && callback( null, balance );
                    } )
                    .catch( ( err ) => {
                        callback && callback( err, null )
                    } );
            } else {
                callback && callback( err, null )
            }
        } );
    };
}

/**
 * 获取赎回资源的信息
 */
export function getRefunds( account, callback ) {
    return ( dispatch ) => {
        GetEOS( ( err, eos ) => {
            if ( eos ) {
                eos.getTableRows( {
                    'json': true,
                    'code': 'eosio',
                    'scope': account.accountName,
                    'table': 'refunds',
                    'table_key': 'active'
                } )
                    .then( ( response ) => {

                        const refunds = response.rows[ 0 ] ? Number( response.rows[ 0 ].cpu_amount.split( ' ' )[ 0 ] ) + Number( response.rows[ 0 ].net_amount.split( ' ' )[ 0 ] ) : 0;
                        const refundMoneyDetail = response.rows[ 0 ] ? {
                            cpu: Number( response.rows[ 0 ].cpu_amount.split( ' ' )[ 0 ] ),
                            net: Number( response.rows[ 0 ].net_amount.split( ' ' )[ 0 ] )
                        } : { cpu: 0, net: 0 };
                        const request_time = response.rows[ 0 ] ? response.rows[ 0 ].request_time : null;

                        const result = {
                            refunds: refunds,
                            refundsTime: request_time,
                            refundMoneyDetail: refundMoneyDetail,
                        };
                        dispatch( { type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO, account: account, data: result } );
                        callback && callback( null, result );
                    } )
                    .catch( ( err ) => {
                            callback && callback( err, null );
                        }
                    );
            } else {
                callback && callback( err, null );
            }
        } );
    };


}
/**
 * 获取竞选节点
 */
export function getBPSAndNodeId( account, callback ) {
    return ( dispatch ) => {
        _getBps( account, ( err, response ) => {
            if ( !err ) {
                const BPS = response.rows;

                _getNodesIDInfo( ( err, res ) => {
                    if ( !err ) {
                        res[ 'totalVoteWeight' ] = response.total_producer_vote_weight;
                        res[ 'BPs' ] = _sortBPS( res.needNotrSort, res.contributors, BPS );

                        dispatch( {
                            type: eosActionTypes.EOS_ACCOUNT_UPDATE_INFO,
                            account: account,
                            data: res
                        } );

                        callback && callback( null, res );
                    } else {
                        callback && callback( err, null );
                    }
                } );
            } else {
                callback && callback( err, null );
            }
        } );
    };
}

function _getBps( account, callback ) {
    GetEOS( ( err, eos ) => {
        if ( eos ) {
            eos.getProducers( { json: true, limit: 999 } )
                .then( response => {
                    console.log( 'get bps !!! : ', response )
                    callback && callback( null, response );
                } )
                .catch( err => {
                    callback && callback( err, null );
                } );
        } else {
            callback && callback( err, null );
        }
    } );
}


function _getNodesIDInfo( callback ) {
    _getNodesInfo( ( err, response ) => {
        if ( !err ) {
            let bpProducerDic = {};

            response.bp_info_list.map( ( bp ) => {
                bpProducerDic[ bp.producer_name ] = {
                    logo: bp.logo,
                    organization_name: bp.organization_name
                }
            } );
            const contributors = response.contributors;
            const needNotrSort = response.needNotrSort;
            let showLabel = !!response.showLabel;

            const result = {
                bpProducerDic: bpProducerDic,
                contributors: contributors,
                showLabel: showLabel,
                needNotrSort: needNotrSort
            };

            callback && callback( null, result );
        } else {
            callback && callback( err, null );
        }
    } )
}


function _getNodesInfo( callback ) {
    fetch( contributorInfo )
        .then( ( response ) => response.json() )
        .then( ( res ) => {
            callback && callback( null, res );
        } )
        .catch( err => {
            callback && callback( err, null );
        } )
}


function _sortBPS( needNotrSort, contributors, BPS ) {

    if ( needNotrSort ) {
        return BPS
    }

    let sortedBPS;
    let normalBPS = [];
    let contributorBPS = [];
    let tmpDic = {};


    BPS.map( ( bp ) => {
        if ( contributors.indexOf( bp.owner ) !== -1 ) {
            tmpDic[ bp.owner ] = bp;
        } else {
            normalBPS.push( bp );
        }
    } );

    contributors.map( ( c ) => {
        tmpDic[ c ] && contributorBPS.push( tmpDic[ c ] )
    } );

    sortedBPS = contributorBPS.concat( normalBPS );

    return sortedBPS

}

// 获取节点V2
export function getProducerList(callback) {
    return ( dispatch ) => {
        _getBps( null, ( err, response ) => {
            if ( !err ) {
                callback && callback( null, response );
            } else {
                callback && callback( err, null );
            }
        } );
    };
}

export function getVoteIndexPageUsdPricePost( callback ) {
    return ( dispatch ) => {
        getEOSPrice(( err, res ) => {
            if (err) {
                callback && callback( err, null )
            } else {
                const resData = res.body;
                dispatch( { type: eosActionTypes.EOS_UPDATE_PRICE, data: resData.data.quotes.USD.price } );
                callback && callback( null, resData )
            }
        })
    };
}

// 下拉刷新用的，带有回调的 updateAccount 方法, 改成并发callback
export function updateEOSAccountWithCallback (account, callback) {
    return (dispatch) => {
        let i = 0;
        let hasCallbacked = false;

        const store = getStore();

        const EOSTokenList = getSupportTokens();

        const supportTokenList = Object.keys(account.supportToken);
        let supportTokenLength = 0;

        for ( let index = 0; index < EOSTokenList.length; index++ ) {
            const tokenItem = EOSTokenList[index];
            const { name, publisher } = tokenItem;
            const publisher_token = `${publisher}_${name}`;

            if ( name && publisher && supportTokenList.includes(publisher_token) && account.supportToken[publisher_token].isShow ) {
                supportTokenLength ++;
                break;
            }
        }

        function parallaxCallback (err, res) {
            // 有其他更新出错，就返回
            if (hasCallbacked) return;
            // 某请求出错，就回调，并更新 hasCallbacked
            if (err) {
                hasCallbacked = true;
                callback && callback( err, res );
            } else {
                i++;
            }
            // 成功计数等于请求数，证明并列请求都完成了，则执行回调
            if (supportTokenLength > 0) {
                if (i>=7) { callback && callback( err, res ) }
            } else {
                if (i>=6) { callback && callback( err, res ) }
            }
        }

        // 更新帐号
        dispatch(getAccount(account, (err, res) => { parallaxCallback(err, res) }));
        // 更新当前余额
        dispatch(getCurrencyBalance(account, (err, res) => { parallaxCallback(err, res) }));
        // 更新抵押进度
        dispatch(getRefunds(account, (err, res) => { parallaxCallback(err, res) }));
        // 更新当前EOS兑换美元价格
        dispatch(getVoteIndexPageUsdPricePost((err, res) => { parallaxCallback(err, res) }));
        // 更新当前RAM价格
        dispatch(getCurrentRAMPrice(account, (err, res) => { parallaxCallback(err, res) }));
        // 更新当前账号各种Token数量
        dispatch(updateAccountTokenBalance (account, (err, res) => { parallaxCallback(err, res) }));
        // 更新Token兑EOS价格
        dispatch(getTokenEOSPrice ( (err, res) => { parallaxCallback(err, res) }));
    }
};

/**
 * 更新EOS账户信息
 */
export function updateAccount( account, callback ) {
    return (dispatch) => {
        // 更新帐号
        dispatch(getAccount(account, (err, res) => { callback && callback(err, res)}));
        // 更新当前余额
        dispatch(getCurrencyBalance(account, (err, res) => { callback && callback(err, res)}));
        // 更新抵押进度
        dispatch(getRefunds(account, (err, res) => { callback && callback(err, res)}));
        // 更新当前EOS兑换美元价格
        dispatch(getVoteIndexPageUsdPricePost((err, res) => { callback && callback(err, res)}));
        // 更新当前RAM价格
        dispatch(getCurrentRAMPrice(account, (err, res) => { callback && callback(err, res)}));
        // 更新当前账号各种Token数量
        // dispatch(updateAccountTokenBalance (account, (err, res) => { callback && callback(err, res)}));
    }
}


/**
 * 给节点投票
 */
export function voteProducers( account, producers = [ 'eosiomeetone' ], password, callback ) {
    return ( dispatch ) => {

        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.voteproducer({   // 添加权限判断
                    voter: account.accountName,
                    proxy: '',
                    producers: producers
                }, eos.meetone_transactionOptions).then(( result ) => {
                        if ( result.broadcast ) {
                            AnalyticsUtil.onEventWithLabel('WAtransaction', 'voteBP')

                            dispatch(getAccount(account,null));
                            callback && callback( null, result );
                        } else {
                            callback && callback( Error( I18n.t( Keys.Broadcast_is_empty ) ), null );
                        }
                    }).catch(( err ) => {
                    callback && callback( err, null );
                });
            } else {
                callback && callback( err, null );
            }

        }));
    };
}

// 代理投票
export function voteProxy( account, proxy = 'cannonproxy1', password, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.voteproducer({   // 添加权限判断
                    voter: account.accountName,
                    proxy: proxy,
                    producers: []
                }, eos.meetone_transactionOptions).then(( result ) => {
                        if ( result.broadcast ) {
                            AnalyticsUtil.onEventWithLabel('WAtransaction', 'voteProxy')

                            dispatch(getAccount(account,null));
                            callback && callback( null, result );
                        } else {
                            callback && callback( Error( I18n.t( Keys.Broadcast_is_empty ) ), null );
                        }
                    }).catch(( err ) => {
                    callback && callback( err, null );
                });
            } else {
                callback && callback( err, null );
            }
        }));
    };
}

// 查询合约数据
export function getEOSTableRows(data ,callback) {
    return (dispatch) => {
        GetEOS( (err, eos) => {
            if (eos) {
                eos.getTableRows(data)
                .then(res => {
                    callback && callback(null, res);
                }).catch(err => {
                    callback && callback(err, null);
                });
            } else {
                callback && callback(err, null);
            }
        });
    }
}

/**
 * 抵押资源
 */
export function delegatebw( account, data, password, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.transaction( tr => {  // 添加权限判断
                    tr.delegatebw({...data}, eos.meetone_transactionOptions );
                } )
                    .then( ( result ) => {
                        AnalyticsUtil.onEventWithLabel('WAtransaction', 'delegatebw')

                        // 抵押资源后,更新一下资源和refund信息
                        dispatch(getAccount(account,null));
                        dispatch(getCurrencyBalance(account,null));
                        dispatch(getRefunds(account,null));
                        callback && callback( null, result )
                    } )
                    .catch( ( err ) => {
                        callback && callback(err, null );
                    } )
            } else {
                callback && callback(err, null );
            }
        }));
    };
}

/**
 * 手动赎回抵押的资源
 */
export function refundbw(account, password, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction(tr => {   // 添加权限判断
                    tr.refund({
                        owner: account.accountName
                    }, eos.meetone_transactionOptions);
                }).then(function (result) {
                    AnalyticsUtil.onEventWithLabel('WAtransaction', 'refund')
                    // 手动赎回要通知更新EOS账户下的信息
                    dispatch( updateAccount( account, null ) );
                    callback && callback(null, result);
                }).catch(function (error) {
                    if (error) {
                        callback && callback(error, null);
                    }
                });
            } else {
                callback && callback(err, null);
            }


        }));
    }
}

/**
 * 申请赎回质押 - 3days later
 */
export function undelegatebw( account, data, password, callback ) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return false;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.transaction( tr => {   // 添加权限判断
                    tr.undelegatebw( {...data}, eos.meetone_transactionOptions );
                } )
                    .then( ( result ) => {
                        if ( result.broadcast ) {
                            AnalyticsUtil.onEventWithLabel('WAtransaction', 'undelegate')
                            // 赎回资源后,更新一下资源和refund信息
                            dispatch(getAccount(account,null));
                            dispatch(getCurrencyBalance(account,null));
                            dispatch(getRefunds(account,null));
                            callback && callback( null, result )
                        } else {
                            callback && callback(err, null );
                        }
                    } )
                    .catch( ( err ) => {
                        callback && callback(err, null );
                    } )
            } else {
                callback && callback(err, null );
            }
        }));
    };
}

/**
 * 创建新的帐号
 */
export function createNewAccount( account, accountPrivateKey, data, callback ) {
    return ( dispatch ) => {
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.transaction( tr => {   // 添加权限判断
                    tr.newaccount({
                        creator: account.accountName,
                        name: data.name,
                        owner: account.accountPublicKey,
                        active: account.accountPublicKey
                    }, eos.meetone_transactionOptions);
                    tr.buyrambytes({
                        payer: account.accountName,
                        receiver: data.name,
                        bytes: data.rambytes
                    }, eos.meetone_transactionOptions);
                    tr.delegatebw({
                        from: account.accountName,
                        receiver: data.name,
                        stake_net_quantity: data.stake_net_quantity,
                        stake_cpu_quantity: data.stake_cpu_quantity,
                        transfer: 1
                    }, eos.meetone_transactionOptions);
                } )
                    .then( ( result ) => {
                        if ( result.broadcast ) {
                            AnalyticsUtil.onEventWithLabel('WAtransaction', 'createNewAccount')
                            // 抵押资源后会返回首页，首页被激活后会自动调用更新账户信息，所以这里不需要重复调用了
                            // dispatch( updateAccount( account, null ) );
                            callback && callback( null, result )
                        } else {
                            callback && callback( Error( I18n.t( Keys.Broadcast_is_empty ) ), null )
                        }
                    } )
                    .catch( ( err ) => {
                        callback && callback( err, null )
                    } )
            } else {
                callback && callback( err, null )
            }
        }));
    };
}

/**
 * 发起交易
 * @param account 钱包帐号对象
 * @param data: {from: string, to: string, quantity: sting, tokenPublisher: string, memo: string}
 * @param callback {function} callback
 */
export function EOSTransfer ( account, data, password, callback) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }

        // 记录转账历史
        const transferHistory = _updateTransferHistory(data);
        dispatch({
            type: eosActionTypes.EOS_TRANSFER_HISTORY_UPDATE,
            data: {
                transferHistory: transferHistory
            }
        });

        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.transaction({  // 添加权限判断
                    actions: [
                        {
                            account: data.tokenPublisher,
                            name: 'transfer',
                            authorization: [{
                                actor: data.from,
                                permission: eos.meetone_isOwner ? 'owner' : 'active'
                            }],
                            data: {
                                from: data.from,
                                to: data.to,
                                quantity: data.quantity,
                                memo: data.memo
                            }
                        }
                    ]
                })
                .then( ( result ) => {
                    if ( result.broadcast ) {
                        var tokenName = data.quantity.split(' ')[1].toLowerCase();
                        AnalyticsUtil.onEventWithMap('WAtransaction', { transferToken: `${data.tokenPublisher}_${tokenName}` } );

                        // 抵押资源后会返回首页，首页被激活后会自动调用更新账户信息，所以这里不需要重复调用了
                        // dispatch( updateAccount( account, null ) );
                        callback && callback( null, result )
                    } else {
                        callback && callback( Error( I18n.t( Keys.Broadcast_is_empty ) ), null )
                    }
                } )
                .catch( ( err ) => {
                    callback && callback( err, null )
                } )
            } else {
                callback && callback( err, null )
            }

        }));
    };
}

function _updateTransferHistory (data) {
    const name = data.to;
    const memo = data.memo;

    const store = getStore();
    const transferHistory = store.getState().eosStore.transferHistory;

    const history = JSON.parse(JSON.stringify(transferHistory));

    for (let i = 0; i < history.length; i++) {
        if (history[i].name === name) {
            history[i].memo = memo;

            return history;
        }
    }

    history.unshift({
        name,
        memo
    });

    return history;
}

/**
 * 发出Transaction事务请求
 */
export function EOSTransaction(account, data, password, callback) {
    return (dispatch) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if (!err) {
                eos.transaction(data)
                .then((result) => {
                    const actions = data.actions;
                    if (actions) {
                        for (let i = 0; i < actions.length; i++) {
                            if (actions[i].account === 'eosio.token') {
                                if (actions[i].name === 'transfer') {
                                    const receiver = actions[i].data.to;
                                    AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  `${actions[i].account}_${actions[i].name}_${receiver}` } );
                                } else {
                                    AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  `${actions[i].account}_${actions[i].name}` } );
                                }
                            } else {
                                AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  actions[i].account } );
                            }
                        }
                    }
                    callback && callback(null, result);
                })
                .catch((err) => {
                    callback && callback(err, null);
                })
            } else {
                callback && callback(err, null);
            }
        }))
    }
}

/**
 * 获取查询历史交易记录的EOSJS实例
 */
function GetEOSForTransHistory( callback ) {
    const historyNetwork = getStore().getState().eosStore.historyNetwork;
    try {
        const eos = Eos({
            httpEndpoint: _getUrl( historyNetwork['domains']),
            expireInSeconds: 60,
            broadcast: true,
            debug: false,
            sign: true,
            chainId: historyNetwork.chain_id,
        });
        callback && callback( null, eos );
    } catch (error) {
        callback && callback( error, null );
    }
}

/**
 * 查询历史交易记录
 */
export function getEOSTransactions ( account, data, callback ) {
    return ( dispatch ) => {
        GetEOSForTransHistory(( err, eos ) => {
            if ( !err ) {
                // DEBUG change account_name to a mainnet accountName
                eos.getActions({'account_name': account.accountName, 'pos': data.pos, 'offset': data.offset })
                    .then( ( result ) => {
                        callback && callback( null, result )
                    } )
                    .catch( ( err ) => {
                        callback && callback( err, null )
                    } )
            } else {
                callback && callback( err, null )
            }
        } );
    };

}

/**
 * 历史交易记录查询 (缓存版，因为安卓问题未使用，暂留)
 */

export function getAccountTransHistory ( account, data, callback ) {
    return ( dispatch ) => {
        GetEOSForTransHistory( ( err, eos ) => {
            if ( !err ) {
                eos.getActions({'account_name': account.accountName, 'pos': data.pos, 'offset': data.offset })
                    .then( ( result ) => {
                        if (result.actions.length > 0) {
                            dispatch( {
                                type: eosActionTypes.EOS_ADDTO_HISTORY_STACK,
                                account: account,
                                historyData: result.actions
                            } );
                        }
                        callback && callback( null, result )
                    } )
                    .catch( ( err ) => {
                        callback && callback( err, null )
                    } )
            } else {
                callback && callback( err, null )
            }
        } );
    }
}

/**
 * 生成公私钥
 */
export function generateKey(callback) {
    try {
        return (dispatch) => {
            const ecc = Eos.modules.ecc;
            ecc.randomKey()
                .then((privateKey) => {
                    const publicKey = ecc.privateToPublic(privateKey);
                    const data = {
                        publicKey,
                        privateKey
                    };
                    callback && callback(null, data);
                });
        }
    } catch(error) {
        callback && callback(error, null);
    }
}

// 帮别人注册账户的逻辑
export function createEOSAccountWithPublicKey(account, password, {name, publicKey, rambytes = 4096, stake_cpu_quantity = '0.0100 EOS', stake_net_quantity = '0.0100 EOS'}, callback) {
    try {
        return (dispatch) => {
            const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
            if (!accountPrivateKey) {
                return false;
            }
            dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
                if (!err) {
                    eos.transaction(tr => {  // 添加权限判断
                        tr.newaccount({
                            creator: account.accountName,
                            name: name,
                            owner: publicKey,
                            active: publicKey
                        }, eos.meetone_transactionOptions);
                        tr.buyrambytes({
                            payer: account.accountName,
                            receiver: name,
                            bytes: rambytes
                        }, eos.meetone_transactionOptions);
                        tr.delegatebw({
                            from: account.accountName,
                            receiver: name,
                            stake_cpu_quantity: stake_cpu_quantity,
                            stake_net_quantity: stake_net_quantity,
                            transfer: 1
                        }, eos.meetone_transactionOptions);
                    }).then((result) => {
                        if ( result.broadcast ) {
                            AnalyticsUtil.onEventWithLabel('WAtransaction', 'createForOthers')
                            // 返回注册成功结果
                            callback && callback(null, result);
                        } else {
                            callback && callback(err, null);
                        }
                    }).catch(error => {
                        callback && callback(error, null);
                    });
                } else {
                    callback && callback(err, null);
                }
            }));
        }
    } catch(error) {
        callback && callback(error, null);
    }
}

/**
 * 通过邀请码创建账户逻辑
 */
export function createEOSAccount ( name, voucher, callback ) {
    try {
        return ( dispatch ) => {
            const ecc = Eos.modules.ecc;
            ecc.randomKey()
                .then( ( privateKey ) => {
                    const publicKey = ecc.privateToPublic(privateKey);
                    const data = {
                        pk: publicKey,
                        name: name,
                        voucher_code: voucher
                    }
                    const keys = {
                        privateKey,
                        publicKey
                    }
                    netNewAccount(data, ( err, resBody ) => {
                        if (err) {
                            callback && callback(err, null, null)
                        } else {
                            const resData = JSON.parse(resBody);
                            callback && callback(null, keys, resData);
                        }
                    })
                })
        }
    } catch (error) {
        callback && callback( error, null );
    }
}

// 多币种

// 更新支持的交易所列表
export function updateExchangeList( callback ) {
    return ( dispatch ) => {
        getExchangeList(( err, resBody ) => {
            if (err) {
                callback && callback(err, null)
            } else {
                const resData = JSON.parse(resBody);
                dispatch( { type: eosActionTypes.EOS_UPDATE_SUPPORTEXCHANGES, data: resData } )
                callback && callback( null, resData );
            }
        })
    };
}

// 单账号添加某token
export function eosWalletSupportTokenAdd( account, token, callback ) {
    return ( dispatch ) => {
        dispatch( {
            type: eosActionTypes.EOS_ACCOUNT_SUPPORT_TOKEN_ADD,
            account: account,
            token: token
        } );

        callback && callback( null, null );
    };
}

// 单账号删除某token
export function eosWalletSupportTokenRemove( account, token, callback ) {
    return ( dispatch ) => {
        dispatch( {
            type: eosActionTypes.EOS_ACCOUNT_SUPPORT_TOKEN_REMOVE,
            account: account,
            token: token
        } );

        callback && callback( null, null );
    };
}

// 添加自定义的token
export function eosWalletAddCustomToken( token, callback ) {
    return ( dispatch ) => {

        const store = getStore();
        const customTokens = store.getState().eosStore.customTokens.slice();
        const supportTokens = store.getState().eosStore.supportTokens.slice();

        const allTokens = customTokens.concat(supportTokens);
        let hasAdded = false;

        if ( token.publisher === 'eosio.token' ) {
            hasAdded = true;
        } else {
            for (let i = 0; i < allTokens.length; i++) {
                if (allTokens[i].name === token.name && allTokens[i].publisher === token.publisher) {
                    hasAdded = true;
                    break;
                }
            }
        }

        if (!hasAdded) {
            dispatch( {
                type: eosActionTypes.EOS_ADD_CUSTOM_TOKEN,
                token: token
            } );
            callback && callback( null, null );
        }
    };
}

// 单账号更新所有token数据
export function updateAccountTokenBalance (account, callback) {
    return ( dispatch ) => {
        _getTokenAsync( account, null, ( error, balanceMap ) => {
            if ( error ) {
                callback && callback( error, null );
            } else {

                dispatch( {
                    type: eosActionTypes.EOS_UPDATE_TOKEN_BALANCE,
                    account: account,
                    balanceMap: balanceMap
                } );

                callback && callback( null, balanceMap );
            }
        } );
    };
}

// 只更新某个 token
export function updateTokenBalance (account, token, callback) {
    return ( dispatch ) => {
        _getTokenAsync( account, token, ( error, balanceMap ) => {
            if ( error ) {
                callback && callback( error, null );
            } else {

                dispatch( {
                    type: eosActionTypes.EOS_UPDATE_TOKEN_BALANCE,
                    account: account,
                    balanceMap: balanceMap
                } );

                callback && callback( null, balanceMap );
            }
        } );
    };
}

// 获取 token 数据的调用
function _getTokenAsync( account, token, callback ) {
    const tokenBalanceMap = {};
    const seletcedTokenObj = account.supportToken || {};

    const netType = getNetType();

    if (!IS_DEBUG || netType !== 'EOS' ) {
        // 更新所有打开的token
        if (token === null) {
            const supportTokenList = Object.keys( seletcedTokenObj );
            if (netType === 'EOS'){
                getAccountTokens({
                    "account": account.accountName
                },( err, res ) => {
                    if (err) {
                        callback && callback( null, tokenBalanceMap );
                    } else {
                        const resData = res.body;
                        if (resData.use_node) {
                            const EOSTokenList = getSupportTokens();
                            let currentIndex = 0;
                            // 如果遍历账号设置的tokenList，服务端删除某token时会报错，所以改成遍历下发的全部token列表，判断账号是否有添加这个token。
                            for ( let index = 0; index < EOSTokenList.length; index++ ) {
                                const tokenItem = EOSTokenList[index];
                                const tokenName = tokenItem.name;
                                const tokenPublisher = tokenItem.publisher;
                                const tokenPrecision = tokenItem.precision;
                                const publisher_token = `${tokenPublisher}_${tokenName}`;

                                // 如果设置了不显示,就跳下一个
                                if (supportTokenList.includes(publisher_token) && seletcedTokenObj[publisher_token].isShow === false) {
                                    currentIndex++;
                                    continue;
                                } else {
                                    // 获取各 Token 余额
                                    GetEOS( ( err, eos ) => {
                                        if ( eos ) {
                                            eos.getCurrencyBalance( { "code": tokenPublisher, "account": account.accountName } )
                                                .then( ( response ) => {
                                                    let balance = '0';
                                                    if ( response && response.length > 0 ) {
                                                        // 一个账号可能发多种代币,这里还是遍历一遍
                                                        // 返回格式现在是数组 ["100 EOS", "200 ONE"]
                                                        response.forEach(item => {
                                                            if (item.split( ' ' )[1] === tokenName) {
                                                                balance = Number( item.split( ' ' )[ 0 ] ).toFixed(tokenPrecision) + '';
                                                            }
                                                        });
                                                    }

                                                    // 没有显示过的情况下，余额大于0自动显示出来
                                                    if ( !supportTokenList.includes(publisher_token)) {
                                                        if (balance > 0) {
                                                            tokenBalanceMap[publisher_token] = {
                                                                isShow: true,
                                                                balance: balance
                                                            };
                                                        }
                                                    // 显示过的情况下，判断是否开启
                                                    } else {
                                                        if (seletcedTokenObj[publisher_token].isShow) {
                                                            tokenBalanceMap[publisher_token] = {
                                                                isShow: true,
                                                                balance: balance
                                                            };
                                                        }
                                                    }

                                                    currentIndex++;
                                                    // 全部获取完之后执行回调
                                                    if ( currentIndex >= EOSTokenList.length ) {
                                                        callback && callback( null, tokenBalanceMap );
                                                    }
                                                } )
                                                .catch( ( err ) => {
                                                    // 获取失败的token,不阻塞其他token的更新
                                                    // toast 出请求失败的 token （暂不）
                                                    // Toast.show(format( I18n.t( Keys.token_update_fail ), tokenName ), {position: Toast.positions.CENTER});

                                                    currentIndex++;
                                                    // 全部获取完之后执行回调
                                                    if ( currentIndex >= EOSTokenList.length ) {
                                                        callback && callback( null, tokenBalanceMap );
                                                    }
                                                } );
                                        } else {
                                            callback && callback( err, null )
                                        }
                                    } );
                                }
                            }
                        } else if (resData.err_code === 0) {
                            const tokensData = resData.account.tokens;

                            for (let i = 0; i < tokensData.length; i++) {
                                const tokenItem = tokensData[i];
                                const tokenName = tokenItem.symbol;
                                const tokenPublisher = tokenItem.contract;
                                const balance = tokenItem.balance;
                                const publisher_token = `${tokenPublisher}_${tokenName}`;

                                // 没有显示过的情况下，余额大于0自动显示出来
                                if ( !supportTokenList.includes(publisher_token)) {
                                    if (balance > 0) {
                                        tokenBalanceMap[publisher_token] = {
                                            isShow: true,
                                            balance: balance
                                        };
                                    }
                                // 显示过的情况下，更新余额，开启与否保持原样
                                } else {
                                    tokenBalanceMap[publisher_token] = {
                                        isShow: seletcedTokenObj[publisher_token].isShow,
                                        balance: balance
                                    };

                                    const tokenIndex = supportTokenList.indexOf(publisher_token);
                                    supportTokenList.splice(tokenIndex, 1);
                                }
                            }

                            // eosflare没有返回，但是有开启的Token单独请求一遍
                            const EOSTokenList = getSupportTokens();
                            const EOSTokenListMap = EOSTokenList.map((token) => `${token.publisher}_${token.name}`)
                            let currentIndex = 0;
                            for ( let index = 0; index < supportTokenList.length; index++ ) {
                                const tokenItem = supportTokenList[index];
                                const tokenName = tokenItem.split('_')[1];
                                const tokenPublisher = tokenItem.split('_')[0];

                                const publisher_token = `${tokenPublisher}_${tokenName}`;

                                // 如果设置了不显示,就跳下一个
                                if ((seletcedTokenObj[publisher_token] && seletcedTokenObj[publisher_token].isShow === false) || !EOSTokenListMap.includes(publisher_token)) {
                                    currentIndex++;
                                    continue;
                                } else {
                                    // 获取各 Token 余额
                                    GetEOS( ( err, eos ) => {
                                        if ( eos ) {
                                            eos.getCurrencyBalance( { "code": tokenPublisher, "account": account.accountName } )
                                                .then( ( response ) => {
                                                    let balance = '0';
                                                    if ( response && response.length > 0 ) {
                                                        // 一个账号可能发多种代币,这里还是遍历一遍
                                                        // 返回格式现在是数组 ["100 EOS", "200 ONE"]
                                                        response.forEach(item => {
                                                            if (item.split( ' ' )[1] === tokenName) {
                                                                balance = item.split( ' ' )[ 0 ];
                                                            }
                                                        });
                                                    }

                                                    tokenBalanceMap[publisher_token] = {
                                                        isShow: true,
                                                        balance: balance
                                                    };

                                                    currentIndex++;
                                                    // 全部获取完之后执行回调
                                                    if ( currentIndex >= supportTokenList.length ) {
                                                        callback && callback( null, tokenBalanceMap );
                                                    }
                                                } )
                                                .catch( ( err ) => {
                                                    // 获取失败的token,不阻塞其他token的更新
                                                    // toast 出请求失败的 token （暂不）
                                                    // Toast.show(format( I18n.t( Keys.token_update_fail ), tokenName ), {position: Toast.positions.CENTER});

                                                    currentIndex++;
                                                    if ( currentIndex >= supportTokenList.length ) {
                                                        callback && callback( null, tokenBalanceMap );
                                                    }
                                                } );
                                        } else {
                                            currentIndex++;
                                            if ( currentIndex >= supportTokenList.length ) {
                                                callback && callback( null, tokenBalanceMap );
                                            }
                                        }
                                    } );
                                }
                            }
                        } else {
                            callback && callback( null, tokenBalanceMap );
                        }
                    }
                } )
            } else {
                const EOSTokenList = getSupportTokens();
                let currentIndex = 0;
                // 如果遍历账号设置的tokenList，服务端删除某token时会报错，所以改成遍历下发的全部token列表，判断账号是否有添加这个token。
                for ( let index = 0; index < EOSTokenList.length; index++ ) {
                    const tokenItem = EOSTokenList[index];
                    const tokenName = tokenItem.name;
                    const tokenPublisher = tokenItem.publisher;
                    const tokenPrecision = tokenItem.precision;
                    const publisher_token = `${tokenPublisher}_${tokenName}`;

                    // 如果设置了不显示,就跳下一个
                    if (supportTokenList.includes(publisher_token) && seletcedTokenObj[publisher_token].isShow === false) {
                        currentIndex++;
                        continue;
                    } else {
                        // 获取各 Token 余额
                        GetEOS( ( err, eos ) => {
                            if ( eos ) {
                                eos.getCurrencyBalance( { "code": tokenPublisher, "account": account.accountName } )
                                    .then( ( response ) => {
                                        let balance = '0';
                                        if ( response && response.length > 0 ) {
                                            // 一个账号可能发多种代币,这里还是遍历一遍
                                            // 返回格式现在是数组 ["100 EOS", "200 ONE"]
                                            response.forEach(item => {
                                                if (item.split( ' ' )[1] === tokenName) {
                                                    balance = Number( item.split( ' ' )[ 0 ] ).toFixed(tokenPrecision) + '';
                                                }
                                            });
                                        }

                                        // 没有显示过的情况下，余额大于0自动显示出来
                                        if ( !supportTokenList.includes(publisher_token)) {
                                            if (balance > 0) {
                                                tokenBalanceMap[publisher_token] = {
                                                    isShow: true,
                                                    balance: balance
                                                };
                                            }
                                        // 显示过的情况下，判断是否开启
                                        } else {
                                            if (seletcedTokenObj[publisher_token].isShow) {
                                                tokenBalanceMap[publisher_token] = {
                                                    isShow: true,
                                                    balance: balance
                                                };
                                            }
                                        }

                                        currentIndex++;
                                        // 全部获取完之后执行回调
                                        if ( currentIndex >= EOSTokenList.length ) {
                                            callback && callback( null, tokenBalanceMap );
                                        }
                                    } )
                                    .catch( ( err ) => {
                                        // 获取失败的token,不阻塞其他token的更新
                                        // toast 出请求失败的 token （暂不）
                                        // Toast.show(format( I18n.t( Keys.token_update_fail ), tokenName ), {position: Toast.positions.CENTER});

                                        currentIndex++;
                                        // 全部获取完之后执行回调
                                        if ( currentIndex >= EOSTokenList.length ) {
                                            callback && callback( null, tokenBalanceMap );
                                        }
                                    } );
                            } else {
                                callback && callback( err, null )
                            }
                        } );
                    }
                }
            }
        // 只更新指定的token
        } else {
            const tokenName = token.name;
            const tokenPublisher = token.publisher;
            const tokenPrecision = token.precision;
            const publisher_token = `${tokenPublisher}_${tokenName}`;

            GetEOS( ( err, eos ) => {
                if ( eos ) {
                    eos.getCurrencyBalance( { "code": tokenPublisher, "account": account.account_name } )
                        .then( ( response ) => {
                            let balance = '0';
                            if ( response && response.length > 0 ) {
                                response.forEach(item => {
                                    if (item.split( ' ' )[1] === tokenName) {
                                        balance = Number( item.split( ' ' )[ 0 ] ).toFixed(tokenPrecision) + '';
                                    }
                                });
                            }

                            let isShow;
                            if (seletcedTokenObj[publisher_token]) {
                                isShow = seletcedTokenObj[publisher_token].isShow
                            } else {
                                isShow = false;
                            }

                            tokenBalanceMap[publisher_token] = {
                                isShow: isShow,
                                balance: balance
                            };

                            callback && callback( null, tokenBalanceMap );
                        } )
                        .catch( ( err ) => {
                            callback && callback( err, null )
                        } );
                } else {
                    callback && callback( err, null )
                }
            } );
        }

    // 测试环境不刷token,免得一直报红
    } else {
        callback && callback( null, {} );
    }
}


/**
 * 对数据进行迁移，加固私钥体系
 */
export function updateAccountToSecretData() {
    return (dispatch) => {
        dispatch({
            type: eosActionTypes.EOS_SECRET_UPDATE
        });
    }
}

/**
 *
 * @param {String} accountPrivateKey 私钥
 * @param {String} password 密码
 * @return {String} accountPrivateKeyData 加密后的私钥
 */
function _setPrivateKey(accountPrivateKey, password ) {
    return CryptoJS.AES.encrypt( JSON.stringify({
        accountPrivateKey: accountPrivateKey,
        isEncrypted: true
    }), password ).toString();
}

/**
 * 验证密码是否正确的逻辑
 * 如果密码错误，返回{Boolean} false
 * 如果密码正确，返回{Object} accountOrigin
 */
export function verifyPassword(account, password, callback, dispatch) {
    const bytes = CryptoJS.AES.decrypt( account.aloha, password );
    const store = getStore();
    // 获取所有帐号列表
    const accounts = store.getState().eosStore.accounts.slice();
    let decryptedData;
    // 当前的Account
    let accountOrigin = null;
    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey === account.primaryKey ) {
            accountOrigin = accounts[ index ]; // 当前帐号
            const hasHint = accountOrigin.passwordHint && accountOrigin.passwordHint.length > 0; // 密码提示
            let errorMsg = I18n.t(Keys.password_is_not_correct);
            if (hasHint) {
                errorMsg += '\n' + I18n.t(Keys.Password_Hint) + accountOrigin.passwordHint;
            }

            try {
                decryptedData = JSON.parse( bytes.toString(CryptoJS.enc.Utf8) );
            } catch (error) {
                callback && callback( Error(errorMsg), null);
                // if the password is not correct
                // reset store.eosStore.tempPsw to null
                if (dispatch) {
                    dispatch({
                        type: eosActionTypes.EOS_UPDATE_PSW,
                        tempPsw: null
                    })
                }
                return false;
            }

            if ( decryptedData && decryptedData.isEncrypted ) {
            } else {
                callback && callback( Error(errorMsg), null);
                // if the password is not correct
                // reset store.eosStore.tempPsw to null
                if (dispatch) {
                    dispatch({
                        type: eosActionTypes.EOS_UPDATE_PSW,
                        tempPsw: null
                    })
                }
                return false;
            }
        }
    }
    return decryptedData.accountPrivateKey;
}

// 公钥权限变更
export function EOSAuthChange ( account, data, password, callback) {
    return ( dispatch ) => {
        const accountPrivateKey = verifyPassword(account, password, callback, dispatch);
        if (!accountPrivateKey) {
            return;
        }
        dispatch(updateEOS(account, accountPrivateKey, (err, eos) => {
            if ( !err ) {
                eos.transaction({  // 添加权限判断
                    actions: [
                        {
                            "account": "eosio",
                            "name": "updateauth",
                            "authorization": [
                                {
                                    "actor": account.accountName,
                                    "permission": eos.meetone_isOwner ? 'owner' : 'active'
                                }
                            ],
                            "data": data
                        }
                    ]
                })
                .then( ( result ) => {
                    if ( result.broadcast ) {
                        AnalyticsUtil.onEventWithLabel('WAtransaction', 'updateAuth')
                        // 更新帐号信息（net、cpu、授权等，不会更新余额、token、ramprice等）
                        dispatch(getAccount(account, null));
                        dispatch(updateEOS());

                        callback && callback( null, result )
                    } else {
                        callback && callback( Error( I18n.t( Keys.Broadcast_is_empty ) ), null )
                    }
                } )
                .catch( ( err ) => {
                    callback && callback( err, null )
                } )
            } else {
                callback && callback( err, null )
            }

        }));
    };
}

export function updateEOSBrowserHistory ( data ) {
    return ( dispatch ) => {
        const browserHistory = _updateEOSBrowserHistory(data);
        dispatch({
            type: eosActionTypes.EOS_BROWSER_HISTORY_UPDATE,
            data: {
                browserHistory: browserHistory
            }
        });
    };
}

/**
 * 对浏览记录进行队列的更新
 * update: 新增长度的判断（最长为5） - @JohnTrump
 */
function _updateEOSBrowserHistory (data) {
    if (data === null) {
        return []
    } else {

        const store = getStore();
        const browserHistory = store.getState().eosStore.browserHistory;
        const history = JSON.parse(JSON.stringify(browserHistory));
        let index = history.indexOf(data);

        if (index !== -1) {
            history.splice(index, 1);
        }

        if (history.length >= 5) {
            history.pop();
        }

        history.unshift(data);

        return history;
    }
}

export function toggleAssetsShow ( data ) {
    return ( dispatch ) => {
        dispatch({
            type: eosActionTypes.EOS_ASSETS_SHOW_TOGGLE,
            data: {
                hideAssets: data
            }
        });
    };
}

export function getTokenEOSPrice( callback ) {
    return ( dispatch ) => {
        getTokenListPrice(( err, res ) => {
            if (err) {
                callback && callback( err, null )
            } else {
                const resData = res.body;

                const tokenArray = resData.data;

                const tokenPricesMap = {};

                for (let i = 0; i < tokenArray.length; i++) {
                    const publisher = tokenArray[i].contract;
                    const name = tokenArray[i].currency;
                    tokenPricesMap[`${publisher}_${name}`] = tokenArray[i];
                }

                dispatch({
                    type: eosActionTypes.EOS_UPDATE_TOKEN_PRICE,
                    data: {
                        tokenPrices: tokenPricesMap
                    }
                });

                callback && callback( null, null )
            }
        })
    };
}
