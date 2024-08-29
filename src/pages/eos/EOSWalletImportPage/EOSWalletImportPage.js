import React from 'react';
import { connect } from "react-redux";
import EOSWalletImportPageView from "./EOSWalletImportPageView";
import { addEOSWallet, getKeyAccountByPrivateKey } from "../../../actions/EOSAction";
import {getCurrentWallet} from "../../../actions/WalletAction";
import { getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        netType: getNetType(),
        language: state.settingStore.language,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchGetAccountNames: ( privateKey, callback ) => {
        dispatch( getKeyAccountByPrivateKey( privateKey, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },

    onAddEOSWallet: ( accountPrivateKey, accountName, password, passwordHint, callback ) => {
        dispatch( addEOSWallet( accountPrivateKey, accountName, password, passwordHint, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) );
    },
});

const EOSWalletImportPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSWalletImportPageView );

export default EOSWalletImportPage;
