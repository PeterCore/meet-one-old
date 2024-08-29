import walletActionTypes from "./walletActionTypes";
import { getStore } from "../../setup";
import { getNetType } from "../../actions/ChainAction";

const initialState = {
    walletSelfIncrementPrimaryKey: 0,
    currentWalletPrimaryKey: undefined,
};

export default function walletReducer( state = initialState, action ) {
    switch ( action.type ) {
        case walletActionTypes.UPDATE_WALLET_SELF_INCREMENT_PRIMARY_KEY:
            return Object.assign( {}, state, {
                walletSelfIncrementPrimaryKey: action.walletSelfIncrementPrimaryKey
            } );
            break;
        case walletActionTypes.UPDATE_WALLET_DEFAULT_PRIMARY_KEY:
            return Object.assign( {}, state, {
                currentWalletPrimaryKey: action.currentWalletPrimaryKey
            } );
            break;
        case walletActionTypes.ACCOUNT_SET_DEFAULT: {
            return Object.assign( {}, state, {
                currentWalletPrimaryKey: action.account.primaryKey,
            } );
        }
        case walletActionTypes.RE_CALC_CURRENT_WALLET_ADDRESS:
            const store = getStore();
            //const ethAccounts = store.getState().ethStore.accounts.slice();
            const eosAccounts = store.getState().eosStore.accounts.slice();

            const currentWalletPrimaryKey = calcCurrentWalletAddress( eosAccounts );

            return Object.assign( {}, state, {
                currentWalletPrimaryKey: currentWalletPrimaryKey,
            } );
        default:
            return state;
    }
}

function calcCurrentWalletAddress( eosAccounts ) {
    const store = getStore();
    const currentWalletPrimaryKey = store.getState().walletStore.currentWalletPrimaryKey;
    const currentNetType = getNetType();
    const accountArray = [];

    for ( let index = 0; index < eosAccounts.length; index++ ) {
        if (eosAccounts[ index ].walletType === currentNetType) {
            accountArray.push(eosAccounts[ index ]);
            if ( eosAccounts[ index ].primaryKey === currentWalletPrimaryKey) {
                return currentWalletPrimaryKey;
            }
        }
    }

    if (accountArray.length > 0) {
        return accountArray[ 0 ].primaryKey;
    }
}
