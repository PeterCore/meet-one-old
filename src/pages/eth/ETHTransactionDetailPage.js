import React from 'react';
import { connect } from "react-redux";
import ETHTransactionDetailPageView from "./ETHTransactionDetailPageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        transaction: params.transaction,
        token: params.token
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const ETHTransactionDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTransactionDetailPageView );

export default ETHTransactionDetailPage;
