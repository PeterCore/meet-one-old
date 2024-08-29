import React from 'react';
import { Linking } from 'react-native';
import AboutPageView from "./AboutPageView";
import { connect } from "react-redux";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import { updateChangeBtnState } from "../../actions/ChainAction";


const mapStoreToProps = ( state, ownProps ) => {
    return {
        showChangeBtn: state.chainStore.showChangeBtn,
        language: state.settingStore.language,
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    openTerms: (language) => {
        let lang = language.split('-')[0] || 'zh';
        lang === 'zh' ?
        ownProps.navigation.navigate( 'WebViewPage',
            {
                url: "https://dapp.ethte.com/terms.html?hide_float_btn=1",
                webTitle: I18n.t( Keys.user_agreement )
            } )
        :
        ownProps.navigation.navigate( 'WebViewPage',
            {
                url: "https://meet.one/terms.html?hide_float_btn=1",
                webTitle: I18n.t( Keys.user_agreement )
            } )
        // Linking.openURL( "https://meet.one/terms.html" ).catch( err => console.error( 'An error occurred', err ) );
    },
    openTelegramWebsit: (language) => {
        let lang = language.split('-')[0] || 'zh';
        lang === 'zh' ?
            Linking.openURL("https://t.me/MeetOne").catch(err => console.error('An error occurred', err)) :
            Linking.openURL("https://t.me/MeetOneEnglish").catch(err => console.error('An error occurred', err));
    },
    openOfficalWebsit: () => {
        // ownProps.navigation.navigate( 'WebViewPage',
        //     {
        //         url: "https://meet.one/",
        //         webTitle: I18n.t( Keys.user_agreement )
        //
        //     } )
        Linking.openURL( "https://meet.one/" ).catch( err => console.error( 'An error occurred', err ) );
    },
    openChainChangePage: () => {
        ownProps.navigation.navigate( 'EOSChainChangePage');
    },
    showChangeChainBtn: () => {
        dispatch(updateChangeBtnState(true));
    },
    openSubmitDAppPage: (language) => {
        let lang = language.split('-')[0] || 'zh';
        lang === 'zh' ?
            ownProps.navigation.navigate( 'WebViewPage',
            {
                url: "http://sg.mikecrm.com/jiPbeGH?hide_float_btn=1",
                webTitle: I18n.t( Keys.user_agreement )

            } ) :
            ownProps.navigation.navigate( 'WebViewPage',
            {
                url: "http://sg.mikecrm.com/d33UaXy?hide_float_btn=1",
                webTitle: I18n.t( Keys.user_agreement )

            } )
    },
    openHelpCenter: (language) => {
        let lang = language.split('-')[0] || 'zh';
        switch (lang) {
            case 'zh':
                ownProps.navigation.navigate( 'WebViewPage', { url: "https://eosiomeetone.zendesk.com/hc/zh-cn?hide_float_btn=1" } );
                break;
            case 'en':
                ownProps.navigation.navigate( 'WebViewPage', { url: "https://eosiomeetone.zendesk.com/hc/en-us?hide_float_btn=1" } );
                break;
            case 'ko':
                ownProps.navigation.navigate( 'WebViewPage', { url: "https://eosiomeetone.zendesk.com/hc/ko?hide_float_btn=1" } );
                break;
            default:
                ownProps.navigation.navigate( 'WebViewPage', { url: "https://eosiomeetone.zendesk.com/hc/en-us?hide_float_btn=1" } );
                break;
        }
    },
});

const AboutPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( AboutPageView );

export default AboutPage;
