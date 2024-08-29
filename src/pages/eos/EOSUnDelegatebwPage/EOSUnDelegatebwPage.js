import React from 'react';
import { connect } from "react-redux";
import EOSUnDelegatebwPageView from "./EOSUnDelegatebwPageView";
import { undelegatebw } from "../../../actions/EOSAction";
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
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchUnDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( undelegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res )
        } ) )
    },
});

const EOSUnDelegatebwPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSUnDelegatebwPageView );

export default EOSUnDelegatebwPage;
