import React from 'react';
import QRScanPageView from "./QRScanPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const QRScanPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( QRScanPageView );

export default QRScanPage;
