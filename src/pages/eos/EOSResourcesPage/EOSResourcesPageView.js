import React, { Component } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Platform, Dimensions, StatusBar } from "react-native";
import Button from "react-native-button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import format from "string-format";
import Toast from "react-native-root-toast";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";
import { handleError } from "../../../net/parse/eosParse";
import { getStore } from "../../../setup";
import NavigationUtil from "../../../util/NavigationUtil";
import IconSet from "../../../components/IconSet";
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';
import * as env from "../../../env";
import AnalyticsUtil from "../../../util/AnalyticsUtil";
import { netCpubaoleBtn } from '../../../net/DiscoveryNet';

const slideFromBottom = new SlideAnimation({
    slideFrom: 'bottom',
});

const WIDTH = Dimensions.get( 'window' ).width;
const STATE_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 20) : StatusBar.currentHeight;
const NAVI_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

class EOSResourcesPageView extends Component {
    static navigationOptions = ( props ) => {
        return {
            title: I18n.t( Keys.resource ),
            headerStyle: {
                backgroundColor: '#e8f0fa',
                borderBottomWidth: 0,
                elevation: 0,
            },
            headerRight:
                <Button
                    style={commonStyles.top_info_right_btn}
                    onPress={() => {
                        props.navigation.state.params.goToCustom()
                    }}
                >
                    { I18n.t( Keys.custom_stake_topright ) }
                </Button>
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            CPU: "",
            NET: "",
            isRequesting: false,
            isPswdOpen: false,
            isDelegate: 1, // 0 赎回 1 抵押 2 租赁
            // 计算公式
            rental: 0, // 租金比
        };
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTstake');
    }

    componentWillMount() {
        this.goToCustom = this.goToCustom.bind( this );
        this.props.navigation.setParams( { goToCustom: this.goToCustom } );
        this.props.updateAccountData(this.props.account);

        netCpubaoleBtn((err, res) => {
            if (!err) {
                const resData = JSON.parse(res);
                if (resData.data.length > 0) {
                    let target = resData.data[0].target;
                    if (target.match('http')) {
                        target = target + '?wallet=' + this.props.account.accountName;
                    }
                    if (this.props.oneyuanstake && this.props.netType === 'EOS') {
                        this.setState({
                            oneyuanstake: true,
                            oneyuanstakeTarget: target
                        })
                    }
                }
            }
        });
    }
    goToCustom() {
        this.props.navigation.navigate('EOSCustomDelegatePage', {
            primaryKey: this.props.account.primaryKey
        })
    }

    setDelegate () {
        this.setState({
            CPU: "",
            NET: "",
            isDelegate: 1
        });
    }

    setUnDelegate () {
        this.setState({
            CPU: "",
            NET: "",
            isDelegate: 0
        });
    }

    setRental() {
        // 点击租赁tab逻辑处理
        this.setState({
            CPU: "",
            NET: "",
            isDelegate: 2
        });
    }

    // 验证要抵押的CPU资源输入
    checkDelegateCPU() {
        const input_cpu = Number(this.state.CPU);
        const cpu_available = (this.props.account.currencyBalance + this.props.account.refundMoneyDetail.cpu).toFixed(4);
        if ( input_cpu < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( cpu_available < input_cpu ) {
            Toast.show( format( I18n.t( Keys.cpu_available_tip ), cpu_available ), { position: Toast.positions.CENTER } );
            return false;
        } else {
            return true;
        }
    };

    // 验证要抵押的NET数量输入
    checkDelegateNET() {
        const input_net = Number(this.state.NET);
        const net_available = (this.props.account.currencyBalance + this.props.account.refundMoneyDetail.net).toFixed(4);
        if ( input_net < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( net_available < input_net ) {
            Toast.show( format( I18n.t( Keys.net_available_tip ), net_available ), { position: Toast.positions.CENTER } );
            return false;
        } else {
            return true;
        }
    };
    // 抵押状态的按钮点击
    DelegatebwConfirm () {
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const total_resources = this.props.account.currencyBalance + this.props.account.refunds;

        if ( Number.isNaN(input_cpu) || Number.isNaN(input_net) || (input_cpu <= 0 && input_net <= 0) ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return;
        } else if ( (input_cpu + input_net) > total_resources ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoEnoughBW ), { position: Toast.positions.CENTER } );
            return;
        } else if ( !this.checkDelegateCPU() || !this.checkDelegateNET() ) {
            return;
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.delegateResources(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    };
    // 租赁状态的按钮点击
    RentalConfirm() {
        // 输入校验
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const balance = this.props.account.currencyBalance;

        if (!(input_cpu && input_net) && Number.isNaN(input_cpu) || Number.isNaN(input_net)) {
            Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return;
        } else if ((input_cpu + input_net) / this.props.rental > balance) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoEnoughBW ), { position: Toast.positions.CENTER } );
            return;
        }

        // 免密逻辑
        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.rentalResources(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    }

    // 验证要赎回的CPU资源输入
    checkUnDelegateCPU () {
        const account = this.props.account;
        const staked_cpu = account.self_delegated_bandwidth ? account.self_delegated_bandwidth.cpu_weight : 0 ;
        const input_cpu = Number(this.state.CPU);

        if ( input_cpu < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( input_cpu > parseFloat(staked_cpu) ) {
            Toast.show( I18n.t( Keys.undelegate_cpu_tip ), { position: Toast.positions.CENTER } );
            return false;
        }
        return true;
    };
    // 验证要赎回的NET资源输入
    checkUnDelegateNET () {
        const account = this.props.account;
        const staked_net = account.self_delegated_bandwidth ? account.self_delegated_bandwidth.net_weight : 0 ;
        const input_net = Number(this.state.NET);

        if ( input_net < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( input_net > parseFloat(staked_net) ) {
            Toast.show( I18n.t( Keys.undelegate_net_tip ), { position: Toast.positions.CENTER } );
            return false;
        }
        return true;
    };
    // 赎回状态的按钮点击
    UnDelegatebwConfirm () {
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);

        if ( Number.isNaN(input_cpu) || Number.isNaN(input_net) || (input_cpu <= 0 && input_net <= 0) ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return;
        } else if ( !this.checkUnDelegateCPU() || !this.checkUnDelegateNET() ) {
            return;
        }
        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.unDelegateResources(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    };

    // 赎回执行
    unDelegateResources (password) {
        const accountName = this.props.account.accountName;
        const data = {
            from: accountName,
            receiver: accountName,
            unstake_net_quantity: Number( this.state.NET ).toFixed(4) + " " + this.props.systemToken,
            unstake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " " + this.props.systemToken,
        };
        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onDispatchUnDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( !err ) {
                    this.setState({
                        CPU: "",
                        NET: ""
                    })
                    Toast.show( I18n.t( Keys.transaction_success ) + '!', { position: Toast.positions.CENTER });
                } else {
                    handleError(err);
                }
            } );
        } );
    }

    // 抵押执行
    delegateResources( password ) {
        const accountName = this.props.account.accountName;
        const data = {
            from: accountName,
            receiver: accountName,
            stake_net_quantity: Number( this.state.NET ).toFixed(4) + " " + this.props.systemToken,
            stake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " " + this.props.systemToken,
            transfer: 0,
        };
        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onDispatchDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( !err ) {
                    this.setState({
                        CPU: "",
                        NET: ""
                    })
                    Toast.show( I18n.t( Keys.transaction_success ) + '!', { position: Toast.positions.CENTER } );
                } else {
                    handleError(err);
                }
            } );
        });
    };

    // 租赁
    rentalResources(password) {
        const {account, rental, rentnet, rentcpu, rent} = this.props;
        const {CPU, NET} = this.state;

        const input_cpu = Number(CPU);
        const input_net = Number(NET);

        const amount_cpu = input_cpu / rental;
        const amount_net = input_net / rental;

        this.setState({isRequesting: true});
        if (input_cpu && input_net) {
            // rent
            rent(account, password, amount_cpu, amount_net, (err, res) => {
                this.setState({isRequesting: false});
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                } else {
                    handleError(err);
                }
            });
        } else if (input_cpu) {
            // rentcpu
            rentcpu(account, password, amount_cpu, (err, res) => {
                this.setState({isRequesting: false});
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                } else {
                    handleError(err);
                }
            });
        } else if (input_net) {
            rentnet(account, password, amount_net, (err, res) => {
                this.setState({isRequesting: false});
                if (!err) {
                    Toast.show(I18n.t( Keys.success_to_transfer), {position: Toast.positions.CENTER });
                } else {
                    handleError(err);
                }
            });
        }

    }

    render() {
        const account = this.props.account;

        const cpu_limit = account.cpu_limit;
        const cpu_available_ms = cpu_limit && (cpu_limit.available / 1000).toFixed(2);
        const cpu_used_ms = cpu_limit && (cpu_limit.used / 1000).toFixed(2);
        const cpu_max_ms = cpu_limit && (cpu_limit.max / 1000).toFixed(2);

        const net_limit = account.net_limit;
        const net_available_kb = net_limit && (net_limit.available / 1024).toFixed(2);
        const net_used_kb = net_limit && (net_limit.used / 1024).toFixed(2);
        const net_max_kb = net_limit && (net_limit.max / 1024).toFixed(2);

        const cpu_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.cpu_weight;
        const net_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.net_weight;

        const all_cpu_weight = account.total_resources && account.total_resources.cpu_weight;
        const all_net_weight = account.total_resources && account.total_resources.net_weight;
        const total_weight = (parseFloat(all_cpu_weight) + parseFloat(all_net_weight)).toFixed(4);

        const self_delegated_weight = isNaN(parseFloat(cpu_weight) + parseFloat(net_weight)) ? 0 : (parseFloat(cpu_weight) + parseFloat(net_weight));
        const other_delegated_weight = ((parseFloat(all_cpu_weight) + parseFloat(all_net_weight)) - self_delegated_weight).toFixed(4);

        let isLong = false;
        if (total_weight >= 1000) {
            isLong = true;
        }

        // 动态计算两个的可抵押数
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const refunding_cpu = this.props.account.refundMoneyDetail.cpu;
        const refunding_net = this.props.account.refundMoneyDetail.net;
        const eos_balance = this.props.account.currencyBalance;

        let delegate_CPU_placeholder,delegate_NET_placeholder;
        if (input_cpu <= refunding_cpu) {
            delegate_NET_placeholder = eos_balance + refunding_net;
        } else {
            const remain_balance = eos_balance - (input_cpu - refunding_cpu);
            if (remain_balance > 0) {
                delegate_NET_placeholder = remain_balance + refunding_net;
            } else {
                delegate_NET_placeholder = refunding_net;
            }
        }

        if (input_net <= refunding_net) {
            delegate_CPU_placeholder = eos_balance + refunding_cpu;
        } else {
            const remain_balance = eos_balance - (input_net - refunding_net);
            if (remain_balance > 0) {
                delegate_CPU_placeholder = remain_balance + refunding_cpu;
            } else {
                delegate_CPU_placeholder = refunding_cpu;
            }
        }

        // 可租赁的数量计算
        let rent_CPU_placeholder, rent_NET_placeholder, rentalAbout_placeholder;
        let max_cpu_rentable = eos_balance * this.props.rental;
        let max_net_rentable = eos_balance * this.props.rental;
        // let max_about_rentable = eos_balance;

        let rentAbout = '';
        let cpu_rentable = max_cpu_rentable;
        let net_rentable = max_net_rentable;

        if (this.state.isDelegate === 2) {
            if (input_cpu) {
                net_rentable = max_net_rentable - input_cpu
            } else if (input_net) {
                cpu_rentable = max_cpu_rentable - input_net
            }
            // 计算预估的租金
            rentAbout = (input_cpu + input_net) / this.props.rental;
        }

        rent_CPU_placeholder = Util.toFixed((cpu_rentable), 4) + " " + I18n.t(Keys.DelegatebwPage_Available);
        rent_NET_placeholder = Util.toFixed((net_rentable), 4) + " " + I18n.t(Keys.DelegatebwPage_Available)
        rentalAbout_placeholder = Util.toFixed((rentAbout), 4) + " EOS";

        // 可抵押的数量提示
        delegate_CPU_placeholder = delegate_CPU_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );
        delegate_NET_placeholder = delegate_NET_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );

        // 可赎回的数量提示
        const undelegate_CPU_placeholder = parseFloat(cpu_weight).toFixed(4) + " " + I18n.t( Keys.DelegatebwPage_Available );
        const undelegate_NET_placeholder = parseFloat(net_weight).toFixed(4) + " " + I18n.t( Keys.DelegatebwPage_Available );

        return (
            <View style={[ commonStyles.wrapper, { backgroundColor: '#fff' } ]}>
                <View style={[ commonStyles.wrapper, { backgroundColor: '#fff' } ]}>
                    <KeyboardAwareScrollView bounces={false} >
                        <View style={{ backgroundColor: '#e8f0fa' }}>
                            <View style={styles.cardContainer}>
                                <View style={styles.card}>
                                    <View style={styles.equationContainer}>
                                        <View style={styles.equationItem}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={styles.equationTitle}>{ I18n.t( Keys.delegate_staked_eos ) }</Text>
                                                <TouchableOpacity onPress={() => {
                                                    this.tipDialog.show();
                                                }}>
                                                    <IconSet name={ 'icon-wenhao' } style={{
                                                        paddingLeft: 10,
                                                        paddingRight: 10,
                                                        paddingBottom: 5,
                                                        fontSize: 18,
                                                        color: '#4A90E2'
                                                    }} />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={styles.equationText}>{total_weight}</Text>
                                        </View>

                                        <View style={[ styles.equationSymbolItem, isLong ? { marginHorizontal: 5 } : {} ]}>
                                            <Text style={styles.equationTitle}> </Text>
                                            <Text style={styles.equationSymbol}>=</Text>
                                        </View>

                                        <View style={styles.equationItem}>
                                            <Text style={styles.equationTitle}>CPU</Text>
                                            <Text style={styles.equationText}>{ parseFloat(all_cpu_weight).toFixed(4) }</Text>
                                        </View>

                                        <View style={[ styles.equationSymbolItem, isLong ? { marginHorizontal: 5 } : {} ]}>
                                            <Text style={styles.equationTitle}> </Text>
                                            <Text style={styles.equationSymbol}>+</Text>
                                        </View>

                                        <View style={styles.equationItem}>
                                            <Text style={styles.equationTitle}>NET</Text>
                                            <Text style={styles.equationText}>{ parseFloat(all_net_weight).toFixed(4) }</Text>
                                        </View>
                                    </View>

                                    <View style={[commonStyles.commonIntervalStyle, { marginHorizontal: 20, marginBottom: 5 }]} />

                                    {/* 已占用 */}
                                    <ProgressItem
                                        titleText={ I18n.t( Keys.account_info_cpu_used ) }
                                        oneyuanstake={this.state.oneyuanstake}
                                        oneyuanstakeTarget={this.state.oneyuanstakeTarget}
                                        navigation={this.props.navigation}
                                        language={this.props.language}
                                        contentText={`${cpu_used_ms} ms / ${cpu_max_ms} ms`}
                                        value={cpu_used_ms}
                                        max={cpu_max_ms}
                                    />

                                    {/* 余量 */}
                                    {/* <ProgressItem
                                        titleText={ I18n.t( Keys.account_info_cpu_available ) }
                                        contentText={`${cpu_available_ms} ms / ${cpu_max_ms} ms`}
                                        value={cpu_available_ms}
                                        max={cpu_max_ms}
                                    /> */}

                                    {/* 已占用 */}
                                    <ProgressItem
                                        titleText={ I18n.t( Keys.account_info_net_used ) }
                                        contentText={`${net_used_kb} KB / ${net_max_kb} KB`}
                                        value={net_used_kb}
                                        max={net_max_kb}
                                    />

                                    {/* 余量 */}
                                    {/* <ProgressItem
                                        titleText={ I18n.t( Keys.account_info_net_available ) }
                                        contentText={`${net_available_kb} KB / ${net_max_kb} KB`}
                                        value={net_available_kb}
                                        max={net_max_kb}
                                    /> */}

                                    <View style={{ height: 10 }} />
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#fff', flexGrow: 1 }}>
                            <View style={[commonStyles.commonIntervalStyle ]} />

                            <View style={styles.tabContainer}>
                                <View style={styles.tab}>
                                    <TouchableOpacity onPress={()=>{ this.setDelegate() }}>
                                        <Text style={[
                                            styles.tabText,
                                            this.state.isDelegate === 1 ? styles.activeTabColor : {}
                                        ]}>
                                            { I18n.t( Keys.delegate_eos_stake ) }
                                        </Text>
                                        <View style={
                                            this.state.isDelegate === 1 ? styles.activeTabBottom : {}
                                        }/>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tab}>
                                    <TouchableOpacity onPress={()=>{ this.setUnDelegate() }}>
                                        <Text style={[
                                            styles.tabText,
                                            this.state.isDelegate === 0 ? styles.activeTabColor : {}
                                        ]}>
                                            { I18n.t( Keys.delegate_eos_unstake ) }
                                        </Text>
                                        <View style={
                                            this.state.isDelegate === 0 ? styles.activeTabBottom : {}
                                        }/>
                                    </TouchableOpacity>
                                </View>

                                {
                                    this.props.enable_rex ? (
                                        <View style={styles.tab}>
                                            <TouchableOpacity onPress={()=>{ this.setRental() }}>
                                                <Text style={[
                                                    styles.tabText,
                                                    this.state.isDelegate === 2 ? styles.activeTabColor : {}
                                                ]}>{I18n.t(Keys.rent)}</Text>
                                                <View style={
                                                    this.state.isDelegate === 2 ? styles.activeTabBottom : {}
                                                }/>
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                }

                            </View>

                            <View style={{ paddingHorizontal: 15 }}>
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>CPU</Text>
                                    <TextInput
                                        value={this.state.CPU}
                                        multiline={false}
                                        ref={(textinput) => { this.CPUInput = textinput }}
                                        style={styles.stakeInput}
                                        placeholder={
                                            // CPU placeholder
                                            this.state.isDelegate === 0 ? undelegate_CPU_placeholder:
                                            this.state.isDelegate === 1 ? delegate_CPU_placeholder:
                                            rent_CPU_placeholder
                                        }
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={(CPU) => {
                                            this.setState( { CPU } )
                                        }}
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
                                        placeholder={
                                            // NET placeholder
                                            this.state.isDelegate === 0 ? undelegate_NET_placeholder:
                                            this.state.isDelegate === 1 ? delegate_NET_placeholder :
                                            rent_NET_placeholder
                                        }
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={( NET ) => {
                                            this.setState( { NET } )
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                </View>
                                <View style={[commonStyles.commonIntervalStyle]} />

                                {/* Rental预估 */}
                                {
                                    this.state.isDelegate === 2 ? (
                                        <View>
                                            <View style={[commonStyles.commonIntervalStyle, {marginTop: 20}]} />
                                            <View style={styles.InputContainer}>
                                                <Text style={styles.stakeTitle}>{I18n.t(Keys.rent_about)}</Text>
                                                <TextInput
                                                    editable={false}
                                                    multiline={false}
                                                    style={styles.stakeInput}
                                                    placeholder={rentalAbout_placeholder}
                                                    placeholderTextColor={"#b5b5b5"}
                                                    keyboardType="numeric"
                                                    returnKeyType="done"
                                                    underlineColorAndroid={"transparent"}
                                                />
                                            </View>
                                        </View>
                                    ) : null
                                }
                                <View style={[commonStyles.commonIntervalStyle, { marginBottom: 20 } ]} />

                                {
                                    this.state.isDelegate === 1 ?
                                    (
                                        <View>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.delegate_note ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.delegate_note_1 ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.delegate_note_2 ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.delegate_note_3 ) }</Text>
                                        </View>
                                    ) : this.state.isDelegate === 0 ?
                                    (
                                        <View>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.delegate_note ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.undelegate_note_1 ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.undelegate_note_2 ) }</Text>
                                            <Text style={styles.noteText}>{ I18n.t( Keys.undelegate_note_3 ) }</Text>
                                        </View>
                                    ) : (
                                        <View>
                                            <View>
                                                <Text style={[styles.noteText]}>{ I18n.t( Keys.delegate_note ) }</Text>
                                                <Text style={[styles.noteText, {marginTop: 10}]}>{I18n.t(Keys.rent_rate)}{Util.toFixed(this.props.rental, 4)} </Text>
                                            </View>
                                            <View style={{marginTop: 10}}>
                                                <Text style={styles.noteText}>{I18n.t(Keys.rent_tips1)}</Text>
                                                <Text style={styles.noteText}>{I18n.t(Keys.rent_tips2)}</Text>
                                            </View>
                                        </View>
                                    )
                                }

                                <TouchableOpacity style={{
                                        marginTop: 30,
                                        marginBottom: 15,
                                    }}
                                    onPress={() => {
                                        const {isDelegate} = this.state;
                                        switch (isDelegate) {
                                            case 0:
                                                this.UnDelegatebwConfirm();
                                                break;
                                            case 1:
                                                this.DelegatebwConfirm();
                                                break;
                                            case 2:
                                                this.RentalConfirm();
                                                break;
                                            default:
                                                console.error('isDelegate is not match');
                                                break;
                                        }
                                    }}>
                                    <View style={styles.btn}>
                                        <Text style={styles.btnText}>
                                            { I18n.t( Keys.submit ) }
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </View>

                <PopupDialog
                    ref={(dialog) => { this.tipDialog = dialog; }}
                    dialogAnimation={slideFromBottom}
                    dialogStyle={{
                        width: WIDTH * 315 / 375,
                        height: 'auto'
                    }}
                    containerStyle={{
                        marginTop: - (STATE_BAR_HEIGHT + NAVI_BAR_HEIGHT)
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        height: 44,
                        marginHorizontal: 20,
                        marginTop: 20,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#323232'
                        }}>{ I18n.t( Keys.eos_staked_by_self ) }</Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-end'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'DIN',
                                color: '#323232'
                            }}>{ self_delegated_weight.toFixed(4) }  </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#323232'
                            }}>{this.props.systemToken}</Text>
                        </View>
                    </View>
                    <View style={[commonStyles.commonIntervalStyle, { marginHorizontal: 20 } ]} />
                    <View style={{
                        flexDirection: 'row',
                        height: 44,
                        marginHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#323232'
                        }}>{ I18n.t( Keys.eos_staked_by_others ) }</Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-end'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'DIN',
                                color: '#323232'
                            }}>{ other_delegated_weight }  </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#323232'
                            }}>{this.props.systemToken}</Text>
                        </View>
                    </View>
                    <View style={[commonStyles.commonIntervalStyle, { marginHorizontal: 20 } ]} />

                    <TouchableOpacity
                        onPress={() => {
                            this.tipDialog.dismiss()
                        }}>
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 16,
                                color: '#4A90E2',
                                marginVertical: 20
                            }}>{ I18n.t( Keys.close ) }</Text>
                        </View>
                    </TouchableOpacity>
                </PopupDialog>

                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        const {isDelegate} = this.state;
                        switch (isDelegate) {
                            case 0:
                                this.unDelegateResources(password);
                                break;
                            case 1:
                                this.delegateResources(password);
                                break;
                            case 2:
                                this.rentalResources(password);
                                break;
                            default:
                                console.error('isDelegate is not match');
                                break;
                        }
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}/>

                {
                    this.state.isRequesting ? <LoadingView/> : null
                }
            </View>
        );
    }
}

class ProgressItem extends Component {

    constructor( props ) {
        super( props );
    }

    render() {

        let percent = ((this.props.value / this.props.max) * 100).toFixed(0);

        let barColor = '#1ace9a';
        if (percent > 90) {
            barColor = "#f65858";
        } else if (percent > 70) {
            barColor = "#f6bc58";
        }

        if (percent > 100) {
            percent = '100%';
        } else if (percent < 0) {
            percent = '0%';
        } else {
            percent = percent + '%';
        }

        return (
            <View style={{ paddingHorizontal: 20, backgroundColor: '#ffffff' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 24,
                    marginTop: 10
                }}>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#323232'
                        }}>
                            {this.props.titleText}
                        </Text>
                        {
                            this.props.oneyuanstake ?
                            <TouchableOpacity onPress={() => {
                                NavigationUtil.openURI({component: this, url: this.props.oneyuanstakeTarget });
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: Util.getDpFromPx(1),
                                    borderColor: '#4A90E2',
                                    width: 77,
                                    height: 22,
                                    borderRadius: 11,
                                    marginLeft: 10
                                }}>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#4A90E2',
                                    }}>
                                        { I18n.t( Keys.eos_resources_oneyuan_rent ) }
                                    </Text>

                                    <IconSet name={ 'icon-arrow' } style={{
                                        fontSize: 10,
                                        color: '#4A90E2'
                                    }} />
                                </View>
                            </TouchableOpacity>
                            :
                            null
                        }
                    </View>
                    <Text style={{
                        fontSize: 14,
                        color: '#999999'
                    }}>
                        {this.props.contentText}
                    </Text>
                </View>

                {/* progressbar */}
                <View style={[{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '100%',
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5'
                }]}>
                    <View style={[{
                        width: percent,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: barColor
                    }]}></View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create( {
    cardContainer: {
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 15,
        shadowColor: '#001c51',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 5,
        shadowOpacity: 0.1
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 5
    },
    equationContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        alignItems: 'center'
    },
    equationItem: {
        marginTop: 20,
        marginBottom: 15
    },
    equationSymbolItem: {
        marginHorizontal: 12,
    },
    equationTitle: {
        fontSize: 14,
        color: '#323232',
        marginBottom: 5
    },
    equationText: {
        fontFamily: 'DIN',
        fontSize: 20,
        fontWeight: '500',
        color: '#323232',
    },
    equationSymbol: {
        fontSize: 16,
        color: '#323232',
        opacity: 0.6,
        textAlign: 'center',
        marginTop: 4
    },

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
        color: '#999999'
    },
    activeTabColor: {
        color: '#323232'
    },
    activeTabBottom: {
        position: 'absolute',
        width: 24,
        height: 3,
        left: '50%',
        marginLeft: -12,
        bottom: 0,
        backgroundColor: '#1ace9a'
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
    },
    noteText: {
        fontSize: 14,
        color: '#323232',
        fontWeight: '300',
        lineHeight: 22
    },
    btn: {
        height: 44,
        backgroundColor: '#4a4a4a',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        fontSize: 18,
        color: '#ffffff'
    }


} );

export default EOSResourcesPageView;
