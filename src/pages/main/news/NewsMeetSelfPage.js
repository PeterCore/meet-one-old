import React from 'react';
import NewsMeetSelfPageView from "./NewsMeetSelfPageView";
import { connect } from "react-redux";
import constants from "../../../constants/constants";
import { getNews } from "../../../actions/NewsAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        language: state.settingStore.language
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetNews: ( pageNum, pageSize, callback ) => {
        dispatch( getNews( pageNum, pageSize, constants.NEWS_MEET_SELF, callback ) );
    },
});

const NewsMeetSelfPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( NewsMeetSelfPageView );

export default NewsMeetSelfPage;
