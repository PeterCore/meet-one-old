import React from 'react';
import { connect } from "react-redux";
import EOSMappingTipPageView from "./EOSMappingTipPageView";
import ethers from "ethers";
import { generateEOSWallet } from "../../actions/EthersAction";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey ),
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGenerateEOSWallet: ( callback ) => {
        dispatch( generateEOSWallet( ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
});

const EOSMappingTipPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSMappingTipPageView );

export default EOSMappingTipPage;
