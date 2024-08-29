import React from 'react';
import { connect } from "react-redux";
import ETHTokenDetailPageView from "./ETHTokenDetailPageView";
import { getEtherTransactions, getTokenTransactionHistory, getTransactionCount } from "../../actions/EthersAction";
import ethers from "ethers";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        token: params.token,
        exchangeRates: state.ethStore.exchangeRates,
        blockData: state.ethStore.blockData,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetTransactionCount: ( account, callback ) => {
        dispatch( getTransactionCount( account, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onGetTokenTransactionHistory: ( account, contractAddress, callback ) => {
        dispatch( getTokenTransactionHistory( account, contractAddress, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },

    onGetEtherTransactions: ( account, callback ) => {
        dispatch( getEtherTransactions( account, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },


});

const ETHTokenDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTokenDetailPageView );

export default ETHTokenDetailPage;
