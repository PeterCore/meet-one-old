import React from 'react';
import { connect } from "react-redux";
import ETHWalletBackupKeystorePageView from "./ETHWalletBackupKeystorePageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        accounts: state.ethStore.accounts,
        account: getCurrentWallet( state, params.primaryKey ),
        keystore: params.keystore
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const ETHWalletBackupKeystorePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHWalletBackupKeystorePageView );

export default ETHWalletBackupKeystorePage;
