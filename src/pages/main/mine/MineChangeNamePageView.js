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

export default class MineChangeNamePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.change_name ),
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
            username: this.props.account.username,
            isRequesting: false,
            errText: null,
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

    componentDidMount() {
        console.log( 'componentDidMount' );
    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true
    }

    _onTapButton() {
        this.setState( {
            isRequesting: true
        } )
        InteractionManager.runAfterInteractions( () => {
            this.props.onSetUserName( this.state.username, ( err, resBody ) => {
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
                    Toast.show( I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } )
                }
            } )
        } )
    }

    _onChangeText( text ) {
        this.setState( {
            username: text
        } )
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
                            I18n.t( Keys.user_name )
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
                                this._inputText = view
                            }}
                            style={[ commonStyles.commonInputTextStyle, styles.marginLR ]}
                            onChangeText={( text ) => {
                                this._onChangeText( text )
                            }}
                            padding={0}
                            keyboardType={'default'}
                            maxLength={12}
                            returnKeyType={'done'}
                            underlineColorAndroid={'transparent'}
                            defaultValue={this.state.username}
                            onSubmitEditing={() => {
                                if ( !!this.state.username && this.state.username !== this.props.account.username ) {
                                    this._inputText.blur();
                                    this._onTapButton();
                                }
                            }}
                        />
                    </View>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, styles.hintText ]}
                    >
                        {this.state.errText}
                    </Text>

                    <View style={{ flex: 1 }}></View>

                    {
                        <Button
                            containerStyle={[
                                !!this.state.username && this.state.username !== this.props.account.username ?
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
                                this._inputText.blur();
                                this._onTapButton();
                            }}
                            title={null}
                            disabled={!(!!this.state.username && this.state.username !== this.props.account.username)}>
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