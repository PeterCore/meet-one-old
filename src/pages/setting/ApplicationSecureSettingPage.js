import View from './ApplicationSecureSettingPageView';
import { connect } from "react-redux";
import settingActionTypes from "../../reducers/setting/settingActionTypes";

const mapStoreToProps = ( state, ownProps ) => {
    const {
        enableLock,
        enableLockWhenBackground,
        enableBiologyId,
        applicationPsw,
        biologyType
    } = state.settingStore;

    return {
        enableLock,
        enableLockWhenBackground,
        enableBiologyId,
        applicationPsw,
        biologyType
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    // 切换是否打开登录密码
    onTapEnableLock: (enableLock) => {
        dispatch({
            type: settingActionTypes.APPLICATION_LOCK_UPDATE,
            enableLock
        })
    },
    // 切换是否打开生物验证
    onTapEnableBiologyId: (enableBiologyId) => {
        dispatch({
            type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_UPDATE,
            enableBiologyId
        })
    },
    // 切换是否进入后台立即锁定
    onTapEnableBackground: (enableLockWhenBackground) => {
        dispatch({
            type: settingActionTypes.APPLICATION_LOCK_BACKGROUND_UPDATE,
            enableLockWhenBackground
        })
    }
});

const ApplicationSecureSettingPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)(View);

export default ApplicationSecureSettingPage;
