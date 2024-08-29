import React from 'react';
import NewsSharePageView from "./NewsSharePageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        news: params.news,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const NewsSharePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsSharePageView );

export default NewsSharePage;
