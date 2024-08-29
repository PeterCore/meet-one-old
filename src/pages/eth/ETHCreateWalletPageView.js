import React, { Component } from 'react';
import { Image, InteractionManager, Text, TextInput, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import TextUtil from '../../util/TextUtil';
import commonStyles from "../../styles/commonStyles";
import constStyles from "../../styles/constStyles";
import Toast from "react-native-root-toast";
import CheckBox from 'react-native-check-box'
import Hyperlink from "react-native-hyperlink";
import ethers from "ethers";
import Spinner from 'react-native-loading-spinner-overlay';
import * as env from "../../env";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import format from "string-format";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Util from "../../util/Util";
import LoadingView from "../../components/LoadingView";
import DEBUG_DATA from "../../DEBUG_DATA";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHCreateWalletPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eth_wallet_add_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            walletName: Util.generateNewWalletName(),
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            password2: env.IS_DEBUG ? DEBUG_DATA.password : '',
            passwordHint: '',
            isCheck: false,
            isRequesting: false,
            percent: ''
        }
    }

    componentWillMount() {
    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }


    import() {
        const { navigate, goBack, state } = this.props.navigation;

        this.props.navigation.navigate( 'ETHImportPage',
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

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.walletName ) ||
            TextUtil.isEmpty( this.state.password ) ||
            TextUtil.isEmpty( this.state.password2 ) ||
            !this.state.isCheck;
    }

    startCreate() {

        if ( TextUtil.isEmpty( this.state.walletName ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_name_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }
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

        this.setState( {
            isRequesting: true
        } );
        const { navigate, goBack, state } = this.props.navigation;

        InteractionManager.runAfterInteractions( () => {
            this.props.onCreateEtherAccount(
                this.state.walletName,
                this.state.password,
                this.state.password,
                ( error, result ) => {
                    this.setState( {
                        isRequesting: false
                    } );
                    if ( error == null ) {
                        this.props.navigation.navigate( 'ETHWalletSeedPhrasePage',
                            {
                                primaryKey: result.account.primaryKey,
                                seedPhrase: result.seedPhrase,
                                hdPathString: result.hdPathString,
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
                    } else {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    }
                },
                ( percent ) => {

                } );
        } );

    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <Text style={[ commonStyles.commonSubTextColorStyle, {
                            fontSize: 14,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 20
                        } ]}>
                            {
                                I18n.t( Keys.please_set_wallet_name )
                            }
                        </Text>
                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal, {} ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { walletName: text } )}
                            placeholder={I18n.t( Keys.wallet_name )}
                            defaultValue={this.state.walletName}
                            maxLength={40}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordTextInput.focus();
                            }}
                        />
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>


                        <Text style={[ commonStyles.commonSubTextColorStyle, {
                            fontSize: 14,
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 20
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
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordHintTextInput.focus();
                            }}
                        />
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 20 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordHintTextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { passwordHint: text } )}
                            placeholder={I18n.t( Keys.password_tip_hint )}
                            defaultValue={this.state.passwordHint}
                        />
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <View
                            style={[ { flexDirection: 'row' }, commonStyles.pdl_normal, commonStyles.pdr_normal, { marginTop: 20 } ]}>
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
                                        source={require( '../../imgs/all_icon_checkbox_on.png' )}
                                    />
                                }
                                unCheckedImage={
                                    <Image
                                        style={[ { width: 20, height: 20 } ]}
                                        source={require( '../../imgs/all_icon_checkbox_off.png' )}
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
                                linkText={url => url === env.meet_terms_url
                                    ? I18n.t( Keys.meet_term_title_1 )
                                    : url}
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
                                        format( I18n.t( Keys.meet_term_title_2 ), env.meet_terms_url )
                                    }
                                </Text>
                            </Hyperlink>
                        </View>

                        <View style={[ {}, commonStyles.wrapper ]}/>
                        <Button
                            containerStyle={[
                                this.isNextButtonDisabled() ? commonStyles.buttonContainerDisabledStyle : commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    marginTop: 20
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
                                            this.startCreate()
                                        }},
                                    ]
                                );
                            }}
                            title={null}
                            disabled={this.isNextButtonDisabled()}>
                            {I18n.t( Keys.create_wallet )}
                        </Button>

                        <Button
                            containerStyle={[
                                {
                                    height: 44,
                                    marginTop: 20
                                },
                                commonStyles.mgl_normal,
                                commonStyles.mgr_normal,
                            ]}
                            style={[ { color: constStyles.THEME_COLOR } ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                this.import()
                            }}
                            title={null}
                            disabled={false}>
                            {I18n.t( Keys.import_wallet )}
                        </Button>
                    </KeyboardAwareScrollView>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHCreateWalletPageView;
