import { fetchVersionList, fetchConfig } from "../net/VersionNet";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import settingActionTypes from "../reducers/setting/settingActionTypes";

// 获取版本信息
export function versionCheckUpate( callback ) {
    return ( dispatch ) => {
        // 请求当前的版本信息
        fetchVersionList((err, res) => {
            if (!err) {
                const resBody = res && JSON.parse(res);
                dispatch( {
                    type: settingActionTypes.VERSION_INFO_UPDATE,
                    versionInfo: resBody
                });
                callback && callback(null ,{data: resBody});
            } else {
                callback && callback( Error( I18n.t(Keys.request_failed)));
            }
        });
    };
}

// 获取配置信息
export function applicationConfigUpdate(callback) {
    return dispatch => {
        // 请求当前的配置信息
        fetchConfig((err, res) => {
            if (!err) {
                const resBody = res && JSON.parse(res);
                if (resBody.code === 0) {
                    dispatch({
                        type: settingActionTypes.APPLICATION_CONFIG_UPDATE,
                        config: resBody
                    });
                }
                callback && callback(null, {data: res.resBody});
            } else {
                callback && callback( Error( I18n.t(Keys.request_failed)));
            }
        });
    };
}
