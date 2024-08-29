import React, { Component } from 'react';
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Button from "react-native-button";
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from "react-native-root-toast";
import LoadingView from "../../../components/LoadingView";
import {
    Dimensions,
    InteractionManager,
    Keyboard,
    LayoutAnimation,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';

const SCREEN_HEIGHT = Dimensions.get( 'window' ).height;

export default class MineChangePasswordPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.change_password ),
        };
    };


    _onKeyboardWillShow = ( e ) => {

        const visibleHeight = SCREEN_HEIGHT - e.endCoordinates.height - constStyles.ACTION_BAR_HEIGHT - constStyles.STATE_BAR_OFFY_KEYBOARD;

        LayoutAnimation.configureNext( LayoutAnimation.create(
            e.duration,
            LayoutAnimation.Types[ e.easing ]
        ) );

        this.setState( {
            visibleHeight
        } );
    };
    _onKeyboardWillHide = () => {

        this.setState( {
            visibleHeight: SCREEN_HEIGHT - constStyles.ACTION_BAR_HEIGHT - constStyles.STATE_BAR_OFFY_KEYBOARD,
        } );
    };

    constructor( props ) {
        super( props );

        this.state = {
            currentPwd: null,
            newPwd: null,
            repeatPwd: null,
            isRequesting: false,
            visibleHeight: SCREEN_HEIGHT - constStyles.ACTION_BAR_HEIGHT - constStyles.STATE_BAR_OFFY_KEYBOARD
        }
    }


    componentWillMount() {
        Keyboard.addListener( 'keyboardWillShow', this._onKeyboardWillShow );
        Keyboard.addListener( 'keyboardWillHide', this._onKeyboardWillHide );
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners( 'keyboardWillShow' );
        Keyboard.removeAllListeners( 'keyboardWillHide' );
    }

    buttonDisabled() {
        return (!this.state.currentPwd || !this.state.newPwd || !this.state.repeatPwd)
    }

    _onTapButton() {
        if ( !/^(?:\\d+|[0-9]+|[a-zA-Z]+|[!@#$%^&*]+){8,16}$/.test( this.state.newPwd ) ) {
            Toast.show( I18n.t( Keys.password_format_hint ), { position: Toast.positions.CENTER } )
            return;
        }

        if ( this.state.newPwd !== this.state.repeatPwd ) {
            Toast.show( I18n.t( Keys.repeat_password_error ), { position: Toast.positions.CENTER } )
            return;
        }

        this.setState( {
            isRequesting: true
        } )
        InteractionManager.runAfterInteractions( () => {
            this.props.changePassword( this.state.currentPwd, this.state.newPwd, ( err, resBody ) => {
                this.setState( {
                    isRequesting: false
                } )

                if ( err ) {
                    if ( err.message ) {
                        Toast.show( err.message, { position: Toast.positions.CENTER } )
                    } else {
                        Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } )
                    }
                } else {
                    Toast.show( I18n.t( Keys.password_modify_success ), { position: Toast.positions.CENTER } )
                }
            } )
        } )
    }

    _onCurrentPasswordTextChange( text ) {
        this.setState( {
            currentPwd: text
        } )
    }

    _onNewPasswordTextChange( text ) {
        this.setState( {
            newPwd: text
        } )
    }

    _onRepeatPasswordTextChange( text ) {
        this.setState( {
            repeatPwd: text
        } )
    }

    _onTapFindPassword() {
        this.props.onTapPasswordForgot();
    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View
                    style={[ Platform.OS === 'ios' ? { height: this.state.visibleHeight } : commonStyles.wrapper, commonStyles.commonBG2 ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, styles.hintText ]}
                    >
                        {
                            I18n.t( Keys.verify_password )
                        }
                    </Text>

                    <View
                        style={[
                            styles.itemHeight,
                            commonStyles.commonBorderTop,
                            commonStyles.commonBorderBottom,
                            {
                                backgroundColor: "#FFFFFF",
                                alignItems: 'center',
                                flexDirection: 'row',
                            }
                        ]}
                    >
                        <TextInput
                            ref={( view ) => {
                                this._currentPassword = view
                            }}
                            style={[
                                commonStyles.commonInputTextStyle,
                                styles.marginLR,
                                {
                                    flex: 1,
                                    fontSize: 16
                                }
                            ]}
                            onChangeText={( text ) => {
                                this._onCurrentPasswordTextChange( text )
                            }}
                            padding={0}
                            keyboardType={'default'}
                            maxLength={16}
                            placeholder={I18n.t( Keys.current_password )}
                            placeholderTextColor={constStyles.PLACE_HOLDER_TEXT_COLOR}
                            returnKeyType={'done'} keyboardType={'default'}
                            secureTextEntry={true}
                            underlineColorAndroid={'transparent'}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._password.focus()
                            }}
                        >
                        </TextInput>
                        <TouchableOpacity
                            onPress={() => {
                                this._onTapFindPassword()
                            }}
                        >
                            <Text
                                style={[ commonStyles.commonSmallSubTextStyle, styles.hintText, { color: "#1ACE9A" } ]}
                            >
                                {
                                    I18n.t( Keys.find_password )
                                }
                            </Text>
                        </TouchableOpacity>

                    </View>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, styles.hintText ]}
                    >
                        {
                            I18n.t( Keys.set_new_password )
                        }
                    </Text>

                    <View
                        style={[
                            commonStyles.commonBorderTop,
                            commonStyles.commonBorderBottom,
                            {
                                backgroundColor: "#FFFFFF",
                                justifyContent: 'center',
                            }
                        ]}
                    >
                        <TextInput
                            ref={( view ) => {
                                this._password = view
                            }}
                            style={[
                                commonStyles.commonInputTextStyle,
                                styles.marginLR,
                                styles.itemHeight,
                                {
                                    fontSize: 16
                                }
                            ]}
                            onChangeText={( text ) => {
                                this._onNewPasswordTextChange( text )
                            }}
                            padding={0}
                            secureTextEntry={true}
                            keyboardType={'default'}
                            maxLength={16}
                            placeholder={I18n.t( Keys.password )}
                            placeholderTextColor={constStyles.PLACE_HOLDER_TEXT_COLOR}
                            returnKeyType={'done'}
                            underlineColorAndroid={'transparent'}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._repeatPassword.focus()
                            }}
                        >
                        </TextInput>
                        <View
                            style={[ commonStyles.commonBorderTop, styles.marginL ]}
                        >

                        </View>
                        <TextInput
                            ref={( view ) => {
                                this._repeatPassword = view
                            }}
                            style={[
                                commonStyles.commonInputTextStyle,
                                styles.itemHeight,
                                styles.marginLR,
                                {
                                    fontSize: 16
                                }
                            ]}
                            onChangeText={( text ) => {
                                this._onRepeatPasswordTextChange( text )
                            }}
                            padding={0}
                            keyboardType={'default'}
                            maxLength={16}
                            secureTextEntry={true}
                            placeholder={I18n.t( Keys.repeat_password )}
                            placeholderTextColor={constStyles.PLACE_HOLDER_TEXT_COLOR}
                            returnKeyType={'done'}
                            underlineColorAndroid={'transparent'}
                            onSubmitEditing={() => {
                                if ( !this.buttonDisabled() ) {
                                    this._currentPassword.blur()
                                    this._password.blur()
                                    this._repeatPassword.blur()
                                    this._onTapButton();
                                }
                            }}
                        >
                        </TextInput>
                    </View>

                    <View style={{ flex: 1 }}></View>

                    {
                        <Button
                            containerStyle={[
                                this.buttonDisabled() ?
                                    commonStyles.buttonContainerDisabledStyle
                                    :
                                    commonStyles.buttonContainerStyle,
                                commonStyles.mgb_normal,
                                {
                                    height: 44,
                                    marginLeft: 15,
                                    marginRight: 15,
                                    borderRadius: 0,
                                }
                            ]}
                            style={[ commonStyles.buttonContentStyle, { fontSize: 18 } ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle, { fontSize: 18 } ]}
                            onPress={() => {
                                this._currentPassword.blur()
                                this._password.blur()
                                this._repeatPassword.blur()
                                this._onTapButton();
                            }}
                            title={null}
                            disabled={this.buttonDisabled()}>
                            {
                                I18n.t( Keys.complete )
                            }
                        </Button>
                    }


                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create( {
    hintText: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: 10,
        marginBottom: 10,
    },
    itemHeight: {
        height: 44
    },
    marginLR: {
        marginLeft: 15,
        marginRight: 15,
    },
    marginL: {
        marginLeft: 15,
    },
    marginR: {
        marginRight: 15,
    }
} )