import React from 'react';
import { connect } from "react-redux";
import EOSDelegatebwPageView from "./EOSDelegatebwPageView";
import { delegatebw } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";


const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;
    let account;
    if (params && params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        account: account,
        BPs: account.BPs,
        USD: state.eosStore.USD,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( delegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
});

const EOSDelegatebwPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSDelegatebwPageView );

export default EOSDelegatebwPage;
