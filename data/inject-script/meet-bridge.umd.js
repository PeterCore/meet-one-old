/*
 * 关于meetBridge的脚本注入
 * @Author: JohnTrump
 * @Date: 2018-09-28 16:37:54
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-12-06 20:04:16
 */

export default {
    source: `!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.MeetBridge=t()}(this,function(){"use strict";return function(){function e(e,t){void 0===e&&(e="meetone://"),void 0===t&&(t="2.0.2"),this.tryTimes=0,this.scheme=e,this.version=t,window.document.addEventListener("message",function(e){try{var t=JSON.parse(e.data),o=t.params,r=t.callbackId,n=decodeURIComponent(atob(o)),i=JSON.parse(n);console.log(r,i),r&&window[r](i)}catch(e){}})}return e.coverObjectToParams=function(e){try{var t=JSON.stringify(e);return btoa(encodeURIComponent(t))}catch(e){console.error(e)}return""},e.prototype._getCallbackId=function(){var e=parseInt(1e4*Math.random()+"");return"meet_callback_"+(new Date).getTime()+e},e.prototype._sendRequest=function(e){var t=this;try{window.postMessage(e),this.tryTimes=0}catch(o){this.tryTimes<60?setTimeout(function(){t._sendRequest(e),t.tryTimes=++t.tryTimes},1e3):console.error("post url timeout(60 times):",e)}},e.prototype.customGenerate=function(t){var o=this._getCallbackId();t=Object.assign(t,{callbackId:o});var r=this.generateURI(t);return this.version>=e.V2_MIN_VERSION?(this._sendRequest(r),new Promise(function(e,t){window[o]=function(o){try{e(o)}catch(e){t(e)}}})):r},e.revertParamsToObject=function(e){try{var t=atob(e),o=decodeURIComponent(t);return JSON.parse(o)}catch(e){console.error(e)}return{}},e.prototype.generateURI=function(t){var o=t.routeName,r=void 0===o?"":o,n=t.params,i=void 0===n?{}:n,a=t.callbackId,s=void 0===a?"":a,c="";return c=this.scheme.concat(r).concat("?params=").concat(e.coverObjectToParams(i)),s&&(c=c.concat("&callbackId="+s)),c},e.prototype.invokeGetNetwork=function(){return this.customGenerate({routeName:"eos/network"})},e.prototype.invokeShare=function(e){var t=e.shareType,o=void 0===t?1:t,r=e.title,n=void 0===r?"":r,i=e.description,a=void 0===i?"":i,s=e.imgUrl,c=void 0===s?"":s,u=e.options,d=void 0===u?{}:u;return this.customGenerate({routeName:"app/share",params:{shareType:o,imgUrl:c,title:n,description:a,options:d}})},e.prototype.invokeShareCode=function(e){var t=e.description,o=void 0===t?"":t,r=e.name,n=void 0===r?"":r,i=e.target,a=void 0===i?"":i,s=e.banner,c=void 0===s?"":s,u=e.icon,d=void 0===u?"":u;return this.customGenerate({routeName:"app/share",params:{shareType:5,description:o,options:{name:n,target:a,banner:c,icon:d}}})},e.prototype.invokeAuthorize=function(e){var t=e.scheme,o=void 0===t?null:t,r=e.redirectURL,n=void 0===r?null:r,i=e.dappIcon,a=void 0===i?null:i,s=e.dappName,c=void 0===s?null:s,u=e.loginMemo,d=void 0===u?null:u;return this.customGenerate({routeName:"eos/authorize",params:{dappIcon:a,dappName:c,loginMemo:d,scheme:o,redirectURL:n}})},e.prototype.invokeAuthorizeInWeb=function(){return this.customGenerate({routeName:"eos/authorizeInWeb"})},e.prototype.invokeTransfer=function(e){var t=e.to,o=void 0===t?"":t,r=e.amount,n=void 0===r?0:r,i=e.tokenName,a=void 0===i?"EOS":i,s=e.tokenContract,c=void 0===s?"eosio.token":s,u=e.tokenPrecision,d=void 0===u?4:u,p=e.memo,m=void 0===p?"":p,v=e.orderInfo,h=void 0===v?"":v;return this.customGenerate({routeName:"eos/transfer",params:{to:o,amount:n,tokenName:a,tokenContract:c,tokenPrecision:d,memo:m,orderInfo:h}})},e.prototype.invokeTransaction=function(e){var t=e.actions,o=void 0===t?[]:t,r=e.options,n=void 0===r?{broadcast:!0}:r,i=e.description,a=void 0===i?"":i;return this.customGenerate({routeName:"eos/transaction",params:{actions:o,options:n,description:a}})},e.prototype.invokeAccountInfo=function(e){return this.customGenerate({routeName:"eos/account_info"})},e.prototype.invokeNavigate=function(e){var t=e.target,o=void 0===t?"":t,r=e.options,n=void 0===r?{}:r;return this.customGenerate({routeName:"app/navigate",params:{target:o,options:n}})},e.prototype.invokeWebview=function(e){var t=e.url,o=void 0===t?"":t,r=e.title,n=void 0===r?"":r;return this.customGenerate({routeName:"app/webview",params:{url:o,title:n}})},e.prototype.invokeSignProvider=function(e){var t=e.buf,o=void 0===t?[""]:t,r=e.transaction,n=void 0===r?null:r;return this.customGenerate({routeName:"eos/sign_provider",params:{buf:o,transaction:n}})},e.prototype.invokeSignature=function(e){var t=e.data,o=void 0===t?"":t,r=e.whatfor,n=void 0===r?"":r,i=e.isHash,a=void 0!==i&&i,s=e.isArbitrary,c=void 0!==s&&s;return this.customGenerate({routeName:"eos/signature",params:{data:o,whatfor:n,isHash:a,isArbitrary:c}})},e.prototype.invokeBalance=function(e){var t=e.accountName,o=void 0===t?"":t,r=e.contract,n=void 0===r?"eosio.token":r,i=e.symbol,a=void 0===i?"EOS":i;return this.customGenerate({routeName:"eos/getBalance",params:{accountName:o,contract:n,symbol:a}})},e.V2_MIN_VERSION="2.0.0",e}()}); `
};
