import React from 'react';
import { connect } from "react-redux";
import WalletETHWidgetView from "./WalletETHWidgetView";
import {
    getCurrentBlockData,
    getExchangeRates,
    updateAllAccountBalance,
    updateEOSMappingStatus
} from "../../../../../actions/EthersAction";
import ethers from "ethers";
import { getAllWallet, getCurrentWallet, setDefaultWallet } from "../../../../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    return {
        accounts: getAllWallet( state ),
        account: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey ),
        isLoggedIn: state.userStore.isLoggedIn,
        exchangeRates: state.ethStore.exchangeRates,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onSetDefaultWallet: ( account, callback ) => {
        dispatch( setDefaultWallet( account, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    updateETHData: () => {
        dispatch( updateAllAccountBalance( null ) );
        dispatch( getExchangeRates( null ) );
        dispatch( getCurrentBlockData( null ) );
        dispatch( updateEOSMappingStatus( null ) );
    },
});

const WalletETHWidget = connect(
    mapStoreToProps,
    mapDispatchToProps
)( WalletETHWidgetView );

export default WalletETHWidget;
