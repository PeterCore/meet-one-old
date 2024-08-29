import React from 'react';
import MineChangePasswordPageView from "./MineChangePasswordPageView";
import { connect } from "react-redux";
import { memberChangePwd } from '../../../actions/UserAction'
import { NavigationActions, StackActions } from "react-navigation";


const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: state.userStore.account,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTapPasswordForgot: () => {
        ownProps.navigation.navigate( 'AccountRegisterPage', {
            flowType: 'forgotPassword'
        } )
    },
    // onTapLogin: (account, password, callback) => {
    //     dispatch( authLogin(account, password, callback) )
    // }
    changePassword( current, newPwd, callback ) {
        dispatch( memberChangePwd( current, newPwd, ( err, resBody ) => {
            if ( !err ) {
                ownProps.navigation.dispatch(
                    StackActions.reset(
                        {
                            index: 1,
                            actions: [
                                NavigationActions.navigate( { routeName: 'mainPage' } ),
                                NavigationActions.navigate( { routeName: 'AccountLoginPage' } ),
                            ]
                        }
                    )
                );
            }
            callback( err, resBody )
        } ) )
    }
});

const MineChangePassword = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MineChangePasswordPageView );

export default MineChangePassword;
