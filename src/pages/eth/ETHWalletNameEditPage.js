import React from 'react';
import { connect } from "react-redux";
import ETHWalletNameEditPageView from "./ETHWalletNameEditPageView";
import { updateAccountName } from "../../actions/EthersAction";
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
    onUpdateAccountName: ( jsonWallet, name, callback ) => {
        dispatch( updateAccountName( jsonWallet, name, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const ETHWalletNameEditPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHWalletNameEditPageView );

export default ETHWalletNameEditPage;
