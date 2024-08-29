import React from 'react';
import AccountRegisterPageView from "./AccountRegisterPageView";
import { connect } from "react-redux";
import { authMobileGetToken, authSetPwd, authVerifyToken, onRegisterSuccess } from "../../../actions/UserAction";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import { NavigationActions, StackActions } from "react-navigation";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        isLoggedIn: state.userStore.isLoggedIn,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    registerPhone: ( countryCode, phone, callback ) => {
        dispatch( authMobileGetToken( {
            countryCode: countryCode,
            mobile: phone,
            type: 0,
        }, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    findPassword: ( countryCode, phone, callback ) => {
        dispatch( authMobileGetToken( {
            countryCode: countryCode,
            mobile: phone,
            type: 1,
        }, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    verifyToken: ( mobile, token, callback ) => {
        dispatch( authVerifyToken( mobile,
            token,
            ( error, result ) => {
                callback && callback( error, result );
            } ) )
    },
    setPassword: ( password, callback ) => {
        dispatch( authSetPwd( password,
            ( error, result ) => {
                callback && callback( error, result );
            } ) )
    },
    onRegisterSuccess: ( account ) => {
        dispatch( onRegisterSuccess(
            account
        ) )

        dispatch(
            StackActions.reset(
                {
                    index: 0,
                    actions: [
                        NavigationActions.navigate( { routeName: 'mainPage' } ),
                    ]
                }
            )
        );
    },
    onTapLogin: () => {
        ownProps.navigation.navigate( 'AccountLoginPage' );
    },
    openTerms: () => {
        ownProps.navigation.navigate( 'WebViewPage',
            {
                url: "https://meet.one/terms.html",
                webTitle: I18n.t( Keys.user_agreement )

            } )
        // Linking.openURL( "https://meet.one/terms.html" ).catch( err => console.error( 'An error occurred', err ) );
    },
});

const AccountRegisterPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( AccountRegisterPageView );

export default AccountRegisterPage;
