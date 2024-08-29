import React from 'react';
import { connect } from "react-redux";
import ETHQRCodePageView from "./ETHQRCodePageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const ETHQRCodePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHQRCodePageView );

export default ETHQRCodePage;
