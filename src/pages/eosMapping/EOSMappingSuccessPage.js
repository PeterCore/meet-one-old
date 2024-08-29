import React from 'react';
import { connect } from "react-redux";
import EOSMappingSuccessPageView from "./EOSMappingSuccessPageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        eosWallet: params.eosWallet,
        transactionHash: params.transactionHash,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSMappingSuccessPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSMappingSuccessPageView );

export default EOSMappingSuccessPage;
