import { Dimensions, PixelRatio, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { getStore } from "../setup";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import format from "string-format";
import base64 from "base-64";
import utf8 from "utf8";

const screenW = Dimensions.get( 'window' ).width;
const screenH = Dimensions.get( 'window' ).height;

const CryptoJS = require( "crypto-js" );

// iPhoneX iPhoneXS
const X_WIDTH = 375;
const X_HEIGHT = 812;

// iPhoneXSMax iPhoneXR
const XSMax_WIDTH = 414;
const XSMax_HEIGHT = 896;

const Util = {
    getDpFromPx: function ( pxValue ) {
        return pxValue / PixelRatio.get();
    },

    /**
     * 格式化时间 - 到天,格式 YYYYMMDD
     * @param {Date} date 默认今日
     */
    formatDate: function (date = new Date(), type = 'YYYYMMDD') {
        date = new Date(date);
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        if (type === 'YYYYMMDD') {
            return [year, month, day].map(formatNumber).join('');
        } else if (type === 'YYYY/MM/DD') {
            return [year, month, day].map(formatNumber).join('/');
        }
    },

    calcDeviceLanguage: function () {
        let deviceLocale = DeviceInfo.getDeviceLocale();
        const deviceCountry = DeviceInfo.getDeviceCountry();

        if ( Platform.OS === 'ios' ) {
            if ( deviceLocale.lastIndexOf( deviceCountry ) >= 0 && deviceLocale.lastIndexOf( deviceCountry ) === deviceLocale.length - deviceCountry.length ) {
                deviceLocale = deviceLocale.substr( 0, deviceLocale.length - deviceCountry.length - 1 );
            }
        }

        return deviceLocale;
    },

    isArray: function ( o ) {
        return Object.prototype.toString.call( o ) === '[object Array]';
    },

    isiPhoneFullDisplay: function () {
        return (
            Platform.OS === 'ios' &&
            (Util.isIphoneX() || Util.isIphoneXSMax())
        )
    },

    isIphoneX: function () {
        return (
            Platform.OS === 'ios' &&
            ((screenH === X_HEIGHT && screenW === X_WIDTH) ||
                (screenH === X_WIDTH && screenW === X_HEIGHT))
        )
    },

    isIphoneXSMax: function () {
        return (
            Platform.OS === 'ios' &&
            ((screenH === XSMax_HEIGHT && screenW === XSMax_WIDTH) ||
                (screenH === XSMax_WIDTH && screenW === XSMax_HEIGHT))
        )
    },

    generateNewWalletName() {
        const store = getStore();

        if ( store.getState().ethStore.newWalletIndex === 0 ) {
            return I18n.t( Keys.wallet_name_format_1 )
        } else {
            return format( I18n.t( Keys.wallet_name_format_2 ), store.getState().ethStore.newWalletIndex )
        }
    },


    /**
     * 校验手机号
     * */
    isPhoneNumber( phone ) {
        const regexp = new RegExp( "^1[3|4|5|6|7|8][0-9]{9}$" );
        let isTrue = false;
        if ( phone && regexp.test( phone ) ) {
            isTrue = true;
        }
        return isTrue;
    },

    /**
     * 数字三分位
     * */
    numberStandard(num = 0, decimal = 2) {
        // 如果num是 NaN的话，则默认为0
        // if (num != 0 && !!!num) {
        //     num = 0;
        // }
        let newNum = Number( num ).toFixed(decimal);
        return newNum && newNum.toString().replace(/(^|\s)\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','));
    },

    formatNum( num ) {
        let newStr = "";
        let count = 0;
        let str = String( num );
        if ( str.indexOf( "." ) === -1 ) {
            for ( let i = str.length - 1; i >= 0; i -= 1 ) {
                if ( count % 3 === 0 && count !== 0 ) {
                    newStr = `${str.charAt( i )}, ${newStr}`;
                } else {
                    newStr = str.charAt( i ) + newStr;
                }
                count += 1;
            }
            // 自动补小数点后两位
            str = `${newStr}.00`;
        } else {
            for ( let i = str.indexOf( "." ) - 1; i >= 0; i -= 1 ) {
                if ( count % 3 === 0 && count !== 0 ) {
                    newStr = `${str.charAt( i )}, ${newStr}`;
                } else {
                    // 逐个字符相接起来
                    newStr = str.charAt( i ) + newStr;
                }
                count += 1;
            }
            str = newStr + (`${str}00`).substr( (`${str}00`).indexOf( "." ), 3 );
        }
        return str;
    },

    // 保留N位小数，不四舍五入, 默认为保留两位小数
    toFixed(num, decimal = 2) {
        const DECIMAL = Math.pow(10, decimal);
        return Math.floor(num * DECIMAL) / DECIMAL;
    },

    // 将数字转换成代币符号表示的金额
    // eg toAssertSymbol(3.141) => return '3.1410 EOS'
    toAssertSymbol(num, decimal = 4, symbol = 'EOS') {
        return this.toFixed(num, decimal).toFixed(decimal) + ' ' + symbol;
    },

    // base64编码
    base64Encode(str) {
        const bytes = utf8.encode(str);
        return base64.encode(bytes)
    },

    // base64解码
    base64Decode(str) {
        return base64.decode(str);
    },

    // 将编码后的字符串转换成对象并解析
    parseQueryString(url, v2) {
        var json = {};
        if (url.indexOf('?') === -1) {
            return json;
        }
        var arr = url.substr(url.indexOf('?') + 1).split('&');
        arr.forEach(item => {
            var tmp = item.split('=');
            if (tmp[0] === 'params' || tmp[0] === 'info') {
                var jsonString = Util.base64Decode((tmp[1]));
                if (!v2) {
                    jsonString = decodeURIComponent(jsonString);
                } else {
                    jsonString = utf8.decode(jsonString);
                }
                json[tmp[0]] = JSON.parse(jsonString);
            } else {
                json[tmp[0]] = tmp[1];
            }
        });
        return json;
    },

    parseURLQueryString(url) {
        var json = {};
        if (url.indexOf('?') === -1) {
            return json;
        }
        var arr = url.substr(url.indexOf('?') + 1).split('&');
        arr.forEach(item => {
            var tmp = item.split('=');
            json[tmp[0]] = tmp[1];
        });
        return json;
    },

    appendQueryString(url, queryVars) {
        var firstSeperator = (url.indexOf('?')==-1 ? '?' : '&');
        var queryStringParts = new Array();
        for(var key in queryVars) {
            queryStringParts.push(key + '=' + queryVars[key]);
        }
        var queryString = queryStringParts.join('&');
        return url + firstSeperator + queryString;
    },

    // 将对象转换成编码后的字符串
    coverObjectToParams(obj, v2) {
        try {
            var json = JSON.stringify(obj)
            if (!v2) {
                json = encodeURIComponent(json);
            }
            return Util.base64Encode(json);
        } catch (error) {
            console.error(error)
        }
        return ''
    },

    // 生成协议URI链接
    generateURI({ schema = 'meetone://', routeName = '', params = {}, callbackId = '' }) {
        return schema
            .concat(routeName)
            .concat('?params=')
            .concat(Util.coverObjectToParams(params, false))
            .concat('&callbackId=' + callbackId)
    },

    schemeEncode(code, type, data) {
        let paramsObj = {
            code,
            type,
            data
        };
        let paramsJSON = JSON.stringify(paramsObj);
        const params = Util.base64Encode(encodeURIComponent(paramsJSON));
        return params;
    },

    /*
    * 随机生成由字母与数字组成的字符串
    * randomWord 产生任意长度随机字母数字组合
    * randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
    */
    randomWord(randomFlag = false, min = 8, max) {
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        // 随机产生
        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        for (var i = 0; i < range; i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    },

    /**
     * to encrypt the temp password
     * @author JohnTrump
     * @param {String} password the temp password which to encrypt
     * @return {String} after encrypted data string
     */
    encryptTempPsw(password) {
        const store = getStore();
        const uuid = DeviceInfo.getUniqueID();
        const surge = store.getState().eosStore.surge;
        return CryptoJS.AES.encrypt(
            JSON.stringify({ password, isEncrypted: true }),
            '' + surge + uuid
        ).toString();
    },

    /**
     * to decrypt the tempPsw
     *
     * @author JohnTrump
     * @param {String} tempPsw the temp password which is encrypted
     * @returns {String} the true password
     */
    decryptTempPsw(tempPsw) {
        if (!tempPsw) {
            return ''
        }
        const store = getStore();
        const uuid = DeviceInfo.getUniqueID();
        const surge = store.getState().eosStore.surge;
        // return the the password of decrypt
        const bytes = CryptoJS.AES.decrypt( tempPsw, '' + surge + uuid );
        let decryptedData;

        try {
            decryptedData = JSON.parse( bytes.toString(CryptoJS.enc.Utf8) );
        } catch (error) {
            return ''
        }

        if ( decryptedData && decryptedData.isEncrypted ) {
            return decryptedData.password
        } else {
            return '';
        }
    }
};

/**
 * 格式化数字
 */
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

export default Util;
