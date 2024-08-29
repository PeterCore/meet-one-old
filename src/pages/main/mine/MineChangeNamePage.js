import React from 'react';
import MineChangeNamePageView from "./MineChangeNamePageView";
import { connect } from "react-redux";
import { memberSetName, } from "../../../actions/UserAction"


const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: state.userStore.account,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // onTapPasswordForgot: () => {
    //     ownProps.navigation.navigate('AccountRegisterPage', {
    //         flowType: 'forgotPassword'
    //     })
    // },
    onSetUserName: ( name, callback ) => {
        dispatch( memberSetName( name, callback ) )
    }
});

const MineChangeNamePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MineChangeNamePageView );

export default MineChangeNamePage;