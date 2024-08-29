import React, { Component } from 'react';
import { Dimensions, Image, InteractionManager, Text, TextInput, View, Alert, Platform } from 'react-native';
import TextUtil from '../../util/TextUtil';
import ModalDropdown from 'react-native-modal-dropdown';
import hdPathTypeConfig from '../../../data/hdPathType';
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import commonStyles from "../../styles/commonStyles";
import { NavigationActions, SafeAreaView } from "react-navigation";
import constStyles from "../../styles/constStyles";
import TouchableItemComponent from "../../components/TouchableItemComponent";
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

const Mnemonic = require( 'bitcore-mnemonic' );

class ETHImportBySeedPhrasePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.import_wallet_by_seed_phrase ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            walletName: Util.generateNewWalletName(),
            seedPhrase: env.IS_DEBUG ? DEBUG_DATA.seedPhrase : "",
            hdPathValue: hdPathTypeConfig.hdPath[ 0 ].value,
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            password2: env.IS_DEBUG ? DEBUG_DATA.password : '',
            passwordHint: '',
            isRequesting: false,
            isCheck: false,
        }
    }

    startImport() {
        if ( TextUtil.isEmpty( this.state.seedPhrase ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_seed_phrase_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }
        if ( TextUtil.isEmpty( this.state.password ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_password_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( this.state.password !== this.state.password2 ) {
            Toast.show( I18n.t( Keys.password_is_not_same ), { position: Toast.positions.CENTER } );
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

        if ( !Mnemonic.isValid( this.state.seedPhrase.trim(), Mnemonic.Words.ENGLISH ) ) {
            Toast.show( I18n.t( Keys.invalid_seed_phrase ), { position: Toast.positions.CENTER } );
            return;
        }

        this.setState( {
            isRequesting: true
        } );
        const { navigate, goBack, state } = this.props.navigation;

        InteractionManager.runAfterInteractions( () => {
            this.props.onCreateEtherAccountBySeedPhrase( this.state.walletName.trim(), this.state.password.trim(), this.state.passwordHint,
                this.state.hdPathValue, this.state.seedPhrase.trim(),
                ( error, result ) => {
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
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    }
                }
            );
        } );
    }

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.seedPhrase ) ||
            TextUtil.isEmpty( this.state.password ) ||
            TextUtil.isEmpty( this.state.password2 ) ||
            !this.state.isCheck
    }

    render() {
        const hdPathTypeArray = [];
        let defaultIndex = 0;
        let defaultValue = '';

        for ( let index = 0; index < hdPathTypeConfig.hdPath.length; index++ ) {
            hdPathTypeArray.push( hdPathTypeConfig.hdPath[ index ].value + ' ' + hdPathTypeConfig.hdPath[ index ].name )

            if ( hdPathTypeConfig.hdPath[ index ].value === this.state.hdPathValue ) {
                defaultIndex = index;
                defaultValue = hdPathTypeArray[ index ];
            }
        }

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>

                        <TextInput
                            style={[ commonStyles.commonInput, commonStyles.paddingCommon, commonStyles.wrapper, commonStyles.monospace, { height: 206 } ]}
                            underlineColorAndroid={'transparent'}
                            multiline={true}
                            onChangeText={( text ) => this.setState( { seedPhrase: text } )}
                            placeholder={I18n.t( Keys.please_input_seed_phrase )}
                            defaultValue={this.state.seedPhrase}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordTextInput.focus();
                            }}
                        />
                        <View style={[ commonStyles.commonIntervalStyle ]}/>

                        <View style={[ { marginTop: 10 } ]}>
                            <ModalDropdown
                                ref={( modalDropDown ) => {
                                    this._modalDropDown = modalDropDown;
                                }}
                                style={[ { height: 44, marginLeft: 12 } ]}
                                textStyle={[ { fontSize: 44 } ]}
                                dropdownStyle={[ { width: Dimensions.get( 'window' ).width } ]}
                                dropdownTextStyle={[ { fontSize: 16 } ]}
                                dropdownTextHighlightStyle={[ { fontSize: 16, }, constStyles.THEME_COLOR ]}
                                defaultIndex={defaultIndex}
                                defaultValue={defaultValue}
                                options={hdPathTypeArray}
                                onSelect={( rowID, rowData ) => {
                                    console.log( "rowID" + rowID + "; rowData = " + rowData )
                                    this.setState( { hdPathValue: hdPathTypeConfig.hdPath[ rowID ].value } );
                                }}
                            />

                            <TouchableItemComponent
                                containerStyle={[ {
                                    position: 'absolute',
                                    left: 0,
                                    right: 0
                                } ]}
                                title={hdPathTypeArray[ defaultIndex ]}
                                onPress={() => {
                                    this._modalDropDown.show();
                                }}
                                headerInterval={true}
                                footerInterval={true}/>


                        </View>

                        <Text
                            style={[ commonStyles.commonSubTextColorStyle, {
                                fontSize: 14,
                                marginTop: 15,
                                marginLeft: 15
                            } ]}>{I18n.t( Keys.please_set_password_tip )}</Text>

                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordTextInput = textInput;
                            }}
                            style={[ commonStyles.monospace, commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
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
                            style={[ commonStyles.monospace, commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
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

                        <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                        <TextInput
                            ref={( textInput ) => {
                                this._passwordHintTextInput = textInput;
                            }}
                            style={[commonStyles.monospace, commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
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

                        <Button
                            containerStyle={[
                                this.isNextButtonDisabled() ? commonStyles.buttonContainerDisabledStyle : commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    marginTop: 20,
                                    marginBottom: 20
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

export default ETHImportBySeedPhrasePageView;
