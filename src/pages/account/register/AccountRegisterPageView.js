import React, { Component } from 'react';
import {
    Dimensions,
    InteractionManager,
    Keyboard,
    LayoutAnimation,
    Platform,
    StatusBar,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import PhoneRegisterView from "../component/PhoneRegisterView"
import PhoneVerifyView from "../component/PhoneVerifyView"
import SetupPasswordView from "../component/SetupPasswordView"
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import ForgotPasswordView from "../component/ForgotPasswordView";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Toast from "react-native-root-toast";
import ImageVerifyInputComponent from "../component/ImageVerifyInputComponent"
import LoadingView from "../../../components/LoadingView";

const SCREEN_HEIGHT = Dimensions.get( 'window' ).height;

class AccountRegisterPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: '',
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
        const { state } = this.props.navigation;
        const { params } = state;
        this.state = {
            visibleHeight: SCREEN_HEIGHT - constStyles.ACTION_BAR_HEIGHT - constStyles.STATE_BAR_OFFY_KEYBOARD,
            step: 1,
            phone: "",
            verifyMobile: "",
            isRequesting: false,
            account: null,
            isRegister: params.flowType == 'register',
            isImageVerifyOpen: false,
            isImageVerified: false,
            country: { CountryISOCode: "CN", MobileCode: 86 },
            phoneTemp: "",
        }
    }

    componentWillUpdate() {
    }

    componentWillMount() {
        console.log( 'componentWillMount' );
    }

    componentWillMount() {
        Keyboard.addListener( 'keyboardWillShow', this._onKeyboardWillShow );
        Keyboard.addListener( 'keyboardWillHide', this._onKeyboardWillHide );
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners( 'keyboardWillShow' );
        Keyboard.removeAllListeners( 'keyboardWillHide' );
        this.timer && clearTimeout( this.timer );
    }

    doSetPassword( password ) {
        this.setState( {
            isRequesting: true
        } );
        const { goBack } = this.props.navigation;

        InteractionManager.runAfterInteractions( () => {
            this.props.setPassword( password, ( error, resBody ) => {
                this.setState( { isRequesting: false } );

                if ( error ) {
                    if ( error.message ) {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    } else {
                        Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } );
                    }
                } else {
                    if ( this.state.isRegister ) {
                        this.props.onRegisterSuccess( this.state.account );
                        goBack();
                    } else {
                        Toast.show( I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } );
                        goBack();
                    }
                    // this.setState( {
                    //     isRequesting: false,
                    // } );
                }
            } );
        } );
    }

    doVerifyToken( token ) {
        this.setState( {
            isRequesting: true
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.verifyToken( this.state.verifyMobile, token, ( error, resBody ) => {
                if ( error ) {
                    this.setState( { isRequesting: false } );
                    if ( error.message ) {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    } else {
                        Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } );
                    }
                } else {
                    this.setState( {
                        isRequesting: false,
                        step: 3,
                    } );
                }
            } );
        } );
    }

    doRegister( countryCode, phone, callback ) {
        this.setState( {
            isRequesting: true
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.registerPhone( countryCode, phone, ( error, resBody ) => {
                if ( error ) {
                    this.setState( { isRequesting: false } );
                    if ( error.message ) {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    } else {
                        Toast.show( I18n.t( Keys.register_failed ), { position: Toast.positions.CENTER } );
                    }
                    callback && callback( false );
                } else {
                    this.setState( {
                        isRequesting: false,
                        phone: phone,
                        step: 2,
                        verifyMobile: resBody.data.mobile,
                        account: {
                            mobile: resBody.data.mobile,
                            logo: resBody.data.logo,
                            username: resBody.data.username,
                            id: resBody.data.id,
                            email: resBody.data.email,
                            emailVerified: resBody.data.emailVerified,
                            countryCode: resBody.data.countryCode,
                            uuid: resBody.data.uuid,
                        },
                    } );
                    callback && callback( true );
                }
            } );
        } );
    }

    doFindPassword( countryCode, phone, callback ) {
        this.setState( {
            isRequesting: true
        } )

        InteractionManager.runAfterInteractions( () => {
            this.props.findPassword( countryCode, phone, ( error, resBody ) => {
                if ( error ) {
                    this.setState( { isRequesting: false } );
                    if ( error.message ) {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    } else {
                        Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } );
                    }

                    callback && callback( false );
                } else {
                    this.setState( {
                        isRequesting: false,
                        step: 2,
                        phone: phone,
                        verifyMobile: resBody.data.mobile,
                    } )
                    callback && callback( true );
                }
            } )
        } )
    }

    selectCountry() {
        const { navigation } = this.props;
        navigation.navigate( 'CountrySelectPage', {
            callback: ( value ) => {
                this.setState( {
                    country: value
                } );
            }
        } );
    }


    render() {
        const { state } = this.props.navigation;
        const { params } = state;
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View
                    style={[ commonStyles.commonBG, Platform.OS === 'ios' ? { height: this.state.visibleHeight } : commonStyles.wrapper ]}>
                    <StatusBar translucent={false} barStyle="default"/>
                    <View
                        style={[ {
                            height: 3,
                            backgroundColor: '#F5F5F5'
                        } ]}>
                        <View
                            style={[ {
                                width: Dimensions.get( 'window' ).width / 3 * this.state.step,
                                height: 3,
                                backgroundColor: constStyles.THEME_COLOR
                            } ]}
                        />
                    </View>

                    {
                        this.state.step == 1 ? (
                                params.flowType == 'register' ?
                                    <PhoneRegisterView
                                        style={[ { flex: 1 } ]}
                                        country={this.state.country}
                                        onNextStep={( countryCode, phone ) => {
                                            // this.doRegister( countryCode, phone );
                                            if ( this.state.isImageVerified ) {
                                                this.doRegister( countryCode, phone );
                                            } else {
                                                this.setState( {
                                                    phoneTemp: phone,
                                                    isImageVerifyOpen: true
                                                } )
                                            }
                                        }}
                                        onTapLoginExistAccount={() => {
                                            this.props.onTapLogin();
                                        }}
                                        openTerms={() => {
                                            this.props.openTerms();
                                        }}
                                        onTapCountryCode={() => {
                                            this.selectCountry();
                                        }}
                                    >
                                    </PhoneRegisterView>
                                    :
                                    <ForgotPasswordView
                                        style={[ { flex: 1 } ]}
                                        onNextStep={( countryCode, phone ) => {
                                            this.doFindPassword( countryCode, phone );
                                        }}
                                        country={this.state.country}
                                        onTapCountryCode={() => {
                                            this.selectCountry();
                                        }}
                                    />
                            )
                            :
                            (
                                this.state.step == 2 ?
                                    <PhoneVerifyView
                                        style={[ { flex: 1 } ]}
                                        phone={this.state.phone}
                                        resendVerifyCode={( callback ) => {
                                            this.doRegister( this.state.country.CountryISOCode, this.state.phone, callback );
                                        }}
                                        onNextStep={( token ) => {
                                            this.doVerifyToken( token );
                                            // this.setState( {
                                            //     step: 3,
                                            // } )
                                        }}
                                    >
                                    </PhoneVerifyView>
                                    :
                                    <SetupPasswordView
                                        style={[ { flex: 1 } ]}
                                        onNextStep={( password ) => {
                                            this.doSetPassword( password );
                                        }}
                                    >
                                    </SetupPasswordView>
                            )
                    }

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                    <ImageVerifyInputComponent
                        isOpen={this.state.isImageVerifyOpen}
                        onResult={( password ) => {
                            this.doEOSMapping( password );
                        }}
                        onClose={() => {
                            this.setState( {
                                isImageVerifyOpen: false
                            } );
                        }}
                        onVerifySuccess={() => {
                            this.setState( {
                                isImageVerified: true
                            } );
                            this.timer = setTimeout(
                                () => {
                                    this.doRegister( this.state.country.CountryISOCode, this.state.phoneTemp );
                                },
                                600
                            );
                        }}
                    />
                </View>
            </SafeAreaView>
        );

    }
}


export default AccountRegisterPageView;


