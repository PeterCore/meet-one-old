import React, { Component } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, StyleSheet } from "react-native";
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import format from "string-format";
import { getStore } from "../../../../setup";
import Keys from "../../../../configs/Keys";
import I18n from "../../../../I18n";
import commonStyles from "../../../../styles/commonStyles";
import Util from "../../../../util/Util";
import PasswordInputComponent from "../../../../components/PasswordInputComponent";
import CustomSwitch from '../../../../components/CustomSwitch';
import LoadingView from "../../../../components/LoadingView";
import AnalyticsUtil from "../../../../util/AnalyticsUtil";
import { handleError } from "../../../../net/parse/eosParse";

class REXExcahngePageView extends Component {

    static navigationOptions = (props) => {
        return {
            title: I18n.t(Keys.rex_title)
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            isRequesting: false, // 加载状态
            // 当前页面的主要单位: 'EOS' / 'REX'
            mainUnit: 'EOS',
            // 输入
            input: "",
            CPU: "",
            NET: "",
            useStakedEOS: false,
            // 密码输入控件
            isPswdOpen: false
        }
    }

    componentDidMount() {
        this.props.getCurrentREXPrice((err, res) => {
            console.log(res);
        });
        this.props.getCurrentAccountREX(this.props.account, (err, res) => {
            console.log(res);
        });
    }

    componentWillUnmount() { }

    // 打开密码输入框
    _openPassword() {
        // 数据验证
        if (this.state.mainUnit === 'EOS') {
            // 买入REX
            if (this.state.useStakedEOS) {
                if (this.unstaketorexValidate()) return false
            } else {
                if (this.buyREXValidate()) return false
            }
        } else {
            if (this.sellREXValidate()) return false;
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
            this.setState({ isPswdOpen: true });
        }

    }

    // 验证输入
    buyREXValidate() {
        // 当前帐号下的EOS余额
        const account = this.props.account;
        let eos_avaliable = account.currencyBalance;
        const input = Number(this.state.input);
        if (input <= 0) {
            // 小于0
            Toast.show(I18n.t(Keys.DelegatebwPage_UseValidValue), { position: Toast.positions.CENTER });
            return true;
        } else if (eos_avaliable < input) {
            // 大于余额
            Toast.show( format( I18n.t( Keys.rex_buy_balance), eos_avaliable ), { position: Toast.positions.CENTER } );
            return true;
        }
        return false;
    }

    unstaketorexValidate() {
        const account = this.props.account;
        // 自身可以赎回的资源
        const cpu_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.cpu_weight;
        const net_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.net_weight;

        const cpu_avaliable = Number(parseFloat(cpu_weight).toFixed(4));
        const net_avaliable = Number(parseFloat(net_weight).toFixed(4));

        const CPU = Number(this.state.CPU);
        const NET = Number(this.state.NET);

        if (CPU <= 0 && NET <= 0) {
            // 小于0
            Toast.show(I18n.t(Keys.DelegatebwPage_UseValidValue), { position: Toast.positions.CENTER });
            return true;
        } else if (cpu_avaliable < CPU) {
            Toast.show( format( I18n.t( Keys.rex_buy_cpu), cpu_avaliable ), { position: Toast.positions.CENTER } );
            return true;
        } else if (net_avaliable < NET) {
            // 大于余额
            Toast.show( format( I18n.t( Keys.rex_buy_net), net_avaliable ), { position: Toast.positions.CENTER } );
            return true;
        }
        return false
    }

    sellREXValidate() {
        const rexMaturedBalance = this.props.rexMaturedBalance
        const input = Number(this.state.input);

        if (input <= 0) {
            // 小于0
            Toast.show(I18n.t(Keys.DelegatebwPage_UseValidValue), { position: Toast.positions.CENTER });
            return true;
        } else if (rexMaturedBalance < input) {
            // 大于余额
            Toast.show( format( I18n.t( Keys.rex_sell_rex ), rexMaturedBalance), { position: Toast.positions.CENTER } );
            return true;
        }
        return false;
    }

    transitionConfirmed(password) {
        const {account} = this.props;
        const {NET, CPU, input} = this.state;
        this.setState({ isRequesting: true });
        if (this.state.mainUnit === 'EOS') {
            // 买入REX
            if (this.state.useStakedEOS) {
                // 使用已抵押的EOS支付
                this.props.unstaketorex(account, password, Util.toAssertSymbol(CPU), Util.toAssertSymbol(NET), (err, res) => {
                    this.setState({ isRequesting: false });
                    if (!err) {
                        Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                    } else {
                        handleError(err);
                    }
                });
            } else {
                // 使用现有的EOS进行支付
                this.props.buyREX(this.props.account, password, Util.toAssertSymbol(input), (err, res) => {
                    this.setState({ isRequesting: false });
                    if (!err) {
                        Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                    } else {
                        handleError(err);
                    }
                });
            }
        } else {
            // 卖出REX
            this.props.sellREX(this.props.account, password, Util.toAssertSymbol(input, 4, 'REX'), (err, res) => {
                this.setState({ isRequesting: false });
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                } else {
                    handleError(err);
                }
            });
        }
    }

    // 修改主要单位
    _changeUnit(targetUnit = 'EOS') {
        const { mainUnit } = this.state;

        if (mainUnit === targetUnit) {
            return false;
        }

        this.setState({
            mainUnit: targetUnit,
            useStakedEOS: false,
            input: ""
        });
    }

    // 快速选择数字
    _quickBtn(num = 0.25) {
        // EOS余额
        const {currencyBalance : eosBalance} = this.props.account;
        // REX余额
        const {rexMaturedBalance} = this.props;
        const balance = this.state.mainUnit === 'EOS' ? eosBalance : rexMaturedBalance;
        let input = Util.toFixed(balance * num, 4);
        this.setState({ input });
    }

    // 检查价格
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

    render() {
        // 当前帐号下的EOS余额
        const account = this.props.account;
        let {currencyBalance} = account;
        let rexBalance = this.props.rexBalance;
        let rexMaturedBalance = this.props.rexMaturedBalance;
        let REXPrice = this.props.REXPrice;
        let input = this.state.input; // 当前输入的值
        let about = 0.0000; // 预估可兑换
        let {NET: net, CPU: cpu} = this.state;

        // 自身可以赎回的资源
        const cpu_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.cpu_weight;
        const net_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.net_weight;

        // 可赎回的数量提示
        const undelegate_CPU_placeholder = parseFloat(cpu_weight).toFixed(4) + " " + I18n.t(Keys.DelegatebwPage_Available);
        const undelegate_NET_placeholder = parseFloat(net_weight).toFixed(4) + " " + I18n.t(Keys.DelegatebwPage_Available);

        if (this.state.mainUnit === 'EOS') {
            if (!this.state.useStakedEOS) {
                // update the rexAbout
                // 非使用已抵押的EOS支付
                about = input * REXPrice;
            } else {
                // 使用已抵押的EOS支付
                about = (Number(net) + Number(cpu)) * REXPrice
            }
        } else {
            // update the eosAbout
            about = input / REXPrice
        }

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView>
                    {/* For Navigate Buttons */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: 50, marginTop: 20 }}>
                        {/* Buy REX */}
                        <TouchableOpacity
                            onPress={() => this._changeUnit('EOS')}
                            activeOpacity={0.7}
                            style={{
                                flex: 1
                            }}>
                            <View style={[
                                styles.button,
                                {
                                    // 左侧按钮，右边无圆角
                                    borderTopRightRadius: 0,
                                    borderBottomEndRadius: 0
                                },
                                this.state.mainUnit === 'EOS' ? styles.buttonActive : {}
                            ]}>
                                <Text style={[
                                    styles.buttonFontStyle,
                                    this.state.mainUnit === 'EOS' ? styles.textActive : {}
                                ]}>
                                    {I18n.t(Keys.rex_buy)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {/* Sell REX */}
                        <TouchableOpacity
                            onPress={() => this._changeUnit('REX')}
                            activeOpacity={0.7}
                            style={{
                                flex: 1
                            }}>
                            <View style={[
                                styles.button,
                                {
                                    // 右侧按钮，左边无圆角
                                    borderTopLeftRadius: 0,
                                    borderBottomStartRadius: 0
                                },
                                this.state.mainUnit === 'REX' ? styles.buttonActive : {}
                            ]}>
                                <Text style={[[styles.buttonFontStyle, this.state.mainUnit === 'REX' ? styles.textActive : {}]]}>
                                    {I18n.t(Keys.rex_sell)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {
                        this.state.useStakedEOS ? (
                            <View style={[{marginTop: 20, marginBottom: 10, paddingHorizontal: 15}, styles.wrapper]}>
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>CPU</Text>
                                    <TextInput
                                        value={this.state.CPU}
                                        multiline={false}
                                        ref={(textinput) => { this.CPUInput = textinput }}
                                        style={styles.stakeInput}
                                        placeholder={undelegate_CPU_placeholder}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={(CPU) => {this.setState({CPU})}}
                                        underlineColorAndroid={"transparent"}
                                    />
                                </View>

                                <View style={[commonStyles.commonIntervalStyle ]} />

                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>NET</Text>
                                    <TextInput
                                        value={this.state.NET}
                                        multiline={false}
                                        ref={(textinput) => { this.NETInput = textinput }}
                                        style={styles.stakeInput}
                                        // placeholder={}
                                        placeholder={undelegate_NET_placeholder}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={( NET ) => {this.setState({NET})}}
                                        underlineColorAndroid={"transparent"}/>
                                </View>
                            </View>
                        ) : (
                            <View style={[{ marginTop: 20, marginBottom: 10, paddingHorizontal: 15 }, styles.wrapper]}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ paddingTop: 20, fontSize: 16, color: '#323232' }}>
                                            {this.state.mainUnit === 'EOS' ? I18n.t(Keys.ram_price) : 'REX'}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 4 }}>
                                        <View style={{ flexDirection: 'row', borderBottomColor: '#ebebeb', borderBottomWidth: Util.getDpFromPx(1) }}>
                                            <TextInput
                                                ref={(ref) => this.props.TextInput}
                                                style={styles.conItemTextInput}
                                                keyboardType={'numeric'}
                                                spellCheck={false}
                                                autoCapitalize={'none'}
                                                autoCorrect={false}
                                                value={this.state.input.toString()}
                                                placeholder={'0'}
                                                placeholderTextColor={"#999999"}
                                                onChangeText={(text) => {
                                                    this.setState({ input: text })
                                                }}
                                                underlineColorAndroid={"transparent"} />
                                            <Text style={styles.unit}> {this.state.mainUnit === 'EOS' ? 'EOS' : 'REX'} </Text>
                                        </View>

                                        <Text style={[styles.balanceTip]}>
                                            {/* Balance */}
                                            {I18n.t(Keys.ram_balance)}
                                            {
                                                // EOS Balance ： REX Balance
                                                Util.numberStandard(this.state.mainUnit === 'EOS' ? currencyBalance : rexBalance, 4)
                                            }
                                            {/* 单位 */}
                                            {this.state.mainUnit === 'EOS' ? ' EOS' : ' REX'}
                                        </Text>

                                        {
                                            this.state.mainUnit === 'EOS' ? null : (
                                                <Text style={[styles.balanceTip, {marginTop: -15}]}>
                                                    {I18n.t(Keys.rex_sellable)}{Util.numberStandard(rexMaturedBalance, 4) + ' REX'}
                                                </Text>
                                            )
                                        }

                                        <View style={{ paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Button onPress={() => this._quickBtn(0.25)} style={styles.quickButton}>25%</Button>
                                            <Button onPress={() => this._quickBtn(0.5)} style={styles.quickButton}>50%</Button>
                                            <Button onPress={() => this._quickBtn(0.75)} style={styles.quickButton}>75%</Button>
                                            <Button onPress={() => this._quickBtn(1)} style={styles.quickButton}>100%</Button>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )
                    }


                    <View style={[styles.wrapper, {height: 44, justifyContent: 'center', paddingHorizontal: 15}]}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{ fontSize: 16, color: '#323232' }}>
                                {this.state.mainUnit === 'EOS' ? 'REX' : 'EOS'}
                            </Text>

                            <Text style={{ fontSize: 16, color: '#888' }}>
                                {I18n.t(Keys.rex_about)}
                                {/* 预估兑换的数量 */}
                                {' ' + Util.numberStandard(about, 4)}
                                {/* 预估兑换的单位 */}
                                {this.state.mainUnit === 'EOS' ? ' REX' : ' EOS'}
                            </Text>
                        </View>
                    </View>

                    {
                        this.state.mainUnit === 'EOS' ? (
                            <View style={[styles.wrapper, { height: 44, justifyContent: 'center', marginTop: 20, paddingHorizontal: 15 }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 16, color: '#323232', alignSelf: 'center' }}>{I18n.t(Keys.rex_used_staked)}</Text>
                                    {/* 自定义开关 */}
                                    <CustomSwitch
                                        // 模态样式
                                        modalStyle={styles.modalStyle}
                                        // 设置颜色
                                        onTintColor={'#3E688F'}
                                        ref={(component) => { this.enableLock = component }}
                                        toggleAction={(value) => {
                                            this.setState({
                                                useStakedEOS: value,
                                                input: "",
                                                NET: "",
                                                CPU: "",
                                                eosAbout: 0,
                                                rexAbout: 0,

                                            });
                                        }}
                                        switchStatus={this.state.useStakedEOS} />
                                </View>
                            </View>
                        ) : null
                    }


                    {/* tips */}
                    <View style={{marginTop: 20}}>
                        {
                            this.state.mainUnit === 'EOS' ? (
                                <Text style={styles.tipsText}>
                                    {I18n.t(Keys.rex_tips1)}{'\n'}
                                    {I18n.t(Keys.rex_tips2)}{'\n'}
                                    {I18n.t(Keys.rex_tips3)}{'\n'}
                                    {I18n.t(Keys.rex_tips4)} {Util.numberStandard(REXPrice, 4)} REX/EOS
                                </Text>
                            ) : (
                                <Text style={styles.tipsText}>
                                    {I18n.t(Keys.rex_tips1)}{'\n'}
                                    {I18n.t(Keys.rex_tips3)}{'\n'}
                                    {I18n.t(Keys.rex_tips4)} {Util.numberStandard(REXPrice, 4)} REX/EOS
                                </Text>
                            )
                        }
                    </View>


                    {/* Transaction button */}
                    <TouchableOpacity
                        style={{
                            paddingHorizontal: 15,
                            marginTop: 100,
                            marginBottom: 20
                        }}
                        activeOpacity={0.7}
                        onPress={() => this._openPassword()}>
                        <View style={{
                            height: 50,
                            backgroundColor: '#4A4A4A',
                            marginTop: 20,
                            borderRadius: 2
                        }}>
                            <Text style={{
                                fontSize: 18,
                                color: '#fff',
                                textAlign: 'center',
                                lineHeight: 50
                            }}>{I18n.t(Keys.ram_done)}</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* 密码验证输入框 */}
                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={(password) => {
                        this.transitionConfirmed(password)
                    }}
                    onClose={() => {
                        this.setState({
                            isPswdOpen: false
                        });
                    }} />

                <Spinner visible={this.state.isRequesting} children={<LoadingView />} />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    conItemTextInput: {
        fontFamily: 'DIN',
        fontWeight: '600',
        flexGrow: 1,
        fontSize: 20,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: "#fff",
        color: "#000",
        textAlign: 'right'
    },
    balanceTip: {
        paddingVertical: 10,
        fontSize: 12,
        lineHeight: 16,
        color: '#888',
        textAlign: 'right'
    },
    unit: {
        fontSize: 16,
        color: '#141414',
        lineHeight: 26,
        alignSelf: 'center',
        textAlign: 'right'
    },
    quickButton: {
        width: 60,
        height: 24,
        lineHeight: 24,
        fontSize: 14,
        color: '#3E688F',
        textAlign: 'center',
        borderColor: '#e8e8e8',
        borderWidth: Util.getDpFromPx(1),
        borderRadius: 2
    },

    button: {
        backgroundColor: '#fafafa',
        borderColor: '#1B0606',
        borderWidth: Util.getDpFromPx(1),
        borderRadius: 4,
        height: 36.5
    },

    buttonActive: {
        backgroundColor: '#4A4A4A'
    },

    textActive: {
        color: '#fff'
    },

    buttonFontStyle: {
        fontSize: 16,
        color: '#2B2B48',
        textAlign: 'center',
        lineHeight: 36
    },

    tipsText: {
        marginHorizontal: 15,
        fontSize: 12,
        color: '#888',
        fontWeight: '300',
        lineHeight: 20,
        letterSpacing: 0
    },

    wrapper: {
        backgroundColor: '#fff',
        borderColor: '#EBEBEB',
        borderTopWidth: Util.getDpFromPx(1),
        borderBottomWidth: Util.getDpFromPx(1)
    },

    // 需要从外面传递给CustomSwitch组件覆盖原来组件的样式
    modalStyle: {
        // backgroundColor: '#f0f',
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        zIndex: 2
    },

    InputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
    },

    stakeTitle: {
        fontSize: 16,
        color: '#323232'
    },
    stakeInput: {
        flexGrow: 1,
        fontSize: 16,
        height: 50,
        color: '#323232',
        textAlign: 'right'
    }
});

export default REXExcahngePageView;
