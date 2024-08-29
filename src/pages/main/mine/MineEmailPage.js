import React from 'react';
import MineEmailPageView from "./MineEmailPageView";
import { connect } from "react-redux";
import { memberBindEmail } from "../../../actions/UserAction";


const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: state.userStore.account,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    bindEmail: ( email, callback ) => {
        dispatch( memberBindEmail( email, callback ) )
    },
    resentVerifyEmail: ( email, callback ) => {
        dispatch( memberBindEmail( email, callback ) )
    },
    unBindEmail: ( account, callback ) => {

    }
});

const MineEmailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MineEmailPageView );

export default MineEmailPage;