import React from 'react';
import PushNotificationSettingPageView from "./PushNotificationSettingPageView";
import { connect } from "react-redux";
import settingActionTypes from "../../reducers/setting/settingActionTypes";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        enableImportantNewsNotification: state.settingStore.enableImportantNewsNotification
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onChangePushSetting: ( isOpen ) => {
        dispatch( ( dispatch ) => {
            dispatch( {
                'type': settingActionTypes.SETTING_IMPORTANT_NEWS_NOTIFICATION,
                enableImportantNewsNotification: isOpen
            } );
        } );
    },
});

const PushNotificationSettingPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( PushNotificationSettingPageView );

export default PushNotificationSettingPage;
