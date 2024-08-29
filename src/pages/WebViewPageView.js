import React from "react";
import { StyleSheet, View, TouchableOpacity, Text, StatusBar, Platform, Image, Clipboard, Linking, BackHandler, Dimensions } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import Eos from "eosjs";
import commonStyles from "../styles/commonStyles";
import LoadingView from "../components/LoadingView";
import EOSTransferConfirmComponent from "./eos/EOSTransferPage/EOSTransferConfirmComponent";
import EOSTransactionsConfirmComponent from "./eos/EOSTransactionListPage/EOSTransactionsConfirmComponent";
import PasswordInputComponent from "../components/PasswordInputComponent";
import ShareComponent from "../components/ShareComponent";
import { getStore } from "../setup";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import URLRouteUtil from "../util/URLRouteUtil";
import Util from "../util/Util";
const DeviceInfo = require('react-native-device-info');
import constStyles from "../styles/constStyles";
import {verifyPassword} from "../actions/EOSAction";
import MeetBridge from "../../data/inject-script/meet-bridge.umd.js";
import Scatter from "../../data/inject-script/scatter.js";
import { handleError } from "../net/parse/eosParse";
import Toast from "react-native-root-toast";
import AnalyticsUtil from "../util/AnalyticsUtil";
import CPUFloatButton from "../components/CPUFloatButton";
import { netCpubaoleBtn } from "../net/DiscoveryNet";

import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';
import { WebView } from 'react-native-webview';

const slideFromBottom = new SlideAnimation({
    slideFrom: 'bottom',
});

const STATE_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 20) : StatusBar.currentHeight;
const NAVI_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const ANDROID_BOTTOM_MENU_HEIGHT = Platform.OS === 'ios' ? 0 : 50;

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const IOS_BOTTOM_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 34 : 0) : 0;

class WebViewPageView extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        var result = {
            gesturesEnabled: !navigation.state.params.backButtonEnabled,
            title: `${state.params.title}`,
            headerRight:
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.showDialog();
                    }}>
                    <Image
                        source={ require( '../imgs/web-topright.png' ) }
                        style={[ { width: 22, height: 22, marginRight: 15 } ]}
                    />
                </Button>,
            headerLeft:
            <View style={[ { flexDirection: 'row' } ]}>
                <Button
                style={{
                    width: navigation.state.params.backButtonEnabled ? Platform.OS === 'ios' ? 44 : 34 : 44,
                    height: 44
                }}
                onPress={() => {
                    navigation.state.params.goBackPage();
                }}>
                <Image
                    source={ require( '../imgs/back-icon-ios.png' ) }
                    style={[ { width: navigation.state.params.backButtonEnabled ? Platform.OS === 'ios' ? 44 : 34 : 44, height: 44 } ]}
                />
            </Button>

            {navigation.state.params.backButtonEnabled ?
            <Button
                style={{
                    width: 44,
                    height: 44
                }}
                flex={1}
                onPress={() => {
                    props.navigation.goBack();
                }}>
                <Image
                    source={ require( '../imgs/btn_close.png' ) }
                    style={[ { width: 44, height: 44 } ]}
                />
            </Button>
            : null
            }
            </View>
        };

        if (props.navigation.state.params.simpleHead == 1) {
            result = Object.assign( {}, result, {
                title: '',
                headerStyle: {
                    elevation: 0,
                    borderBottomWidth: 0,
                    marginTop: Platform.OS === 'ios' ? 0 : constStyles.STATE_BAR_HEIGHT
                },
                headerTransparent: true,
                headerLeft:
                <View style={[ { flexDirection: 'row' } ]}>
                <Button
                    style={{
                        width: navigation.state.params.backButtonEnabled ? Platform.OS === 'ios' ? 44 : 34 : 44,
                        height: 44,
                    }}
                    onPress={() => {
                        navigation.state.params.goBackPage();
                    }}
                >
                    <View
                        style={{
                            width: 10
                        }}
                    />
                    <Image
                        style={{
                            marginLeft: 20
                        }}
                        source={ require( '../imgs/h5_btn_back.png' ) }
                        style={[ { width: navigation.state.params.backButtonEnabled ? Platform.OS === 'ios' ? 44 : 34 : 44, height: 44 } ]}
                    />
                </Button>
                {navigation.state.params.backButtonEnabled ?
                <Button
                style={{
                    width: 44,
                    height: 44
                }}
                onPress={() => {
                    props.navigation.goBack();
                }}>
                <Image
                    source={ require( '../imgs/h5_btn_close.png' ) }
                    style={[ { width: 44, height: 44 } ]}
                />
                </Button>
                : null
                }
            </View>
            } );
        }

        if (props.navigation.state.params.simpleLeft == 1) {
            result = Object.assign( {}, result, {
                headerLeft: null,
                header: null
            } );
        }

        return result;
    };

    constructor( props ) {
        super( props );
        // 页面标题、 网址、 是否分享
        const {url, isShare, shareBody} = props.navigation.state.params;
        const queryObj = Util.parseQueryString(url, false);
        const store = getStore();
        this.state = {
            url,
            isShare,
            initJS: true,
            loading: true,
            shareBody, // 分享的内容
            isOpenShare: false, // 是否打开分享
            isConfirmOpen: false, // 是否打开确认信息（转账）
            isTransactionConfirmOpen: false, // 是否打开确认信息(事务)
            isPswdOpen: false, // 是否打开密码确认框(转账)
            isTransactionPswdOpen: false, // 是否打开密码确认框(事务)
            isSignaturePswdOpen: false, // 是否打开密码确认框（签名）
            isSignatureConfirmOpen: false, // 是否打开签名信息确认框(签名)
            transactionActions: null, // Transaction参数
            transactionReason: null, // Transaction原因
            paymentData: null, // 付款信息
            signatureData: '', // 签名信息
            transactionData: null, // Transaction信息
            simpleHead: queryObj['simple_head'],
            simpleLeft: queryObj['simple_left'],
            hideShare: queryObj['hide_share'],
            hideFloatBtn: queryObj['hide_float_btn'],
            nocache: queryObj['nocache'],
            needAccount: queryObj['need_account'],
            infoData: null, // 回调信息
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            callbackId: null,
            transactionRawData: null,
            showDialog: false,
            // canSkip初始值不能值是False，要根据tempPsw来判断
            canSkip: !!Util.decryptTempPsw(store.getState().eosStore.tempPsw), // 是否显示记住合约的按钮
            skipActionNames: [], // 记住的合约名称 -> 关闭Dapp前不再提示
        };
        this.onMessage = this.onMessage.bind( this );
    }

    componentWillMount() {
        netCpubaoleBtn((err, res) => {
            if (!err) {
                const resData = JSON.parse(res);
                if (resData.data.length > 0) {
                    let target = resData.data[0].target;
                    if (target.match('http') && this.props.walletAccount) {
                        target = target + '?wallet=' + this.props.walletAccount.accountName;
                    }
                    this.setState({
                        floatBtnTarget: target
                    })
                } else {
                    this.setState({
                        hideFloatBtn: true
                    })
                }
            }
        });
    }

    componentDidMount() {
        this._goBackPage = this._goBackPage.bind( this );
        this._showDialog = this._showDialog.bind(this);

        this.props.navigation.setParams({
            showDialog: this._showDialog,
            goBackPage: this._goBackPage,
            isShare: this.state.isShare,
            simpleHead: this.state.simpleHead,
            simpleLeft: this.state.simpleLeft,
            title: this.props.navigation.state.webTitle ? this.props.navigation.state.webTitle : '',
            backButtonEnabled: this.state.backButtonEnabled,
        });

        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this._goBackPage(); // works best when the goBack is async
        return true;
    }

   _onNavigationStateChange = (navState) => {
        var shareBody = this.state.shareBody;

        var shareObj =  Object.assign({}, shareBody, {
            website: this.state.url,
            title: navState.title,
            content: this.state.url
        });

        this.setState({
            shareBody: shareObj
        });

        if (Platform.OS === 'android') {
            this.setState({
                backButtonEnabled: navState.canGoBack,
                forwardButtonEnabled: navState.canGoForward,
                // loading: navState.loading,
                webTitle: navState.title,
            });
            this.props.navigation.setParams({ title: navState.title, backButtonEnabled: navState.canGoBack });
            // if (navState.url !== this.state.url) {
            //     this.setState({
            //         url: navState.url,
            //     });
            // }
        }
    }

    // 点击右上角Share的逻辑
    _share() {
        this.setState({ isOpenShare: true });
    }

    _showDialog() {
        this.setState({
            showDialog: !this.state.showDialog
        })
    }

    onMessage( e ) {
        var event = e.nativeEvent;
        if (Platform.OS === 'ios') {
            this.setState({
                backButtonEnabled: event.canGoBack,
                forwardButtonEnabled: event.canGoForward,
                // loading: navState.loading,
                webTitle: event.title
            });
            this.props.navigation.setParams({ title: event.title, backButtonEnabled: event.canGoBack });
        }
        if (URLRouteUtil.detectScheme(event.data, 'meetone://')) {
            URLRouteUtil.handleOpenURL(this, event.data,  (err, res) => {
                // postMessage 参数是一个字符串
                // PostMessage To Webview
                this.meetWebview.postMessage(JSON.stringify(res));
            });
        } else {
            // 非 meetone://私有协议，不做处理，直接打开webview
            try {
                var data = JSON.parse( event.data );
                if ( data.command === 'open' ) {
                    let args = data.payload;
                    let url = args.url;
                    let title = args.title;
                    this.openWebView( url, title );
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    openWebView( url, title ) {
        this.props.navigation.push( 'WebViewPage', {
            url: url,
            webTitle: title
        })
    }

    reload() {
        this.setState({
            initJS: true,
            loading: true
        })
        this.meetWebview.reload();
    }

    // 发起支付
    doPay(password) {
        this.setState({loading: true});
        const paymentData = this.state.paymentData;
        this.props.onTransfer(this.props.walletAccount, {
            from: (paymentData.from && paymentData.from.accountName) ? paymentData.from.accountName : this.props.walletAccount,
            to: paymentData.to,
            quantity: Number(paymentData.amount).toFixed(paymentData.tokenPrecision).concat(' ').concat(paymentData.tokenName),
            tokenPublisher: paymentData.tokenContract,
            memo: paymentData.memo,
        }, password, (err, res) => {
            // 关闭掉loading提示
            this.setState({loading: false});
            if (err) {
                Toast.show(this._handleError(err), { position: Toast.positions.CENTER } );
                let params = Util.schemeEncode(500, 0, {
                    origin: err, // 报错的信息原样返回, 为了方便调试
                    message: this._handleError(err)
                });
                this.meetWebview.postMessage(JSON.stringify({
                    params,
                    callbackId: this.state.callbackId
                }));
            } else {
                // 支付成功的回调
                let params = Util.schemeEncode(0, 0, res);
                this.meetWebview.postMessage(JSON.stringify({
                    params,
                    callbackId: this.state.callbackId
                }));
            }
        });
    }

    // 签名
    doSignature(password) {
        this.setState({loading: true});

        // 当前导入的EOS帐号
        const account = this.props.walletAccount;

        if (!account) {
            // 钱包内没有帐号的情况
            return
        }

        // 获取帐号私钥
        const accountPrivateKey = verifyPassword(account, password, (err, result) => {
            if (err) {
                // handleError(err);
                this.setState({loading: false});
                Toast.show(this._handleError(err), { position: Toast.positions.CENTER } );
                let params = Util.schemeEncode(500, 6, {
                    origin: err,
                    message: this._handleError(err)
                });

                this.meetWebview.postMessage(JSON.stringify({
                    params,
                    callbackId: this.state.callbackId
                }))
            }
        }, this.props.dispatch);

        if (!accountPrivateKey) {
            this.setState({loading: false});
            return;
        }

        // for signing
        const { ecc } = Eos.modules;
        try {
            let isOwner = false;

            // 判断是否Owner权限
            if (account.permissions) {
                account.permissions.forEach(perm => {
                    perm.required_auth.keys.forEach(key => {
                        if (perm.perm_name === 'owner') {
                            if (key.key === account.accountPublicKey) {
                                isOwner = true;
                            }
                        }
                    })
                });
            }

            let sign = '';


            if (this.state.isSignProvider) {
                sign = ecc.sign(Buffer.from(this.state.signatureData.buf, 'uft-8'), accountPrivateKey);
            } else if (this.state.isArbitrary && this.state.isHash){
                sign = ecc.Signature.signHash(this.state.signatureData, accountPrivateKey).toString();
            } else {
                sign = ecc.sign(this.state.signatureData, accountPrivateKey);
            }

            // 签名成功的回调
            let params = Util.schemeEncode(0, 6, {
                signature: sign,
                account: account.accountName,
                isOwner: isOwner
            });
            this.setState({loading: false});
            this.meetWebview.postMessage(JSON.stringify({
                params,
                callbackId: this.state.callbackId
            }));

            // 统计合约调用
            const actions = this.state.transactionRawData;
            if (actions) {
                for (let i = 0; i < actions.length; i++) {
                    if (actions[i].account === 'eosio.token') {
                        if (actions[i].name === 'transfer') {
                            const receiver = actions[i].data.to;
                            AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  `${actions[i].account}_${actions[i].name}_${receiver}` } );
                        } else {
                            AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  `${actions[i].account}_${actions[i].name}` } );
                        }
                    } else {
                        AnalyticsUtil.onEventWithMap('WAtransaction', { contract:  actions[i].account } );
                    }
                }
            }

        } catch (error) {
            // 签名失败的回调
            this.setState({loading: false});
            let params = Util.schemeEncode(500, 6, {
                origin: error, // 报错的信息原样返回, 为了方便调试
                message: '签名失败'
            });

            this.meetWebview.postMessage(JSON.stringify({
                params,
                callbackId: this.state.callbackId
            }));
        }
    }

    // 发起事务
    doTransaction(password) {
        this.setState({loading: true});
        const actions = this.state.transactionActions;
        this.props.onTransaction(this.props.walletAccount, actions, password, (err, res) => {
            this.setState({loading: false});
            if (err) {
                Toast.show(this._handleError(err), { position: Toast.positions.CENTER } );
                // 事务失败的回调
                let params = Util.schemeEncode(500, 5, {
                    origin: err, // 报错的信息原样返回, 为了方便调试
                    message: this._handleError(err)
                });
                this.meetWebview.postMessage(JSON.stringify({
                    params,
                    callbackId: this.state.callbackId
                }));
            } else {
                // 事务成功的回调
                let params = Util.schemeEncode(0, 5, res);
                this.meetWebview.postMessage(JSON.stringify({
                    params,
                    callbackId: this.state.callbackId
                }));
            }
        })
    }

    _goBackPage() {
        if (this.state.backButtonEnabled) {
            this.meetWebview.goBack();
        } else {//否则返回到上一个页面
            this.props.navigation.goBack();
        }
    };

    _handleError(err) {
        if (err && err.status) {
            // 没有互联网链接
            return I18n.t(Keys.no_internet_connect);
        } else if (err && err.message ) {
            return err.message;
        } else {
            try {
                // 错误处理
                const errorObj = JSON.parse(err);
                const errCode = errorObj.error.code;
                const keys = Keys['error_' + errCode];
                if (keys) {
                    return I18n.t(keys);
                } else {
                    return err;
                }
            } catch (error) {
                return I18n.t(Keys.error_parse);
            }
        }
    }

    render() {
        var queryVars = Util.parseURLQueryString(this.state.url)
        queryVars = Object.assign(queryVars, { lang:getStore().getState().settingStore.language, meetone:true, meetone_version:DeviceInfo.getVersion(), system_name:DeviceInfo.getSystemName() });
        if (this.state.needAccount && this.props.walletAccount) {
            queryVars = Object.assign( {}, queryVars, {
                eos_account: this.props.walletAccount.accountName
            } );
        }
        const targetURL = this.state.url.split('?')[0];
        const new_url = Util.appendQueryString(targetURL, queryVars);

        const patchPostMessageFunction = function() {
            var originalPostMessage = window.postMessage;

            var patchedPostMessage = function(message, targetOrigin, transfer) {
                originalPostMessage(message, targetOrigin, transfer);
            };

            patchedPostMessage.toString = function() {
                return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };

            window.postMessage = patchedPostMessage;
        };

        const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';

        // 弹窗位置，因为导航栏的有无而变化
        let modalMargin = STATE_BAR_HEIGHT  + NAVI_BAR_HEIGHT  - ANDROID_BOTTOM_MENU_HEIGHT;
        // 浮窗初始位置
        const DraggerRadius = 32;
        const DraggerPosition = {
            left: WINDOW_WIDTH - 2 * DraggerRadius,
            top: WINDOW_HEIGHT - 2 * DraggerRadius - 300,
        }
        const DraggerMinX = DraggerRadius;
        const DraggerMaxX = WINDOW_WIDTH - DraggerRadius;
        // 与弹窗位置一样，因为导航栏的有无而变化
        let DraggerMinY = DraggerRadius;
        let DraggerMaxY = WINDOW_HEIGHT - STATE_BAR_HEIGHT - NAVI_BAR_HEIGHT - DraggerRadius - IOS_BOTTOM_HEIGHT;
        if (this.state.simpleHead) {
            modalMargin = - ANDROID_BOTTOM_MENU_HEIGHT;
            DraggerMinY = STATE_BAR_HEIGHT + NAVI_BAR_HEIGHT + DraggerRadius;
            DraggerMaxY = WINDOW_HEIGHT - DraggerRadius - IOS_BOTTOM_HEIGHT;
        }
        if (this.state.simpleLeft) {
            modalMargin = STATE_BAR_HEIGHT - ANDROID_BOTTOM_MENU_HEIGHT;
            DraggerMinY = STATE_BAR_HEIGHT + DraggerRadius;
            DraggerMaxY = WINDOW_HEIGHT - DraggerRadius - IOS_BOTTOM_HEIGHT;
        }

        let showCPUFloatBtn,  // 是否显示浮窗
            useRate,          // CPU占用率
            floatBtnSwitch;   // 右上角菜单浮窗状态开关

        // 首先判断是否有钱包，链接参数配置是否关闭浮窗
        if (this.props.walletAccount && !this.state.hideFloatBtn && this.props.showCPUBtn && this.props.netType === 'EOS') {
            // 计算使用率、可用量、抵押量
            const account = this.props.walletAccount;
            const cpu_max = account.cpu_limit && account.cpu_limit.max;
            const cpu_used = account.cpu_limit && account.cpu_limit.used;
            useRate = parseInt(cpu_used / cpu_max * 100);

            if (useRate > 100) {
                useRate = 100;
            } else if (isNaN(useRate)) {
                useRate = 0;
            }

            if (this.props.cpuFloatBtnSetting){
                showCPUFloatBtn = true;
                floatBtnSwitch = true;
            } else {
                showCPUFloatBtn = false;
                floatBtnSwitch = true;
            }
        } else {
            showCPUFloatBtn = false;
            floatBtnSwitch = false;
            useRate = 0;
        }

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}
                    marginTop = {((Platform.OS === 'ios' && this.state.simpleHead == 1) ? -constStyles.STATE_BAR_HEIGHT : 0)}
                    marginBottom = {Util.isiPhoneFullDisplay() ? -34 : 0}>
                    <StatusBar
                        animated={true} //指定状态栏的变化是否应以动画形式呈现。目前支持这几种样式：backgroundColor, barStyle和hidden
                        translucent={this.state.simpleHead == 1 ? true : false}//指定状态栏是否透明。设置为true时，应用会在状态栏之下绘制（即所谓“沉浸式”——被状态栏遮住一部分）。常和带有半透明背景色的状态栏搭配使用。
                        barStyle={this.state.simpleHead == 1 ? 'light-content' : 'default'} // enum('default', 'light-content', 'dark-content')
                    />



                    <WebView
                        originWhitelist={['*']}
                        userAgent = { DeviceInfo.getUserAgent() + "; MEET.ONE" }
                        allowsBackForwardNavigationGestures = {true}
                        ref={(webview) => { this.meetWebview = webview; }}
                        scalesPageToFit={Platform.OS === 'ios' ? true : false}
                        injectedJavaScript={patchPostMessageJsCode}
                        source={{ uri: new_url + "", headers: {
                            // TODO: 似乎这个Headers没用   // accept-language 有用，需要带
                            'Cache-Control': this.state.nocache == 1 ? 'no-cache' : '',
                            'accept-language': getStore().getState().settingStore.language,
                            'version': DeviceInfo.getVersion(),
                            'systemVersion': DeviceInfo.getSystemVersion()} }}
                        onMessage={this.onMessage}
                        onShouldStartLoadWithRequest={( e ) => {
                            // console.log('onShouldStartLoadWithRequest');
                            if (this.state.initJS) {
                                // will inject javascript code include `MeetBridge` & `ScatterAdapter`
                                this.setState({initJS: false}, () => {
                                    this.meetWebview.injectJavaScript(MeetBridge.source)
                                    this.meetWebview.injectJavaScript(Scatter.source)
                                })
                            }
                            if (e.url.startsWith("weixin://") || e.url.startsWith("alipays://")) {
                                Linking.openURL(e.url).catch(err => console.error('An error occurred', err));
                                return false;
                            }
                            // Return true from the function to continue loading the request and false to stop loading.
                            return true;
                        }}
                        onLoadStart={() => {
                            // console.log('onLoadStart');
                            // if (this.state.initJS) {
                            //     this.setState({initJS: false}, () => {
                            //         this.meetWebview.injectJavaScript(MeetBridge.source)
                            //         this.meetWebview.injectJavaScript(Scatter.source)
                            //     })
                            // }
                        }}
                        onLoad={() => {
                            // console.log('onLoad');
                            if (Platform.OS === 'ios') {
                                this.meetWebview.injectJavaScript(`;(function() {
                                    let history = window.history;
                                    let pushState = history.pushState;
                                    history.pushState = function(state) {
                                      setTimeout(function () {
                                        window.postMessage(JSON.stringify({
                                          type: 'navStateChange',
                                          navState: { url: location.href, title: document.title }
                                        }));
                                      }, 1100);
                                      return pushState.apply(history, arguments);
                                    };
                                  })()`);
                            }
                            this.meetWebview.injectJavaScript(MeetBridge.source)
                            this.meetWebview.injectJavaScript(Scatter.source)
                            this.setState({
                                loading: false
                            })
                        }}
                        onError={() => {
                            this.setState({
                                loading: false
                            })
                        }}
                        onNavigationStateChange={this._onNavigationStateChange}
                        renderError={(errorDomain, errorCode, errorDesc) => (
                            <View style={styles.error}>
                                <Text>{errorDomain}</Text>
                                <Text>{errorCode}</Text>
                                <Text>{errorDesc}</Text>
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.btnText} onPress={()=>{this.reload()}}>Reload</Text>
                                </TouchableOpacity>
                            </View>
                        )}/>

                    {
                        this.state.loading ?
                        <LoadingView/>
                        :
                        null
                    }
                </View>

                {
                    showCPUFloatBtn ?
                    <CPUFloatButton
                        containerStyle={{
                            position: 'absolute',
                            left: DraggerPosition.left,
                            top: DraggerPosition.top,
                            width: DraggerRadius * 2,
                            height: DraggerRadius * 2,
                        }}
                        initial_x={ DraggerPosition.left + DraggerRadius }
                        initial_y={ DraggerPosition.top + DraggerRadius }
                        minX={ DraggerMinX }
                        maxX={ DraggerMaxX }
                        minY={ DraggerMinY }
                        maxY={ DraggerMaxY }

                        btnText={ I18n.t(Keys.cpu_usage) }
                        useRate={useRate}
                        navigation={this.props.navigation}
                        floatBtnTarget={this.state.floatBtnTarget}
                    />
                    :
                    null
                }

                {/* 右上角拉起的弹窗 */}
                <PopupDialog
                    show={this.state.showDialog}
                    onDismissed={() => {
                        this.setState({
                            showDialog: false
                        })
                    }}
                    dialogAnimation={slideFromBottom}
                    dialogStyle={{
                        position: 'absolute',
                        height: 150,
                        bottom: modalMargin,
                        borderRadius: 0,
                    }}
                >
                    <View style={[{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: 20,
                        paddingHorizontal: 15
                    }, this.state.hideShare ? { justifyContent: 'flex-start' } : {} ]}>
                        {/* 刷新 */}
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                showDialog: false
                            }, () => {
                                this.reload();
                            })
                        }}>
                            <View style={styles.dialogBtn}>
                                <Image
                                    source={ require( '../imgs/web-refresh.png' ) }
                                    style={[ { width: 50, height: 50 } ]}
                                />
                                <Text style={styles.dialogBtnText}>刷新</Text>
                            </View>
                        </TouchableOpacity>

                        {
                            this.state.hideShare
                            ?
                            null
                            :
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    showDialog: false
                                }, () => {
                                    Linking.openURL( this.state.url ).catch( err => console.error( 'An error occurred', err ) );
                                })
                            }}>
                                <View style={styles.dialogBtn}>
                                    <Image
                                        source={ require( '../imgs/web-openlink.png' ) }
                                        style={[ { width: 50, height: 50 } ]}
                                    />
                                    <Text style={styles.dialogBtnText}>浏览器打开</Text>
                                </View>
                            </TouchableOpacity>
                        }

                        {
                            this.state.hideShare
                            ?
                            null
                            :
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    showDialog: false
                                }, () => {
                                    this._share()
                                })
                            }}>
                                <View style={styles.dialogBtn}>
                                    <Image
                                        source={ require( '../imgs/web-share.png' ) }
                                        style={[ { width: 50, height: 50 } ]}
                                    />
                                    <Text style={styles.dialogBtnText} >分享</Text>
                                </View>
                            </TouchableOpacity>
                        }

                        {
                            this.state.hideShare
                            ?
                            null
                            :
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    showDialog: false
                                }, () => {
                                    Clipboard.setString(this.state.url);
                                    Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                                })
                            }}>
                                <View style={styles.dialogBtn}>
                                    <Image
                                        source={ require( '../imgs/web-copylink.png' ) }
                                        style={[ { width: 50, height: 50 } ]}
                                    />
                                    <Text style={styles.dialogBtnText} >复制链接</Text>
                                </View>
                            </TouchableOpacity>
                        }

                        {
                            floatBtnSwitch
                            ?
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    showDialog: false
                                }, () => {
                                    this.props.toggleFloatButtonState(!showCPUFloatBtn);
                                })
                            }}>
                                <View style={[ styles.dialogBtn, this.state.hideShare ? { marginLeft: 24 } : {} ]}>
                                    <Image
                                        source={ showCPUFloatBtn ? require( '../imgs/dapps_btn_cputool_on.png') : require( '../imgs/dapps_btn_cputool_off.png' ) }
                                        style={[ { width: 50, height: 50 } ]}
                                    />
                                    <Text style={styles.dialogBtnText} >资源小工具</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            null
                        }
                    </View>
                </PopupDialog>

                <ShareComponent
                    isOpen={this.state.isOpenShare}
                    onClose={() => {
                        this.setState( {
                            isOpenShare: false
                        });
                    }}
                    webviewComponent={this.meetWebview}
                    callbackId={this.state.callbackId}
                    onCancel={() => {
                        let params = Util.schemeEncode(999, 300, {});
                        this.meetWebview.postMessage(JSON.stringify({
                            params,
                            callbackId: this.state.callbackId
                        }));
                    }}
                    shareBody={this.state.shareBody}/>

                {/* 密码输入框 - 支付确认 */}
                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this.doPay(password);
                    }}
                    onClose={(code) => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                        // 取消的回调
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                    }}/>

                {/* 密码输入框 - 发起Transaction */}
                <PasswordInputComponent
                    isOpen={this.state.isTransactionPswdOpen}
                    onResult={( password ) => {
                        this.doTransaction( password );
                    }}
                    onClose={(code) => {
                        this.setState( {
                            isTransactionPswdOpen: false
                        } );
                        // 取消的回调
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                    }}/>

                <PasswordInputComponent
                    isOpen={this.state.isSignaturePswdOpen}
                    onResult={( password, isRemember ) => {
                        // 签名
                        this.doSignature(password);
                        // 设置记住密码
                        if (isRemember) {
                            this.setState({canSkip: true});
                        }
                    }}
                    onClose={(code) => {
                        this.setState( {
                            isSignaturePswdOpen: false
                        } );
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                    }}/>

                {/* 支付确认信息框 */}
                <EOSTransferConfirmComponent
                    isExternal={true}
                    isOpen={this.state.isConfirmOpen}
                    onConfirm={() => {
                        // 如果有临时保存的密码的话，则直接发起付款，不需要用户再次输入密码
                        const store = getStore();
                        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                        if (tempPsw) {
                            AnalyticsUtil.onEvent('WASNfree');
                            this.doPay(tempPsw);
                        } else {
                            this.setState({
                                isPswdOpen: true
                            });
                        }
                    }}
                    onClose={(code) => {
                        AnalyticsUtil.onEvent('WAtransactiondialog');
                        this.setState({
                            isConfirmOpen: false
                        });
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                    }}
                    data={this.state.paymentData}/>

                {/* 签名信息确认框 */}
                <EOSTransactionsConfirmComponent
                    canSkip={ this.state.canSkip }
                    skipActionNames={this.state.skipActionNames}
                    isExternal={true}
                    isOpen={this.state.isSignatureConfirmOpen}
                    onConfirm={({isRemember, actionName}) => {
                        const store = getStore();
                        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                        if (isRemember) {
                            this.state.skipActionNames.push(actionName);
                        }
                        if (tempPsw) {
                            AnalyticsUtil.onEvent('WASNfree');
                            this.doSignature(tempPsw);
                        } else {
                            this.setState({ isSignaturePswdOpen: true });
                        }
                    }}
                    onClose={(code) => {
                        AnalyticsUtil.onEvent('WAtransactiondialog');
                        this.setState({
                            isSignatureConfirmOpen: false
                        });
                        // 取消的回调
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                    }}
                    transactionRawData={this.state.transactionRawData}
                />
                {/* 发起交易确认信息框 */}
                <EOSTransactionsConfirmComponent
                    isExternal={true}
                    isOpen={this.state.isTransactionConfirmOpen}
                    onConfirm={() => {
                        const store = getStore();
                        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                        if (tempPsw) {
                            AnalyticsUtil.onEvent('WASNfree');
                            this.doTransaction(tempPsw);
                        } else {
                            this.setState({
                                isTransactionPswdOpen: true
                            });
                        }
                    }}
                    onClose={(code) => {
                        AnalyticsUtil.onEvent('WAtransactiondialog');
                        this.setState({
                            isTransactionConfirmOpen: false
                        });
                        // 取消的回调
                        if (code === -1) {
                            let params = Util.schemeEncode(999, 999, {});
                            this.meetWebview.postMessage(JSON.stringify({
                                params,
                                callbackId: this.state.callbackId
                            }));
                        }
                        if (-1 === code && this.state.infoData) {
                            URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/transaction', {}, '', this.state.infoData.dappRedirectURL);
                        }
                    }}
                    data={this.state.transactionData}/>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    error: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        width: 150,
        height: 50,
        marginTop: 20,
        backgroundColor: '#444444',
        flexDirection: 'row',
        borderRadius: 3,
    },
    btnText: {
        width: 150,
        height: 50,
        lineHeight: 50,
        textAlign: 'center',
        color: '#fff',
        fontSize: 16
    },
    dialogBtn: {
        alignItems: 'center'
    },
    dialogBtnText: {
        marginTop: 5,
        fontSize: 10,
        color: '#323232'
    }
});

export default WebViewPageView;
