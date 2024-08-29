import React from 'react';
import SystemSettingsPageView from "./SystemSettingsPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // onTapManagerWallet: () => {
    //     ownProps.navigation.navigate( 'WalletListPage' )
    // },
    // onTapTransactionHistory: () => {
    //     ownProps.navigation.navigate( 'ETHWalletHistoryPage' )
    // },
    // onTapSystemSetting:() => {
    //
    // },

    onTapLanguageSelect: () => {
        ownProps.navigation.navigate( 'LanguageSettingPage' )
    },
    onTapPushNotificationSetting: () => {
        ownProps.navigation.navigate( 'PushNotificationSettingPage' )
    },
});

const SystemSettingsPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( SystemSettingsPageView );

export default SystemSettingsPage;