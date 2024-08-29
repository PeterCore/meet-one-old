import ethActionTypes from "./ethActionTypes";
import { getStore } from "../../setup";
import * as env from "../../env";
import { updateAccountBalance, updateEOSMappingStatus } from "../../actions/EthersAction";
import ethers from 'ethers';
import walletActionTypes from "../wallet/walletActionTypes";
import { InteractionManager } from "react-native";

const { HDNode, providers, utils, Wallet } = ethers;
const initialState = {
    accounts: [],
    currentWalletAddress: '',
    exchangeRates: {},
    blockData: {},
    transferGasLimit: {},
    newWalletIndex: 0
};

export default function ethReducer( state = initialState, action ) {
    switch ( action.type ) {
        case ethActionTypes.ETH_ACCOUNT_ADD: {
            const accounts = ethAccountAdd( action.account );

            return Object.assign( {}, state, {
                accounts: accounts,
                newWalletIndex: state.newWalletIndex + 1
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_REMOVE: {
            const accounts = ethAccountRemove( action.account );

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_UPDATE_NAME: {
            const store = getStore();
            const accounts = store.getState().ethStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === utils.getAddress( action.account.jsonWallet.address ) ) {
                    accounts[ index ].name = action.account.name.trim();
                    break;
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_PASSWORD_CHANGE: {
            const store = getStore();
            const accounts = store.getState().ethStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === utils.getAddress( action.account.jsonWallet.address ) ) {
                    accounts[ index ].jsonWallet = action.account.jsonWallet;
                    accounts[ index ].pswdTip = action.account.pswdTip;
                    break;
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_UPDATE_BALANCE: {
            return Object.assign( {}, state, {
                accounts: ethWalletBalanceUpdate( action.balanceMap ),
            } );
        }
        case ethActionTypes.ETH_UPDATE_EXCHANGE_RATE: {
            return Object.assign( {}, state, {
                exchangeRates: action.exchangeRates,
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_SUPPORT_TOKEN_ADD: {
            return Object.assign( {}, state, {
                accounts: ethWalletAddressAddSupportToken( action.account, action.tokenName ),
            } );
        }
        case ethActionTypes.ETH_ACCOUNT_SUPPORT_TOKEN_REMOVE: {
            return Object.assign( {}, state, {
                accounts: ethWalletAddressRemoveSupportToken( action.account, action.tokenName ),
            } );
        }
        case ethActionTypes.ETH_CURRENT_BLOCK_DATA: {
            return Object.assign( {}, state, {
                blockData: action.blockData,
            } );
        }
        case ethActionTypes.ETH_UPDATE_EOS_MAPPING_STATUS: {
            const store = getStore();
            const accounts = store.getState().ethStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                if ( action.mappingDataMap[ utils.getAddress( accounts[ index ].jsonWallet.address ) ] ) {
                    accounts[ index ].mappingData = action.mappingDataMap[ utils.getAddress( accounts[ index ].jsonWallet.address ) ];
                }
            }

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        }
        case ethActionTypes.ETH_UPDATE_TRANSFER_GAS_LIMIT: {
            const store = getStore();
            const transferGasLimit = Object.assign( {}, store.getState().ethStore.transferGasLimit, {} );

            transferGasLimit[ action.token ] = action.gasLimit;

            return Object.assign( {}, state, {
                transferGasLimit: transferGasLimit,
            } );
        }
        case ethActionTypes.ETH_WALLET_INIT_PRIMARY_KEY:
            const store = getStore();
            const accounts = store.getState().ethStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                accounts[ index ].primaryKey = index + 1;
                accounts[ index ].walletType = 'ETH';

                if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === state.currentWalletAddress ) {
                    const store = getStore();

                    InteractionManager.runAfterInteractions( () => {
                        const store = getStore();
                        store.dispatch( ( dispatch ) => {
                            dispatch( {
                                'type': walletActionTypes.UPDATE_WALLET_DEFAULT_PRIMARY_KEY,
                                currentWalletPrimaryKey: accounts[ index ].primaryKey
                            } );
                        } );
                    } );
                }
            }

            InteractionManager.runAfterInteractions( () => {
                const store = getStore();
                store.dispatch( ( dispatch ) => {
                    dispatch( {
                        'type': walletActionTypes.UPDATE_WALLET_SELF_INCREMENT_PRIMARY_KEY,
                        walletSelfIncrementPrimaryKey: accounts.length + 1
                    } );
                } );
            } );

            return Object.assign( {}, state, {
                accounts: accounts,
            } );
        default:
            return state;
    }
}


function ethAccountAdd( account ) {
    initSupportTokens( account );

    const store = getStore();

    const accounts = store.getState().ethStore.accounts.slice();

    account.primaryKey = store.getState().walletStore.walletSelfIncrementPrimaryKey;
    account.walletType = 'ETH';

    accounts.unshift( account );

    store.dispatch( updateAccountBalance( account, ( err, res ) => {
        if ( err ) {
            console.log( err.message )
        }
    } ) );

    store.dispatch( updateEOSMappingStatus( ( err, res ) => {
        if ( err ) {
            console.log( err.message )
        }
    } ) );

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


function ethAccountRemove( account ) {
    const store = getStore();

    const accounts = store.getState().ethStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === utils.getAddress( account.jsonWallet.address ) ) {
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

function ethWalletAddressAddSupportToken( account, tokenName ) {
    const store = getStore();
    const accounts = store.getState().ethStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === utils.getAddress( account.jsonWallet.address ) ) {
            if ( !account.supportToken[ tokenName ] ) {
                account.supportToken[ tokenName ] = '0'
            }
        }
    }

    store.dispatch( updateAccountBalance( account, ( err, res ) => {
        if ( err ) {
            console.log( err.message )
        }
    } ) );

    return accounts;
}

function ethWalletAddressRemoveSupportToken( account, tokenName ) {
    const store = getStore();
    const accounts = store.getState().ethStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === utils.getAddress( account.jsonWallet.address ) ) {
            let keys = Object.keys( accounts[ index ].supportToken );

            const supportToken = {};
            for ( let index1 = 0; index1 < keys.length; index1++ ) {
                if ( keys[ index1 ] !== tokenName ) {
                    supportToken[ keys[ index1 ] ] = account.supportToken[ keys[ index1 ] ];
                }
            }
            account.supportToken = supportToken;
        }
    }

    return accounts;
}

function ethWalletBalanceUpdate( balanceMap ) {
    const store = getStore();
    const accounts = store.getState().ethStore.accounts.slice();

    if ( balanceMap ) {
        for ( let index = 0; index < accounts.length; index++ ) {
            const address = utils.getAddress( accounts[ index ].jsonWallet.address );
            if ( balanceMap[ address ] ) {
                const balances = balanceMap[ address ];

                if ( !accounts[ index ].supportToken ) {
                    initSupportTokens( accounts[ index ] );
                }

                let keys = Object.keys( accounts[ index ].supportToken );
                for ( let index1 = 0; index1 < keys.length; index1++ ) {
                    if ( balances[ keys[ index1 ] ] ) {
                        accounts[ index ].supportToken[ keys[ index1 ] ] = balances[ keys[ index1 ] ];
                    }
                }
            }
        }
    }

    return accounts;
}

function initSupportTokens( account ) {
    if ( !account.supportToken ) {
        account.supportToken = {};

        for ( let index = 0; index < env.ERC20Token.length; index++ ) {
            if ( !env.ERC20Token[ index ].can_hide ) {
                account.supportToken[ env.ERC20Token[ index ].name ] = '0';
            }
        }
    }

}