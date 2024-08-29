import React from 'react';
import { connect } from "react-redux";
import ETHWalletInfoPageView from "./ETHWalletInfoPageView";
import { deleteETHWallet, exportETHWalletKeystore, exportETHWalletPrivateKey } from "../../actions/EthersAction";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        accounts: state.ethStore.accounts,
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onExportETHWalletPrivateKey: ( account, password, callback ) => {
        dispatch( exportETHWalletPrivateKey( account, password, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onExportETHWalletKeystore: ( account, password, callback ) => {
        dispatch( exportETHWalletKeystore( account, password, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onDeleteETHWallet: ( account, password, callback ) => {
        dispatch( deleteETHWallet( account, password, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const ETHWalletInfoPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHWalletInfoPageView );

export default ETHWalletInfoPage;
