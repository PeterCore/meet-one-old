// import React from 'react';
import { connect } from 'react-redux';
import ETHTransactionListPageView from "./ETHTransactionListPageView";
// import ethers from "ethers";
import { getEtherTransactions } from "../../actions/EthersAction";
// import { getCurrentWallet } from "../../actions/WalletAction";

// const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    return {
        // accounts: state.ethStore.accounts,
        // account: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey )
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetEtherTransactions: ( account, callback ) => {
        dispatch( getEtherTransactions( account, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
});

const ETHTransactionListPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHTransactionListPageView );

export default ETHTransactionListPage;
