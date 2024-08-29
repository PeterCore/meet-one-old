import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import commonStyles from "../../../styles/commonStyles";
import BottomLineTextInput from "../../../components/BottomLineTextInput";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Toast from "react-native-root-toast";

class ForgotPasswordView extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            phone: ""
        }
    }

    _nextStep() {
        if ( this.state.phone ) {
            this.props.onNextStep( this.props.country.CountryISOCode, `${this.props.country.MobileCode}${this.state.phone}` );
        } else {
            Toast.show( I18n.t( Keys.pls_input_phone ), { position: Toast.positions.CENTER } );
        }
    }

    render() {
        return (
            <View style={[ this.props.style ]}>
                <View style={[ { height: 45 }, commonStyles.mgt_normal, commonStyles.mgl_normal ]}>
                    <Text style={[ { fontSize: 32, fontWeight: 'bold' }, commonStyles.commonTextColorStyle ]}>
                        {
                            `${I18n.t( Keys.forgot_password )}?`
                        }
                    </Text>
                </View>

                <Text
                    style={[ commonStyles.commonTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, {
                        marginTop: 4,
                        lineHeight: 24
                    } ]}>
                    {
                        I18n.t( Keys.forgot_password_hint )
                    }
                </Text>

                <Text
                    style={[ commonStyles.commonSubTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, {
                        marginTop: 40,
                    } ]}>
                    {
                        I18n.t( Keys.phone_number )
                    }
                </Text>

                <BottomLineTextInput
                    style={[ commonStyles.mgl_normal, commonStyles.mgr_normal, { marginTop: 10 } ]}
                    onChangeText={( text ) => {
                        this.setState( { phone: text } )
                    }}
                    returnKeyType={'next'}
                    returnKeyLabel={I18n.t( Keys.next )}
                    onSubmitEditing={() => {
                        this._nextStep();
                    }}
                    keyboardType={'numeric'}
                    leftElement={
                        <TouchableOpacity
                            onPress={() => {
                                this.props.onTapCountryCode();
                            }}
                            style={[ commonStyles.justAlignCenter, styles.countryCodeContainer, { marginRight: 10 } ]}>
                            <Text
                                style={[ styles.countryCodeText ]}
                            >+{this.props.country.MobileCode}</Text>
                        </TouchableOpacity>
                    }
                />


                <View
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}
                >

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
                                I18n.t( Keys.next_step )
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

const styles = StyleSheet.create( {
    countryCodeContainer: {
        height: 28,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10

    },
    countryCodeText: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center'
    }
} );

export default ForgotPasswordView