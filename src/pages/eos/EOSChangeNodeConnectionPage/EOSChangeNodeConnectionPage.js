import React from 'react';
import { connect } from "react-redux";
import EOSChangeNodeConnectionPageView from "./EOSChangeNodeConnectionPageView";


const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSChangeNodeConnectionPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSChangeNodeConnectionPageView );

export default EOSChangeNodeConnectionPage;
