
import EOSTransferResultPageView from "./EOSTransferResultPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSTransferResultPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTransferResultPageView );

export default EOSTransferResultPage;
