import React from 'react';
import NewsDetailPageView from "./NewsDetailPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        news: params.news,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const NewsDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsDetailPageView );

export default NewsDetailPage;
