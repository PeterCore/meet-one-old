import walletActionTypes from "../reducers/wallet/walletActionTypes";
import { getInfo } from "../net/VersionNet";
import { getStore } from "../setup";

export function getCurrentWalletSimple( ) {
    const state = getStore().getState();
    const primaryKey = state.walletStore.currentWalletPrimaryKey
    const ethAccounts = state.ethStore.accounts.slice();
    const eosAccounts = state.eosStore.accounts.slice();

    const accounts = ethAccounts.concat( eosAccounts );

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey === primaryKey ) {
            return accounts[ index ];
        }
    }
}

export function getCurrentWallet( state, primaryKey ) {
    const ethAccounts = state.ethStore.accounts.slice();
    const eosAccounts = state.eosStore.accounts.slice();

    const accounts = ethAccounts.concat( eosAccounts );

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( accounts[ index ].primaryKey === primaryKey ) {
            return accounts[ index ];
        }
    }
}

export function getAllWallet( state ) {
    const ethAccounts = state.ethStore.accounts.slice();
    const eosAccounts = state.eosStore.accounts.slice();

    let accounts = ethAccounts.concat( eosAccounts );

    accounts.sort( function ( a, b ) {
        return a.primaryKey - b.primaryKey
    } );

    return accounts;
}

export function setDefaultWallet( account, callback ) {
    return ( dispatch ) => {
        // 如果是EOS的话，则上传Wallet部分信息
        const {accountName, accountPublicKey: publicKey} = account;
        dispatch( {
            'type': walletActionTypes.ACCOUNT_SET_DEFAULT,
            account: account
        });

        if (account.walletType === 'EOS'){
            getInfo({ accountName, publicKey });
        }
        callback && callback( null, null );
    };
}
