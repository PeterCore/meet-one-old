import React from 'react';
import LanguageSettingPageView from "./LanguageSettingPageView";
import { connect } from "react-redux";
import settingActionTypes from "../../reducers/setting/settingActionTypes";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onChangeLanguage: ( language ) => {
        dispatch( ( dispatch ) => {
            dispatch( { 'type': settingActionTypes.LANGUAGE_UPDATE, deviceLocale: language } );
        } );
    },
});

const LanguageSettingPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( LanguageSettingPageView );

export default LanguageSettingPage;
