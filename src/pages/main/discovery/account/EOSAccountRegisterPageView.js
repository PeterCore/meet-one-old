import React, { Component } from 'react';
import {Modal, View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, TouchableHighlight} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Keys from "../../../../configs/Keys";
import I18n from "../../../../I18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import IconSet from "../../../../components/IconSet";
import AccountInputText from "../AccountInputText";
import PasswordInputComponent from "../../../../components/PasswordInputComponent";
import Util from "../../../../util/Util";
import Toast from "react-native-root-toast";
import { verifyPassword } from '../../../../actions/EOSAction';
import { handleError } from '../../../../net/parse/eosParse';
import { getStore } from '../../../../setup';

import AnalyticsUtil from '../../../../util/AnalyticsUtil';

/**
 * 价格组件
 */
const PriceItem = ({title, price, subPrice, unit = 'EOS', subUnit = 'EOS'}) => {
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: '#ccc', borderBottomWidth: 1, paddingVertical: 15}}>
            <Text style={{fontSize: 14, color: '#323232', alignSelf: 'center'}}>{title}</Text>
            <View style={{alignSelf: 'center'}}>
                <Text style={{fontSize: 14, color: '#323232'}}>{price} {unit}</Text>
                { subPrice ? <Text style={{fontSize: 12, color: '#323232', textAlign: 'right', paddingVertical: 5}}>{subPrice} {subUnit}</Text> : null}
            </View>
        </View>
    )
}

class EOSAccountRegisterPageView extends Component {

    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: ""
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            // 密码输入框显示状态
            isPswdOpen: false,
            ruleShow: false,
            // 帐号列表
            accounts: [{
                text: '',
                errorMsg: ''
            }],
            // 注册账号花费常量
            COST: {
                rambytes: 4096,
                stake_net_quantity: '0.0100' + ' ' + this.props.systemToken,
                stake_cpu_quantity: '0.0100' + ' ' + this.props.systemToken
            },
        }

    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTnewaccountname');
    }

    // 显示/隐藏 modal
    _setRuleModalVisible() {
        let isShow = this.state.ruleShow;
        this.setState( {
            ruleShow: !isShow,
        } );
    }

    // 点击新增帐号的逻辑
    registerConfirm() {
        const accounts = this.state.accounts;

        if (accounts.length === 0) {
            Toast.show(I18n.t( Keys.account_at_least_one ), { position: Toast.positions.CENTER } );
            return false;
        }

        for (const account of accounts) {
            if (account.errorMsg.length > 0 || account.text.length === 0) {
                Toast.show(I18n.t( Keys.account_make_sure ), { position: Toast.positions.CENTER } );
                return false;
            }
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.doRegisterConfirm(tempPsw);
        } else {
            // 验证逻辑通过， 显示密码输入框
            this.setState( { isPswdOpen: true } );
        }
    }

    // 密码输入通过后的逻辑
    doRegisterConfirm(password) {
        const accountPrivateKey = verifyPassword(this.props.walletAccount, password, (err, result) => {
            handleError(err);
        }, this.props.dispatch);
        if (!accountPrivateKey) {
            return;
        }
        const accounts = this.state.accounts;
        const accountList = [];
        let {rambytes, stake_cpu_quantity, stake_net_quantity} = this.state.COST;
        accounts.forEach(account => {
            accountList.push({
                name: account.text,
                rambytes,
                stake_net_quantity,
                stake_cpu_quantity,
            })
        });
        this.props.navigation.navigate('EOSAccountRegisterResultPage', {
            accountList,
            accountPrivateKey
        });
    }

    render() {
        return (
            <SafeAreaView style={[ commonStyles.wrapper, {backgroundColor: '#fff'}]}>
                <ScrollView style={{ paddingHorizontal: 20 }} >
                    <KeyboardAwareScrollView>
                        <Text style={{
                            fontSize: 32,
                            fontWeight: '700',
                            color: '#323232',
                            marginVertical: 10,
                        }}>{I18n.t( Keys.register_account )}</Text>
                        <Text style={{ fontSize: 14, marginVertical: 5, color: '#999', lineHeight: 16 }}>{ this.props.netType === 'MEETONE' ? I18n.t( Keys.register_meetone_account_info ) : I18n.t( Keys.register_account_info )}</Text>
                        <Text style={{ fontSize: 14, color: '#323232', lineHeight: 20, marginTop: 20}}>{I18n.t(Keys.bulk_account_tips1)} {this.props.walletAccount && this.props.walletAccount.accountName} {I18n.t(Keys.bulk_account_tips2)}</Text>

                        {/* 账户名称输入Wrapper */}
                        <View style={{ marginVertical: 40 }}>
                            {/* TextInput Components */}
                            <View>
                                {this.state.accounts.map((item, index) => {
                                    return (
                                        <AccountInputText
                                            key={index}
                                            index={index}
                                            length={12}
                                            delete={(index) => {
                                                const accounts = this.state.accounts;
                                                accounts.splice(index, 1);
                                                this.setState({ accounts });
                                            }}
                                            onChangeText={(index,text) => {
                                                const accounts = this.state.accounts;
                                                accounts[index].text = text;
                                                this.setState({ accounts });
                                            }}
                                            // 验证逻辑
                                            isValidate={(index = '', text = '') => {
                                                if (text.length < 12) {
                                                    item.errorMsg = I18n.t( Keys.account_make_sure_info )
                                                } else {
                                                    // 现在 blur 无法保证字符全部合法，所以加个判断

                                                    let matchResult;
                                                    if (this.props.netType === 'MEETONE') {
                                                        matchResult = text.match(/^[a-z1-5]+\.m$/g)
                                                    } else {
                                                        matchResult = text.match(/^[a-z1-5]+$/g)
                                                    }

                                                    if (!matchResult) {
                                                        if (this.props.netType === 'MEETONE') {
                                                            item.errorMsg = I18n.t( Keys.register_meetone_account_info )
                                                        } else {
                                                            item.errorMsg = I18n.t( Keys.register_account_info )
                                                        }
                                                    } else {
                                                        item.errorMsg = I18n.t(Keys.loading);
                                                        const account = this.props.walletAccount;
                                                        this.props.getAccountPost(account, {accountName: text}, () => {
                                                            item.errorMsg = '';
                                                            const accounts = this.state.accounts;
                                                            accounts[index].errorMsg = item.errorMsg;
                                                            const isValid = item.errorMsg.length == 0;
                                                            this.setState({ accounts , isValid});
                                                        }, () => {
                                                            item.errorMsg = I18n.t(Keys.eos_account_has_exist);
                                                            const accounts = this.state.accounts;
                                                            accounts[index].errorMsg = item.errorMsg;
                                                            const isValid = item.errorMsg.length == 0;
                                                            this.setState({ accounts , isValid});
                                                        });
                                                    }
                                                }
                                                const accounts = this.state.accounts;
                                                accounts[index].errorMsg = item.errorMsg;
                                                this.setState({ accounts });
                                            }}
                                            errorMsg={item.errorMsg}
                                            text={item.text}/>
                                    )
                                })}
                            </View>
                            {/* 新增一项 */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    const _accounts = this.state.accounts;
                                    _accounts.push({
                                        text: '',
                                        errorMsg: ''
                                    });
                                    this.setState({
                                        accounts: _accounts
                                    })
                                }}
                                style={[
                                    styles.inputComponent, {
                                    backgroundColor: '#FFF',
                                    borderStyle: 'dashed',
                                    borderColor: '#E8E8E8',
                                    justifyContent: 'center',
                                    marginVertical: 10}]}>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#999999',
                                    lineHeight: 50,
                                    textAlign: 'center'}}>
                                        <IconSet name="icon-me_icon_addwalletxhd" style={{width: 12, height: 12}}/> {I18n.t( Keys.add_new_one_account )}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{marginTop: 160}}>
                            <View style={{ paddingVertical: 12 }}>
                                <View style={{}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <TouchableOpacity
                                            onPress={() => { this._setRuleModalVisible(); }}
                                            activeOpacity={0.9}>
                                            <Text style={{ marginTop: 0, fontSize: 14, color: '#999' }}>
                                                * {I18n.t( Keys.account_make_sure_1 )} {Util.toFixed((this.props.RAMPrice * this.state.COST.rambytes / 1024) + 0.02)} {this.props.systemToken} {I18n.t( Keys.account_make_sure_2 )}
                                                <IconSet style={{fontSize: 18, color: constStyles.THEME_COLOR, marginLeft: 10}} name="icon-wenhao"/>
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 开始注册帐号 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={()=> {
                                this.registerConfirm();
                            }}>
                            <View style={{
                                height: 50,
                                backgroundColor: '#4A4A4A',
                                marginVertical: 20,
                                borderRadius: 2
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    color: '#fff',
                                    textAlign: 'center',
                                    lineHeight: 50
                                }}>{I18n.t( Keys.start_register_account )}</Text>
                            </View>
                        </TouchableOpacity>

                    </KeyboardAwareScrollView>
                </ScrollView>

                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={this.state.ruleShow}
                    onShow={() => { }}
                    onRequestClose={() => {}}>

                    <View style={[ styles.ruleModalStyle ]}>
                        <View style={styles.ruleSubView}>
                            <Text style={{fontSize: 14, lineHeight: 22, color: '#323232'}}>{I18n.t( Keys.add_new_one_account_1 )} {Util.toFixed(this.props.RAMPrice * this.state.COST.rambytes / 1024 + 0.02)} {this.props.systemToken} {I18n.t( Keys.add_new_one_account_2 )}</Text>

                            <View style={{marginTop: 12}}>
                                <PriceItem title={'NET Stake'} price={this.state.COST.stake_net_quantity.split(' ')[0]} unit={this.props.systemToken}/>
                                <PriceItem title={'CPU Stake'} price={this.state.COST.stake_cpu_quantity.split(' ')[0]} unit={this.props.systemToken}/>
                                <PriceItem title={'RAM'} price={this.state.COST.rambytes} unit={'bytes'} subPrice={Util.toFixed(this.state.COST.rambytes / 1024 * this.props.RAMPrice)} subUnit={this.props.systemToken} />
                            </View>

                            <View style={styles.buttonView}>
                                <TouchableHighlight underlayColor='transparent'
                                                    style={styles.buttonStyle}
                                                    onPress={this._setRuleModalVisible.bind( this )}>
                                    <Text style={styles.buttonText}>
                                        {I18n.t( Keys.close )}
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 密码验证输入框 */}
                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this.doRegisterConfirm( password )
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}/>
            </SafeAreaView>
        )
    }
}

/**
 * 描述组件
 * @param {Object} param0 组件参数
 */
const RAMDescriptionItem = ({title = 'RAM余额', count = '0', unit = 'byte'}) => {
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: '#EBEBEB',
            borderBottomWidth: 1,
            paddingTop: 16,
            paddingBottom: 8
        }}>
            <Text style={{
                fontSize: 14,
                color: '#323232'
            }}>{title}</Text>
            <View style={{flexDirection: 'row'}}>
                <Text style={{
                    paddingRight: 10,
                    fontSize: 20,
                    color: '#323232'
                }}>{count}</Text>
                <Text style={{
                    fontSize: 16,
                    color: '#323232'
                }}>{unit}</Text>
            </View>
        </View>
    )
}

/**
 * 选择框组件
 */
const Checkbox = ({checked = false}) => {
    const unCheckedEle = <IconSet style={{fontSize: 20, color: constStyles.THEME_COLOR}} name="icon-all_icon_checkbox_of"/>;
    const checkedEle = <IconSet style={{fontSize: 20, color: constStyles.THEME_COLOR}} name="icon-backcopy3"/>;
    return (
        checked ? checkedEle : unCheckedEle
    )
}

const leftFirstBase = 38;

const styles = StyleSheet.create({
    inputComponent: {
        height: 50,
        borderWidth: 1,
        borderRadius: 2,
        marginVertical: 5
    },

    normalInput: {
        backgroundColor: '#fff',
        borderColor: '#e8e8e8',
    },

    errorInput: {
        backgroundColor: '#rgba(246,88,88,0.05)',
        borderColor: '#F65858'
    },

    ruleSubView: {
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
        paddingTop: 23,
        paddingLeft: 15,
        paddingRight: 15,
        // paddingBottom: 23,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },


    ruleModalStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    buttonText: {
        fontSize: 14,
        color: '#1ACE9A',
        textAlign: 'center',
    },

    buttonView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },

    buttonStyle: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default EOSAccountRegisterPageView;
