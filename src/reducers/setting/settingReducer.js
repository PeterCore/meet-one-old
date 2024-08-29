import settingActionTypes from "./settingActionTypes";
import Util from "../../util/Util";

const initialState = {
    isInit: true,
    enableVersionNotification: true,
    enableImportantNewsNotification: true,
    language: Util.calcDeviceLanguage(),
    versionInfo: {},
    cpuFloatBtnSetting: null,
    discoveryAlertList: [], // 发现页免责声明提醒记录（用于排除掉重复提示）
    discoveryAlertList_v2: [], // 发现页免责声明提醒记录（用于排除掉重复提示）v2版本
    gamesUsedList: [], // 游戏中心最近使用队列， 长度定义为4
    discoveryUsedList: [], // Discovery发现页最近使用，包含游戏中心最近使用+Dapps中心最近使用
    enableLock: false, // 是否打开应用锁
    enableLockWhenBackground: true, // 是否允许进入后台即锁定（默认开）
    enableBiologyId: true, // 是否允许生物识别
    biologyType: null, // 判断生物识别的方法 FaceID | TouchID | null
    isLockScreen: false, // 是否锁屏
    isNumberUnlock: false, // 是否使用密码解锁中
    applicationPsw: null, // 应用锁密码
    applicationPswTips: null, // 应用锁密码提示
    waitingURI: null, // 等待协议
    waitingComponent: null, // 等待唤起协议的组件
    isRememberPassword: false, // 是否记住免密码的勾选
    config: {} // 全局变量配置
};

export default function settingReducer( state = initialState, action ) {
    switch ( action.type ) {
        case settingActionTypes.APPLICATION_CONFIG_UPDATE: {
            const {data= {}} = action.config;
            return {
                ...state,
                config: data
            }
        }
        // 浏览器 CPU爆了浮窗 是否显示
        case settingActionTypes.TOGGLE_CPU_FLOAT_BUTTON: {
            return {
                ...state,
                cpuFloatBtnSetting: action.floatBtnShow
            }
        }
        // 发现页最近使用更新
        case settingActionTypes.DISCOVERY_USED_LIST_UPDATE: {
            let resultList = state.discoveryUsedList;

            let index = state.discoveryUsedList.indexOf(action.id)
            if (index !== -1) {
                resultList.splice(index, 1);
            }

            if (state.discoveryUsedList.length >= 4) {
                resultList.pop();
            }

            resultList.unshift(action.id);

            return {
                ...state,
                discoveryUsedList: resultList
            }
        }
        // 更新游戏中心最近使用
        case settingActionTypes.GAMES_USED_LIST_UPDATE: {
            let resultList = state.gamesUsedList;


            let index = state.gamesUsedList.indexOf(action.id)
            if (index !== -1) {
                resultList.splice(index, 1);
            }

            if (state.gamesUsedList.length >= 4) {
                resultList.pop();
            }

            resultList.unshift(action.id);

            return {
                ...state,
                gamesUsedList: resultList
            }
        }
        // 免责声明记录更新
        case settingActionTypes.DISCOVERY_ALERT_UPDATE: {
            return {
                ...state,
                discoveryAlertList: action.discoveryAlertList
            }
        }
        // 记住免密码的勾选状态更新
        case settingActionTypes.APPLICATION_REMEMBER_PASSWORD: {
            return {
                ...state,
                isRememberPassword: action.isRememberPassword
            }
        }
        case settingActionTypes.SETTING_IMPORTANT_NEWS_NOTIFICATION:
            return Object.assign( {}, state, {
                enableImportantNewsNotification: action.enableImportantNewsNotification
            } );
        case settingActionTypes.SETTING_NEW_VERSION_NOTIFICATION:
            return Object.assign( {}, state, {
                enableVersionNotification: action.enableVersionNotification
            } );
        case settingActionTypes.LANGUAGE_UPDATE:
            return {
                ...state,
                language: action.deviceLocale,
            };
        case settingActionTypes.VERSION_INFO_UPDATE:
            return {
                ...state,
                versionInfo: action.versionInfo
            }
        case settingActionTypes.IS_INIT:
            return {
                ...state,
                isInit: action.isInit
            }
        case settingActionTypes.APPLICATION_LOCK_UPDATE:
            return {
                ...state,
                enableLock: action.enableLock
            }
        case settingActionTypes.APPLICATION_LOCK_BACKGROUND_UPDATE:
            return {
                ...state,
                enableLockWhenBackground: action.enableLockWhenBackground
            }
        case settingActionTypes.APPLICATION_LOCK_BIOLOGY_UPDATE:
            return {
                ...state,
                enableBiologyId: action.enableBiologyId
            }
        case settingActionTypes.APPLICATION_PASSWORD_UPDATE:
            return {
                ...state,
                applicationPsw: action.applicationPsw
            }
        case settingActionTypes.APPLICATION_PASSWORD_TIPS_UPDATE:
            return {
                ...state,
                applicationPswTips: action.applicationPswTips
            }
        case settingActionTypes.APPLICATION_LOCK_STATUS:
            return {
                ...state,
                isLockScreen: action.isLockScreen
            }
        case settingActionTypes.APPLICATION_NUMBER_UNLOCK:
            return {
                ...state,
                isNumberUnlock: action.isNumberUnlock
            }
        case settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE:
            return {
                ...state,
                biologyType: action.biologyType
            }
        case settingActionTypes.APPLICATION_WAITING_URI:
            return {
                ...state,
                waitingURI: action.waitingURI
            }
        case settingActionTypes.APPLICATION_WAITING_COMPONENT:
            return {
                ...state,
                waitingComponent: action.waitingComponent
            }
        default:
            return state;
    }
}
