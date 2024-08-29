import Toast from "react-native-root-toast";
import { NavigationActions, StackActions } from "react-navigation";
import { getCurrentWalletSimple } from "../actions/WalletAction"
import Util from "../util/Util";
import URLRouteUtil from "../util/URLRouteUtil";
import Keys from "../configs/Keys";
import { Alert, Linking } from "react-native";

const SimpleWalletSDK = {
    handlePath: function (component ,path, callback) {
        const queryObj = parseSimpleWalletQueryString(path); // Query Params Obj
        const action = queryObj.action;
        if (action === 'transfer') {
            return simpleWalletTransfer(component, queryObj, callback);
        } else if (action === 'login') {
            return simpleWalletLogin(component, queryObj, callback);
        }
        return false;
    },
};

// 将编码后的字符串转换成对象并解析
function parseSimpleWalletQueryString(url) {
    var json = {};
    if (url.indexOf('eos.io?') === -1) {
        return json;
    }
    var paramString = url.substr(url.indexOf('eos.io?') + 7);
    if (paramString.indexOf('param=') === -1) {
        return json;
    }
    var jsonData = url.substr(url.indexOf('param=') + 6);
    var jsonString = decodeURIComponent(jsonData);
    json = JSON.parse(jsonString);
    return json;
}

/**
 * 获得一个帐号的登录授权
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function simpleWalletLogin(component, queryObj, callback) {
    let paramsObj = {
        loginUrl: queryObj.loginUrl,
        uuID: queryObj.uuID,
        loginMemo: queryObj.loginMemo,
        dappName: queryObj.dappName,
        dappIcon: queryObj.dappIcon,
        protocol: queryObj.protocol,
        version: queryObj.version
    };
    let dapp = {
        name: queryObj.dappName,
        icon: queryObj.dappIcon,
        description: queryObj.loginMemo
    };
    let infoObj = {
        dapp: dapp,
        dappCallbackURL: queryObj.callback
    };
    const account = getCurrentWalletSimple();
    var gotoPage = 'EOSAuthorationPage';
    var pageParams = {
        queryObj: {
            params: paramsObj,
            info: infoObj
        }
    };
    if (!account) {
        gotoPage = 'EOSWalletImportPage';
        pageParams = Object.assign(pageParams, {before: 'EOSAuthorationPage'});
    }
    component.props.navigation.navigate(gotoPage, pageParams);
    let params = Util.schemeEncode(100, 1, {
        message: '等待确认授权'
    });
    callback && callback(null, {params});
}

/**
 *
 * eos发起付款
 * @param {Component} component 调用的组件对象
 * @param {Object} queryObj 查询对象
 * @param {Function} callback 回调
 */
function simpleWalletTransfer(component, queryObj, callback) {
    let paramsObj = {
        from: queryObj.from,
        to: queryObj.to,
        amount: queryObj.amount,
        tokenName: queryObj.symbol,
        tokenContract: queryObj.contract,
        tokenPrecision: queryObj.precision,
        memo: queryObj.dappData ? queryObj.dappData : 'ref=MEET.ONE', // ref作为钱包名，标记来源,
        description: queryObj.desc
    };
    let dapp = {
        name: queryObj.dappName,
        icon: queryObj.dappIcon,
        description: queryObj.desc
    };
    let infoObj = {
        dapp: dapp,
        dappCallbackURL: queryObj.callback
    };
    if (queryObj.from && !simpleWalletMatchEOSAccount(queryObj.from, queryObj.callback)) {
        return;
    }
    var states = {
        isConfirmOpen: true,
        infoData: infoObj
    }
    if (paramsObj.description) {
        Object.assign(states, {paymentData: Object.assign(paramsObj, {from: component.props.walletAccount, orderInfo:paramsObj.description})});
    } else {
        Object.assign(states, {paymentData: Object.assign(paramsObj, {from: component.props.walletAccount})});
    }
    component.setState( states , () => {
        let params = Util.schemeEncode(100, 0, {
            message: '等待用户确认'
        });
        callback && callback(null, {params});
    });
}

function simpleWalletMatchEOSAccount(from, dappCallbackURL) {
    const account = getCurrentWalletSimple();
    if (from && account.accountName !== from) {
        Toast.show(Keys.not_match_account, {position: Toast.positions.CENTER});
        if (dappCallbackURL) {
            dappCallbackURL = dappCallbackURL + '&result=2';
            Linking.openURL(dappCallbackURL)
            .catch( err => {
                console.error( 'An error occurred when invokeCallBackScheme', err )
            });
        }
        return false;
    }   
    return true; 
}

export default SimpleWalletSDK;
