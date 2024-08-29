import React from 'react';
import MineProfilePageView from "./MineProfilePageView";
import { connect } from "react-redux";
import { authLogout, memberMe, } from "../../../actions/UserAction";
import { NavigationActions, StackActions } from "react-navigation";


const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: state.userStore.account,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTapChangePassword: () => {
        ownProps.navigation.navigate( 'MineChangePasswordPage' )
    },
    onTapUserName: () => {
        ownProps.navigation.navigate( 'MineChangeNamePage' )
    },
    onTapEmail: () => {
        ownProps.navigation.navigate( 'MineEmailPage' )
    },
    onTapLogout: ( callback ) => {
        dispatch( authLogout( ( err, resBody ) => {
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

            callback( err, resBody )
        } ) )
    },
    updateProfile: () => {
        dispatch( memberMe( ( err, resBody ) => {

        } ) )
    },
});

const MineProfilePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MineProfilePageView );

export default MineProfilePage;
