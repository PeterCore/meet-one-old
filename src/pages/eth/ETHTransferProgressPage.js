import React from 'react';
import { connect } from "react-redux";
import ETHTransferProgressPageView from "./ETHTransferProgressPageView";
import { getTransaction } from "../../actions/EthersAction";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        transactionHash: params.transactionHash,
        toAddress: params.toAddress
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetTransaction: ( transactionHash, callback ) => {
        dispatch( getTransaction( transactionHash, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },

});

const ETHTransferProgressPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTransferProgressPageView );

export default ETHTransferProgressPage;
