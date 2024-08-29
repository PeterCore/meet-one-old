import React from 'react';
import { connect } from "react-redux";
import ETHWalletSeedPhrasePageView from "./ETHWalletSeedPhrasePageView";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        seedPhrase: params.seedPhrase,
        hdPathString: params.hdPathString,
    };
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const ETHWalletSeedPhrasePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHWalletSeedPhrasePageView );

export default ETHWalletSeedPhrasePage;
