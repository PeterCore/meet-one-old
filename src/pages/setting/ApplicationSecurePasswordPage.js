import View from './ApplicationSecurePasswordPageView';
import { connect } from "react-redux";
// import settingActionTypes from "../../reducers/setting/settingActionTypes";


const mapStoreToProps = ( state, ownProps ) => {
    const {
        applicationPsw
    } = state.settingStore;

    return {
        applicationPsw
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch
});


const ApplicationSecurePasswordPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)(View);

export default ApplicationSecurePasswordPage;
