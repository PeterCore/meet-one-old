
import CandyPageView from "./CandyPageView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        isLoggedIn: state.userStore.isLoggedIn,
        account: state.userStore.account,
        versionInfo: state.settingStore.versionInfo
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
});

const CandyPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( CandyPageView );

export default CandyPage;
