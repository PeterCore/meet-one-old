import React from 'react';
import NewsWeiboPageView from "./NewsWeiboPageView";
import { connect } from "react-redux";
import { getNews } from "../../../actions/NewsAction";
import constants from "../../../constants/constants";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetNews: ( pageNum, pageSize, callback ) => {
        dispatch( getNews( pageNum, pageSize, constants.NEWS_WEI_BO, callback ) );
    },
});

const NewsWeiboPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsWeiboPageView );

export default NewsWeiboPage;
