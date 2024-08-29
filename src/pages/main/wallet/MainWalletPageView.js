import React, { Component } from 'react';
import { Alert, Image, View, InteractionManager, Linking, Platform } from 'react-native';
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import NavigationUtil from '../../../util/NavigationUtil';
import URLRouteUtil from "../../../util/URLRouteUtil";
import Util from "../../../util/Util";

import WalletEOSWidget from "./components/WalletEOSWidget/WalletEOSWidget";
import WalletETHWidget from "./components/WalletETHWidget/WalletETHWidget";
import WalletEmptyView from "./components/WalletEmptyView";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import EOSTransferConfirmComponent from "../../eos/EOSTransferPage/EOSTransferConfirmComponent";
import EOSTransactionsConfirmComponent from "../../eos/EOSTransactionListPage/EOSTransactionsConfirmComponent";
import LoadingView from "../../../components/LoadingView";
import Toast from "react-native-root-toast";
import RNExitApp from 'react-native-exit-app';
import { IS_STORE } from '../../../env';
import Eos from "eosjs";
import {verifyPassword} from "../../../actions/EOSAction";
import { getStore } from '../../../setup';
import settingActionTypes from "../../../reducers/setting/settingActionTypes";
import AnalyticsUtil from "../../../util/AnalyticsUtil";


var DeviceInfo = require( 'react-native-device-info' );

class MainWalletPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.main_tab_meet ),
            tabBarIcon: ( { focused, tintColor } ) => (
                focused ?
                    <Image
                        source={require( '../../../imgs/tabbar_btn_wallet_active.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
                    :
                    <Image
                        source={require( '../../../imgs/tabbar_btn_wallet.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
            ),
            tabBarOnPress: ( data ) => {
                var previousScene = data.previousScene;
                var scene = data.scene;
                if ( !scene.focused ) {
                    data.jumpToIndex( scene.index );
                }
                // 更新钱包的相关信息
                navigation &&
                navigation.state &&
                navigation.state.params &&
                navigation.state.params.onFocusedTabClick &&
                navigation.state.params.onFocusedTabClick();
            },
            header: null
        };
    };

    /**
     * 执行更新钱包信息的逻辑
     * @author JohnTrump
     * @memberof MainWalletPageView
     */
    _onTabClick() {
        if ( this.props.account && this.props.account.walletType === 'ETH' ) {
            this.props.updateETHData();
        } else if ( this.props.account && this.props.account.walletType === 'EOS' ){
            this.props.updateEOSData(this.props.account);
        }
    }

    // 执行版本更新
    _onUpdate(err, resBody) {
        if ( err ) {
            if ( err.message ) {
                Toast.show( err.message, { position: Toast.positions.CENTER } )
            } else {
                Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } )
            }
        } else {
            if ((DeviceInfo.getVersion() < this.props.versionInfo.version)) {
                Alert.alert(
                    this.props.versionInfo.title,
                    this.props.versionInfo.notes,
                    this.props.versionInfo.type === 1 ?
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                NavigationUtil.openBrowser({ url: this.props.versionInfo.download_url});
                                // 强制退出APP
                                // https://github.com/wumke/react-native-exit-app
                                setTimeout(() => {
                                    RNExitApp.exitApp();
                                }, 1000);
                            }
                        }
                    ] :
                    [
                        {text: I18n.t( Keys.ask_me_later ), onPress: () => console.log('Ask me later pressed')},
                        {text: I18n.t( Keys.update_now ), onPress: () => NavigationUtil.openBrowser({ url: this.props.versionInfo.download_url})}
                    ]
                )
            } else {
                // 静默检查，不要显示
                // Toast.show( I18n.t( Keys.is_newest_version ), { position: Toast.positions.CENTER } )
            }
        }
    }

    constructor( props ) {
        super( props );
        const store = getStore();
        this.state = {
            isConfirmOpen: false, // 支付确认信息
            isTransactionConfirmOpen: false, // 合约操作确认信息
            isPswdOpen: false, // 支付密码输入框是否打开
            isTransactionPswdOpen: false, // 发起事务输入框是否打开
            isSignaturePswdOpen:false, // 发起签名输入框是否打开
            isSignatureConfirmOpen: false, // 是否打开签名信息确认框(签名)
            paymentData: null, // 付款信息
            transactionData: null, // Transaction信息
            loading: false, // 加载中状态
            infoData: null, // 回调信息
            // canSkip初始值不能值是False，要根据tempPsw来判断
            canSkip: !!Util.decryptTempPsw(store.getState().eosStore.tempPsw), // 是否显示记住合约的按钮
            skipActionNames: [], // 记住的合约名称 -> 关闭Dapp前不再提示
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: settingActionTypes.APPLICATION_WAITING_COMPONENT,
            waitingComponent: this
        });
        InteractionManager.runAfterInteractions(() => {
            // 获取最新的配置信息
            this.props.applicationConfigUpdate();
            if (!IS_STORE) {
                // 判断版本更新
                this.props.checkUpdate(() => {
                    setTimeout(() => {
                        this._onUpdate();
                    }, 2000);
                })
            }
            // 绑定_onTabClick逻辑
            this.props.navigation.setParams({
                onFocusedTabClick: this._onTabClick.bind(this)
            });
        });

        // 获取初始的URL
        Linking.getInitialURL().then(url => {
            const store = getStore();
            const {enableLock} = store.getState().settingStore;
            if (!this.props.isInit) {
                if (!enableLock) {
                    url && URLRouteUtil.handleOpenURL(this, url, (err, res) => {
                        this.props.updateisInit(true);
                        console.log(err, res);
                    });
                }
            }
        });

        // 监听URL
        Linking.addEventListener('url', this.handleOpenURL);
    }

    componentWillUnmount() {
        // 移除监听URL
        Linking.removeEventListener('url', this.handleOpenURL);
    }

    /**
     * 处理通过协议唤起APP的通用链接
     */
    handleOpenURL = (event) => {
        const store = getStore();
        const {enableLock, enableLockWhenBackground} = store.getState().settingStore;
        if (!(enableLock && enableLockWhenBackground)) {
            URLRouteUtil.handleOpenURL(this, event.url, (err, res) => {
                console.log(err, res);
            });
        }
    }

    // 发起支付
    doPay(password) {
        this.setState({loading: true});
        const paymentData = this.state.paymentData;
        this.props.onTransfer(this.props.account, {
            from: (paymentData.from && paymentData.from.accountName) ? paymentData.from.accountName : this.props.walletAccount,
            to: paymentData.to,
            quantity: Number(paymentData.amount).toFixed(paymentData.tokenPrecision).concat(' ').concat(paymentData.tokenName),
            tokenPublisher: paymentData.tokenContract,
            memo: paymentData.memo,
        }, password, (err, res) => {
            // 关闭掉loading提示
            this.setState({loading: false});
            var code = 500;
            if (err) {
                Toast.show(this._handleError(err), { position: Toast.positions.CENTER } );
            } else {
                code = 0;
                Toast.show(I18n.t(Keys.transaction_success), { position: Toast.positions.CENTER } );
            }
            if (this.state.infoData) {
                var dappCallbackURL = this.state.infoData.dappCallbackURL;
                if (dappCallbackURL) {
                    dappCallbackURL = dappCallbackURL + (err ? '&result=2' : '&result=1');
                    if (!err && res.transaction_id) {
                        dappCallbackURL = dappCallbackURL + '&txID=' + res.transaction_id;
                    }
                    Linking.openURL(dappCallbackURL)
                    .catch( err => {
                        console.error( 'An error occurred when invokeCallBackScheme', err )
                    });
                } else {
                    URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, code, err, 'eos/transfer', res, '', this.state.infoData.dappRedirectURL);
                }
            }
        });
    }

    // 发起事务
    doTransaction(password) {
        this.setState({loading: true});
        const actions = this.state.transactionActions;
        this.props.onTransaction(this.props.account, actions, password, (err, res) => {
            this.setState({loading: false});
            var code = 500;
            if (err) {
                Toast.show(this._handleError(err), { position: Toast.positions.CENTER } );
            } else {
                code = 0;
                Toast.show(I18n.t(Keys.transaction_success), { position: Toast.positions.CENTER } );
            }
            if (this.state.infoData) {
                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, code, err, 'eos/transaction', res, '', this.state.infoData.dappRedirectURL);
            }
        })
    }

    // 签名
    doSignature(password) {
        this.setState({loading: true});
        // 当前导入的EOS帐号
        const account = this.props.walletAccount;

        if (!account) {
            // 钱包内没有帐号的情况
            if (this.state.infoData) {
                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, 400, 'no match', 'eos/signature', {}, '', this.state.infoData.dappRedirectURL);
            }
            return
        }

        // 获取帐号私钥
        const accountPrivateKey = verifyPassword(account, password, (err, result) => {
            handleError(err);
        }, this.props.dispatch);

        if (!accountPrivateKey) {
            this.setState({loading: false});
            if (this.state.infoData) {
                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, 500, err, 'eos/signature', {}, '', this.state.infoData.dappRedirectURL);
            }
            return;
        }

        // for signing
        const { ecc } = Eos.modules;
        try {
            let isOwner = false;

            // 判断是否Owner权限
            if(account.permissions) {
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

            let sign = ecc.sign(this.state.signatureData, accountPrivateKey);
            // 签名成功的回调
            var resultJson = {
                signature: sign,
                account: account.accountName,
                isOwner: isOwner
            }
            this.setState({loading: false});
            if (this.state.infoData) {
                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, 0, 'success', 'eos/signature', resultJson, '', this.state.infoData.dappRedirectURL);
            }
        } catch (error) {
            // 签名失败的回调
            this.setState({loading: false});
            if (this.state.infoData) {
                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, 500, error, 'eos/signature', {error}, '', this.state.infoData.dappRedirectURL);
            }
        }
    }

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
        return (
            <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                {
                    this.props.account ?
                        (
                            this.props.account.walletType === 'ETH' ?
                                <WalletETHWidget navigation={this.props.navigation} updateETHAccount={this.props.updateETHAccountWithCallback} />
                                :
                                <WalletEOSWidget navigation={this.props.navigation} />
                        )
                        :
                        <WalletEmptyView
                            {...this.props}
                            navigation={this.props.navigation}
                        />
                }

                {
                    // Loading组件
                    this.state.loading ? <LoadingView/> : null
                }

                <View style={[ commonStyles.commonIntervalStyle ]}/>


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
                        if (-1 === code && this.state.infoData) {
                            var dappCallbackURL = this.state.infoData.dappCallbackURL;
                            if (dappCallbackURL) {
                                dappCallbackURL = dappCallbackURL + '&result=0';
                                Linking.openURL(dappCallbackURL)
                                .catch( err => {
                                    console.error( 'An error occurred when invokeCallBackScheme', err )
                                });
                            } else {
                                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/transfer', {}, '', this.state.infoData.dappRedirectURL);
                            }
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
                        if (-1 === code && this.state.infoData) {
                            URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/transfer', {}, '', this.state.infoData.dappRedirectURL);
                        }
                    }}/>

                {/* 密码输入框 - 发起签名 */}
                <PasswordInputComponent
                    isOpen={this.state.isSignaturePswdOpen}
                    onResult={( password ) => {
                        // 签名
                        this.doSignature(password);
                    }}
                    onClose={(code) => {
                        this.setState( {
                            isSignaturePswdOpen: false
                        } );
                        if (-1 === code && this.state.infoData) {
                            URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/signature', {}, '', this.state.infoData.dappRedirectURL);
                        }
                    }}/>

                {/* 支付确认信息框 */}
                <EOSTransferConfirmComponent
                    isExternal={true}
                    isOpen={this.state.isConfirmOpen}
                    onConfirm={() => {
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
                        if (-1 === code && this.state.infoData) {
                            var dappCallbackURL = this.state.infoData.dappCallbackURL;
                            if (dappCallbackURL) {
                                dappCallbackURL = dappCallbackURL + '&result=0';
                                Linking.openURL(dappCallbackURL)
                                .catch( err => {
                                    console.error( 'An error occurred when invokeCallBackScheme', err )
                                });
                            } else {
                                URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/transfer', {}, '', this.state.infoData.dappRedirectURL);
                            }
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
                            this.doSignature(tempPsw);
                        } else {
                            this.setState({ isSignaturePswdOpen: true });
                        }
                    }}
                    onClose={(code) => {
                        this.setState({
                            isSignatureConfirmOpen: false
                        });
                        if (-1 === code && this.state.infoData) {
                            URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/signature', {}, '', this.state.infoData.dappRedirectURL);
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
                        if (-1 === code && this.state.infoData) {
                            URLRouteUtil.invokeCallBackScheme(this.state.infoData.dappCallbackScheme, -1, 'Cancel', 'eos/transaction', {}, '', this.state.infoData.dappRedirectURL);
                        }
                    }}
                    data={this.state.transactionData}/>
            </View>
        );
    }
}

export default MainWalletPageView;
