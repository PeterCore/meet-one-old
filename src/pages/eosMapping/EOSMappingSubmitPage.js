import React from 'react';
import { connect } from "react-redux";
import EOSMappingSubmitPageView from "./EOSMappingSubmitPageView";
import { doEOSMapping, estimateGas } from "../../actions/EthersAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        accounts: state.ethStore.accounts,
        eosWallet: params.eosWallet,
        exchangeRates: state.ethStore.exchangeRates,
        blockData: state.ethStore.blockData,
        transferGasLimit: state.ethStore.transferGasLimit,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onEstimateGas: ( token, callback ) => {
        dispatch( estimateGas( token, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
    onDoEOSMapping: ( account, gasLimit, gasPrice, password, publicKey, callback ) => {
        dispatch( doEOSMapping( account, gasLimit, gasPrice, password, publicKey, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },

});

const EOSMappingSubmitPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSMappingSubmitPageView );

export default EOSMappingSubmitPage;
