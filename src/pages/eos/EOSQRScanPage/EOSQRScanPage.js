
import EOSQRScanPageView from "./EOSQRScanPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSQRScanPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSQRScanPageView );

export default EOSQRScanPage;
