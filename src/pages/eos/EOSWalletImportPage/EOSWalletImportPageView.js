import React, { Component } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from "react-native";
import CheckBox from 'react-native-check-box'
import Hyperlink from "react-native-hyperlink";
import format from "string-format";
import I18n from "../../../I18n";
import Toast from "react-native-root-toast";
// import Spinner from 'react-native-loading-spinner-overlay';
import Button from "react-native-button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import Keys from "../../../configs/Keys";
import * as env from "../../../env";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSWalletImportPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.HomePage_importWallet ),
        };
    };

    constructor( props ) {
        super( props );
        // 之前的路由
        const before = props.navigation.state.params && props.navigation.state.params.before;
        const queryObj = props.navigation.state.params && props.navigation.state.params.queryObj;
        this.state = {
            before: before,
            queryObj: queryObj,
            key: "",
            ItemData: [],
            accountPrivateKey: "",
            password: '',
            password2: '',
            passwordHint: '',
            isNetworkSelectOpen: false,
            isRequesting: false,
            isCheck: false
        };
    }

    componentWillReceiveProps( nextProps ) { }

    componentDidMount() {
        AnalyticsUtil.onEvent('WAimport');
    }

    goWallet( data ) {
        this.props.onAddEOSWallet( this.state.key.trim(), data, this.state.password, this.state.passwordHint, ( err, res ) => {
            const { navigate, goBack, state } = this.props.navigation;
            if (err) {
                if (typeof err === 'string') {
                    Toast.show( err, { position: Toast.positions.CENTER } );
                } else {
                    Toast.show(err.message, { position: Toast.positions.CENTER });
                }
                return;
            } else {
                Toast.show( I18n.t( Keys.import_success ) , { position: Toast.positions.CENTER });
            }

            if ( state.params && state.params.callback ) {
                state.params && state.params.callback && state.params.callback();
            } else if (this.state.before) {
                this.props.navigation.dispatch(
                    StackActions.reset({
                        index: 1,
                        actions: [
                            NavigationActions.navigate( { routeName: 'mainPage' } ),
                            NavigationActions.navigate( { routeName: this.state.before, params: {queryObj: this.state.queryObj} } ),
                        ]
                    })
                )
            } else {
                this.props.navigation.navigate('mainPage');
            }
        } );
    };

    // 跳转到创建钱包页面
    goCreate() {
        const { navigate, goBack, state } = this.props.navigation;

        this.props.navigation.navigate( 'EOSCreateWalletPage',
            {
                callback: ( account ) => {

                    const { navigate, goBack, state } = this.props.navigation;


                    if ( state.params && state.params.callback ) {
                        state.params && state.params.callback && state.params.callback( account );
                    } else {
                        goBack();
                    }
                }
            }
        );
    }

    //submit wallet data
    goSubmit() {

        if ( !this.state.key ) {
            Toast.show( I18n.t( Keys.please_input_private_key_1 ), { position: Toast.positions.CENTER } )
            return;
        }

        if ( this.state.password.length < 8 ) {
            Toast.show( I18n.t( Keys.password_shot_length_tip ), { position: Toast.positions.CENTER } )
            return;
        }

        if ( this.state.password !== this.state.password2 ) {
            Toast.show( I18n.t( Keys.password_is_not_the_same ), { position: Toast.positions.CENTER } )
            return;
        }

        this.setState({
            ItemData: [],
            // 显示加载中
            isRequesting: true
        });
        this.props.onDispatchGetAccountNames( this.state.key.trim(), ( err, response ) => {
            this.setState({ isRequesting: false });
            if ( err ) {
                Toast.show( err.message, { position: Toast.positions.CENTER } );
            } else {
                const accountArray = response.account_names;
                if (accountArray.length > 1) {
                    // 有多个账号跳选择页
                    this.props.navigation.navigate('EOSImportAccountSelectPage', {
                        accountArray: accountArray,
                        key: this.state.key.trim(),
                        password: this.state.password,
                        passwordHint: this.state.passwordHint,
                        before: this.state.before,
                        queryObj: this.state.queryObj
                    })
                } else {
                    // 如果只有一个账号直接导入
                    this.goWallet(accountArray[0]);
                }
            }
        } );
    };

    render() {
        const privateKeyIntl = I18n.t( Keys.HomePage_privateKey );
        const choiceAccountIntl = I18n.t( Keys.HomePage_choiceAccount );
        const submitKey = I18n.t( Keys.HomePage_Submit );
        const Hint = I18n.t( Keys.HomePage_Hint );
        const language = this.props.language.split('-')[0] || 'zh';
        const isCN = language === 'zh';

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <View>
                            <Text style={styles.contentBoxTitle}>{privateKeyIntl}</Text>
                            <View style={[ commonStyles.commonIntervalStyle ]}/>
                            <TextInput
                                style={[styles.conItemTextInput, commonStyles.monospace, {height: 88}]}
                                multiline
                                placeholder={Hint}
                                placeholderTextColor={"#b5b5b5"}
                                onChangeText={( key ) => this.setState({
                                    // fuck the `\n` wrap to avoid the private key invalid
                                    key: key.replace(/\n/ig, "")
                                })}
                                value={this.state.key}
                                underlineColorAndroid={"transparent"}/>
                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            <Text
                                style={[ commonStyles.commonSubTextColorStyle, {
                                    fontSize: 14,
                                    marginTop: 20,
                                    marginLeft: 15
                                } ]}>{I18n.t( Keys.please_set_password_tip )}</Text>

                            <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                            <TextInput
                                ref={( textInput ) => {
                                    this._passwordTextInput = textInput;
                                }}
                                style={[ commonStyles.commonInput, commonStyles.monospace, styles.paddingBoth ]}
                                underlineColorAndroid={'transparent'}
                                onChangeText={( text ) => this.setState( { password: text } )}
                                placeholder={I18n.t( Keys.password )}
                                placeholderTextColor={"#b5b5b5"}
                                defaultValue={this.state.password}
                                keyboardType={'default'}
                                secureTextEntry={true}
                                returnKeyType={'next'}
                                returnKeyLabel={I18n.t( Keys.next )}
                                onSubmitEditing={() => {
                                    this._password2TextInput.focus();
                                }}
                            />
                            <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                            <TextInput
                                ref={( textInput ) => {
                                    this._password2TextInput = textInput;
                                }}
                                style={[ commonStyles.commonInput, commonStyles.monospace, styles.paddingBoth ]}
                                underlineColorAndroid={'transparent'}
                                onChangeText={( text ) => this.setState( { password2: text } )}
                                placeholder={I18n.t( Keys.password2 )}
                                placeholderTextColor={"#b5b5b5"}
                                defaultValue={this.state.password2}
                                keyboardType={'default'}
                                secureTextEntry={true}
                                returnKeyType={'next'}
                                returnKeyLabel={I18n.t( Keys.next )}
                                onSubmitEditing={() => {
                                    {/* this._passwordHintTextInput.focus(); */}
                                }}
                            />
                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            {/*设置密码提示 */}
                            <Text style={[ commonStyles.commonSubTextColorStyle, {
                                    fontSize: 14,
                                    marginTop: 20,
                                    marginLeft: 15
                                } ]}>{I18n.t( Keys.please_set_password_hint)}</Text>

                            <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                            <TextInput
                                style={[ commonStyles.commonInput, commonStyles.monospace,  styles.paddingBoth ]}
                                underlineColorAndroid={'transparent'}
                                onChangeText={( text ) => this.setState( { passwordHint: text } )}
                                placeholder={I18n.t( Keys.password_tip_hint )}
                                placeholderTextColor={"#b5b5b5"}
                                defaultValue={this.state.passwordHint }
                                keyboardType={'default'}
                                returnKeyType={'next'}
                                returnKeyLabel={I18n.t( Keys.next )}/>
                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                        </View>

                        <View
                            style={[ { flexDirection: 'row' }, styles.paddingBoth, { marginTop: 20 } ]}>
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

                            <Hyperlink
                                style={[ {
                                    marginLeft: 10,
                                }, commonStyles.wrapper
                                ]}
                                linkStyle={[ {
                                    fontSize: 16
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
                                        fontSize: 16
                                    }, commonStyles.commonSubTextColorStyle
                                    ]}>
                                    {
                                        format( I18n.t( Keys.meet_term_title_2 ), isCN ? 'https://dapp.ethte.com/terms.html' : 'https://meet.one/terms.html')
                                    }
                                </Text>
                            </Hyperlink>
                        </View>

                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerDisabledStyle,
                                !this.state.isCheck ? {}: { backgroundColor: '#4a4a4a' },
                                {
                                    height: 44,
                                    marginTop: 50,
                                },
                                styles.marginBoth
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            disabled={!this.state.isCheck}
                            onPress={() => {
                                Alert.alert(
                                    I18n.t(Keys.risk_alert),
                                    Platform.OS === 'ios' ? I18n.t(Keys.risk_alert_ios) : I18n.t(Keys.risk_alert_android),
                                    [
                                        {text: I18n.t(Keys.cancel), onPress: () => {}},
                                        {text: I18n.t(Keys.ok), onPress: () => {
                                            this.goSubmit()
                                        }},
                                    ]
                                );
                            }}
                            title={null}>
                            {I18n.t( Keys.import_wallet )}
                        </Button>

                        {
                            this.props.netType === 'EOS' ?
                            <Button
                                containerStyle={[
                                    {
                                        height: 44,
                                        marginTop: 20
                                    },
                                    commonStyles.mgl_normal,
                                    commonStyles.mgr_normal,
                                ]}
                                style={[ { color: '#4a4a4a' } ]}
                                styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                onPress={() => {
                                    // 创建钱包
                                    this.goCreate()
                                }}
                                title={null}
                                disabled={false}>
                                {I18n.t( Keys.create_wallet )}
                            </Button>
                            :
                            null
                        }

                    </KeyboardAwareScrollView>
                </View>

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
    paddingBoth: {
        paddingHorizontal: 15
    },
    marginBoth: {
        marginHorizontal: 15
    },

    contentBoxTitle: {
        fontSize: 14,
        color: "#888",
        lineHeight: 25,
        paddingTop: 15,
        paddingBottom: 10,
        paddingLeft: 15,
    },
    contentBoxImg: {
        height: 20,
    },
    conItemTextInput: {
        flexGrow: 1,
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        backgroundColor: "#fff",
        color: "#000",
    },
    buttonSubmit: {
        fontSize: 16,
        lineHeight: 44,
        color: "#fff",
        textAlign: "center",
    },


    //item
    contentItem: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        //fontSize : 18,
        paddingTop: 15,
        paddingBottom: 15,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    contentItemBox: {
        backgroundColor: '#fff',
        paddingLeft: 15,
        paddingRight: 10,
    },
    contentItemTitle: {
        fontSize: 14,
        color: "#888",
        lineHeight: 25,
        paddingTop: 15,
        paddingBottom: 10,
        paddingLeft: 15,
    },

    contentItemText: {
        fontSize: 18,
    },
} );

export default EOSWalletImportPageView;
