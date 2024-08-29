import React from 'react';
import { connect } from "react-redux";
import ETHImportByPrivateKeyPageView from "./ETHImportByPrivateKeyPageView";
import { importEtherAccountByPrivateKey } from "../../actions/EthersAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onImportEtherAccountByPrivateKey: ( name, password, pswdTip, privateKey, callback ) => {
        dispatch( importEtherAccountByPrivateKey( name, password, pswdTip, privateKey, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const ETHImportByPrivateKeyPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHImportByPrivateKeyPageView );

export default ETHImportByPrivateKeyPage;
