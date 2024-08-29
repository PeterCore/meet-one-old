import React from "react";
import { NavigationActions, StackActions } from "react-navigation";
import { AppState, BackHandler, Platform, View, Text, Dimensions, InteractionManager, TouchableOpacity, Image, Linking, Clipboard, ImageBackground} from "react-native";
import Button from "react-native-button";
import TouchID from 'react-native-touch-id';
import { connect } from "react-redux";
import DeviceInfo from "react-native-device-info";
import PopupDialog, { ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';

import { getCurrentWallet } from "./actions/WalletAction";
import { updateEOS, updateExchangeList } from "./actions/EOSAction";
import { doGetBestServerHost } from "./net/utils/RequestUtil";
import { encryptShareCode } from "./net/3thNet"
import { metaServerHosts } from "./actions/MetaAction";
import { getStore } from './setup';
import I18n from "./I18n";
import Keys from "./configs/Keys";
import * as env from "./env";
import { AppNavigator } from './AppNavigator';
import NavigationUtil from './util/NavigationUtil';

import commonStyles from "./styles/commonStyles";
import navActionTypes from "./reducers/nav/navActionTypes";
import userActionTypes from "./reducers/user/userActionTypes";
import ethActionTypes from "./reducers/eth/ethActionTypes";
import settingActionTypes from "./reducers/setting/settingActionTypes";
import URLRouteUtil from "./util/URLRouteUtil";

import { getNetType, updateNetworks, updateHistoryNetworks, updateChainData, updateSupportTokens } from "./actions/ChainAction";

// const popupDialogAnimation = new ScaleAnimation({
//     // toValue: 100
// });

const popupDialogAnimation = new ScaleAnimation();
// const popupDialogAnimation = new SlideAnimation({
//     slideFrom: 'bottom'
// });

class App extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            appState: AppState.currentState,
            previousAppStates: [],
            memoryWarnings: 0,
            verifyFailed: false,
            shareCodeName: '', // 口令的名称
            shareCodeDesc: '', // 口令的描述
            shareCodeTarget: '', // 跳转目标
            shareCodeBanner: '', // 口令弹窗banner
            shareCodeIcon: '', // 口令弹窗icon
            shareCodeModal: false// 显示弹窗
        };

        this.props.dispatch( { 'type': navActionTypes.NAV_CLEAR_STACK } );

        this._handleAppStateChange = this.handleAppStateChange.bind( this );
        this._handleMemoryWarning = this.handleMemoryWarning.bind( this );
        this._onBack = this.onBack.bind( this );

        I18n.locale = this.props.language;

        // 读取剪切板
        this._readClipboard();

    }

    componentWillMount() {
        this.props.dispatch(updateEOS()); // 更新EOSJS实例对象
        this.props.dispatch( updateNetworks( () => {
            // 更新完节点列表之后再更新一次，如果下发的列表改变时候，能及时更新，但是如果有选过节点，则无法更新到。
            this.props.dispatch(updateEOS());
        } ) );
        this.props.dispatch( updateHistoryNetworks( null ) );
        this.props.dispatch( updateSupportTokens ( null ) );
        this.props.dispatch( updateExchangeList (null) );
        this.props.dispatch( doGetBestServerHost() );
        this.props.dispatch( updateChainData() );

        if ( this.props.walletSelfIncrementPrimaryKey <= 0 ) {
            this.props.dispatch( { 'type': ethActionTypes.ETH_WALLET_INIT_PRIMARY_KEY } );
        }

        this.props.dispatch( metaServerHosts( ( err, res ) => { } ) );
    }

    componentDidMount() {
        // 获取初始的URL
        Linking.getInitialURL().then(url => {
            this.props.dispatch({
                type: settingActionTypes.APPLICATION_WAITING_URI,
                waitingURI: url
            });
        });

        // 监听URL
        Linking.addEventListener('url', this.handleOpenURL);

        AppState.addEventListener( 'change', this._handleAppStateChange );
        AppState.addEventListener( 'memoryWarning', this._handleMemoryWarning );

        BackHandler.addEventListener( 'hardwareBackPress', this._onBack );
        this.props.dispatch({
            type: 'IS_INIT',
            isInit: false
        });

        // 打开应用锁的情况下走的逻辑
        if (this.props.enableLock) {
            this.props.dispatch({
                type: settingActionTypes.APPLICATION_LOCK_STATUS,
                isLockScreen: true
            });
            this.forceUpdate();
        }
        // 尝试解锁
        this._authBiology(this);
    }


    componentWillUnmount() {
        // 移除监听URL
        Linking.removeEventListener('url', this.handleOpenURL);
        AppState.removeEventListener( 'change', this._handleAppStateChange );
        AppState.removeEventListener( 'memoryWarning', this._handleMemoryWarning );

        BackHandler.removeEventListener( 'hardwareBackPress', this._onBack )
    }

    /**
     * 处理通过协议唤起APP的通用链接
     */
    handleOpenURL = (event) => {
        this.props.dispatch({
            type: settingActionTypes.APPLICATION_WAITING_URI,
            waitingURI: event.url
        });
    }

    onBack() {
        const { dispatch, nav } = this.props;
        if ( this.shouldCloseApp( nav ) ) {
            return false;
        }

        dispatch( {
            type: 'Navigation/BACK'
        } );

        return true;
    }

    shouldCloseApp( nav ) {
        return nav.index === 0;
    }

    shouldComponentUpdate( nextProps, nextState ) {

        if ( nextProps.pushToken !== this.props.pushToken ) {
            if ( this.props.pushToken && this.props.pushToken.length > 0 ) {
                //un register old

                console.log( "Old token = " + this.props.pushToken + "  newToken = " + nextProps.pushToken );

            } else {
                if ( nextProps.pushToken && nextProps.pushToken.length > 0 ) {

                    console.log( "Old token = null" + "  newToken = " + nextProps.pushToken );
                }
            }
        }

        if ( nextProps.pushToken !== this.state.pushToken ) {
            this.props.dispatch( { 'type': userActionTypes.PUSH_TOKEN_UPDATE, pushToken: nextState.pushToken } );
        }

        if ( nextState.appState !== this.state.appState ) {
            if ( nextState.previousAppStates.length > 0 && nextState.previousAppStates[ nextState.previousAppStates.length - 1 ] === 'background' && nextState.appState === 'active' ) {
                //the app from background to active

            }
        }


        return false;
    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.language !== this.props.language ) {
            // language changed
            I18n.locale = nextProps.language;

            this.props.dispatch(
                StackActions.reset(
                    {
                        index: 0,
                        actions: [
                            NavigationActions.navigate( { routeName: 'mainPage' } ),
                        ]
                    }
                )
            );
        }

        if ( nextProps.netType !== this.props.netType ) {
            this.props.dispatch(
                StackActions.reset(
                    {
                        index: 0,
                        actions: [
                            NavigationActions.navigate( { routeName: 'mainPage' } ),
                        ]
                    }
                )
            );
        }

        if ( nextProps.serverHostUrlData !== this.props.serverHostUrlData ) {
            this.props.dispatch( doGetBestServerHost() );
        }

        // 如果是用数字锁，并且解锁后
        if (nextProps.isNumberUnlock !== this.props.isNumberUnlock && !nextProps.isNumberUnlock) {
            // 通知组件进行刷新(口令)
            this.forceUpdate();
        }
    }

    handleMemoryWarning() {
        this.setState( { memoryWarnings: this.state.memoryWarnings + 1 } );
    }

    handleAppStateChange( appState ) {
        const previousAppStates = this.state.previousAppStates.slice();
        const store = getStore();
        const {enableLock, enableLockWhenBackground} = store.getState().settingStore;
        previousAppStates.push( this.state.appState );
        this.setState( {
            appState: appState,
            previousAppStates: previousAppStates,
            deviceCountry: DeviceInfo.getDeviceCountry()
        } );

        const recentStatus = this.state.previousAppStates[this.state.previousAppStates.length - 1];

        if (recentStatus == 'active' && appState == 'background') {
            if (this.props.waitingURI) {
                this.props.dispatch({
                    type: settingActionTypes.APPLICATION_WAITING_URI,
                    waitingURI: null
                });
            }
        }

        if (enableLock && enableLockWhenBackground) {
            // 判断是否正在用数字密码来解锁，如果是的话，则不显示isLockScreen
            if (this.props.isNumberUnlock) {
                return
            }
            // before change to `background` status
            if (recentStatus == 'active' && appState == (Platform.OS === 'ios' ? 'inactive' : 'background') && !this.props.isLockScreen) {
                InteractionManager.runAfterInteractions( () => {
                    this.props.dispatch({
                        type: settingActionTypes.APPLICATION_LOCK_STATUS,
                        isLockScreen: true
                    });
                    // 注意，这里要通知RN强制重新渲染组件，否则没有生效
                    this.forceUpdate();
                })
            }
            // when `background` status change to `active`
            if (recentStatus == 'background' && appState == 'active') {
                this.setState({
                    verifyFailed: false
                }, () => {
                    this.forceUpdate();
                    this._authBiology(this);
                });
            }
        }

        // APP切换到前台的时候，读取一下剪切板
        if(recentStatus == 'background' && appState == 'active') {
            this._readClipboard();
        }
    }

    // 读取剪切板
    _readClipboard() {
        Clipboard.getString().then(content => {
            // 判断是否满足我们的剪切板格式要求，如果满足的话，继续执行相关的逻辑
            // const reg = /(?<=\$).*?(?=\$)/ig; //  JS不支持后行断言
            const reg = /(?=\$\s+).*(?=\$)/ig;
            let rawCode = reg.exec(content)[0];
            const code = rawCode && rawCode.replace('$ ', '').split(' ')[0];
            if (code) {
                encryptShareCode(code, (err, res) => {
                    let {data} = res.body;
                    if (data) {
                        let string = data.replace(/&quot;/g, '\"');
                        try {
                            let result = JSON.parse(string);
                            let {target = '', banner = '', icon = '', name = '', description = '', login = true} = result;

                            // 项目方可以指定options.login为false,这个时候钱包就不会去检查是否有导入账户
                            if (login) {
                                // 判断是否登录钱包
                                if (!this.props.account) {
                                    return
                                }
                            }

                            this.setState({
                                shareCodeDesc: description, // 口令描述
                                shareCodeTarget: target, // 口令跳转目标
                                shareCodeBanner: banner, // 口令Banner
                                shareCodeIcon: icon, // 口令icon
                                shareCodeName: name, // 口令名称
                                shareCodeModal: true, // 是否显示Modal
                            }, () => {
                                // 这里要强制更新，否则View不会刷新
                                this.forceUpdate();
                            });

                        } catch (error) {
                            // 清空剪切板
                            Clipboard.setString('');
                            console.log(error);
                        }
                    }
                });
                // 清空剪切板
                Clipboard.setString('');
            }
        })
    }

    // 跳转到密码输入页面的逻辑
    _navigateToPassword(component) {
        // 设置全局变量 isLockScreen = false
        component.props.dispatch({
            type: settingActionTypes.APPLICATION_LOCK_STATUS,
            isLockScreen: false
        });
        // 设置全局变量isNumberUnlock = true
        component.props.dispatch({
            type: settingActionTypes.APPLICATION_NUMBER_UNLOCK,
            isNumberUnlock: true
        });
        component.forceUpdate();
        // 跳转到密码页
        component.props.dispatch(
            StackActions.push({
                routeName: 'ApplicationSecurePasswordPage',
                params: {
                    type: 'unlock'
                }
            })
        );
    }

    /**
     * 调用生物验证的逻辑
     * @param {Component} component 调用TouchID、FaceID的组件
     */
    _authBiology(component) {
        //config is optional to be passed in on Android
        const optionalConfigObject = {
            title: I18n.t(Keys.application_lock_auth_required), // Android
            color: "#f65858", // Android,
            // fallbackLabel: "Show Passcode" // iOS (if empty, then label is hidden)
        }
        // 测试是否支持
        TouchID.isSupported()
            .then(biometryType => {
                if (biometryType === 'FaceID') {
                    component.props.dispatch({
                        type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                        biologyType: 'FaceID'
                    });
                } else {
                    component.props.dispatch({
                        type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                        biologyType: 'TouchID'
                    });
                }

                // 如果应用没有被锁屏的话，就不做任何处理
                if(!component.props.isLockScreen || !component.props.enableBiologyId) {
                    return
                }

                TouchID.authenticate(I18n.t(Keys.application_lock_desc), optionalConfigObject)
                    .then(success => {
                        component.props.dispatch({
                            type: settingActionTypes.APPLICATION_LOCK_STATUS,
                            isLockScreen: false
                        });
                        component.forceUpdate();
                        if (component.props.waitingComponent && component.props.waitingURI) {
                            URLRouteUtil.handleOpenURL(component.props.waitingComponent, component.props.waitingURI, (err, res) => {
                                console.log(err, res);
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        component.setState({
                            verifyFailed: true
                        });
                        // 解锁失败
                        component.props.dispatch({
                            type: settingActionTypes.APPLICATION_LOCK_STATUS,
                            isLockScreen: true
                        });
                        component.forceUpdate();
                        if (error.name === 'RCTTouchIDNotSupported' || error.name === 'LAErrorTouchIDNotAvailable' || error.name === 'LAErrorTouchIDNotEnrolled') {
                            this._navigateToPassword(component);
                        } else if (error.name === 'LAErrorAuthenticationFailed') {
                            // 指纹错误，累计三次，跳转到App密码验证
                            this._navigateToPassword(component);
                        }
                    })
            })
            .catch(error => {
                component.props.dispatch({
                    type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                    biologyType: null
                });
            });


    }

    render() {
        return (
            <View style={[ commonStyles.wrapper, commonStyles.commonBG, {} ]}>
                {
                    this.props.isLockScreen ?
                    (
                        <View
                            style={{
                                backgroundColor: '#fff',
                                width: this.props.isLockScreen ? Dimensions.get('window').width : 0,
                                height: this.props.isLockScreen ? Dimensions.get('window').height : 0,
                                zIndex: 999,
                                alignItems: 'center',
                                justifyContent: 'space-around'
                            }}>

                            <Text
                                style={{
                                    fontSize: 24,
                                    color: '#323232',
                                }} >{I18n.t(Keys.application_lock_title)}</Text>

                            {
                                (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (this.props.biologyType && this.props.enableBiologyId) {
                                                this._authBiology(this);
                                            } else {
                                                this._navigateToPassword(this);
                                            }
                                        }}>
                                        <Image
                                            style={{
                                                width: 175,
                                                height: 175,
                                                marginBottom: 30
                                            }}
                                            source={
                                                this.props.enableBiologyId && this.props.biologyType === 'TouchID' ?
                                                require('./imgs/application_lock_fingerprint.png') :
                                                this.props.enableBiologyId && this.props.biologyType === 'FaceID' ?
                                                require('./imgs/application_loco_faceid.png') : require('./imgs/application_loco_password.png')
                                            }/>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: '#323232',
                                                textAlign: 'center'
                                            }}>{I18n.t(Keys.application_lock_click)}</Text>
                                    </TouchableOpacity>
                                )
                            }
                            <Text style={{ fontSize: 14, color: '#f65858' }}>
                                {
                                    this.state.verifyFailed ? I18n.t(Keys.application_lock_verify_failed) : ' '
                                }
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    this._navigateToPassword(this);
                                }}>
                                <View style={{
                                    marginTop: Platform.OS === 'ios' ? -20 : 0,
                                    borderColor: '#1ACE9A',
                                    borderWidth: 1,
                                    width: 165,
                                    height: 44,
                                    borderRadius: 22
                                }}>
                                    <Text
                                        style={{
                                            lineHeight: 44,
                                            fontSize: 16,
                                            color: '#1ACE9A',
                                            textAlign: 'center'
                                        }}>{I18n.t(Keys.application_lock_psw)}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }

                {
                    (!this.props.isLockScreen && !this.props.isNumberUnlock) ? (
                        <PopupDialog
                            ref={(popupDialog) => {this._popupDialog = popupDialog;}}
                            dialogAnimation={popupDialogAnimation}
                            width={Dimensions.get('window').width * .88}
                            height={'auto'}
                            // height={this.state.shareCodeBanner ? (Dimensions.get('window').width) / 5 * 2 + 150 : 220}
                            dialogStyle={{
                                backgroundColor: 'transparent',
                            }}
                            onDismissed={() => {
                                // Dialog dismissed的回调
                                this.setState({shareCodeModal: false}, () => {
                                    this.forceUpdate();
                                });
                            }}
                            show={this.state.shareCodeModal}>
                            {/* Dialog Content Wrapper */}
                            <View style={{
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                borderRadius: 15,
                            }}>
                                {/* banner */}
                                {
                                    this.state.shareCodeBanner ? (
                                        <View style={{
                                            width: '100%',
                                            borderTopLeftRadius: 15,
                                            borderTopRightRadius: 15,
                                            overflow: 'hidden'
                                        }}>
                                            <ImageBackground
                                                source={{
                                                    // 测试用的图片
                                                    // uri: 'https://static.ethte.com/artboard-2-png(2018-11-21T11:24:34+08:00).png'
                                                    // uri: 'https://static.ethte.com/artboard-copy-png(2018-11-21T14:13:42+08:00).png'
                                                    uri: this.state.shareCodeBanner
                                                }}
                                                resizeMode={'cover'}
                                                style={{
                                                    height: (Dimensions.get('window').width * .88) / 5 * 2,
                                                    width: '100%'
                                                }}/>
                                        </View>
                                    ) : (
                                        <View style={{
                                            height: 40
                                        }}>

                                        </View>
                                    )
                                }
                                {/* 标题与icon */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginVertical: 20,
                                    paddingHorizontal: 50
                                }}>
                                    {/* icon */}
                                    <Image
                                        style={{
                                            width: 36,
                                            height: 36,
                                            backgroundColor: 'transparent',
                                            borderWidth: 1,
                                            borderColor: '#e8e8e8',
                                            borderRadius: 10,
                                            marginRight: 10
                                        }}
                                        source={{uri: this.state.shareCodeIcon }} />
                                    {/* 标题 */}
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 17,
                                            color: '#323232',
                                            fontWeight: '700'
                                        }}>
                                        {this.state.shareCodeName}
                                    </Text>

                                </View>

                                {/* 描述 */}
                                <View
                                    style={{
                                        paddingHorizontal: 20
                                    }}>
                                    <Text
                                        numberOfLines={2}
                                        style={{
                                            textAlign: 'left',
                                            fontSize: 16,
                                            color: '#323232',
                                            lineHeight: 24
                                        }}>
                                        {this.state.shareCodeDesc}
                                    </Text>
                                </View>


                                <Button
                                    onPress={() => {
                                        this.setState({
                                            shareCodeModal: false
                                        }, () => {
                                            this.forceUpdate();
                                            NavigationUtil.openShareCodeTarget({
                                                component: this,
                                                url: this.state.shareCodeTarget
                                            });
                                        })
                                    }}
                                    style={[ commonStyles.buttonContentStyle ]}
                                    styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                    containerStyle={[
                                        commonStyles.buttonContainerStyle, {
                                            height: 44,
                                            width: 165,
                                            marginTop: 20,
                                            marginBottom: 30,
                                            borderRadius: 22,
                                            backgroundColor: '#4a4a4a',
                                        }
                                    ]}>
                                    {I18n.t(Keys.share_code_open)}
                                </Button>


                            </View>

                            {/* 关闭按钮 */}
                            <TouchableOpacity
                                onPress={() => {
                                    this._popupDialog.dismiss();
                                }}
                                style={{
                                    marginTop: 40,
                                    alignSelf: 'center'
                                }}
                                activeOpacity={0.8} >
                                <Image
                                    style={{
                                        width: 36,
                                        height: 36
                                    }}
                                    source={require('./imgs/sharecode_close.png')} />
                            </TouchableOpacity>
                        </PopupDialog>
                    ) : null
                }
                <AppNavigator/>
            </View>
        )
    }

}


function select( store ) {
    return {
        netType: getNetType(),
        account: getCurrentWallet(store, store.walletStore.currentWalletPrimaryKey), // 钱包账户
        pushToken: store.userStore.pushToken,
        language: store.settingStore.language,
        walletSelfIncrementPrimaryKey: store.walletStore.walletSelfIncrementPrimaryKey,
        serverHostUrlData: store.metaStore.serverHostUrlData,
        nav: store.nav,
        isLockScreen: store.settingStore.isLockScreen,
        isNumberUnlock: store.settingStore.isNumberUnlock,
        enableBiologyId: store.settingStore.enableBiologyId,
        enableLock: store.settingStore.enableLock,
        biologyType: store.settingStore.biologyType,
        waitingURI: store.settingStore.waitingURI,
        waitingComponent: store.settingStore.waitingComponent
    };
}

export default connect( select )( App );
