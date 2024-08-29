import React from 'react';
import AccountLoginPageView from "./AccountLoginPageView";
import { connect } from "react-redux";
import { authLogin } from "../../../actions/UserAction";
import { NavigationActions, StackActions } from "react-navigation";


const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTapPasswordForgot: () => {
        ownProps.navigation.navigate( 'AccountRegisterPage', {
            flowType: 'forgotPassword'
        } )
    },
    onTapLogin: ( account, password, callback ) => {
        dispatch( authLogin( account, password, ( err, resBody ) => {
            if ( !err ) {
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
            }
            callback( err, resBody );
        } ) )
    }
});

const AccountLoginPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( AccountLoginPageView );

export default AccountLoginPage;
