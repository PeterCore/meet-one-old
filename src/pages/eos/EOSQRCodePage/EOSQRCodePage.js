import { connect } from "react-redux";
import EOSQRCodePageView from "./EOSQRCodePageView";
import { getCurrentWallet } from "../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const EOSQRCodePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSQRCodePageView );

export default EOSQRCodePage;
