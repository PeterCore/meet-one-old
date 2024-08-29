import React, { Component } from 'react';
import { Image, InteractionManager, Text, TextInput, View, Platform, Alert, TouchableOpacity, StyleSheet  } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import CheckBox from 'react-native-check-box'
import Hyperlink from "react-native-hyperlink";
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import NavigationUtil from "../../../util/NavigationUtil";
import { getInviteCodeBtn } from "../../../net/DiscoveryNet";

import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import format from "string-format";
import TextUtil from '../../../util/TextUtil';
import AnalyticsUtil from '../../../util/AnalyticsUtil';

import * as env from "../../../env";
import DEBUG_DATA from "../../../DEBUG_DATA";

class EOSCreateWalletPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.create_eos_account ),
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            walletName: '',
            errorMsg: '',
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            password2: env.IS_DEBUG ? DEBUG_DATA.password : '',
            passwordHint: '',
            isCheck: false,
            isRequesting: false,
            voucher: ''
        }
    }

    componentWillMount() {
        getInviteCodeBtn((err, res) => {
            if (!err) {
                const resData = JSON.parse(res);
                if (resData.data.length > 0) {
                    let target = resData.data[0].target;
                    this.setState({
                        how_to_get: true,
                        how_to_get_target: target
                    })
                }
            }
        });
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTnew8invite');
    }

    componentWillReceiveProps( nextProps ) { }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.walletName ) ||
            TextUtil.isEmpty( this.state.password ) ||
            TextUtil.isEmpty( this.state.password2 ) ||
            TextUtil.isEmpty(this.state.voucher) ||
            !this.state.isCheck ||
            (this.state.errorMsg && this.state.errorMsg.length !== 0)
    }

    // 注册完成导入帐户
    addToWallet (name, privateKey, publicKey, password, passwordHint) {
        this.props.addToEOSWallet( privateKey, name, password, passwordHint, ( err, res ) => {
            this.props.navigation.navigate('EOSGeneratorPage', {
                publicKey,
                privateKey
            });
        } );
    }

    accountNameWarning (msg) {
        this.setState({
            errorMsg: msg
        });
    }

    removeWarning () {
        this.setState({
            errorMsg: ''
        });
    }

    startCreate() {
        if ( TextUtil.isEmpty( this.state.password ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_password_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( this.state.password.length < 8 ) {
            Toast.show( I18n.t( Keys.password_is_tooshort ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( this.state.password !== this.state.password2 ) {
            Toast.show( I18n.t( Keys.password_is_not_same ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( !this.state.isCheck ) {
            Toast.show( I18n.t( Keys.please_agree_meet_term ), { position: Toast.positions.CENTER } );
            return;
        }

        if (this.state.errorMsg && this.state.errorMsg.length !== 0) {
            Toast.show( I18n.t( Keys.eos_account_has_exist ), { position: Toast.positions.CENTER } );
            return;
        }

        this.setState( {
            isRequesting: true
        });

        const walletName = this.state.walletName;
        const password = this.state.password;
        const voucher = this.state.voucher;
        const passwordHint = this.state.passwordHint;

        InteractionManager.runAfterInteractions( () => {
            this.props.onCreateEOSAccount(
                walletName,
                voucher,
                ( error, twokey, resData ) => {
                    this.setState({ isRequesting: false });
                    if (error) {
                        // 请求出错
                        Toast.show(I18n.t(Keys.HomePage_SomethingWrong) , {position: Toast.positions.CENTER});
                    } else {
                        // 请求有成功返回
                        if (resData.code === 0) {
                            // 服务端注册成功
                            const {publicKey, privateKey} = twokey;
                            Toast.show(resData.message, { position: Toast.positions.BOTTOM } );
                            this.addToWallet (walletName, privateKey, publicKey, password, passwordHint)
                        } else if (resData.code === -3) {
                            // 服务端调 BP 接口失败信息
                            const errObj = JSON.parse(resData.err);
                            let errCode, keys;
                            // BP 的错误格式处理，多个判断，有可能是服务端其他错误格式
                            if (errObj.error && errObj.error.code) {
                                errCode = errObj.error.code;
                                keys = Keys['error_' + errCode];
                            }
                            if (keys) {
                                Toast.show(I18n.t(keys), { position: Toast.positions.CENTER } );
                            } else {
                                Toast.show(resData.err, {position: Toast.positions.CENTER});
                            }
                        } else {
                            // 邀请码错误、被使用等其他错误
                            Toast.show(resData.message, { position: Toast.positions.CENTER } );
                        }
                    }
                });
        } );

    }

    validateAccountName () {
        if ( TextUtil.isEmpty( this.state.walletName ) ) {
            this.accountNameWarning(I18n.t( Keys.eos_account_name_can_not_be_null ));
            return;
        }

        if ( this.state.walletName.length < 12 ) {
            this.accountNameWarning(I18n.t( Keys.eos_wallet_name_must_be_12 ));
            return;
        }

        if ( !this.state.walletName.match(/^[1-5a-z]{12,12}$/g)) {
            this.accountNameWarning(I18n.t( Keys.please_input_correct_account ));
            return;
        }
        this.setState({
            errorMsg: I18n.t(Keys.loading)
        });
        // 向节点查询注册状态
        this.props.getAccountPost(null, {accountName: this.state.walletName}, () => {
            // 未被注册
            this.removeWarning();
        }, () => {
            // 已被注册
            this.accountNameWarning(I18n.t(Keys.eos_account_has_exist));
        })
    }

    render() {
        const language = this.props.language.split('-')[0] || 'zh';
        const isCN = language === 'zh';

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <Text style={[ commonStyles.commonTextColorStyle, {
                            fontSize: 16,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 20
                        } ]}>
                            {I18n.t( Keys.set_eos_account_name )}
                        </Text>
                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            style={[
                                commonStyles.commonInput,
                                commonStyles.pdl_normal,
                                commonStyles.pdr_normal,
                                commonStyles.monospace,
                                this.state.errorMsg &&
                                this.state.errorMsg.length > 0
                                ? styles.errorInput : {}
                            ]}
                            underlineColorAndroid={'transparent'}
                            keyboardType={'email-address'}
                            placeholder={I18n.t( Keys.eos_account_name )}
                            value={this.state.walletName}
                            autoCapitalize={"none"}
                            maxLength={12}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordTextInput.focus();
                            }}
                            onBlur={() => {
                                this.setState({
                                    errorMsg: ''
                                }, () => {
                                    this.validateAccountName();
                                })
                            }}
                            onChangeText={
                                (text) => {

                                    this.setState( { walletName: text } )

                                    // reacti-native  0.55.4 版本 onchangeText没有阻塞input，会造成 state 与 UI 显示不一致
                                    {/* const reg = /^[a-z1-5]+$/;
                                    if (text.length !== 0) {
                                        if (reg.test(text)) {
                                            this.setState( { walletName: text } )
                                        }
                                    } else {
                                        this.setState( { walletName: '' } )
                                    } */}
                                }
                            }
                        />
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <Text style={[ commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 10
                        }]}>
                            {I18n.t( Keys.eos_account_name_tip )}
                        </Text>

                        <Text
                            style={[commonStyles.commonSubTextColorStyle, {
                                fontSize: 12,
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                            }, this.state.errorMsg && this.state.errorMsg.length ? {color: 'red'} : {}]}>{this.state.errorMsg}</Text>


                        <Text style={[ commonStyles.commonTextColorStyle, {
                            fontSize: 16,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 30
                        } ]}>
                            {
                                I18n.t( Keys.please_set_password_tip )
                            }
                        </Text>
                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordTextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { password: text } )}
                            placeholder={I18n.t( Keys.password )}
                            defaultValue={this.state.password}
                            keyboardType={'default'}
                            secureTextEntry={true}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._password2TextInput.focus();
                            }}
                            onBlur={() => {
                                if ( this.state.password.length < 8 ) {
                                    Toast.show( I18n.t( Keys.password_is_tooshort ), { position: Toast.positions.CENTER } );
                                }
                            }}
                        />
                        <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._password2TextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { password2: text } )}
                            placeholder={I18n.t( Keys.password2 )}
                            defaultValue={this.state.password2}
                            keyboardType={'default'}
                            secureTextEntry={true}
                            onBlur={() => {
                                if ( this.state.password !== this.state.password2 ) {
                                    Toast.show( I18n.t( Keys.password_is_not_same ), { position: Toast.positions.CENTER } );
                                }
                            }}
                        />

                        {/* 恢复 设置密码提示的功能 */}
                        <Text style={[ commonStyles.commonTextColorStyle, {
                            fontSize: 16,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 30}]}>
                            { I18n.t(Keys.please_set_password_hint) }
                        </Text>
                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordHintTextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { passwordHint: text } )}
                            placeholder={I18n.t( Keys.password_tip_hint )}
                            defaultValue={this.state.passwordHint} />

                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 30
                        }}>
                            <Text style={[ commonStyles.commonTextColorStyle, {
                                fontSize: 16,
                                marginLeft: 15,
                                marginRight: 15,
                            }]}>
                                { I18n.t( Keys.please_set_voucher_tip ) }
                            </Text>

                            {
                                this.state.how_to_get && this.props.showHowToGet
                                ?
                                <TouchableOpacity
                                    onPress={() => {
                                        NavigationUtil.openURI({component: this, url: this.state.how_to_get_target });
                                    }}
                                    activeOpacity={0.9}>
                                    <Text style={[{
                                        color: constStyles.THEME_COLOR,
                                        fontSize: 14,
                                        marginLeft: 15,
                                        marginRight: 15
                                    }]}>
                                        {I18n.t(Keys.how_to_get_invite)}
                                    </Text>
                                </TouchableOpacity>
                                :
                                null
                            }

                        </View>


                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._password2TextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( {voucher: text } )}
                            placeholder={I18n.t( Keys.voucher )}
                            defaultValue={this.state.voucher}
                            keyboardType={'default'} />



                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>


                        <View
                            style={[ { flexDirection: 'row', alignItems: 'center' }, commonStyles.pdl_normal, commonStyles.pdr_normal, { marginTop: 30 } ]}>
                            <CheckBox
                                style={{}}
                                onClick={() => {
                                    this.setState( {
                                        isCheck: !this.state.isCheck
                                    } );
                                }}
                                isChecked={this.state.isCheck}
                                checkedImage={
                                    <Image
                                        style={[ { width: 20, height: 20 } ]}
                                        source={require( '../../../imgs/all_icon_checkbox_on.png' )}
                                    />
                                }
                                unCheckedImage={
                                    <Image
                                        style={[ { width: 20, height: 20 } ]}
                                        source={require( '../../../imgs/all_icon_checkbox_off.png' )}
                                    />
                                }
                            />

                            <Text
                                style={[ {
                                    fontSize: 16, marginLeft: 10,
                                }, commonStyles.commonTextColorStyle
                                ]}>
                                {I18n.t( Keys.create_eos_account_tip )}
                            </Text>
                        </View>

                        <View
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, { marginTop: 10 } ]}>
                            <Hyperlink
                                style={[ commonStyles.wrapper ]}
                                linkStyle={[ {
                                    fontSize: 14
                                }, commonStyles.commonSubTextColorStyle ]}
                                linkText={ I18n.t( Keys.meet_term_title_1 ) }
                                onPress={( url ) => {
                                    this.props.navigation.navigate( 'WebViewPage',
                                        {
                                            url: url,
                                            webTitle: I18n.t( Keys.meet_term_title_1 )

                                        } )
                                }}>
                                <Text
                                    style={[ {
                                        fontSize: 14, marginLeft: 5, lineHeight: 24
                                    }, commonStyles.commonSubTextColorStyle
                                    ]}>·{'  '}
                                    {
                                        format( I18n.t( Keys.meet_term_title_2 ), isCN ? 'https://dapp.ethte.com/terms.html' : 'https://meet.one/terms.html' )
                                    }
                                </Text>
                            </Hyperlink>
                        </View>

                        <View
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal ]}>
                            <Text
                                style={[ {
                                    fontSize: 14, marginLeft: 5, lineHeight: 24
                                }, commonStyles.commonSubTextColorStyle
                                ]}>
                                {I18n.t( Keys.create_eos_account_tip2 )}
                            </Text>
                        </View>

                        <View
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal ]}>
                            <Text
                                style={[ {
                                    fontSize: 14, marginLeft: 5, lineHeight: 24
                                }, commonStyles.commonSubTextColorStyle
                                ]}>
                                {I18n.t( Keys.create_eos_account_tip3 )}
                            </Text>
                        </View>

                        <View style={[ {}, commonStyles.wrapper ]}/>
                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerDisabledStyle,
                                this.isNextButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                                {
                                    height: 44,
                                    marginTop: 40,
                                    marginBottom: 40,
                                },
                                commonStyles.mgl_normal,
                                commonStyles.mgr_normal,
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                Alert.alert(
                                    I18n.t(Keys.risk_alert),
                                    Platform.OS === 'ios' ? I18n.t(Keys.risk_alert_ios) : I18n.t(Keys.risk_alert_android),
                                    [
                                        {text: I18n.t(Keys.cancel), onPress: () => {}},
                                        {text: I18n.t(Keys.ok), onPress: () => {
                                            this.startCreate();
                                        }},
                                    ]
                                );
                            }}
                            title={null}
                            disabled={this.isNextButtonDisabled()}>
                            {I18n.t( Keys.create_wallet )}
                        </Button>
                    </KeyboardAwareScrollView>
                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    errorInput: {
        backgroundColor: '#rgba(246,88,88,0.05)',
        borderColor: '#F65858'
    }
});
export default EOSCreateWalletPageView;
