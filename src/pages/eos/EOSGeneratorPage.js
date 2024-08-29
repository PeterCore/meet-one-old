import React from 'react';
import EOSGeneratorPageView from "./EOSGeneratorPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSGeneratorPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSGeneratorPageView );

export default EOSGeneratorPage;
