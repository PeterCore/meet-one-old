import React from 'react';
import { connect } from "react-redux";
import ETHTokenListSettingPageView from "./ETHTokenListSettingPageView";
import { ethWalletSupportTokenAdd, ethWalletSupportTokenRemove } from "../../actions/EthersAction";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onETHWalletSupportTokenAdd: ( account, tokenName, callback ) => {
        dispatch( ethWalletSupportTokenAdd( account, tokenName, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onETHWalletSupportTokenRemove: ( account, tokenName, callback ) => {
        dispatch( ethWalletSupportTokenRemove( account, tokenName, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const ETHTokenListSettingPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTokenListSettingPageView );

export default ETHTokenListSettingPage;
