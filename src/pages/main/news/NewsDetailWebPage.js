import React from 'react';
import NewsDetailWebPageView from "./NewsDetailWebPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        news: params.news,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const NewsDetailWebPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsDetailWebPageView );

export default NewsDetailWebPage;
