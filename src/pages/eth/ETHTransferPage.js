import React from 'react';
import { connect } from "react-redux";
import ETHTransferPageView from "./ETHTransferPageView";
import { estimateGas, sendETHTransaction, transfer } from "../../actions/EthersAction";
import ethers from "ethers";
import * as env from "../../env";
import DEBUG_DATA from "../../DEBUG_DATA";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    let fromPrimaryKey = params.primaryKey;

    if ( !fromPrimaryKey ) {
        fromPrimaryKey = state.walletStore.currentWalletPrimaryKey;
    }

    return {
        account: getCurrentWallet( state, fromPrimaryKey ),
        token: params.token,
        toAddress: params.toAddress ? params.toAddress : (env.IS_DEBUG ? DEBUG_DATA.toAddress : ''),
        exchangeRates: state.ethStore.exchangeRates,
        blockData: state.ethStore.blockData,
        transferGasLimit: state.ethStore.transferGasLimit,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTransfer: ( token, account, gasLimit, gasPrice, toAddress, amount, remark, password, callback ) => {
        dispatch( transfer( token, account, gasLimit, gasPrice, toAddress, amount, remark, password, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },

    onEstimateGas: ( token, callback ) => {
        dispatch( estimateGas( token, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
});

const ETHTransferPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTransferPageView );

export default ETHTransferPage;
