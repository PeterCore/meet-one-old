import React, { Component } from 'react';
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Button from "react-native-button";
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from "react-native-root-toast";
import constStyles from "../../../styles/constStyles";
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';

const SCREEN_HEIGHT = Dimensions.get( 'window' ).height;

export default class MineEmailPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.bind_email ),
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
            email: props.account.email,
            isRequesting: false,
            visibleHeight: SCREEN_HEIGHT - constStyles.ACTION_BAR_HEIGHT - constStyles.STATE_BAR_OFFY_KEYBOARD
        }
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
    }


    componentWillMount() {
        Keyboard.addListener( 'keyboardWillShow', this._onKeyboardWillShow );
        Keyboard.addListener( 'keyboardWillHide', this._onKeyboardWillHide );
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners( 'keyboardWillShow' );
        Keyboard.removeAllListeners( 'keyboardWillHide' );
    }


    _onChangeText( text ) {
        this.setState( {
            email: text,
        } )
    }


    validateEmail( email ) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test( email );
    }

    _onTapButton() {
        if ( this.props.account.email ) {
            this.setState( {
                isRequesting: true
            } );

            if ( this.props.account.emailVerified ) {
                InteractionManager.runAfterInteractions( () => {
                    this.props.unBindEmail( this.props.account.email, ( err, resBody ) => {
                        this.setState( {
                            isRequesting: false
                        } );
                    } )
                } )
            } else {
                InteractionManager.runAfterInteractions( () => {
                    this.props.resentVerifyEmail( this.state.email, ( err, resBody ) => {
                        this.setState( {
                            isRequesting: false
                        } );
                    } )
                } )
            }
        } else {
            if ( this.validateEmail( this.state.email ) ) {
                this.setState( {
                    isRequesting: true
                } );

                InteractionManager.runAfterInteractions( () => {
                    this.props.bindEmail( this.state.email, ( err, resBody ) => {
                        if ( err ) {
                            if ( err.message ) {
                                Toast.show( err.message, { position: Toast.positions.CENTER } )
                            } else {
                                Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } )
                            }
                        } else {
                            Toast.show( I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } )
                        }

                        this.setState( {
                            isRequesting: false
                        } );
                    } )
                } )
            } else {
                Toast.show( I18n.t( Keys.email_format_error ), { position: Toast.positions.CENTER } )
            }

        }
    }


    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View
                    style={[ commonStyles.commonBG2, Platform.OS === 'ios' ? { height: this.state.visibleHeight } : commonStyles.wrapper ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, styles.hintText ]}
                    >
                        {
                            I18n.t( Keys.email_address )
                        }
                    </Text>

                    <View
                        style={[ styles.itemHeight, {
                            backgroundColor: "#FFFFFF",
                            justifyContent: 'center'
                        } ]}
                    >
                        <TextInput
                            ref={( view ) => {
                                this._textInput = view;
                            }}
                            style={[ commonStyles.commonInputTextStyle, styles.marginLR ]}
                            onChangeText={( text ) => {
                                this._onChangeText( text )
                            }}
                            editable={!this.props.account.emailVerified}
                            padding={0}
                            keyboardType={'email-address'}
                            underlineColorAndroid={'transparent'}
                            defaultValue={this.state.email}
                            onSubmitEditing={() => {
                                if ( this.state.email ) {
                                    this._textInput.blur();
                                    this._onTapButton();
                                }
                            }}
                        />

                    </View>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, styles.hintText ]}
                    >
                        {!this.props.account.email ?
                            null
                            :
                            (
                                this.props.account.emailVerified ?
                                    I18n.t( Keys.change_email_hint )
                                    :
                                    I18n.t( Keys.verify_email_hint )
                            )
                        }
                    </Text>

                    <View style={{ flex: 1 }}></View>

                    {
                        //不实现解绑功能
                        this.props.account.emailVerified ?
                            null
                            :
                            <Button
                                containerStyle={[
                                    this.state.email ?
                                        commonStyles.buttonContainerStyle
                                        :
                                        commonStyles.buttonContainerDisabledStyle,
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
                                    this._onTapButton();
                                    this._textInput.blur();
                                }}
                                title={null}
                                disabled={!this.state.email}>
                                {!this.props.account.email || this.props.account.email !== this.state.email ?
                                    I18n.t( Keys.bind )
                                    :
                                    (
                                        this.props.account.emailVerified ?
                                            I18n.t( Keys.unbind )
                                            :
                                            I18n.t( Keys.verify_email_resent )

                                    )
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