import React, { Component } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import format from "string-format";
import Toast from "react-native-root-toast";

import CustomSwitch from "../../../components/CustomSwitch";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import TextUtil from "../../../util/TextUtil";
import Util from "../../../util/Util";
import { handleError } from "../../../net/parse/eosParse";
import { getStore } from "../../../setup";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSCustomDelegatePageView extends Component {
    static navigationOptions = ( props ) => {
        return {
            title: I18n.t( Keys.custom_stake_title )
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            CPU: "",
            NET: "",
            receiver: "",
            transfer: false,
            isRequesting: false,
            isPswdOpen: false,

            delegateList: [],
            unStaking: null,

            isDelegate: props.isDelegate, // 0 赎回 1 抵押
            errorMsg1: ''
        };
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTstakecustom');
        this.getDelegateList();
    }

    getDelegateList() {
        const data = {
            'json': true,
            'code': 'eosio',
            'scope': this.props.account.accountName,
            'table': 'delband',
            'limit': 1000
        }

        this.props.getDelegateList(data, (err, res) => {
            if (!err) {
                const filterList = res.rows.filter((item, index) => {
                    return item.from !== item.to
                })
                this.setState({
                    delegateList: filterList
                })
            } else {
                handleError(err);
            }
        })
    }

    checkAccountName () {
        if ( TextUtil.isEmpty( this.state.receiver ) ) {
            this.setState({
                errorMsg1: I18n.t(Keys.please_input_receiver_account)
            });
            return;
        }
        if ( !this.state.receiver.match(/^[1-5a-z\.]{1,12}$/g)) {
            this.setState({
                errorMsg1: I18n.t( Keys.please_input_correct_account )
            });
            return;
        }
        this.setState({
            errorMsg1: I18n.t(Keys.loading)
        });
        // 向节点查询注册状态
        this.props.getAccountPost({}, {accountName: this.state.receiver}, () => {
            // 未被注册,账号不存在
            this.setState({
                errorMsg1: I18n.t( Keys.account_not_exist )
            });
        }, () => {
            this.setState({
                errorMsg1: ''
            })
        })
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

    _isStakeButtonDisabled() {
        if (TextUtil.isEmpty(this.state.receiver)) {
            return true;
        }

        if (!TextUtil.isEmpty(this.state.errorMsg1)) {
            return true;
        }

        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const total_resources = this.props.account.currencyBalance + this.props.account.refunds;

        if ( Number.isNaN(input_cpu) || Number.isNaN(input_net) || (input_cpu <= 0 && input_net <= 0) ) {
            //Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return true;
        } else if ( (input_cpu + input_net) > total_resources ) {
            //Toast.show( I18n.t( Keys.DelegatebwPage_NoEnoughBW ), { position: Toast.positions.CENTER } );
            return true;
        } else if ( !this.checkDelegateCPU() || !this.checkDelegateNET() ) {
            return true;
        }

        return false;
    }

    // 赎回执行
    unDelegateResources (password) {
        const unstakingAccount = this.state.unStaking;
        const data = {
            from: unstakingAccount.from,
            receiver: unstakingAccount.to,
            unstake_net_quantity: unstakingAccount.net_weight,
            unstake_cpu_quantity: unstakingAccount.cpu_weight,
        };
        console.log(data);
        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onDispatchUnDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( !err ) {
                    this.getDelegateList();
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
            receiver: this.state.receiver,
            stake_net_quantity: Number( this.state.NET ).toFixed(4) + " " + this.props.systemToken,
            stake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " " + this.props.systemToken,
            transfer: this.state.transfer ? 1 : 0
        };
        console.log(data);
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

    renderItem({ item, index }) {
        return (
            <View style={{
                height: 50,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 15
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        color: '#323232'
                    }}>
                        { item.to }
                    </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 14,
                        color: '#999999'
                    }}>
                        { (parseFloat(item.net_weight) + parseFloat(item.cpu_weight)).toFixed(4) + ' ' + this.props.systemToken }
                    </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <TouchableOpacity
                        onPress={() => {
                            const store = getStore();
                            const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                            if (tempPsw) {
                                AnalyticsUtil.onEvent('WASNfree');
                                this.setState({unStaking: item}, () => {
                                    if (this.state.isDelegate) {
                                        this.delegateResources(tempPsw);
                                    } else {
                                        this.unDelegateResources(tempPsw);
                                    }
                                });
                            } else {
                                this.setState({ isPswdOpen: true, unStaking: item })
                            }}}>
                        <View style={{
                            width: 56,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: 'rgba(26,206,154,0.10)',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 12,
                                color: '#323232'
                            }}>
                                { I18n.t( Keys.custom_stake_unstake ) }
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    render() {
        const account = this.props.account;

        // 动态计算两个的可抵押数
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        let refunding_cpu = this.props.account.refundMoneyDetail.cpu;
        let refunding_net = this.props.account.refundMoneyDetail.net;
        const eos_balance = this.props.account.currencyBalance;

        if (this.state.receiver !== account.accountName) {
            refunding_cpu = 0;
            refunding_net = 0;
        }

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

        // 可抵押的数量提示
        delegate_CPU_placeholder = delegate_CPU_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );
        delegate_NET_placeholder = delegate_NET_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                        <View style={styles.tabContainer}>
                            <View style={styles.tab}>
                                <TouchableOpacity onPress={()=>{ this.setState({ isDelegate: 1 }) }}>
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
                                <TouchableOpacity onPress={()=>{
                                    AnalyticsUtil.onEvent('CTstakeunstakelist');
                                    this.setState({ isDelegate: 0
                                }) }}>
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
                        </View>

                        {
                            this.state.isDelegate ?
                            <KeyboardAwareScrollView bounces={false} >
                                <View style={[commonStyles.commonIntervalStyle, { marginTop: 10 } ]} />
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>{ I18n.t( Keys.custom_stake_from ) }</Text>
                                    <Text style={{ fontSize: 16, color: '#999999' }}>{ this.props.account.accountName }</Text>
                                </View>
                                <View style={[commonStyles.commonIntervalStyle, { marginLeft: 15 } ]} />
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>{ I18n.t( Keys.custom_stake_receiver ) }</Text>
                                    <TextInput
                                        value={this.state.receiver}
                                        multiline={false}
                                        maxLength={12}
                                        autoCapitalize={'none'}
                                        style={styles.stakeInput}
                                        onChangeText={( receiver ) => {
                                            this.setState( { receiver } )
                                        }}
                                        onBlur={() => {
                                            this.setState({
                                                errorMsg1: '',
                                                errorMsg1Type: 0
                                            }, () => {
                                                this.checkAccountName();
                                            });
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                </View>
                                <View style={[commonStyles.commonIntervalStyle ]} />

                                <Text style={[commonStyles.commonSubTextColorStyle, {
                                    fontSize: 12,
                                    marginLeft: 15,
                                    marginRight: 15,
                                    marginTop: 10,
                                }, this.state.errorMsg1 && this.state.errorMsg1.length ? {color: '#F65858'} : {}]}>{this.state.errorMsg1}</Text>

                                <View style={[commonStyles.commonIntervalStyle, { marginTop: 15 } ]} />
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>CPU</Text>
                                    <TextInput
                                        value={this.state.CPU}
                                        multiline={false}
                                        style={styles.stakeInput}
                                        placeholder={delegate_CPU_placeholder}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={(CPU) => {
                                            this.setState( { CPU } )
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                </View>
                                <View style={[commonStyles.commonIntervalStyle, { marginLeft: 15 }]} />
                                <View style={styles.InputContainer}>
                                    <Text style={styles.stakeTitle}>NET</Text>
                                    <TextInput
                                        value={this.state.NET}
                                        multiline={false}
                                        style={styles.stakeInput}
                                        placeholder={delegate_NET_placeholder}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={( NET ) => {
                                            this.setState( { NET } )
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                </View>
                                <View style={[commonStyles.commonIntervalStyle, { marginBottom: 10 } ]} />

                                <View style={[commonStyles.commonIntervalStyle ]} />
                                <View style={[ styles.InputContainer ]}>
                                    <Text style={styles.stakeTitle}>
                                        { I18n.t( Keys.custom_stake_transfer ) }
                                    </Text>
                                    <CustomSwitch
                                        toggleAction={( value ) => {
                                            if ( value ) {
                                                this.setState({
                                                    transfer: true
                                                })
                                            } else {
                                                this.setState({
                                                    transfer: false
                                                })
                                            }
                                        }}
                                        switchStatus={this.state.transfer}
                                    />
                                </View>
                                <View style={[commonStyles.commonIntervalStyle ]} />

                                <Text style={styles.noteText}>
                                    { I18n.t( Keys.custom_stake_tip ) }
                                </Text>

                                <Button
                                    containerStyle={[
                                        commonStyles.buttonContainerDisabledStyle, {
                                            height: 44,
                                            marginTop: 60,
                                            marginHorizontal: 15,
                                            borderRadius: 2
                                        },
                                        this._isStakeButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                                    ]}
                                    style={[ commonStyles.buttonContentStyle ]}
                                    styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                    onPress={() => {
                                        const store = getStore();
                                        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                                        if (tempPsw) {
                                            AnalyticsUtil.onEvent('WASNfree');
                                            if (this.state.isDelegate) {
                                                this.delegateResources(tempPsw);
                                            } else {
                                                this.unDelegateResources(tempPsw);
                                            }
                                        } else {
                                            this.setState({ isPswdOpen: true })
                                        }
                                    }}
                                    title={null}
                                    disabled={this._isStakeButtonDisabled()}>
                                    { I18n.t( Keys.submit ) }
                                </Button>
                            </KeyboardAwareScrollView>
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    style={{ flexShrink: 1, marginTop: 10 }}
                                    data={this.state.delegateList}
                                    keyExtractor={( item, index ) => {
                                        return index + '';
                                    }}
                                    renderItem={( { item, index } ) => {
                                        return this.renderItem( { item, index } );
                                    }}
                                    ListEmptyComponent={() => {
                                        return (
                                            <Text
                                                style={[ {
                                                    fontSize: 18,
                                                    textAlign: 'center',
                                                    marginTop: 200
                                                }, commonStyles.wrapper, commonStyles.commonSubTextColorStyle ]}>
                                                {
                                                    I18n.t( Keys.empty_data )
                                                }
                                            </Text>
                                        )
                                    }}
                                    ListHeaderComponent={() => {
                                        if (this.state.delegateList.length > 0) {
                                            return <View style={[commonStyles.commonIntervalStyle]}/>
                                        } else {
                                            return null
                                        }
                                    }}
                                    ListFooterComponent={() => {
                                        if (this.state.delegateList.length > 0) {
                                            return <View style={[commonStyles.commonIntervalStyle]}/>
                                        } else {
                                            return null
                                        }
                                    }}
                                    ItemSeparatorComponent={() => {
                                        return <View style={[ {
                                            height: Util.getDpFromPx( 1 ),
                                            backgroundColor: '#e8e8e8',
                                            marginLeft: 15,
                                        } ]}/>
                                    }}
                                    getItemLayout={( data, index ) => (
                                        { length: 50, offset: (50 + Util.getDpFromPx( 1 )) * index, index }
                                    )}
                                />
                            </View>
                        }

                </View>

                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        if (this.state.isDelegate) {
                            this.delegateResources(password);
                        } else {
                            this.unDelegateResources(password);
                        }
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}/>

                {
                    this.state.isRequesting ?
                    <LoadingView/>
                    :
                    null
                }
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
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
        height: 44,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff'
    },
    stakeTitle: {
        fontSize: 16,
        color: '#323232'
    },
    stakeInput: {
        flexGrow: 1,
        fontSize: 16,
        height: 44,
        color: '#323232',
        textAlign: 'right'
    },
    noteText: {
        marginTop: 20,
        marginHorizontal: 15,
        fontSize: 14,
        color: '#999999',
        lineHeight: 20
    },
    btn: {
        marginHorizontal: 15,
        height: 44,
        backgroundColor: '#4a4a4a',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        fontSize: 17,
        color: '#ffffff'
    }


} );

export default EOSCustomDelegatePageView;
