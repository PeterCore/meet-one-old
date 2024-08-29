import Eos from "eosjs";
import Toast from "react-native-root-toast";
import { NavigationActions, StackActions } from "react-navigation";
import { getCurrentWalletSimple } from "../actions/WalletAction";
import { getEOS } from "../actions/EOSAction";
import { getCurrentNetwork as getCurrentNetworkByNetType } from "../actions/ChainAction";
import Util from "../util/Util";
import URLRouteUtil from "../util/URLRouteUtil";
import Keys from "../configs/Keys";
import {getStore} from '../setup';

const EOSWalletSDK = {
    handlePath: function (component ,path, callback) {
        const tempArray = path.split('?');
        const routeName = tempArray[0]; //协议名称
        const v2 = (-1 != path.indexOf('info='));//有info参数是v2协议
        const queryObj = Util.parseQueryString(path, v2); // Query Params Obj
        if (routeName === 'transfer') {
            // meetone://eos/transfer - 唤起转账
            return eosTokenTransfer(component, queryObj, callback);
        } else if (routeName === 'authorize') {
            // meetone://eos/authorize - 唤起授权页面
            return authorizeEOSAccount(component, queryObj, callback, true);
        } else if (routeName === 'transaction') {
            // meetone://eos/transaction - 提交事务
            return pushTransactions(component, queryObj, callback);
        } else if (routeName === 'account_info') {
            // meetone://eos/account_info - 获取帐号信息
            return getEOSAccountInfo(component, queryObj, callback);
        } else if (routeName === 'getBalance') {
            // meetone://eos/getBalance - 获取帐号余额
            return getEOSBalance(component, queryObj, callback);
        } else if (routeName === 'getWalletList') {
            // meetone://eos/getWalletList 获取帐号钱包列表
            return getEOSWalletList(component, queryObj, callback);
        } else if (routeName === 'authorizeInWeb') {
            // meetone://eos/authorizeInWeb
            return authorizeInWeb(component, queryObj, callback);
        } else if (routeName === 'signature') {
            // meetone://eos/signature
            return signature(component, queryObj, callback);
        } else if (routeName === 'getAccountInfo') {
            // meetone://eos/getAccountInfo
            return authorizeEOSAccount(component, queryObj, callback, false);
        } else if (routeName === 'sign_provider') {
            return signProvider(component, queryObj, callback);
        } else if (routeName === 'network') {
            // meetone://eos/network - 获取当前的节点信息
            return getCurrentNetwork(component, queryObj, callback);
        }
        return false;
    },
};

// 获取当前的节点信息
function getCurrentNetwork(component, queryObj, callback) {
    const currentNetwork = getCurrentNetworkByNetType();

    const {name, chain_id, domains} = currentNetwork
    let params = Util.schemeEncode(0, 7, {
        name,
        chain_id,
        domains
    });
    callback && callback(null, {
        params,
        callbackId: queryObj && queryObj.callbackId
    });
}

/**
 * 为Scatter EOS实例提供签名
 */
function signProvider(component, queryObj, callback) {

    if (queryObj.params.from && !matchEOSAccount(queryObj.params.from, queryObj, 'eos/sign_provider')) {
        return;
    }

    const account = getCurrentWalletSimple();

    if (!account) {
        // 跳转到导入页面
        component.props.navigation.navigate('EOSWalletImportPage', {});
        return;
    }

    // 根据`signatureData.whatfor`显示签名目的
    // 获取Action的内容, Cover abi.data to JSON
    const eos = getEOS();
    const contracts =
        Array.isArray(queryObj.params.transaction) && queryObj.params.transaction.map(action => action.account)
        .reduce((acc, contract) => {
            if(!acc.includes(contract)) acc.push(contract);
            return acc;
        }, []) || [];
    Promise.all(contracts.map(contractAccount => {
        return new Promise((resolve, reject) => {
            eos.contract(contractAccount)
                .then(abi => {
                    resolve({
                        abi: abi.fc,
                        contractAccount
                    });
                }).catch(err => {
                    reject(err)
                })
        });
    })).then(results => {
        let abis = {};
        results.map(abi => {
            abis[abi.contractAccount] = abi.abi;
        });

        Promise.all(Array.isArray(queryObj.params.transaction) && queryObj.params.transaction.map((action, index) => {
            return new Promise((resolve, reject) => {
                try {
                    const contractAccountName = action.account;
                    let abi = abis[contractAccountName];
                    const typeName = abi.abi.actions.find(x => x.name === action.name).type
                    const data = abi.fromBuffer(typeName, action.data);
                    resolve({
                        data,
                        account: action.account,
                        name: action.name,
                        authorization:action.authorization
                    })
                } catch (error) {
                    reject(error);
                }
            });
        })).then(results => {
            var states = {
                isSignatureConfirmOpen: true,
                isSignProvider: true,
                signatureData: {
                    buf: queryObj.params.buf,
                },
                transactionRawData: results,
                callbackId: queryObj && queryObj.callbackId,
            }

            // 组件状态改变，并且执行回调
            component.setState(states, () => {
                let params = Util.schemeEncode(100, 6, { message: '等待用户确认', });
                callback && callback(null, {
                    params
                });
            })
        })
    })
}

/**
 * 获取当前帐号下的签名
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function signature(component, queryObj, callback) {
    if (queryObj.params.from && !matchEOSAccount(queryObj.params.from, queryObj, 'eos/signature')) {
        return;
    }

    const account = getCurrentWalletSimple();

    if (!account) {
        // 跳转到导入页面
        component.props.navigation.navigate('EOSWalletImportPage', {});
        return;
    }

    var states = {
        transactionRawData: queryObj.info ? (queryObj && queryObj.params && queryObj.params.data) : null,
        isSignatureConfirmOpen: true,
        isSignProvider: false,
        isArbitrary: queryObj.params.isArbitrary || false,
        isHash: queryObj.params.isHash || false,
        signatureData: queryObj && queryObj.params && queryObj.params.data,
        infoData: queryObj.info,
        callbackId: queryObj && queryObj.callbackId
    }

    // 组件状态改变，并且执行回调
    component.setState(states, () => {
        let params = Util.schemeEncode(100, 6, { message: '等待用户确认', });
        callback && callback(null, {
            params
        });
    })
}

/**
 * 获得一个帐号的授权
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function authorizeEOSAccount(component, queryObj, callback, needSign) {
    var from = '';
    if (queryObj.params) {
        from = queryObj.params.from;
    } else {
        queryObj.params = {};
    }
    const account = getCurrentWalletSimple();
    var gotoPage = 'EOSAuthorationPage';
    if (needSign) {
        queryObj.params = Object.assign(queryObj.params, {needSign: true, function: "eos/authorize"});
    } else {
        queryObj.params = Object.assign(queryObj.params, {function: "eos/getAccountInfo"});
    }
    var pageParams = {
        queryObj
    };
    if (!account) {
        gotoPage = 'EOSWalletImportPage';
        pageParams = Object.assign(pageParams, {before: 'EOSAuthorationPage'});
    }
    try {
        // 跳转到授权页面中去
        if (from === 'qrcode') {
            // 跳转到目标页面
            // 这里要做一下区分:
            // 如果是从二维码进入的，需要使用reset把当前页面推出路由堆栈
            // 如果不是从二维码进入协议的，则使用普通的跳转就可以了
            component.props.navigation.dispatch(
                StackActions.reset(
                    {
                        index: 1,
                        actions: [
                            NavigationActions.navigate( { routeName: 'mainPage' } ),
                            NavigationActions.navigate( { routeName: gotoPage, params: pageParams} ),
                        ]
                    }
                )
            );
        } else {
            component.props.navigation.navigate(gotoPage, pageParams);
        }
    } catch (error) {
        Toast.show(error, {position: Toast.positions.CENTER});
    }
    let params = Util.schemeEncode(100, 1, {
        message: '等待确认授权'
    });
    callback && callback(null, {params});
}

/**
 *
 * eos发起付款
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function eosTokenTransfer(component, queryObj, callback) {
    if (queryObj.params) {
    } else {
        queryObj.params = {};
    }
    if (queryObj.params.from && !matchEOSAccount(queryObj.params.from, queryObj, 'eos/transfer')) {
        return;
    }
    var states = {
        transactionRawData: null,
        isConfirmOpen: true,
        infoData: queryObj.info,
        callbackId: queryObj && queryObj.callbackId
    }
    if (queryObj.params.description) {
        Object.assign(states, {paymentData: Object.assign(queryObj.params, {from: component.props.walletAccount, orderInfo:queryObj.params.description})});
    } else {
        Object.assign(states, {paymentData: Object.assign(queryObj.params, {from: component.props.walletAccount})});
    }
    component.setState( states , () => {
        let params = Util.schemeEncode(100, 0, {
            message: '等待用户确认'
        });
        callback && callback(null, {params});
    });
}

/**
 * 发起合约内的actions
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function pushTransactions(component, queryObj, callback) {
    if (queryObj.params) {
    } else {
        queryObj.params = {};
    }
    if (queryObj.params.from && !matchEOSAccount(queryObj.params.from, queryObj, 'eos/transaction')) {
        return;
    }
    var actions = queryObj.params;
    if (queryObj.params.description) {
        actions = {
            actions: queryObj.params.actions,
            options: queryObj.params.options,
        }
    }
    var states = {
        transactionRawData: null,
        transactionData: {
            from: component.props.walletAccount,
            description:queryObj.params.description
        },
        transactionActions: actions,
        transactionReason: queryObj.params.description ? queryObj.params.description : '',
        infoData: queryObj.info,
        callbackId: queryObj && queryObj.callbackId
    }

    // 显示Transaction确认框
    Object.assign(states, {isTransactionConfirmOpen: true})

    component.setState( states , () => {
        let params = Util.schemeEncode(100, 5, {
            message: '等待用户确认'
        });
        callback && callback(null, {params})
    });
}

/**
 * 内部Web授权协议
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function authorizeInWeb(component, queryObj, callback) {
    if (component.props.walletAccount) {
        let params = Util.schemeEncode(0, 1, {
            account: component.props.walletAccount && component.props.walletAccount.accountName
        });
        callback && callback(null, {
            params,
            callbackId: queryObj && queryObj.callbackId
        });
    } else {
        let params = Util.schemeEncode(500, 1, {});
        callback && callback(null, {
            params,
            callbackId: queryObj && queryObj.callbackId
        });
    }
}


/**
 * 获取EOS帐号信息
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function getEOSAccountInfo(component, queryObj, callback) {
    if (component.props.walletAccount) {
        let isOwner = false;
        let isActive = false;
        const account = component.props.walletAccount

        if (account.permissions) {
            account.permissions.forEach(perm => {
                perm.required_auth.keys.forEach(key => {
                    if (perm.perm_name === 'owner') {
                        if (key.key === account.accountPublicKey) {
                            isOwner = true;
                        }
                    }
                    if (perm.perm_name === 'active') {
                        if (key.key === account.accountPublicKey) {
                            isActive = true;
                        }
                    }
                })
            });
        }

        let params = Util.schemeEncode(0, 2, {
            account: component.props.walletAccount.accountName,
            publicKey: component.props.walletAccount.accountPublicKey,
            isOwner: isOwner,
            isActive: isActive,
            currencyBalance: component.props.walletAccount.currencyBalance,
        });

        callback && callback(null, {
            params,
            callbackId: queryObj && queryObj.callbackId
        });
    } else {
        let params = Util.schemeEncode(500, 2, {});
        callback && callback(null, {
            params,
            callbackId: queryObj && queryObj.callbackId
        });
    }
}

/**
 * 获取帐号的余额
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function getEOSBalance(component, queryObj, callback) {
    let contract = null; // 发布Token合约的地址 - 必须
    let symbol = null; // Token符号 - 选项, default is 'eosio.token'
    let accountName = null; // 要查询的帐号名称 - 选项, default is 'EOS'
    // 如果指定具体的帐号名称，则获取该帐号名称下的余额
    if (queryObj && queryObj.params && queryObj.params.accountName) {
        accountName = queryObj.params.accountName;
    } else {
        // 如果没有指定帐号名称的话，则获取当前钱包的帐号名称
        const account = getCurrentWalletSimple();
        // 没有帐号名称，则跳转到导入页面
        if (!account) {
            component.props.navigation.navigate('EOSWalletImportPage', {});
            return;
        }
        accountName = account && account.accountName;
    }
    // 指定Token合约名称
    contract = queryObj && queryObj.params && queryObj.params.contract || 'eosio.token';
    // 指定Token符号
    symbol = queryObj && queryObj.params && queryObj.params.symbol || 'EOS';
    let params = {}; // 要返回的参数
    const eos = getEOS(); // 获取全局的eosjs实例
    // 获取余额
    params = Util.schemeEncode(100, 3, {
        message: '正在获取帐号余额'
    });
    callback && callback(null, {params});
    eos.getCurrencyBalance( { "code": contract, "account": accountName } )
        .then((response) => {
            let balance = 0; // 余额
            // 一个账号可能发多种代币,这里还是遍历一遍
            if (response && response.length > 0) {
                response.forEach(item => {
                    if (item.split( ' ' )[1] === symbol) {
                        balance = Number( item.split( ' ' )[ 0 ] ) + '';
                    }
                });
            }
            // 设置返回值
            params = Util.schemeEncode(0, 3, {
                balance,
                contract,
                accountName,
                symbol,
                message: '获取帐号余额成功'
            });
            callback && callback(null, {
                params,
                callbackId: queryObj && queryObj.callbackId
            });
        })
        .catch((err) => {
            params = Util.schemeEncode(500, 3, {
                origin: err.message,
                message: '获取帐号余额失败'
            })
            callback && callback(null, {
                params,
                callbackId: queryObj && queryObj.callbackId
            });
        });
}

function getEOSWalletList() {
    return true;
}

function matchEOSAccount(from, queryObj, path) {
    const account = getCurrentWalletSimple();
    if (from && account.accountName !== from) {
        Toast.show(Keys.not_match_account, {position: Toast.positions.CENTER});
        if (queryObj.info) {
            URLRouteUtil.invokeCallBackScheme(queryObj.info.dappCallbackScheme, 400, 'Not match', path, {}, queryObj.params.callbackId, queryObj.info.dappRedirectURL);
        } else {
            let paramsObj = {
                code: 400,
                data: {}
            };
            const myParams = Util.coverObjectToParams(paramsObj, false);
            URLRouteUtil.invokeScheme( (params.schema ? params.schema : 'moreone') + '://meet/callback?params=' + myParams, params.callbackId, params.redirectURL);
        }
        return false;
    }
    return true;
}

export default EOSWalletSDK;
