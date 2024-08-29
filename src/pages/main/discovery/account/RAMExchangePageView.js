import React, { Component } from "react";
import {View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform, StatusBar, WebView, Modal, Dimensions} from "react-native";
import Button from "react-native-button";
import { NavigationActions, SafeAreaView } from "react-navigation";
import Toast from "react-native-root-toast";
import PopupDialog from 'react-native-popup-dialog';

import Keys from "../../../../configs/Keys";
import I18n from "../../../../I18n";
import {IS_DEBUG} from "../../../../env";
import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import Util from "../../../../util/Util";
import PasswordInputComponent from "../../../../components/PasswordInputComponent";
import { getStore } from "../../../../setup";
import LoadingView from "../../../../components/LoadingView";
import { handleError } from "../../../../net/parse/eosParse";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AnalyticsUtil from "../../../../util/AnalyticsUtil";
const DeviceInfo = require('react-native-device-info');

class RAMExcahngePageView extends Component {
    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.ram_buy_sell ),
            headerStyle: params && params.simpleHead == 1 ? {
                elevation: 0,
                borderBottomWidth: 0
            } : {},
            headerTransparent: params && params.simpleHead == 1, // 控制透明
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            url: 'https://static.ethte.com/meet/ram-market/jump.html?lang=' + (getStore().getState().settingStore.language.match('zh') ? 'zh' : 'en'), // 打开的网页
            nocache: 1,
            simpleHead: 0, // 是否显示无头webview, 0为显示头部，1为无头
            isRequesting: true, // 加载状态
            isPswdOpen: false, // 密码输入框显示状态
            // 卖方
            from: '',
            intervalID: null, // 定时器ID
            isBuy: 1, // 是否买入
            isSell: 0, // 是否卖出
            isOpen: false, // 是否打开交易确认框
        }
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTram');
        this.props.navigation.setParams({
            simpleHead: this.state.simpleHead
        });

        this.props.updateEOSData(this.props.account);

        // ! 调试状态不获取内存价格
        if (!IS_DEBUG) {
            const intervalID = setInterval(() => {
                this.props.updateRAMPrice(this.props.account);
            }, 2000);
            this.setState({ intervalID });
        }
    }

    componentWillUnmount() {
        // 清空刷新RAM价格的定时器
        clearInterval(this.state.intervalID);
    }

    // 打开密码输入框
    _openPassword() {
        if (Number(this.state.from).toFixed(4) <= 0) {
            Toast.show(I18n.t(Keys.DelegatebwPage_UseValidValue), { position: Toast.positions.CENTER } );
            return;
        }
        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.setState({
                isOpen: false
            }, () => {
                this.transitionConfirmed(tempPsw);
            });
        } else {
            this.setState( { isPswdOpen: true, isOpen: false } );
        }
    }

    /**
     * 确认交易逻辑
     */
    transitionConfirmed(password) {
        const {account} = this.props;
        this.setState({ isRequesting: true });
        if (this.state.isBuy === 1) {
            const quant = Number(this.state.from).toFixed(4) + ' EOS';
            // 买入RAM
            this.props.buyRAM(account, password, quant, (err, res) => {
                this.setState({ isRequesting: false });
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                    // 更新EOS
                    this.props.updateEOSData(account);
                    // this.props.navigation.dispatch(NavigationActions.back());
                } else {
                    handleError(err);
                }
            });
        } else {
            const quant = Math.floor(this.state.from * 1024);
            this.props.sellRAM(account, password, quant, (err, res) => {
                this.setState({ isRequesting: false });
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                    // 更新EOS
                    this.props.updateEOSData(account);
                    // this.props.navigation.dispatch(NavigationActions.back());
                } else {
                    handleError(err);
                }
            });
        }
    }

    /**
     * 快速选择的逻辑
     */
    _quickBtn(num = 0.25) {
        const {account = {}} = this.props;
        const balance = this.state.isBuy === 1 ? account.currencyBalance : (account.ram_quota - account.ram_usage);
        let from = Util.toFixed(balance * num, 4);
        if (this.state.isBuy === 0) {
            // ram交易只能是整数
            from = Math.floor(from);
            from = Util.toFixed(from / 1024) - 1;
        }
        this.setState({ from: from < 0 ? 0 : from })
    }

    /**
     * 检查输入的数值
     */
    _chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");
        //必须保证第一位为数字而不是.
        obj = obj.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        obj = obj.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        return obj;
    }

    /**
     * 关闭RAM交易确认的弹窗
     */
    closeModal() {
        this.setState({isOpen: false});
    }

    render() {
        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]} marginTop = {-((Platform.OS === 'ios' && this.state.simpleHead == 1) ? constStyles.STATE_BAR_HEIGHT : 0)}>

                    <StatusBar
                        animated={true} //指定状态栏的变化是否应以动画形式呈现。目前支持这几种样式：backgroundColor, barStyle和hidden
                        translucent={this.state.simpleHead == 1 ? true : false}//指定状态栏是否透明。设置为true时，应用会在状态栏之下绘制（即所谓“沉浸式”——被状态栏遮住一部分）。常和带有半透明背景色的状态栏搭配使用。
                        barStyle={this.state.simpleHead == 1 ? 'light-content' : 'default'} // enum('default', 'light-content', 'dark-content')
                    />
                    <WebView
                        ref={(webview) => { this.meetWebview = webview; }}
                        source={{ uri: this.state.url + "", headers: {
                            'Cache-Control': this.state.nocache == 1 ? 'no-cache' : '',
                            'accept-language': getStore().getState().settingStore.language,
                            'version': DeviceInfo.getVersion(),
                            'systemVersion': DeviceInfo.getSystemVersion()} }}
                        onMessage={this.onMessage}
                        onLoad={() => {
                            this.setState({ isRequesting: false });
                        }}
                        onError={() => {
                            this.setState({
                                loading: false
                            })
                        }}
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

                        {/* 交易按钮 */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                bottom: 30,
                                zIndex: 1,
                                width: 145,
                                height: 44,
                                backgroundColor: '#1ace9a',
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignSelf: 'center'
                            }}
                            onPress={() => {
                                this.setState({ isOpen: true });
                            }}
                            activeOpacity={0.9}>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 17,
                                        color: '#fff',
                                        lineHeight: 26,
                                        textAlign: 'center'
                                    }}
                                >{I18n.t(Keys.ram_done)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* 加载状态 */}
                        { this.state.isRequesting ? <LoadingView/> : null }

                        {/* 密码输入验证框 */}
                        <PasswordInputComponent
                            isOpen={this.state.isPswdOpen}
                            onResult={( password ) => {
                                this.transitionConfirmed( password )
                            }}
                            onClose={() => {
                                this.setState( {
                                    isPswdOpen: false
                                } );
                        }}/>

                        {/* 交易确认框 */}
                        <Modal
                            transparent={true}
                            visible={this.state.isOpen}>
                            <KeyboardAwareScrollView
                                extraHeight={170}
                                style={[{height: Dimensions.get('window').height}]}>
                                <View style={[{height: Dimensions.get('window').height}]}>
                                    <PopupDialog
                                        onDismissed={() => {
                                            this.closeModal();
                                        }}
                                        width={Dimensions.get( 'window' ).width}
                                        height={262}
                                        dialogStyle={{
                                            position: 'absolute',
                                            backgroundColor: '#191E28',
                                            bottom: 0,
                                            borderRadius: 0,
                                            shadowColor: '#000000',
                                            shadowOffset: {
                                                width: 0,
                                                height: 0
                                            }
                                        }}
                                        show={this.state.isOpen}>
                                        <View>
                                            {/* Tab 切换 */}
                                            <View style={styles.tabContainer}>
                                                <View style={styles.tab}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            this.setState({ isBuy: 1, isSell: 0, from: 0});
                                                        }}>
                                                        <Text
                                                            style={[
                                                                styles.tabText,
                                                                this.state.isBuy === 1 ? styles.activeTabColor : {}
                                                            ]}>{I18n.t(Keys.ram_buy)}</Text>
                                                            <View style={
                                                                this.state.isBuy === 1 ? styles.activeTabBottom : {}
                                                            }/>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={styles.tab}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            this.setState({ isBuy: 0, isSell: 1, from: 0});
                                                        }}>
                                                        <Text
                                                            style={[
                                                                styles.tabText,
                                                                this.state.isSell === 1 ? styles.activeTabColor : {}
                                                            ]}>{I18n.t(Keys.ram_sell)}</Text>
                                                            <View style={
                                                                this.state.isSell === 1 ? styles.activeTabBottom : {}
                                                            }/>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Panel */}
                                            <View style={{paddingHorizontal: 15}}>
                                                {/* 输入框组件 */}
                                                <View style={[styles.inputContainer, {
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }]}>
                                                    <Text style={[styles.whiteText, {fontSize: 16, flex: 1}]}>
                                                        {this.state.isBuy === 1 ? I18n.t(Keys.ram_price) : I18n.t(Keys.ram_count)}
                                                    </Text>
                                                    <TextInput
                                                        ref={(ref) => this.props.TextInput}
                                                        keyboardType={'decimal-pad'}
                                                        style={[
                                                            styles.whiteText,
                                                            styles.inputComponent,
                                                            styles.normalInput,
                                                            commonStyles.monospace,
                                                            {
                                                                fontSize: 20,
                                                                paddingRight: 40,
                                                                flex: 3,
                                                                marginTop: 10
                                                            }
                                                        ]}
                                                        onChangeText={(text) => {
                                                            const from = this._chkPrice(text);
                                                            const {ram_quota, ram_usage} = this.props.account;
                                                            this.setState({ from })
                                                        }}
                                                        underlineColorAndroid={"transparent"}
                                                        value={(this.state.from.toString())}
                                                        autoCorrect={false}
                                                        autoCapitalize={'none'}
                                                        spellCheck={false}
                                                    />
                                                    {/* 单位 */}
                                                    <View
                                                        style={{ position: 'absolute', right: 0, }}>
                                                        <View
                                                            style={{
                                                                alignItems: 'flex-end',
                                                                justifyContent: 'center',
                                                                flexDirection: 'row',
                                                                width: 40,
                                                                height: 40,
                                                            }}>
                                                            <Text style={[styles.whiteText, {lineHeight: 38, paddingRight: 10}]}>
                                                                {this.state.isBuy === 1 ? 'EOS' : 'KB'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* 估值&快速选择 */}
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end'
                                                }}>
                                                    {/* 估值 */}
                                                    <Text style={[styles.greyText, {marginTop: 5}]}>
                                                        ≈
                                                        {
                                                            this.state.isBuy === 1 ?
                                                            Util.toFixed((Util.toFixed(this.state.from, 4) / this.props.RAMPrice), 1) :
                                                            Util.toFixed(this.props.RAMPrice * this.state.from, 2)
                                                        }
                                                        {this.state.isBuy === 1 ? 'KB' : 'EOS'}
                                                    </Text>
                                                </View>
                                                {/* 快速选择 */}
                                                <View
                                                    style={{
                                                        marginTop: 10,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    }}>
                                                    <View style={{flex: 1}}>
                                                        <Text style={[styles.greyText,{paddingVertical: 2}]}>
                                                            {this.state.isBuy === 1 ? I18n.t(Keys.max_buy) : I18n.t(Keys.max_change)}
                                                        </Text>
                                                        <Text style={[styles.whiteText]}>
                                                            {
                                                                this.state.isBuy === 1 ?
                                                                Util.toFixed((Util.toFixed(this.props.account.currencyBalance, 4) / this.props.RAMPrice), 1) :
                                                                Util.toFixed(this.props.RAMPrice * (
                                                                    (this.props.account.ram_quota - this.props.account.ram_usage) / 1024 - 1
                                                                ), 2)
                                                            }
                                                            {this.state.isBuy === 1 ? ' KB' : ' EOS'}
                                                        </Text>
                                                    </View>

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        flex: 3
                                                    }}>
                                                        <Button
                                                            onPress={() => this._quickBtn(0.25)}
                                                            style={styles.quickButton}>1/4</Button>
                                                        <Button
                                                            onPress={() => this._quickBtn(0.33)}
                                                            style={styles.quickButton}>1/3</Button>
                                                        <Button
                                                            onPress={() => this._quickBtn(0.5)}
                                                            style={styles.quickButton}>1/2</Button>
                                                        <Button
                                                            onPress={() => this._quickBtn(1)}
                                                            style={styles.quickButton}>{I18n.t(Keys.all_in)}</Button>
                                                    </View>
                                                </View>

                                                {/* 按钮 */}
                                                <TouchableOpacity
                                                    style={{
                                                        position: 'relative',
                                                        top: 20
                                                    }}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        this._openPassword();
                                                    }}>
                                                    <View style={styles.btn}>
                                                        <Text style={styles.btnText}>
                                                            {this.state.isBuy === 1 ? I18n.t(Keys.ram_buy) : I18n.t(Keys.ram_sell)}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </PopupDialog>
                                </View>
                            </KeyboardAwareScrollView>
                        </Modal>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab: {
        position: 'relative',
        height: 44,
        marginHorizontal: 40
    },
    tabText: {
        lineHeight: 44,
        fontSize: 16,
        textAlign: 'center',
        color: '#999'
    },
    activeTabColor: {
        color: '#fff'
    },
    activeTabBottom: {
        position: 'absolute',
        width: 24,
        height: 3,
        left: '50%',
        marginLeft: -12,
        bottom: 0,
        backgroundColor: '#fff'
    },
    whiteText: {
        color: '#fff'
    },
    greyText: {
        color: '#999'
    },
    inputComponent: {
        height: 44,
        // flexDirection: 'column',
        borderWidth: 1,
        borderRadius: 2,
        marginVertical: 5,
        textAlign: 'right'
    },

    normalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: '#3c4459',
        borderWidth: 1,
    },

    btn: {
        height: 44,
        backgroundColor: '#1ACE9A',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        fontSize: 18,
        color: '#ffffff'
    },
    quickButton: {
        width: 60,
        height: 24,
        lineHeight: 24,
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        backgroundColor: '#191e28',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 2,
    },
});

export default RAMExcahngePageView;
