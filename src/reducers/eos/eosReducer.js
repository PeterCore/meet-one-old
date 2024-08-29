import eosActionTypes from "./eosActionTypes";
import eosNetworks from "../../../data/eos_network";
import supportTokens from "../../../data/supportTokens";
import supportExchanges from "../../../data/supportExchanges";
import walletActionTypes from "../wallet/walletActionTypes";
import { getStore } from "../../setup";
import { InteractionManager } from "react-native";

import { IS_DEBUG } from '../../env';
import { updateAccountTokenBalance, updateTokenBalance } from "../../actions/EOSAction";
import { getNetType, getSupportTokens } from "../../actions/ChainAction";
import Util from "../../util/Util";

const CryptoJS = require( "crypto-js" );

const emptyEOSWallet = {
    accountName: '',
    accountPrivateKey: '',
    currencyBalance: 0,

    refunds: 0,
    refundsTime: "",
    refundMoneyDetail: { cpu: 0, net: 0 },

    account_name: "",
    delegated_bandwidth: {
        cpu_weight: "",
        net_weight: "",
    },
    total_resources: {
        ram_bytes: 0,
    },
    voter_info: {
        producers: [],
    },
    net_weight: 0,
    cpu_weight: 0,

    password: '',

    eosNetwork: {},

    bpProducerDic: {},
    contributors: "",
    showLabel: false,
    needNotrSort: false,
    totalVoteWeight: 0,
    BPs: [],

    transaction_history: []
}

const initialState = {
    eosNetworks: eosNetworks,
    supportTokens: supportTokens,
    customTokens: [],
    historyNetwork: {
        name: 'MainNet',
        chain_id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        domains: ['https://api1.eosasia.one'],
        is_mainnet: true
    },
    accounts: [],
    currentNetwork: null,
    //public
    USD: 6.2,
    newWalletIndex: 0,
    RAMPrice: 0,
    REXPrice: 0,
    rental: 0,
    // 将eosjs实例全局化，在redux中管理
    globalEOS: null,
    // 记住的密码
    tempPsw: null,
    surge: Util.randomWord(false, 8),
    // 转账历史
    transferHistory: [],
    // EOS浏览器历史
    browserHistory: [],
    hideAssets: false,
    tokenPrices: {},
    supportExchanges: supportExchanges
};

export default function eosReducer( state = initialState, action ) {
    switch ( action.type ) {
        case eosActionTypes.EOS_UPDATE_EOS:
            return Object.assign({}, state, {
                globalEOS: action.eos
            });
        case eosActionTypes.EOS_UPDATE_PSW:
            return Object.assign({}, state, {
                tempPsw: action.tempPsw
            });
        case eosActionTypes.EOS_UPDATE_RAM_PRICE:
            return Object.assign({}, state, {
                RAMPrice: action.data
            });
        case eosActionTypes.EOS_UPDATE_REX_PRICE:
            return Object.assign({}, state, {
                REXPrice: action.data
            });

        case eosActionTypes.EOS_UPDATE_RENTAL_PRICE:
            return Object.assign({}, state, {
                rental: action.data
            });
        case eosActionTypes.EOS_UPDATE_NETWORKS:
            return Object.assign( {}, state, {
                eosNetworks: action.data
            } );
        case eosActionTypes.EOS_UPDATE_SUPPORTTOKENS:
            return Object.assign( {}, state, {
                supportTokens: action.data
            } );
        case eosActionTypes.EOS_UPDATE_SUPPORTEXCHANGES:
            return Object.assign( {}, state, {
                supportExchanges: action.data
            } );
        case eosActionTypes.EOS_UPDATE_HISTORYNETWORKS:
            return Object.assign( {}, state, {
                historyNetwork: action.data
            } );
        case eosActionTypes.EOS_UPDATE_PRICE:
            return Object.assign( {}, state, {
                USD: action.data
            } );
        case eosActionTypes.EOS_ACCOUNT_UPDATE_INFO: {
            const store = getStore();
            const accounts = store.getState().eosStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( accounts[ index ].primaryKey === action.account.primaryKey ) {
                    accounts[ index ] = Object.assign( {}, accounts[ index ], action.data )
                    break;
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case  eosActionTypes.EOS_ACCOUNT_ADD: {
            const account = Object.assign( {}, emptyEOSWallet, action.data )

            const accounts = eosAccountAdd( account, action.data.primaryKey );

            return Object.assign( {}, state, {
                accounts: accounts,
                newWalletIndex: state.newWalletIndex + 1
            } );
        }
        case eosActionTypes.EOS_ACCOUNT_PASSWORD_CHANGE: {
            const store = getStore();
            const accounts = store.getState().eosStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( accounts[ index ].primaryKey === action.data.account.primaryKey ) {
                    accounts[ index ].passwordHint = action.data.passwordHint;
                    accounts[ index ].aloha = action.data.aloha;
                    break;
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case eosActionTypes.EOS_ACCOUNT_NETWORK_CHANGE: {
            const store = getStore();
            const accounts = store.getState().eosStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( accounts[ index ].primaryKey === action.data.account.primaryKey ) {
                    accounts[ index ].eosNetwork = action.data.eosNetwork;
                    break;
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case eosActionTypes.EOS_ACCOUNT_REMOVE: {
            const accounts = eosAccountRemove( action.data.account );

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case eosActionTypes.EOS_CURRENT_NETWORK_CHANGE: {
            return Object.assign( {}, state, {
                currentNetwork: action.data.eosNetwork
            } );
        }
        // 多币种
        case eosActionTypes.EOS_ACCOUNT_SUPPORT_TOKEN_ADD: {
            return Object.assign( {}, state, {
                accounts: eosAddSupportToken( action.account, action.token ),
            } );
        }
        case eosActionTypes.EOS_ACCOUNT_SUPPORT_TOKEN_REMOVE: {
            return Object.assign( {}, state, {
                accounts: eosRemoveSupportToken( action.account, action.token ),
            } );
        }
        case eosActionTypes.EOS_UPDATE_TOKEN_BALANCE: {
            return Object.assign( {}, state, {
                accounts: eosTokenUpdate( action.account, action.balanceMap ),
            } );
        }
        case eosActionTypes.EOS_ADD_CUSTOM_TOKEN: {
            return Object.assign( {}, state, {
                customTokens: eosAddCustomToken( action.token )
            } );
        }

        case eosActionTypes.EOS_SECRET_UPDATE: {
            return Object.assign({}, state, {
                accounts: eosUpdateAccountToSecret()
            });
        }

        case eosActionTypes.EOS_TRANSFER_HISTORY_UPDATE: {
            return Object.assign({}, state, {
                transferHistory: action.data.transferHistory
            });
        }

        case eosActionTypes.EOS_BROWSER_HISTORY_UPDATE: {
            return Object.assign({}, state, {
                browserHistory: action.data.browserHistory
            });
        }

        case eosActionTypes.EOS_ASSETS_SHOW_TOGGLE: {
            return Object.assign({}, state, {
                hideAssets: action.data.hideAssets
            });
        }

        case eosActionTypes.EOS_UPDATE_TOKEN_PRICE: {
            return Object.assign({}, state, {
                tokenPrices: action.data.tokenPrices
            });
        }

        case eosActionTypes.EOS_ADDTO_HISTORY_STACK: {
            return Object.assign({}, state, {
                accounts: addToAccountHistoryStack( action.account, action.historyData ),
            });
        }

        case eosActionTypes.EOS_RESET_HISTORY_STACK: {
            return Object.assign({}, state, {
                accounts: resetAccountTransHistory()
            });
        }

        default:
            return state;
    }
}

// 历史记录缓存 （因为redux-persist存储有限，暂没使用）
function addToAccountHistoryStack( account, historyData ) {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey  === account.primaryKey ) {
            const historyStack = accounts[index].transaction_history;
            const newHistoryStack = historyStack.concat(historyData);

            newHistoryStack.sort( (a,b) => b.account_action_seq - a.account_action_seq );

            accounts[index].transaction_history = newHistoryStack;

            break;
        }
    }

    return accounts;
}

// 下发的历史记录节点变化时，清空历史记录缓存
function resetAccountTransHistory() {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();
    for ( let index = 0; index < accounts.length; index++ ) {
        accounts[index].transaction_history = [];
    }
    return accounts; // 返回全新的帐号列表
}

// 自定义添加的token
function eosAddCustomToken( token ) {
    const store = getStore();
    const customTokens = store.getState().eosStore.customTokens.slice();

    customTokens.push(token);

    return customTokens;
}

function eosAccountAdd( account, primaryKey) {
    // 初始化默认支持的Token
    initSupportTokens( account );

    const store = getStore();

    const accounts = store.getState().eosStore.accounts.slice();

    if (primaryKey) {
        account.primaryKey = primaryKey;
    } else {
        account.primaryKey = store.getState().walletStore.walletSelfIncrementPrimaryKey;
    }

    // 导入时候的 walletType 根据当前选中链的 netType 来
    account.walletType = getNetType()

    accounts.unshift( account );

    InteractionManager.runAfterInteractions( () => {
        const store = getStore();
        store.dispatch( ( dispatch ) => {
            dispatch( {
                type: walletActionTypes.UPDATE_WALLET_SELF_INCREMENT_PRIMARY_KEY,
                walletSelfIncrementPrimaryKey: account.primaryKey + 1
            } );

            dispatch( {
                type: walletActionTypes.RE_CALC_CURRENT_WALLET_ADDRESS
            } );
        } );
    } );

    return accounts;
}


function eosAccountRemove( account ) {
    const store = getStore();

    const accounts = store.getState().eosStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey === account.primaryKey ) {
            accounts.splice( index, 1 );
            break;
        }
    }

    InteractionManager.runAfterInteractions( () => {
        const store = getStore();
        store.dispatch( ( dispatch ) => {
            dispatch( {
                type: walletActionTypes.RE_CALC_CURRENT_WALLET_ADDRESS
            } );
        } );
    } );

    return accounts;
}

// 多币种的添加与删除
function eosAddSupportToken( account, token ) {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();
    const tokenName = `${token.publisher}_${token.name}`;

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey  === account.primaryKey ) {
            accounts[ index ].supportToken[ tokenName ] = {
                balance: '0',
                isShow: true
            };
            break;
        }
    }

    if (!IS_DEBUG) {
        // 这里 dispatch 一个更新此币种信息的 action
        store.dispatch( updateTokenBalance( account, token, ( err, res ) => {
            if ( err ) {
                console.log( err.message )
            }
        } ) );
    }

    return accounts;
}

function eosRemoveSupportToken( account, token ) {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();
    const tokenName = `${token.publisher}_${token.name}`;

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey  === account.primaryKey ) {

            let keys = Object.keys( accounts[ index ].supportToken );

            const supportToken = {};
            for ( let index1 = 0; index1 < keys.length; index1++ ) {
                supportToken[ keys[ index1 ] ] = account.supportToken[ keys[ index1 ] ];
                if ( keys[ index1 ] === tokenName ) {
                    supportToken[ keys[ index1 ] ] = {
                        balance: account.supportToken[ keys[ index1 ] ].balance,
                        isShow: false
                    }
                }
            }
            accounts[ index ].supportToken = supportToken;
            break;
        }
    }

    return accounts;
}

function eosTokenUpdate (account, balanceMap) {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey  === account.primaryKey ) {
            // 以前导入的钱包需要新增这个字段
            if ( !accounts[ index ].supportToken ) {
                initSupportTokens( accounts[ index ] );
            }
            // 更新token信息
            Object.assign(accounts[ index ].supportToken, balanceMap);
            break;
        }
    }

    return accounts;
}

function initSupportTokens( account ) {
    const EOSTokenList = getSupportTokens();

    if ( !account.supportToken ) {
        account.supportToken = {};

        for ( let index = 0; index < EOSTokenList.length; index++ ) {
            const tokenItem = EOSTokenList[index]
            if ( !tokenItem.can_hide ) {
                account.supportToken[`${tokenItem.publisher}_${tokenItem.name}`] = {
                    balance: '0',
                    isShow: true
                };
            }
        }
    }
}

/**
 * 遍历所有的EOS账户，对EOS原来的账户信息进行数据迁移
 */
function eosUpdateAccountToSecret() {
    const store = getStore();
    const accounts = store.getState().eosStore.accounts.slice();
    for ( let index = 0; index < accounts.length; index++ ) {
        const account = _updateAccountToSecretData(accounts[index]);
        Object.assign(accounts[index], account);
    }
    return accounts; // 返回全新的帐号列表
}

/**
 * 数据迁移逻辑
 * 对账户已有的私钥与密码进行处理
 */
function _updateAccountToSecretData( account ) {
    if ( account.accountPrivateKey && account.accountPrivateKey.length > 0 && account.password && account.password.length > 0 ) {
        account.aloha = CryptoJS.AES.encrypt( JSON.stringify( {
            accountPrivateKey: account.accountPrivateKey,
            isEncrypted: true
        } ), account.password ).toString();

        delete account.accountPrivateKey;
        delete account.password;
    }

    // 迁移加密后的私钥位置
    if (account.accountPrivateKeyData) {
        account.aloha = account.accountPrivateKeyData
        delete account.accountPrivateKeyData;
    }

    // 搭个便车,旧数据没有的字段可以在这里添加
    if ( !account.transaction_history ) {
        account.transaction_history = [];
    }

    return account;
}
