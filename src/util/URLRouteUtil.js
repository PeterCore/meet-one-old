import EOSWalletSDK from "../sdk/EOSWalletSDK";
import WebProtocolSDK from "../sdk/WebProtocolSDK";
import AppCommonSDK from "../sdk/AppCommonSDK";
import SimpleWalletSDK from "../sdk/SimpleWalletSDK";
import { Linking, Alert } from "react-native";
import NavigationUtil from "../util/NavigationUtil";
import Util from '../util/Util';
import I18n from "../I18n";
import Keys from "../configs/Keys";
import settingActionTypes from "../reducers/setting/settingActionTypes";

const URLRouteUtil = {

    /**
     * 判断 scheme 是否为 'matchScheme'
     * @returns {boolean}
     */
    detectScheme: (url, matchScheme) => {
        let tempArray = url.match(/.*?:\/\//g);
        //协议头
        let scheme = "";
        if (tempArray  && tempArray.length > 0) {
            scheme = tempArray[0]
        }
        return scheme === matchScheme// e.g.'meetone://';
    },

    /**
     * 解析URL, scheme不做加解密
     * @returns {string} path - AES解密后的路径
     */
    decryptURL: (url, scheme) => {
        if (URLRouteUtil.detectScheme(url, scheme)) {
            let path = url.replace(scheme, '');
            return path;
        }
    },

    /**
     * 调用EOS SDK
     * @param {Component} component - 调用者的Component对象
     * @param {string} eosPath 路径
     * @param {function} callback 回调
     */
    invokeEOS: function(component, eosPath, callback) {
        EOSWalletSDK.handlePath(component, eosPath, callback);
    },

    /**
     * 调用内部Web协议
     * @param {Component} component - 调用者的Component对象
     * @param {string} webPath 路径
     * @param {function} callback 回调
     */
    invokeWeb: function(component, webPath, callback) {
        WebProtocolSDK.handlePath(component, webPath, callback);
    },

    /**
     * 调用App协议
     * @param {Component} component - 调用者的Component对象
     * @param {string} appPath 路径
     * @param {function} callback 回调
     */
    invokeApp: function(component, appPath, callback) {
        AppCommonSDK.handlePath(component, appPath, callback);
    },

    /**
     * 调用SimpleWallet EOS SDK
     * @param {Component} component - 调用者的Component对象
     * @param {string} eosPath 路径
     * @param {function} callback 回调
     */
    invokeSimpleWallet: function(component, eosPath, callback) {
        SimpleWalletSDK.handlePath(component, eosPath, callback);
    },

    invokeETH: function(component, ethPath, callback) {},

    /**
     * 发起协议请求
     */
    invokeScheme: function(schemeURL, callbackId, redirectURL) {
        // 捕获到异常的话，认为是没有安装MoreOne，跳转到下载链接
        Linking.openURL(schemeURL + '&callbackId=' + callbackId)
            .catch( err => {
                if (redirectURL) {
                    NavigationUtil.openBrowser({url: redirectURL});
                }
                console.error( 'An error occurred when invokeScheme', err )
            });
    },

    /**
     * 发起协议请求
     */
    invokeCallBackScheme: function(callbackScheme, code, message, functionString, data, callbackId, redirectURL) {
        // 取消授权的操作，跳转回去应用
        let paramsObj = {
            code: code,
            data: data,
            function: functionString,
            message: message
        };
        const myParams = Util.coverObjectToParams(paramsObj, true);
        var schemeURL = (callbackScheme ? callbackScheme : 'moreone') + '://meet/callback?params=' + myParams;
        // 捕获到异常的话，认为是没有安装MoreOne，跳转到下载链接
        const DeviceInfo = require('react-native-device-info');
        let meetApp = {
            name: 'MEET.ONE',
            icon: 'https://static.ethte.com/icon-png(2018-08-30T10:45:54+08:00).png',
            description: I18n.t( Keys.eos_entrance ),
            version: DeviceInfo.getVersion()
        };
        let infoObj = {
            dpp: meetApp,
            dappCallbackScheme: 'meetone',
            dappRedirectURL: 'https://meet.one/download',
            sdkVersion: '2.0.3',
        };
        const myInfo = Util.coverObjectToParams(infoObj, true);
        schemeURL = schemeURL + '&info=' + myInfo;
        Linking.openURL(schemeURL + '&callbackId=' + callbackId)
            .catch( err => {
                if (redirectURL) {
                    NavigationUtil.openBrowser({url: redirectURL});
                }
                console.error( 'An error occurred when invokeCallBackScheme', err )
            });
    },

    /**
     * 外部唤起APP会执行的逻辑
     */
    handleOpenURL: function (component, url, callback) {
        if (component.props.waitingURI) {
            component.props.dispatch({
                type: settingActionTypes.APPLICATION_WAITING_URI,
                waitingURI: null
            });
        }
        var match = null;
        if (URLRouteUtil.detectScheme(url, 'meetone://')) {
            match = 'meetone://';
        } else if (URLRouteUtil.detectScheme(url, 'meetoneintl://')) {
            match = 'meetoneintl://';
        }
        if (match) {
            let path = URLRouteUtil.decryptURL(url, match);
            let splitArray = path.split('/'); // 分割后的路径数组
            const routeName = splitArray[0]; // 协议名称
            const link = path.substr(path.indexOf('/') + 1);
            // EOS类型
            if (routeName === 'eos') {
                URLRouteUtil.invokeEOS(component, link, (err, res) => {
                    callback && callback(err, res);
                });
            } else if (routeName === 'web') {
                URLRouteUtil.invokeWeb(component, link, (err, res) => {
                    callback && callback(err, res);
                });
            } else if (routeName === 'app') {
                URLRouteUtil.invokeApp(component, link, (err, res) => {
                    callback && callback(err, res);
                });
            } else if (routeName === 'more') {
                // TODO: MORE客户端传来的回调
            }
        } else {
            var match2 = null;
            if (URLRouteUtil.detectScheme(url, 'simplewallet://')) {
                match2 = 'simplewallet://';
            } else if (URLRouteUtil.detectScheme(url, 'simplewallet-meetone://')) {
                match2 = 'simplewallet-meetone://';
            }
            if (match2) {
                let path = URLRouteUtil.decryptURL(url, match2);
                let splitArray = path.split('?'); // 分割后的路径数组
                const routeName = splitArray[0]; // 协议名称
                if (routeName === 'eos.io') {
                    URLRouteUtil.invokeSimpleWallet(component, path, (err, res) => {
                        callback && callback(err, res);
                    });
                }
            }
        }
    },
};

/**
 * 获取设备的ID
 */
// function getDeviceID() {
//     const DeviceInfo = require('react-native-device-info');
//     const deviceID = DeviceInfo.getDeviceId()
//     // return true;
// }

export default URLRouteUtil;
