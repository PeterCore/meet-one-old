import React, { Component } from 'react';
import commonStyles from "../../../styles/commonStyles";
import BottomLineTextInput from "../../../components/BottomLineTextInput";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from "react-native-root-toast";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LoadingView from "../../../components/LoadingView";
import {
    Dimensions,
    Image,
    InteractionManager,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';

export default class AccountLoginPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: '登录',
            header: null
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            mobile: null,
            isRequesting: false,
            pwd: null,
        }
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
    }

    componentWillUnmount() {
    }

    doLogin() {
        if ( !this.state.mobile ) {
            Toast.show( I18n.t( Keys.pls_input_account ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( !this.state.pwd ) {
            Toast.show( I18n.t( Keys.pls_input_pwd ), { position: Toast.positions.CENTER } );
            return;
        }

        const { goBack } = this.props.navigation;
        this.setState( {
            isRequesting: true
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onTapLogin( this.state.mobile, this.state.pwd, ( err, resBody ) => {
                this.setState( { isRequesting: false } );

                if ( err ) {
                    this.setState( { isRequesting: false } );
                    if ( err.message ) {
                        Toast.show( err.message, { position: Toast.positions.CENTER } );
                    } else {
                        Toast.show( I18n.t( Keys.login_failed ), { position: Toast.positions.CENTER } );
                    }
                }
            } )
        } );

    }

    render() {
        const { goBack } = this.props.navigation;
        return (

            <SafeAreaView style={commonStyles.wrapper}>
                <View
                    style={[ commonStyles.wrapper, commonStyles.commonBG, ]}>
                    <StatusBar translucent={true} barStyle="light-content"/>
                    <KeyboardAwareScrollView
                        keyboardShouldPersistTaps={'handled'}
                        style={[ commonStyles.wrapper ]}
                    >
                        <Image
                            source={require( '../../../imgs/login_img_banner.png' )}
                            style={[ {
                                width: Dimensions.get( 'window' ).width,
                                height: Dimensions.get( 'window' ).width / 1.69,
                            } ]}
                        />

                        <View
                            style={[ commonStyles.justAlignCenter, {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: Dimensions.get( 'window' ).width,
                                height: Dimensions.get( 'window' ).width / 1.69,
                                flexDirection: 'row',
                            } ]}
                        >
                            <Image
                                source={require( '../../../imgs/login_img_logo.png' )}
                                style={[ {
                                    width: 62,
                                    height: 90,
                                } ]}
                            />

                            <View>
                                <Text
                                    style={[ { marginLeft: 20, fontSize: 32, color: 'white' } ]}
                                >
                                    MEET.ONE
                                </Text>

                                <Text
                                    style={[ { marginLeft: 20, fontSize: 16, color: 'white' } ]}
                                >
                                    {
                                        I18n.t( Keys.eos_entrance )
                                    }
                                </Text>
                            </View>
                        </View>


                        <Text
                            style={[ commonStyles.commonSubTextStyle, styles.marginLR, { marginTop: 44 } ]}
                        >
                            {
                                I18n.t( Keys.mobile_or_email )
                            }
                        </Text>

                        <BottomLineTextInput
                            style={[ styles.marginLR, { marginTop: 10 } ]}
                            onChangeText={( text ) => {
                                this.setState( {
                                    mobile: text,
                                } );
                            }}
                            returnKeyType={'next'}
                            returnKeyLabel={I18n.t( Keys.next )}
                            onSubmitEditing={() => {
                                this._passwordView.focus();
                            }}
                        />

                        <Text
                            style={[ commonStyles.commonSubTextStyle, styles.marginLR, commonStyles.mgt_normal ]}
                        >
                            {
                                I18n.t( Keys.password )
                            }
                        </Text>

                        <BottomLineTextInput
                            ref={( view ) => {
                                this._passwordView = view;
                            }}
                            style={[ styles.marginLR, { marginTop: 10 } ]}
                            asPassword={true}
                            onChangeText={( text ) => {
                                this.setState( {
                                    pwd: text,
                                } );
                            }}
                            onSubmitEditing={() => {
                                // this._passwordView.focus();
                                this.doLogin()
                            }}
                        />

                        <TouchableOpacity
                            style={[ styles.marginLR, styles.passwordForgotButton ]}
                            onPress={() => {
                                this.props.onTapPasswordForgot();
                            }}
                        >
                            <Text
                                style={[ styles.passwordForgotText ]}
                            >

                                {
                                    I18n.t( Keys.forgot_password )
                                }
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                this.doLogin();
                            }}
                            style={[
                                styles.loginButton,
                            ]}
                        >
                            <Text
                                style={[ styles.loginButtonText ]}
                            >
                                {
                                    I18n.t( Keys.login )
                                }
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[ styles.marginLR, styles.registerButton ]}
                            onPress={() => {
                                this.props.navigation.navigate( 'AccountRegisterPage', { flowType: 'register' } )
                            }}
                        >
                            <Text
                                style={[ styles.registerButtonText ]}
                            >
                                {
                                    I18n.t( Keys.register_new_account )
                                }
                            </Text>
                        </TouchableOpacity>

                        <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                    </KeyboardAwareScrollView>

                    <TouchableOpacity
                        style={[ commonStyles.justAlignCenter, {
                            width: 44,
                            height: 44,
                            position: 'absolute',
                            top: constStyles.STATE_BAR_HEIGHT,
                            left: 5
                        } ]}
                        onPress={() => {
                            goBack();
                        }}
                    >
                        <Image
                            source={require( '../../../imgs/nav_btn_back_white.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );

    }
};

const styles = StyleSheet.create( {
    // logoImage: {
    //     height: Dimensions.get('window').width * 1.69,
    //     alignSelf: 'center'
    // },
    marginLR: {
        marginLeft: 30,
        marginRight: 30,
    },
    loginButton: {
        width: 165,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: constStyles.THEME_COLOR,
        alignSelf: 'center',
        marginTop: 45,
        justifyContent: 'center'
    },
    loginButtonText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center'
    },
    passwordForgotButton: {
        alignSelf: 'flex-end',
        marginTop: 10
    },
    passwordForgotText: {
        fontSize: 14,
        color: constStyles.THEME_COLOR
    },

    registerButton: {
        alignSelf: 'center',
        marginTop: 30
    },

    registerButtonText: {
        fontSize: 16,
        color: constStyles.THEME_COLOR
    }
} );



