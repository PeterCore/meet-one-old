import React from 'react';
import { connect } from "react-redux";
import WalletPasswordChangePageView from "./WalletPasswordChangePageView";
import ethers from "ethers";
import { changeETHWalletPassword } from "../../actions/EthersAction";
import { getCurrentWallet } from "../../actions/WalletAction";
import { changeEOSWalletPassword } from "../../actions/EOSAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onChangeWalletPassword: ( account, oldPassword, newPassword, passwordHint, callback ) => {
        if ( account.walletType === 'ETH' ) {
            dispatch( changeETHWalletPassword( account, oldPassword, newPassword, passwordHint, ( error, result ) => {
                callback && callback( error, result );
            } ) )
        } else {
            dispatch( changeEOSWalletPassword( account, oldPassword, newPassword, passwordHint, ( error, result ) => {
                callback && callback( error, result );
            } ) )
        }
    },
});

const WalletPasswordChangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( WalletPasswordChangePageView );

export default WalletPasswordChangePage;
