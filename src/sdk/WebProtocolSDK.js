import Util from "../util/Util";

const WebProtocolSDK = {
    handlePath: function (component ,path, callback) {
        const tempArray = path.split('?');
        const routeName = tempArray[0]; //协议名称
        const v2 = (-1 != path.indexOf('info='));//有info参数是v2协议
        const queryObj = Util.parseQueryString(path, false); // Query Params Obj
        if (routeName === 'back') {
            // meetone://web/back - 返回
            back(component);
        } else if (routeName === 'close') {
            // meetone://web/close - 关闭
            close(component);
        } else if (routeName === 'open') {
            // meetone://web/open - 打开
            open(component, queryObj);
        }
        return false;
    },
};

/**
 * 关闭当前页面
 * @param {Component} component 调用的组件对象
 */
function close(component) {
    component.props.navigation.goBack();
}

/**
 * 返回上一页
 * @param {Component} component 调用的组件对象
 */
function back(component) {
    component.props.navigation.goBack();
}

/**
 * 打开新页面
 * @param {Component} component 调用的组件对象
 */
function open(component, queryObj) {
    component.props.navigation.push( 'WebViewPage', {
        url: queryObj.params.url,
        webTitle: queryObj.params.webTitle
    })
}

export default WebProtocolSDK;
