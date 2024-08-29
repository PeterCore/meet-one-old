/*
 * EOS账户注册 - 我是老用户View
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:04:10
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-12 10:16:59
 */

import React from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity, Dimensions, ScrollView, Alert, TextInput, Modal, InteractionManager } from "react-native";
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, SafeAreaView } from "react-navigation";

import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import PasswordInputComponent from "../../../../components/PasswordInputComponent";
import IconSet from "../../../../components/IconSet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Keys from "../../../../configs/Keys";
import I18n from "../../../../I18n";
import Util from "../../../../util/Util";
import TextUtil from '../../../../util/TextUtil';
import LoadingView from "../../../../components/LoadingView";
import {handleError} from "../../../../net/parse/eosParse";
import { getStore } from "../../../../setup";

import AnalyticsUtil from "../../../../util/AnalyticsUtil";

export default class EOSAccountRegisterOldmanPageView extends React.Component {
    static navigationOptions = (props) => {
        return {
            title: I18n.t( Keys.im_old )
        }
    }

    constructor (props) {
        super(props);
        this.state = {
            publicKey: '',
            name: '',
            isPswdOpen: false,
            rambytes: 4096,
            stake_net_quantity: '0.1000' + ' ' + this.props.systemToken,
            stake_cpu_quantity: '0.1000' + ' ' + this.props.systemToken,
            errorMsg0: '',
            errorMsg1: '',
            isRequesting: false
        };
    }

    componentWillMount() {}

    componentDidMount() {
        AnalyticsUtil.onEvent('CTnew8friend');
    }

    // 点击确认的逻辑
    registerConfirm() {
        if (this.state.errorMsg1.length && this.state.errorMsg2.length > 0) {
            return false;
        }
        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.doRegisterConfirm(tempPsw);
        } else {
            this.setState({ isPswdOpen: true });
        }
    }

    // 密码验证通过
    doRegisterConfirm(password) {
        this.setState({
            isRequesting: true
        });
        // 注册逻辑
        InteractionManager.runAfterInteractions( () => {
            const {publicKey, name, rambytes, stake_cpu_quantity, stake_net_quantity} = this.state;
            this.props.onCreateEOSAccountWithPublicKey(this.props.walletAccount, password, {
                publicKey,
                name,
                rambytes,
                stake_cpu_quantity,
                stake_net_quantity
            }, (err, result) => {
                this.setState({isRequesting: false}, () => {
                    if (!err) {
                        Toast.show(I18n.t( Keys.register_account_successfully ), { position: Toast.positions.CENTER } );
                        // 返回
                        this.props.navigation.dispatch( NavigationActions.back() );
                    } else {
                        handleError(err);
                    }
                });
            })
        });
    }

    // 验证公钥合理
    _validateAccountKey() {
        if (this.state.publicKey && /^EOS|eos/.test(this.state.publicKey) && this.state.publicKey.length === 53) {
        this.setState({
                errorMsg0: ''
            });
        } else {
            this.setState({
                errorMsg0: I18n.t( Keys.old_account_errorMsg0 )
            });
        }

    }

    // 验证账号名
    _validateAccountName() {
        if ( TextUtil.isEmpty( this.state.name) ) {
            this.setState({
                errorMsg1: I18n.t(Keys.eos_account_name_can_not_be_null)
            });
            return;
        }

        if ( this.state.name.length < 12 ) {
            this.setState({
                errorMsg1: I18n.t( Keys.eos_wallet_name_must_be_12 )
            });
            return;
        }

        if ( this.props.netType === 'MEETONE' ) {
            if ( !this.state.name.match(/^[1-5a-z]{1,10}\.m$/g)) {
                this.setState({
                    errorMsg1: I18n.t( Keys.please_input_correct_account )
                });
                return;
            }
        } else {
            if ( !this.state.name.match(/^[1-5a-z]{12,12}$/g)) {
                this.setState({
                    errorMsg1: I18n.t( Keys.please_input_correct_account )
                });
                return;
            }
        }

        this.setState({
            errorMsg1: I18n.t(Keys.loading)
        });

        // 向节点查询注册状态
        this.props.getAccountPost(this.props.walletAccount, {accountName: this.state.name}, () => {
            // 未被注册
            this.setState({
                errorMsg1: ''
            });
        }, () => {
            // 已被注册
            this.setState({
                errorMsg1: I18n.t(Keys.eos_account_has_exist)
            });
        })
    }

    // 判断是否为空
    _isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.name ) ||
            TextUtil.isEmpty( this.state.publicKey) ||
            !TextUtil.isEmpty(this.state.errorMsg0) ||
            !TextUtil.isEmpty(this.state.errorMsg1)
    }

    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                commonStyles.commonBG
                ]}>

                <KeyboardAwareScrollView>
                    <Text style={[styles.mgl, styles.title, {marginVertical: 10}]} >{I18n.t(Keys.public_key)}</Text>

                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    <TextInput
                        style={[styles.textInput, commonStyles.monospace, {height: 88}]}
                        value={this.state.publicKey}
                        multiline
                        spellCheck={false}
                        autoCorrect={false}
                        returnKeyLabel={I18n.t( Keys.next )}
                        returnKeyType={'next'}
                        autoCapitalize={'none'}
                        keyboardType={'email-address'}
                        placeholder={I18n.t(Keys.old_account_placeholder)}
                        placeholderTextColor={"#B5B5B5"}
                        onBlur={() => {
                            this.setState({
                                errorMsg0: ''
                            }, () => {
                                this._validateAccountKey();
                            });
                        }}
                        onChangeText={(text) => {
                            this.setState({
                                // fuck the `\n` wrap to avoid the private key invalid
                                publicKey: text.replace(/\n/ig, "").trim()
                            });
                        }}
                        underlineColorAndroid={"transparent"}/>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <Text style={[styles.mgl, styles.small_tips]}>{I18n.t(Keys.old_account_key_info)}</Text>

                    <Text style={[commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 10,
                        }, this.state.errorMsg0 && this.state.errorMsg0.length ? {color: 'red'} : {}]}>{this.state.errorMsg0}</Text>

                    <Text style={[styles.mgl, styles.title, {
                        marginVertical: 10,
                        marginTop: 30
                    }]} >{I18n.t(Keys.set_account_name)}</Text>

                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    <TextInput
                        style={[styles.textInput, commonStyles.monospace]}
                        value={this.state.name}
                        placeholder={I18n.t(Keys.set_account_name_placeholder)}
                        placeholderTextColor={"#B5B5B5"}
                        // 最高12位
                        maxLength={12}
                        spellCheck={false}
                        autoCapitalize={'none'}
                        keyboardType={'email-address'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        returnKeyLabel={I18n.t( Keys.next )}
                        returnKeyType={'next'}
                        onBlur={() => {
                            this.setState({
                                errorMsg1: ''
                            }, () => {
                                this._validateAccountName();
                            })
                        }}
                        onChangeText={
                            (text) => {

                                this.setState( { name: text } )

                                // reacti-native  0.55.4 版本 onchangeText没有阻塞input，会造成 state 与 UI 显示不一致
                                {/* const reg = /^[a-z1-5]+$/;
                                if (text.length !== 0) {
                                    if (reg.test(text)) {
                                        this.setState( { name: text } )
                                    }
                                } else {
                                    this.setState( { name: '' } )
                                } */}
                            }
                        }
                        underlineColorAndroid={"transparent"}/>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <Text style={[styles.mgl, styles.small_tips]}>
                        {
                            this.props.netType === 'MEETONE' ?
                            I18n.t( Keys.register_meetone_account_info )
                            :
                            I18n.t( Keys.eos_account_name_tip )
                        }
                    </Text>

                    <Text style={[commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 10,
                        }, this.state.errorMsg1 && this.state.errorMsg1.length ? {color: 'red'} : {}]}>{this.state.errorMsg1}</Text>

                    <Text style={[styles.title, styles.mgl, {marginTop: 30}]}> * {I18n.t(Keys.account_make_sure_1)} {Util.toFixed((this.props.RAMPrice * this.state.rambytes / 1024) + 0.02)} {I18n.t(Keys.account_make_sure_2)}</Text>
                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerDisabledStyle,
                            {
                                height: 44,
                                marginTop: 120,
                                marginBottom: 40,
                            },
                            this._isNextButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                            styles.mgl
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        disabled={this._isNextButtonDisabled()}
                        onPress={() => {
                            this.registerConfirm();
                        }}
                        title={null}>
                        {I18n.t(Keys.confirm)}
                    </Button>
                </KeyboardAwareScrollView>
                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
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

const styles = StyleSheet.create({
    textInput: {
        flexGrow: 1,
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        backgroundColor: "#fff",
        color: "#000",
    },
    mgl: {
        marginLeft: 15,
        marginRight: 15
    },
    small_tips: {
        marginTop: 10,
        fontSize: 12,
        color: '#888888'
    },
    title: {
        fontSize: 14,
        color: '#323232',
        lineHeight: 22
    }
});
