import React from 'react';
import { connect } from "react-redux";
import ETHWalletBackupPrivateKeyPageView from "./ETHWalletBackupPrivateKeyPageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;


    return {
        accounts: state.ethStore.accounts,
        account: getCurrentWallet( state, params.primaryKey ),
        privateKey: params.privateKey
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const ETHWalletBackupPrivateKeyPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHWalletBackupPrivateKeyPageView );

export default ETHWalletBackupPrivateKeyPage;
