import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import commonStyles from "../../../styles/commonStyles";
import BottomLineTextInput from "../../../components/BottomLineTextInput";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import format from "string-format";
import Toast from "react-native-root-toast";


class PhoneVerifyView extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            token: null,
            getTokenButtonDisabledTime: 60,
            getTokenButtonDisabled: true,
        }
    }

    componentWillUnmount() {
        this.timer && clearTimeout( this.timer );
    }

    startTimer() {
        this.timer && clearTimeout( this.timer );
        this.timer = setInterval(
            () => {
                this.handlerRefreshTokenTimer();
            },
            1000
        );
    }

    handlerRefreshTokenTimer() {
        if ( this.state.getTokenButtonDisabledTime > 1 ) {
            this.setState( {
                getTokenButtonDisabledTime: (this.state.getTokenButtonDisabledTime - 1),
                getTokenButtonDisabled: true
            } );

            // this.onGetTokenSuccess();
        }
        else {
            this.timer && clearTimeout( this.timer );
            this.setState( { getTokenButtonDisabled: false } );
        }
    }

    componentWillMount() {
        console.log( "componentWillMount" );
        this.startTimer();
    }

    _nextStep() {
        if ( !this.state.token ) {
            Toast.show( I18n.t( Keys.pls_input_token ), { position: Toast.positions.CENTER } )
        } else {
            this.props.onNextStep( this.state.token );
        }
    }

    render() {
        return (
            <View style={[ this.props.style ]}>
                <View style={[ { height: 45 }, commonStyles.mgt_normal, commonStyles.mgl_normal ]}>
                    <Text style={[ { fontSize: 32, fontWeight: 'bold' }, commonStyles.commonTextColorStyle ]}>
                        {
                            I18n.t( Keys.verify_phone )
                        }
                    </Text>
                </View>

                <Text
                    style={[ commonStyles.commonTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, {
                        marginTop: 4,
                        lineHeight: 24
                    } ]}>
                    {

                        format( I18n.t( Keys.sent_verify_code_hint ), this.props.phone )
                    }
                </Text>

                <Text
                    style={[ commonStyles.commonSubTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, { marginTop: 40 } ]}>
                    {
                        I18n.t( Keys.verify_code )
                    }
                </Text>

                <BottomLineTextInput
                    style={[ commonStyles.mgl_normal, commonStyles.mgr_normal, { marginTop: 10 } ]}
                    onChangeText={( text ) => {
                        this.setState( { token: text } )
                    }}
                    returnKeyType={'next'}
                    returnKeyLabel={I18n.t( Keys.next )}
                    onSubmitEditing={() => {
                        this._nextStep();
                    }}
                />

                <View
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}
                >

                    <TouchableOpacity
                        disabled={this.state.getTokenButtonDisabled}
                        onPress={() => {
                            this.props.resendVerifyCode( ( isSuccess ) => {
                                if ( isSuccess ) {
                                    this.setState( {
                                        getTokenButtonDisabledTime: 60,
                                        getTokenButtonDisabled: true,
                                    } );
                                    this.startTimer();
                                }
                            } )
                        }}>
                        <Text
                            style={[ commonStyles.commonSubTextStyle, commonStyles.mgl_normal, {
                                color: this.state.getTokenButtonDisabled ? '#B5B5B5' : constStyles.THEME_COLOR,
                                marginBottom: 31
                            } ]}>
                            {
                                this.state.getTokenButtonDisabled ?
                                    format( I18n.t( Keys.resend_count_down ), this.state.getTokenButtonDisabledTime )
                                    :
                                    I18n.t( Keys.resend )
                            }
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}/>

                    <TouchableOpacity
                        style={[ commonStyles.buttonRoundContainerStyle, commonStyles.mgr_normal, commonStyles.mgb_normal ]}
                        onPress={() => {
                            this._nextStep()
                        }}>
                        <Text
                            style={[ {
                                color: 'white',
                                textAlign: 'center',
                                fontSize: 18
                            } ]}>
                            {
                                I18n.t( Keys.verify )
                            }
                        </Text>
                        <Image
                            style={[ { width: 7, height: 14, marginLeft: 10 } ]}
                            source={require( '../../../imgs/login_icon_arrow.png' )}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create( {} );

export default PhoneVerifyView