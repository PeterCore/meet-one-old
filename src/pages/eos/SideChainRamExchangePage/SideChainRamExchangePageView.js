import React, { Component } from "react";
import {View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, StyleSheet} from "react-native";
import Button from "react-native-button";
import { NavigationActions } from "react-navigation";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';

import Keys from "../../../configs/Keys";
import I18n from "../../../I18n";
import {IS_DEBUG} from "../../../env";
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import Util from "../../../util/Util";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import LoadingView from "../../../components/LoadingView";
import { handleError } from "../../../net/parse/eosParse";
import { getStore } from "../../../setup";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class SideChainRamExchangePageView extends Component {
    static navigationOptions = (props) => {
        return {
            title: I18n.t( Keys.ram_buy_sell )
        };
    }

    constructor(props) {
        super(props);
        const {currencyBalance, ram_quota} = this.props.account;
        this.state = {
            // 加载状态
            isRequesting: false,
            // 密码输入框显示状态
            isPswdOpen: false,
            // 卖方
            from: '',
            // 买方
            to: '',
            mainUnit: 'EOS',
            intervalID: null
        }
    }

    componentDidMount() {
        this.props.updateEOSData(this.props.account);
        // ! 调试状态不获取内存价格
        if (!IS_DEBUG) {
            const intervalID = setInterval(() => {
                this.props.updateRAMPrice(this.props.account);
            }, 1000);
            this.setState({ intervalID });
        }
    }

    componentWillUnmount() {
        // 清空刷新RAM价格的定时器
        clearInterval(this.state.intervalID);
    }

    _openPassword() {
        if (Number(this.state.from).toFixed(4) <= 0) {
            Toast.show(I18n.t(Keys.DelegatebwPage_UseValidValue), { position: Toast.positions.CENTER } );
            return;
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.transitionConfirmed(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    }

    transitionConfirmed(password) {
        const {account} = this.props;
        this.setState({ isRequesting: true });
        if (this.state.mainUnit === 'EOS') {
            const quant = Number(this.state.from).toFixed(4) + ' ' + this.props.systemToken;
            // 买入RAM
            this.props.buyRAM(account, password, quant, (err, res) => {
                this.setState({ isRequesting: false });
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                    // 更新EOS
                    this.props.updateEOSData(account);
                    this.props.navigation.dispatch(NavigationActions.back());
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
                    this.props.navigation.dispatch(NavigationActions.back());
                } else {
                    handleError(err);
                }
            });
        }
    }

    _changeUnit(targetUnit = 'EOS', account) {
        const {mainUnit} = this.state;
        if (mainUnit === targetUnit) {
            return false;
        }
        this.setState({
            mainUnit: targetUnit,
            from: ""
        })
    }

    _quickBtn(num = 0.25) {
        const {account = {}} = this.props;
        const balance = this.state.mainUnit === 'EOS' ? account.currencyBalance : (account.ram_quota - account.ram_usage);

        let from = Util.toFixed(balance * num, 4);

        if (this.state.mainUnit === 'RAM') {
            // ram交易只能是整数
            from = Math.floor(from);
            from = Util.toFixed(from / 1024) - 1;
        }
        this.setState({ from: from < 0 ? 0 : from })
    }

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
        return (
            <SafeAreaView style={[commonStyles.wrapper, {
                backgroundColor: '#fafafa'
            }]}>
                <ScrollView>
                    {/* for navigate button */}
                    <View style={{
                        flexDirection: 'row',
                        paddingHorizontal: 15,
                        marginTop: 20
                    }}>
                        {/* EOS -> RAM */}
                        <TouchableOpacity
                            onPress={()=>this._changeUnit('EOS', this.props.account)}
                            activeOpacity={0.7}
                            style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>
                            <View style={[styles.button, this.state.mainUnit === 'EOS' ? styles.buttonActive : {}]}>
                                <Text style={[styles.buttonFontStyle]}>{I18n.t(Keys.ram_buy)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* RAM -> EOS */}
                        <TouchableOpacity
                            onPress={()=>this._changeUnit('RAM')}
                            activeOpacity={0.7}
                            style={{flex: 1, justifyContent: 'center', textAlign: 'center'}}>
                            <View style={[styles.button, this.state.mainUnit === 'RAM' ? styles.buttonActive : {}]}>
                                <Text style={[styles.buttonFontStyle]}>{I18n.t(Keys.ram_sell)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        marginVertical: 20,
                        backgroundColor: '#fff',
                        borderColor: '#EBEBEB',
                        borderTopWidth: 1,
                        borderBottomWidth: 1}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{flex: 1}}>
                                <Text style={{
                                    paddingLeft: 15,
                                    paddingTop: 20,
                                    fontSize: 16,
                                    color: '#888'}}> {this.state.mainUnit === 'EOS' ? I18n.t(Keys.ram_price) : 'RAM'} </Text>
                            </View>
                            <View style={{flex: 4}}>
                                <View style={{
                                    flexDirection: 'row',
                                    borderBottomColor: '#ebebeb',
                                    borderBottomWidth: 1}}>
                                    <TextInput
                                        ref={(ref) => this.props.TextInput}
                                        style={styles.conItemTextInput}
                                        placeholderTextColor={"#999"}
                                        placeholder={'0'}
                                        keyboardType={'numeric'}
                                        spellCheck={false}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        value={(this.state.from.toString())}
                                        onChangeText={(text) => {
                                            const from = this._chkPrice(text);
                                            const {ram_quota, ram_usage} = this.props.account;
                                            this.setState({ from })
                                        }}
                                        underlineColorAndroid={"transparent"} />
                                    <Text style={styles.unit}> {this.state.mainUnit === 'EOS' ? this.props.systemToken : 'KB'} </Text>
                                </View>
                                <Text style={[styles.balanceTip]}>
                                    {I18n.t(Keys.ram_balance)} {
                                        this.state.mainUnit === 'EOS' ?
                                        Util.numberStandard(this.props.account.currencyBalance) :
                                        Util.numberStandard((this.props.account.ram_quota - this.props.account.ram_usage) / 1024)
                                    } {this.state.mainUnit === 'EOS' ? this.props.systemToken : 'KB\n'}
                                    {this.state.mainUnit === 'RAM' ? `${I18n.t(Keys.ram_usage)} ${Util.toFixed(this.props.account.ram_usage / 1024)}KB` : ''}
                                </Text>
                                <View style={{
                                    paddingBottom: 10,
                                    paddingRight: 26,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'}}>
                                    <Button
                                        onPress={() => this._quickBtn(0.25)}
                                        style={styles.quickButton}>25%</Button>
                                    <Button
                                        onPress={() => this._quickBtn(0.5)}
                                        style={styles.quickButton}>50%</Button>
                                    <Button
                                        onPress={() => this._quickBtn(0.75)}
                                        style={styles.quickButton}>75%</Button>
                                    <Button
                                        onPress={() => this._quickBtn(1)}
                                        style={styles.quickButton}>100%</Button>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingVertical: 20}}>
                            <View style={{}}>
                                <Text style={{
                                    paddingLeft: 15,
                                    fontSize: 16,
                                    color: '#888'
                                }}> {this.state.mainUnit === 'EOS' ? 'RAM' : I18n.t(Keys.ram_price)} </Text>
                            </View>
                            <View style={{flexGrow: 1}}>
                                <View style={{borderBottomColor: '#ebebeb'}}>
                                    <Text style={[{textAlign: 'right', fontSize: 16, color: '#323232', paddingRight: 30}]}>
                                        {I18n.t(Keys.ram_estimate)} {
                                            this.state.mainUnit === 'EOS' ?
                                            Util.numberStandard(this.state.from / this.props.RAMPrice) :
                                            Util.numberStandard(this.state.from * this.props.RAMPrice)
                                        } {this.state.mainUnit === 'EOS' ? 'KB' : this.props.systemToken }
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* fot tips */}
                    <Text style={{
                        paddingHorizontal: 15,
                        fontSize: 14,
                        color: '#999',
                        fontWeight: '300',
                        letterSpacing: 0 }}>
                        * {I18n.t(Keys.ram_tips1)} {'\n\n'}
                        * {I18n.t(Keys.ram_tips2)} {this.props.RAMPrice} {this.props.systemToken}/KB{'\n\n'}
                        * {I18n.t(Keys.ram_tips3)} {'\n\n'}
                        * {I18n.t(Keys.ram_tips4)}
                    </Text>

                    {/* 开始注册帐号 */}
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
                            borderRadius: 2}}>
                            <Text style={{
                                fontSize: 18,
                                color: '#fff',
                                textAlign: 'center',
                                lineHeight: 50}}>{I18n.t(Keys.ram_done)}</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* 密码验证输入框 */}
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
                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    conItemTextInput: {
        flexGrow: 1,
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: "#fff",
        color: "#000",
        textAlign: 'right'
    },
    balanceTip: {
        paddingVertical: 10,
        fontSize: 12,
        color: '#999',
        paddingRight: 30,
        textAlign: 'right'
    },
    unit: {
        fontSize: 16,
        color: '#323232',
        alignSelf: 'center',
        paddingRight: 30,
        textAlign: 'right'
    },
    quickButton: {
        width: 60,
        height: 24,
        lineHeight: 24,
        fontSize: 14,
        color: '#1ace9a',
        textAlign: 'center',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 2
    },

    button: {
        backgroundColor: '#fff',
        borderColor: '#E8E8E8',
        borderWidth: 1,
        borderRadius: 2,
        height: 50,
        marginHorizontal: 5
    },

    buttonActive: {
        backgroundColor: ' rgba(26,206,154,0.05)',
        borderColor: '#1ACE9A',
    },

    buttonFontStyle: {
        fontSize: 16,
        color: '#2B2B48',
        textAlign: 'center',
        lineHeight: 50
    }
});

export default SideChainRamExchangePageView;
