import Toast from "react-native-root-toast";
import {Clipboard} from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import {getShareCode} from "../net/3thNet";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import * as env from "../env";
import { Platform } from 'react-native';
import Util from "../util/Util";

const AppCommonSDK = {
    handlePath: function (component ,path, callback) {
        const tempArray = path.split('?');
        const routeName = tempArray[0]; //协议名称
        const v2 = (-1 != path.indexOf('info='));//有info参数是v2协议
        const queryObj = Util.parseQueryString(path, false); // Query Params Obj
        if (routeName === 'share') {
            // meetone://app/share - 分享
            share(component, queryObj, callback);
        } else if (routeName === 'navigate') {
            // meetone://app/navigate - 应用内跳转
            navigate(component, queryObj, callback);
        } else if (routeName === 'webview') {
            // meetone://app/webview - 使用webview打开
            webview(component, queryObj, callback);
        } else if (routeName === 'getInfo') {
            // meetone://app/getInfo - 获取app信息
            return getAppInfo(component, queryObj, callback);
        }
        return false;
    },
};

// 获取app信息
function getAppInfo(component, queryObj, callback) {
    const DeviceInfo = require('react-native-device-info');
    var info = {};
    if ( DeviceInfo.getVersion() ) {
        Object.assign(info, { 'version': DeviceInfo.getVersion() } );
    }

    if ( env.IS_STORE ) {
        Object.assign(info, { 'store': Platform.OS === 'ios' ? 'App Store' : 'Google Play' } );
    } else if (Platform.OS === 'ios') {
        Object.assign(info, { 'store': 'pgyer' } );
    }

    if ( env.IS_INTL ) {
        Object.assign(info, { 'intl': true } );
    }
    let params = Util.schemeEncode(0, 1000, info);
    callback && callback(null, {
        params,
        callbackId: queryObj && queryObj.callbackId
    });
}

/**
 * 使用Webview打开链接
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询参数的对象
 * @param {Function} callback 回调
 */
function webview(component, queryObj = {}, callback) {
    const { url, title, from } = queryObj.params;
    console.log({url, title, from});
    try {
        if (component.props.navigation) {
            component.props.navigation.navigate('WebViewPage', {
                url,
                webTitle: title,
                // isShare: true,
                // sharebody{content, image, website, title}
                // shareBody: Object.assign({
                //     title,
                //     website: url
                // }, shareBody)
            });
        } else {
            // APP.js中没有navigation对象，所以使用dispatch做派发
            const {dispatch} = component.props;
            // 跳转到 WebViewPage组件并且打开
            dispatch(
                StackActions.push({
                    routeName: 'WebViewPage',
                    params: {
                        url,
                        webTitle: title
                    }
                })
            );
        }

    } catch (error) {
        Toast.show(error, {position: Toast.positions.CENTER});
    }
    callback && callback(null, {});
}

/**
 * 应用内内部跳转
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询参数的对象
 * @param {Function} callback 回调
 */
function navigate(component, queryObj = {}, callback) {
    const { target, from } = queryObj.params;
    try {
        // 跳转到目标页面
        // 这里要做一下区分:
        // 如果是从二维码进入的，需要使用reset把当前页面推出路由堆栈
        // 如果不是从二维码进入协议的，则使用普通的跳转就可以了
        if (from === 'qrcode') {
            component.props.navigation.dispatch(
                StackActions.reset(
                    {
                        index: 1,
                        actions: [
                            NavigationActions.navigate( { routeName: 'mainPage' } ),
                            NavigationActions.navigate( {routeName: target, params: {
                                queryObj
                            }} ),
                        ]
                    }
                )
            );
        } else {
            component.props.navigation.navigate(target, queryObj.params.options);
        }
    } catch (error) {
        Toast.show(error, {position: Toast.positions.CENTER});
    }
    callback && callback(null, {});
}

/**
 *
 * 分享
 * @param {Component} component 调用的组件对象
 * @param {Object} shareObj 分享对象
 * title: String
 * description: String
 * link: String
 * imgUrl: String
 * shareType: Number（1 文本；2 图片；3 web link；4 文件; 5 口令）
 * @param {Function} callback 回调
 */
function share(component, shareObj, callback) {
    let title = shareObj.params.title;
    let description = shareObj.params.description;
    let shareType = shareObj.params.shareType;
    var shareBody = {
        content: description,
        title: title
    }
    if (shareType === 1) { //文本
        shareBody = {
            content: description,
            title: title
        }
    } else if (shareType === 2) { //图片
        let imgUrl = shareObj.params.imgUrl;
        shareBody = {
            content: description,
            image: imgUrl,
            title: title
        }
    } else if (shareType === 3) { //web
        let link = shareObj.params.link;
        let imgUrl = shareObj.params.imgUrl;
        shareBody = {
            content: description,
            website: link,
            title: title,
            image: imgUrl
        }
    } else if (shareType === 4) { //文件

    } else if (shareType === 5) {
        // 口令分享
        // eg: 我给你发了一个红包，快来领取吧！复制这段话 $ KPvBbjEPaQg $ 后到 EOS 生态入口 MEET.ONE
        let options = Object.assign({}, shareObj.params.options, {
            description
        });

        // 获取
        getShareCode(options, (err, res) => {
            try {
                let result = res.body;
                if (result) {
                    // 分享的主体
                    shareBody = {
                        content: description + I18n.t(Keys.share_code_1) + result.data + I18n.t(Keys.share_code_2)
                    }

                    // 复制内容
                    Clipboard.setString(shareBody.content);

                    component.setState({
                        shareBody: shareBody,
                        callbackId: shareObj && shareObj.callbackId,
                        isOpenShare: true
                    }, () => {
                        let params = Util.schemeEncode(100, 300, {
                            message: 'loading'
                        });
                        callback && callback(null, {params})
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    component.setState({
        shareBody: shareBody,
        callbackId: shareObj && shareObj.callbackId,
        isOpenShare: true
    }, () => {
        let params = Util.schemeEncode(100, 300, {
            message: 'loading'
        });
        callback && callback(null, {params})
    });
}

export default AppCommonSDK;
