import React from 'react';
import { connect } from "react-redux";
import ETHImportByKeystorePageView from "./ETHImportByKeystorePageView";
import { importEtherAccountByKeystore } from "../../actions/EthersAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onImportEtherAccountByKeystore: ( name, password, keystore, callback ) => {
        dispatch( importEtherAccountByKeystore( name, password, keystore, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const ETHImportByKeystorePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHImportByKeystorePageView );

export default ETHImportByKeystorePage;
