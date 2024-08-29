import React from 'react';
import { connect } from "react-redux";
import ETHImportBySeedPhrasePageView from "./ETHImportBySeedPhrasePageView";
import { importEtherAccountBySeedPhrase } from "../../actions/EthersAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onCreateEtherAccountBySeedPhrase: ( name, password, pswdTip, hdPathString, seedPhrase, callback ) => {
        dispatch( importEtherAccountBySeedPhrase( name, password, pswdTip, hdPathString, seedPhrase, callback ) )
    },
});

const ETHImportBySeedPhrasePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( ETHImportBySeedPhrasePageView );

export default ETHImportBySeedPhrasePage;
