import React from 'react';
import { connect } from "react-redux";
import ETHCreateWalletPageView from "./ETHCreateWalletPageView";
import { createEtherAccount } from "../../actions/EthersAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onCreateEtherAccount: ( name, password, pswdTip, callback, percentCallback ) => {
        dispatch( createEtherAccount( name, password, pswdTip, null, callback, percentCallback ) );
    },
});

const ETHCreateWalletPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHCreateWalletPageView );

export default ETHCreateWalletPage;
