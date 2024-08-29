import React from 'react';
import NewsTwitterPageView from "./NewsTwitterPageView";
import { connect } from "react-redux";
import { getNews } from "../../../actions/NewsAction";
import constants from "../../../constants/constants";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetNews: ( pageNum, pageSize, callback ) => {
        dispatch( getNews( pageNum, pageSize, constants.NEWS_TWITTER, callback ) );
    },
});

const NewsTwitterPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsTwitterPageView );

export default NewsTwitterPage;
