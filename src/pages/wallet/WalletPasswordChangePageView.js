import React, { Component } from 'react';
import { InteractionManager, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import { NavigationActions } from "react-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import TextUtil from "../../util/TextUtil";
import * as env from "../../env";
import LoadingView from "../../components/LoadingView";
import DEBUG_DATA from "../../DEBUG_DATA";
import AnalyticsUtil from "../../util/AnalyticsUtil";

class WalletPasswordChangePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.wallet_password_change_title ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isRequesting: false,
            oldPassword: env.IS_DEBUG ? DEBUG_DATA.password : '',
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            password2: env.IS_DEBUG ? DEBUG_DATA.password : '',
            passwordHint: ''
        };
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WASNchange');
    }

    changePassword() {
        // 旧密码不能为空
        if ( TextUtil.isEmpty( this.state.oldPassword ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_password_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }

        // 新密码不能为空
        if ( TextUtil.isEmpty( this.state.password ) ) {
            Toast.show( I18n.t( Keys.eth_wallet_password_can_not_be_null ), { position: Toast.positions.CENTER } );
            return;
        }

        // 至少八位
        if ( this.state.password.length < 8 ) {
            Toast.show( I18n.t( Keys.password_shot_length_tip ), { position: Toast.positions.CENTER } )
            return;
        }

        // 两个密码保持一致
        if ( this.state.password !== this.state.password2 ) {
            Toast.show( I18n.t( Keys.password_is_not_same ), { position: Toast.positions.CENTER } );
            return;
        }

        this.setState( {
            isRequesting: true
        } );

        InteractionManager.runAfterInteractions( () => {
            this.props.onChangeWalletPassword( this.props.account, this.state.oldPassword, this.state.password2, this.state.passwordHint,
                ( error, result ) => {
                    this.setState( {
                        isRequesting: false
                    } );

                    if ( error == null ) {
                        Toast.show( I18n.t( Keys.success_to_change_wallet_password ), { position: Toast.positions.CENTER } );
                        this.props.navigation.dispatch( NavigationActions.back() );
                    } else {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    }
                }
            );
        } );
    }

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.oldPassword ) ||
            TextUtil.isEmpty( this.state.password ) ||
            TextUtil.isEmpty( this.state.password2 )
    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                    <Text style={[ commonStyles.commonSubTextColorStyle, {
                        fontSize: 14,
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 20
                    } ]}>
                        {
                            I18n.t( Keys.password_verify )
                        }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                    <TextInput
                        style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                        underlineColorAndroid={'transparent'}
                        onChangeText={( text ) => this.setState( { oldPassword: text } )}
                        placeholder={I18n.t( Keys.password_old )}
                        defaultValue={this.state.oldPassword}
                        keyboardType={'default'}
                        secureTextEntry={true}
                        returnKeyType={'next'}
                        returnKeyLabel={I18n.t( Keys.next )}
                        onSubmitEditing={() => {
                            this._passwordTextInput.focus();
                        }}
                    />
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <Text style={[ commonStyles.commonSubTextColorStyle, {
                        fontSize: 14,
                        marginLeft: 20,
                        marginRight: 20,
                        marginTop: 20
                    } ]}>
                        {
                            I18n.t( Keys.set_new_password )
                        }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                    <TextInput
                        ref={( textInput ) => {
                            this._passwordTextInput = textInput;
                        }}
                        style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
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
                        style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
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


                    <Text style={[ commonStyles.commonSubTextColorStyle, {
                        fontSize: 14,
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 20
                    } ]}>
                        {
                            I18n.t( Keys.please_set_password_hint )
                        }
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
                        defaultValue={this.state.passwordHint}
                    />
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <View style={[ commonStyles.wrapper ]}/>

                    <Button
                        containerStyle={[
                            this.isNextButtonDisabled() ? commonStyles.buttonContainerDisabledStyle : commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginTop: 30,
                                marginLeft: 15,
                                marginRight: 15,
                                marginBottom: 20,
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.changePassword();
                        }}
                        title={null}
                        disabled={this.isNextButtonDisabled()}>
                        {I18n.t( Keys.finish_operation )}
                    </Button>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                </View>
            </SafeAreaView>
        );
    }
}

export default WalletPasswordChangePageView;
