import React, { Component } from 'react';
import {AppState, ScrollView, Text, TouchableOpacity, View, Image, InteractionManager, Linking, BackHandler} from 'react-native';
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import Button from "react-native-button";
import Eos from "eosjs";
import request from "superagent";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import WalletSelectComponent from "../../wallet/components/WalletSelectComponent";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import LoadingView from "../../../components/LoadingView";
import {verifyPassword} from "../../../actions/EOSAction";
import {handleError} from "../../../net/parse/eosParse";
import commonStyles from "../../../styles/commonStyles";
import URLRouteUtil from "../../../util/URLRouteUtil";
import Util from '../../../util/Util';
import { getStore } from '../../../setup';
import AnalyticsUtil from '../../../util/AnalyticsUtil';

class EOSAuthorationPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t(Keys.authorization_title),
            headerStyle: {
                backgroundColor: '#ffffff',
                borderBottomWidth: 0,
                elevation: 0
            },
            // 禁止右滑后退
            gesturesEnabled: false,
            // 自定义左上角的取消/后退按钮
            headerLeft: (
                <Button
                    style={commonStyles.top_info_left_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.cancel();
                    }}>
                    {I18n.t( Keys.cancel )}
                </Button>
            ),
        };
    };

    constructor( props ) {
        super( props );
        const {callbackId, params} = props.navigation.state.params.queryObj;
        this.state = {
            isOpenAccountSelect: false,
            callbackId,
            params,
            isPswdOpen: false,
            isRequesting: false,
        }

        if (props.accounts.length < 1) {
            Toast.show( I18n.t( Keys.no_account ), { position: Toast.positions.CENTER } );
            props.navigation.dispatch(
                StackActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate( { routeName: 'mainPage' } ),
                        NavigationActions.navigate( { routeName: 'EOSWalletImportPage', params: {queryObj: props.navigation.state.params.queryObj, before: 'EOSAuthorationPage'} } ),
                    ]
                })
            )
        }
    }

    _cancel() {
        // 取消授权的操作，跳转回去应用
        const {params, info, callbackId} = this.props.navigation.state.params.queryObj;
        if (params.from === 'qrcode') {
            // 二维码进入，不做处理
        } else {
            if (info) {
                var dappCallbackURL = info.dappCallbackURL;
                if (dappCallbackURL) {
                    dappCallbackURL = dappCallbackURL + '&result=0';
                    Linking.openURL(dappCallbackURL)
                    .catch( err => {
                        console.error( 'An error occurred when invokeCallBackScheme', err )
                    });
                } else {
                    URLRouteUtil.invokeCallBackScheme(info.dappCallbackScheme, -1, 'Cancel', params.function, {}, params.callbackId, info.dappRedirectURL);
                }
            } else {
                let paramsObj = {
                    code: -1,
                    data: {}
                };
                const myParams = Util.coverObjectToParams(paramsObj, false);
                URLRouteUtil.invokeScheme( (params.schema ? params.schema : 'moreone') + '://meet/callback?params=' + myParams, params.callbackId, params.redirectURL);
            }
        }
        // 后退
        this.props.navigation.goBack();
    };

    componentWillMount() {
        // 将callbackID参数注入到Navigator中
        this.props.navigation.setParams({
            callbackId: this.state.callbackId,
            params: this.state.params
        });
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WA3rdlogindialog');

        this._cancel = this._cancel.bind( this );

        this.props.navigation.setParams({
            cancel: this._cancel
        });
        // 监听APP状态
        AppState.addEventListener('change', this._handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        // 解除监听APP状态
        AppState.removeEventListener('change', this._handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this._cancel(); // works best when the goBack is async
        return true;
    }

    _handleAppStateChange = (nextAppState) => {
        // nextAppState = ['active', 'inactive', 'background'];
        if (nextAppState === 'background') {
            // 当应用处于授权页面时，切换到后台返回首页
            this.props.navigation.pop();
        }
    }

    // 确认授权
    doConfirm(password) {
        InteractionManager.runAfterInteractions(() => {
            const {params, info} = this.props.navigation.state.params.queryObj;
            const { goBack } = this.props.navigation;
            const {loginUrl, protocol, version} = params;
            var {uuID} = params;
            if (!uuID && info && info.dapp.uuID) {
                uuID = info.dapp.uuID;
            }
            const accountPrivateKey = verifyPassword(this.props.account, password, (err, result) => {
                handleError(err);
            }, this.props.dispatch);
            if (!accountPrivateKey) {
                return;
            }

            // show loading status
            this.setState({ isRequesting: true });
            setTimeout(() => {
                const { ecc } = Eos.modules;
                // 发送授权的页面
                const ref = 'MEET.ONE'; // ref作为钱包名，标记来源
                const timestamp = new Date().getTime(); // 时间戳
                const {accountName} = this.props.account;
                // 生成sign
                // 1. data = timestamp + account + uuID + ref
                let data = timestamp + accountName + uuID + ref;
                // 2. sign = ecc.sign(data, privateKey)
                let sign = ecc.sign(data, accountPrivateKey);
                if (loginUrl) {
                    // 3. 钱包将签名后的数据POST到Dapp提供的loginUrl，请求登录验证
                    request
                    .post(loginUrl)
                    .send({
                        protocol,
                        version,
                        timestamp,
                        sign,
                        uuID,
                        account: accountName,
                        ref
                    })
                    .then(res => {
                        const {body} = res;
                        if (body.code === 0) {
                            Toast.show(I18n.t(Keys.verify_success), { position: Toast.positions.CENTER } )
                            // 将授权页后退掉
                            goBack();
                            var dappCallbackURL = info.dappCallbackURL;
                            if (dappCallbackURL) {
                                dappCallbackURL = dappCallbackURL + '&result=1';
                                Linking.openURL(dappCallbackURL)
                                .catch( err => {
                                    console.error( 'An error occurred when invokeCallBackScheme', err )
                                });
                            }
                        } else {
                            Toast.show(body.error, { position: Toast.positions.CENTER } )
                            var dappCallbackURL = info.dappCallbackURL;
                            if (dappCallbackURL) {
                                // 将授权页后退掉
                                goBack();
                                dappCallbackURL = dappCallbackURL + '&result=2';
                                Linking.openURL(dappCallbackURL)
                                .catch( err => {
                                    console.error( 'An error occurred when invokeCallBackScheme', err )
                                });
                            }
                        }
                    })
                    .finally(() => {
                        // hide loading status
                        this.setState({ isRequesting: false });
                    })
                    .catch(err => {
                        Toast.show( err.message, { position: Toast.positions.CENTER } )
                        console.log(err);
                        var dappCallbackURL = info.dappCallbackURL;
                        if (dappCallbackURL) {
                            // 将授权页后退掉
                            goBack();
                            dappCallbackURL = dappCallbackURL + '&result=2';
                            Linking.openURL(dappCallbackURL)
                            .catch( err => {
                                console.error( 'An error occurred when invokeCallBackScheme', err )
                            });
                        }
                    })
                } else {
                    // hide loading status
                    this.setState({ isRequesting: false });
                    // 确认授权，跳转回去
                    let isOwner = false;
                    let isActive = false;
                    const account = this.props.account

                    if(account.permissions) {
                        account.permissions.forEach(perm => {
                            perm.required_auth.keys.forEach(key => {
                                if (perm.perm_name === 'owner') {
                                    if (key.key === account.accountPublicKey) {
                                        isOwner = true;
                                    }
                                }
                                if (perm.perm_name === 'active') {
                                    if (key.key === account.accountPublicKey) {
                                        isActive = true;
                                    }
                                }
                            })
                        });
                    }

                    let data = {
                        account: account && account.accountName,
                        publicKey: account && account.accountPublicKey,
                        isOwner: isOwner,
                        isActive: isActive,
                        currencyBalance: account && account.currencyBalance,
                        signature: sign,
                        ref: ref,
                        timestamp: timestamp
                    }
                    if (info) {
                        data = Object.assign( {}, data, {
                            uuID: uuID,
                        })
                        var dappCallbackURL = info.dappCallbackURL;
                        if (dappCallbackURL) {
                            dappCallbackURL = dappCallbackURL + '&result=1';
                            Linking.openURL(dappCallbackURL)
                            .catch( err => {
                                console.error( 'An error occurred when invokeCallBackScheme', err )
                            });
                        } else {
                            URLRouteUtil.invokeCallBackScheme(info.dappCallbackScheme, 0, 'Success', params.function, data, params.callbackId, info.dappRedirectURL);
                        }
                    } else {
                        let paramsObj = {
                            code: 0,
                            type: 1,
                            data: data
                        }
                        const myParams = Util.coverObjectToParams(paramsObj, false);
                        URLRouteUtil.invokeScheme( (params.schema ? params.schema : 'moreone') + '://meet/callback?params=' + myParams, this.state.callbackId, params.redirectURL);
                    }
                }
            }, 100);
        });
    }

    render() {

        const {params, info} = this.props.navigation.state.params.queryObj;
        const dappLogo = info ? info.dapp.icon : params.dappIcon;
        const dappName = info ? info.dapp.name : params.dappName;
        const loginMemo = params.description ? params.description : params.loginMemo;
        return (
            <SafeAreaView style={[commonStyles.wrapper, {backgroundColor: '#ffffff'}]}>
                <ScrollView>
                    <View style={{ paddingHorizontal: 35 }}>
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Image
                                source={
                                    dappLogo ? {uri: dappLogo} : require( '../../../imgs/moreone.png' )
                                }
                                style={[ { width: 64, height: 64 } ]}/>
                        </View>

                        {/* 授权名称 */}
                        <Text style={{
                            marginTop: 15,
                            textAlign: 'center',
                            fontSize: 22,
                            fontWeight: '500',
                            color: '#323232'
                        }}>
                            {
                                dappName ? dappName : 'MORE.ONE'
                            }
                        </Text>
                        {/* 授权信息 */}
                        <Text style={{
                            marginTop: 10,
                            marginBottom: 10,
                            textAlign: 'center',
                            fontSize: 14,
                            color: '#999999'
                        }}>
                            {
                                loginMemo ? loginMemo : (dappName ? dappName : 'MORE.ONE') + I18n.t(Keys.authorization_desc)
                            }
                        </Text>

                        {/* 授权免责声明 */}
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 14,
                            marginBottom: 20,
                            color: '#f65858'
                        }}>
                            {I18n.t(Keys.authorization_notice)}
                        </Text>

                        <View style={commonStyles.commonIntervalStyle} />

                        <Text style={{
                            marginTop: 15,
                            fontSize: 14,
                            color: '#999999'
                        }}>{I18n.t(Keys.authorization_permission)}</Text>

                        <Text style={{
                            marginTop: 10,
                            fontSize: 16,
                            lineHeight: 24,
                            color: '#323232'
                        }}>{I18n.t(Keys.authorization_permission_01)}</Text>

                        <Text style={{
                            marginBottom: 15,
                            fontSize: 14,
                            lineHeight: 24,
                            color: '#323232'
                        }}>{I18n.t(Keys.authorization_permission_notice)}</Text>

                        <View style={commonStyles.commonIntervalStyle} />

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 18
                        }}>
                            <View>
                                <Text style={{
                                    fontSize: 14,
                                    color: '#999999'
                                }}>{I18n.t(Keys.authorization_account)}</Text>
                                <Text style={{
                                    marginTop: 5,
                                    fontSize: 16,
                                    color: '#323232'
                                }}>{this.props.account && this.props.account.accountName}</Text>
                            </View>


                            <View style={{
                                marginLeft: 20,
                                width: 56,
                                height: 24,
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(26,206,154,0.10)'
                                    }}
                                    onPress={()=>{
                                        this.setState( {
                                            isOpenAccountSelect: true
                                        } );
                                    }}>
                                    <Text style={{
                                        fontSize: 14,
                                        color: '#323232'
                                    }}>{I18n.t(Keys.authorization_change)}</Text>
                                </TouchableOpacity>
                            </View>


                        </View>

                        <View style={commonStyles.commonIntervalStyle} />

                        <TouchableOpacity
                            style={{
                                marginTop: 60,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#4a4a4a',
                                borderRadius: 2
                            }}
                            onPress={()=>{
                                const {params, info} = this.props.navigation.state.params.queryObj;
                                const { goBack } = this.props.navigation;
                                const account = this.props.account
                                const {loginUrl} = params;
                                const {needSign} = params;
                                if (params.from === 'qrcode' || loginUrl || needSign) {
                                    const store = getStore();
                                    const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                                    if (tempPsw) {
                                        AnalyticsUtil.onEvent('WASNfree');
                                        this.doConfirm(tempPsw);
                                    } else {
                                        // 打开密码确认
                                        this.setState({ isPswdOpen: true });
                                    }
                                } else {
                                    // 确认授权，跳转回去
                                    let isOwner = false;
                                    let isActive = false;
                                    const account = this.props.account

                                    if (account.permissions) {
                                        account.permissions.forEach(perm => {
                                            perm.required_auth.keys.forEach(key => {
                                                if (perm.perm_name === 'owner') {
                                                    if (key.key === account.accountPublicKey) {
                                                        isOwner = true;
                                                    }
                                                }
                                                if (perm.perm_name === 'active') {
                                                    if (key.key === account.accountPublicKey) {
                                                        isActive = true;
                                                    }
                                                }
                                            })
                                        });
                                    }

                                    let data = {
                                        account: account && account.accountName,
                                        publicKey: account && account.accountPublicKey,
                                        isOwner: isOwner,
                                        isActive: isActive,
                                        currencyBalance: account && account.currencyBalance
                                    }

                                    if (info) {
                                        var dappCallbackURL = info.dappCallbackURL;
                                        if (dappCallbackURL) {
                                            dappCallbackURL = dappCallbackURL + '&result=1';
                                            Linking.openURL(dappCallbackURL)
                                            .catch( err => {
                                                console.error( 'An error occurred when invokeCallBackScheme', err )
                                            });
                                        } else {
                                            URLRouteUtil.invokeCallBackScheme(info.dappCallbackScheme, 0, 'Success', params.function, data, params.callbackId, info.dappRedirectURL);
                                        }
                                    } else {
                                        let paramsObj = {
                                            code: 0,
                                            type: 1,
                                            data: data
                                        }
                                        const myParams = Util.coverObjectToParams(paramsObj, false);
                                        URLRouteUtil.invokeScheme( (params.schema ? params.schema : 'moreone') + '://meet/callback?params=' + myParams, this.state.callbackId, params.redirectURL);
                                    }
                                    // 后退
                                    this.props.navigation.goBack();
                                    }
                            }}>
                            <Text style={{
                                fontSize: 17,
                                color: '#ffffff'
                            }}>{I18n.t(Keys.authorization_confirm)}</Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={{
                                marginTop: 10,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={()=>{
                                const {params, callbackId} = this.state
                                if (params.from === 'qrcode') {

                                } else {
                                    // 取消授权的操作，跳转回去应用
                                    if (info) {
                                        var dappCallbackURL = info.dappCallbackURL;
                                        if (dappCallbackURL) {
                                            dappCallbackURL = dappCallbackURL + '&result=0';
                                            Linking.openURL(dappCallbackURL)
                                            .catch( err => {
                                                console.error( 'An error occurred when invokeCallBackScheme', err )
                                            });
                                        } else {
                                            URLRouteUtil.invokeCallBackScheme(info.dappCallbackScheme, -1, 'Cancel', params.function, {}, params.callbackId, info.dappRedirectURL);
                                        }
                                    } else {
                                        let paramsObj = {
                                            code: -1,
                                            data: {}
                                        };
                                        const myParams = Util.coverObjectToParams(paramsObj, false);
                                        URLRouteUtil.invokeScheme( (params.schema ? params.schema : 'moreone') + '://meet/callback?params=' + myParams, params.callbackId, params.redirectURL);
                                    }
                                }
                                // 后退
                                this.props.navigation.goBack();
                            }}>
                            <Text style={{
                                fontSize: 16,
                                color: '#4a4a4a'
                            }}>{I18n.t(Keys.cancel)}</Text>
                        </TouchableOpacity>


                        {/* 帐号选择组件 */}
                        <WalletSelectComponent
                            isOpen={this.state.isOpenAccountSelect}
                            isSupportImport={true}
                            isSupportEOS={true}
                            isSupportETH={false}
                            defaultPrimaryKey={this.props.account ? this.props.account.primaryKey : ''}
                            onResult={( item ) => {
                                let account;
                                for ( let index = 0; index < this.props.accounts.length; index++ ) {
                                    if ( item.primaryKey === this.props.accounts[ index ].primaryKey ) {
                                        account = this.props.accounts[ index ];
                                    }
                                }
                                this.props.onSetDefaultWallet( account, ( error, result ) => {
                                    if ( error ) {
                                        Toast.show( error.message, { position: Toast.positions.CENTER } )
                                    }
                                    if (account.walletType === 'EOS') {
                                        // 同类钱包之间切换，更新帐户信息
                                        this.props.onUpdateAccount( account )
                                    }
                                } );
                            }}
                            onImportWallet={( walletType ) => {
                                if ( walletType === 'ETH' ) {
                                    this.props.navigation.navigate( 'ETHImportPage' );
                                } else {
                                    this.props.navigation.navigate( 'EOSWalletImportPage' );
                                }
                            }}
                            onClose={() => {
                                this.setState({
                                    isOpenAccountSelect: false
                                });
                            }}/>

                        {/* 密码输入框 - 确认授权 */}
                        <PasswordInputComponent
                            isOpen={this.state.isPswdOpen}
                            onResult={( password ) => {
                                this.doConfirm(password);
                            }}
                            onClose={() => {
                                this.setState( {
                                    isPswdOpen: false
                                } );
                            }}/>

                        {/* 加载动画 */}
                        <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default EOSAuthorationPageView;
