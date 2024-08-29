import React from 'react';
import { connect } from "react-redux";
import EOSMappingVerifyPageView from "./EOSMappingVerifyPageView";
import ethers from "ethers";
import { getTransaction } from "../../actions/EthersAction";
import { getCurrentWallet } from "../../actions/WalletAction";

const { HDNode, providers, utils, Wallet } = ethers;

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        eosWallet: params.eosWallet,
        transactionHash: params.transactionHash
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetTransaction: ( transactionHash, callback ) => {
        dispatch( getTransaction( transactionHash, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
});

const EOSMappingVerifyPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSMappingVerifyPageView );

export default EOSMappingVerifyPage;
