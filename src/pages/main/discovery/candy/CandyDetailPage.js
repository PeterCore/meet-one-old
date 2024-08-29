import React from 'react';
import { Platform } from 'react-native';
import CandyDetailPageView from "./CandyDetailPageView";
import { connect } from "react-redux";
import NavigationUtil from "../../../../util/NavigationUtil";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        isLoggedIn: state.userStore.isLoggedIn,
        account: state.userStore.account,
        versionInfo: state.settingStore.versionInfo
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({

    openLink: (href) => {
        Platform.OS === 'ios' ?
        NavigationUtil.openBrowser({url: href}):
        NavigationUtil.openWebView(ownProps.navigation, {url: href})
        // ownProps.navigation.navigate( 'WebViewPage', { url: href }) :
    },
});

const MainDiscoveryPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( CandyDetailPageView );

export default MainDiscoveryPage;
