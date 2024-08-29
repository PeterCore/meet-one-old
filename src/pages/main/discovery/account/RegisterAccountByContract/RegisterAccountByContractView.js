import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";

import commonStyles from "../../../../../styles/commonStyles";
import LoadingView from "../../../../../components/LoadingView";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Keys from "../../../../../configs/Keys";
import I18n from "../../../../../I18n";
import Util from "../../../../../util/Util";
import TextUtil from '../../../../../util/TextUtil';

export default class RegisterAccountByContractView extends React.Component {
    static navigationOptions = (props) => {
        return {
            title: I18n.t( Keys.register_by_contract )
        }
    }

    constructor (props) {
        super(props);
        this.state = {
            publicKey: '',
            name: '',
            isPswdOpen: false,
            rambytes: 4096,
            errorMsg0: '',
            errorMsg1: '',
            isRequesting: false
        };
    }

    componentWillMount() {
        this.props.updateRAMPrice();
    }

    componentDidMount() {}

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

        if ( !this.state.name.match(/^[1-5a-z]{12,12}$/g)) {
            this.setState({
                errorMsg1: I18n.t( Keys.please_input_correct_account )
            });
            return;
        }

        this.setState({
            isRequesting: true,
            errorMsg1: ''
        });

        // 向节点查询注册状态
        this.props.getAccountPost({}, {accountName: this.state.name}, (err, res) => {
            // 这里加强一下判断
            if (err && err.message && err.message.match('Internal Service Error') && err.message.match('unknown key')) {
                // 未被注册
                this.setState({
                    isRequesting: false
                });
                this.goToResultPage();
            } else {
                this.setState({
                    isRequesting: false,
                    errorMsg1: I18n.t(Keys.error)
                })
            }
        }, () => {
            // 已被注册
            this.setState({
                isRequesting: false,
                errorMsg1: I18n.t(Keys.eos_account_has_exist)
            });
        })
    }

    // 判断是否为空
    _isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.name ) ||
            TextUtil.isEmpty( this.state.publicKey) ||
            !TextUtil.isEmpty(this.state.errorMsg0)
    }

    goToResultPage() {
        this.props.navigation.navigate( 'RegisterAccountByContractResult', {
            publicKey: this.state.publicKey,
            name: this.state.name,
            cost: (this.props.RAMPrice > 0) ? Util.toFixed((this.props.RAMPrice * this.state.rambytes / 1024) + 0.2) : 2
        } );
    }

    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                commonStyles.commonBG
                ]}>
                <KeyboardAwareScrollView>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                        }}>
                        <Text style={[styles.mgl, styles.title, {marginVertical: 10}]} >{I18n.t(Keys.public_key)}</Text>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.navigate( 'EOSAccountRegisterFreshmanPage', {
                                    title: I18n.t( Keys.register_by_contract )
                                } );
                            }}>
                            <Text style={[
                                styles.mgl,
                                styles.title,
                                {
                                    color: '#1ace9a',
                                    marginVertical: 10,
                                }
                            ]}>{ I18n.t( Keys.generat_pk ) }</Text>
                        </TouchableOpacity>
                    </View>

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
                            {/* this.setState({
                                errorMsg1: ''
                            }, () => {
                                this._validateAccountName();
                            }) */}
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

                    <Text style={[styles.mgl, styles.small_tips]}>
                        {I18n.t( Keys.eos_account_name_tip )}
                    </Text>

                    <Text style={[commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 10,
                        }, this.state.errorMsg1 && this.state.errorMsg1.length ? {color: 'red'} : {}]}>{this.state.errorMsg1}</Text>

                    <Text style={{
                        fontSize: 16,
                        marginTop: 50,
                        marginLeft: 15,
                        color: '#666666'
                    }}>{ I18n.t( Keys.self_register_tip1 ) }</Text>
                    <Text style={{
                        fontSize: 16,
                        marginTop: 10,
                        marginLeft: 15,
                        color: '#666666'
                    }}>{ I18n.t( Keys.self_register_tip2 ) }</Text>
                    <Text style={{
                        fontSize: 16,
                        marginBottom: 10,
                        marginTop: 10,
                        marginLeft: 15,
                        color: '#666666'
                    }}>{ I18n.t( Keys.cost_tip_2 ) }</Text>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerDisabledStyle,
                            {
                                height: 44,
                                marginTop: 100,
                                marginBottom: 40,
                            },
                            this._isNextButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                            styles.mgl
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        disabled={this._isNextButtonDisabled()}
                        onPress={() => {
                            this._validateAccountName();
                        }}
                        title={null}>
                        {I18n.t(Keys.confirm)}
                    </Button>

                    {
                        this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }

                </KeyboardAwareScrollView>
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
