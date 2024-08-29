import React from 'react';
import NotificationPageView from "./NotificationPageView";
import { connect } from "react-redux";
import { getNotification } from "../../actions/NotificatiponAction";

const mapStoreToProps = ( store, ownProps ) => {
    return {
        account: store.userStore.account,
    }
};

const mapDispatchToProps = ( dispatch, store, ownProps ) => ({
    onGetNotification: ( ownerId, pageNum, pageSize, callback ) => {
        dispatch( getNotification( ownerId, pageNum, pageSize, callback ) );
    },
});

const NotificationPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NotificationPageView );

export default NotificationPage;
