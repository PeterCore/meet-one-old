import React from 'react';
import { Platform } from 'react-native';
import EOSTokenInfoPageView from "./EOSTokenInfoPageView";
import { connect } from "react-redux";
import NavigationUtil from "../../../util/NavigationUtil";

const mapStoreToProps = ( state, ownProps ) => {
    return {

    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    openLink: (href) => {
        Platform.OS === 'ios' ?
        NavigationUtil.openBrowser({url: href}):
        NavigationUtil.openWebView(ownProps.navigation, {url: href})
    },
});

const EOSTokenInfoPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTokenInfoPageView );

export default EOSTokenInfoPage;
