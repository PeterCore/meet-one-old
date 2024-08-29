import React, { Component } from 'react';
import { Image, InteractionManager, Text, TextInput, View, Platform, Alert } from 'react-native';
import Button from "react-native-button";
import TextUtil from '../../util/TextUtil';
import Toast from "react-native-root-toast";
import commonStyles from "../../styles/commonStyles";
import { NavigationActions, SafeAreaView } from "react-navigation";
import CheckBox from 'react-native-check-box'
import Hyperlink from "react-native-hyperlink";
import Spinner from 'react-native-loading-spinner-overlay';
import * as env from "../../env";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import format from "string-format";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Util from "../../util/Util";
import LoadingView from "../../components/LoadingView";
import DEBUG_DATA from "../../DEBUG_DATA";

class ETHImportByKeystorePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.import_wallet_by_keystore_title ),
        };
        ''
    };

    constructor( props ) {
        super( props );
        this.state = {
            walletName: Util.generateNewWalletName(),
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            keystore: env.IS_DEBUG ? DEBUG_DATA.keystore : '',
            isRequesting: false,
            isCheck: false,
        }
    }

    startImport() {

        if ( TextUtil.isEmpty( this.state.keystore ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_keystore_can_not_be_null ), { position: Toast.positions.CENTER } );
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

        if ( !this.state.isCheck ) {
            Toast.show( I18n.t( Keys.please_agree_meet_term ), { position: Toast.positions.CENTER } );
            return;
        }

        this.setState( {
            isRequesting: true
        } );
        const { navigate, goBack, state } = this.props.navigation;

        InteractionManager.runAfterInteractions( () => {
            this.props.onImportEtherAccountByKeystore( this.state.walletName.trim(), this.state.password.trim(), this.state.keystore.trim(), ( error, result ) => {
                this.setState( {
                    isRequesting: false
                } );

                if ( error == null ) {
                    const { navigate, goBack, state } = this.props.navigation;

                    if ( state.params && state.params.callback ) {
                        state.params && state.params.callback && state.params.callback( result.account );
                    } else {
                        this.props.navigation.dispatch( NavigationActions.back() );
                    }
                } else {
                    Toast.show( error.message ? error.message : error, { position: Toast.positions.CENTER } );
                }
            } );
        } );
    }

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.keystore ) ||
            TextUtil.isEmpty( this.state.password ) ||
            !this.state.isCheck
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <TextInput
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.paddingCommon, { height: 206 } ]}
                            underlineColorAndroid={'transparent'}
                            multiline={true}
                            onChangeText={( text ) => this.setState( { keystore: text } )}
                            placeholder={I18n.t( Keys.keystore_input_placeholder )}
                            defaultValue={this.state.keystore}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordTextInput.focus();
                            }}
                        />
                        <View style={[ commonStyles.commonIntervalStyle ]}/>

                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordTextInput = textInput;
                            }}
                            style={[ commonStyles.commonInput, commonStyles.monospace, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                            underlineColorAndroid={'transparent'}
                            onChangeText={( text ) => this.setState( { password: text } )}
                            placeholder={I18n.t( Keys.keystore_password )}
                            defaultValue={this.state.password}
                            secureTextEntry={true}
                            keyboardType={'default'}
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
                                            this.startImport()
                                        }},
                                    ]
                                );
                            }}
                            title={null}
                            disabled={this.isNextButtonDisabled()}>
                            {I18n.t( Keys.import )}
                        </Button>

                    </KeyboardAwareScrollView>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHImportByKeystorePageView;
