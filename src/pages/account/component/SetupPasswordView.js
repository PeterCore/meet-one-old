import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import commonStyles from "../../../styles/commonStyles";
import BottomLineTextInput from "../../../components/BottomLineTextInput";
import constStyles from "../../../styles/constStyles";
import Keys from "../../../configs/Keys";
import I18n from "../../../I18n";
import Toast from "react-native-root-toast";


class SetupPasswordView extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            password: ""
        }
    }

    _nextStep() {
        if ( /^(?:\\d+|[0-9]+|[a-zA-Z]+|[!@#$%^&*]+){8,16}$/.test( this.state.password ) ) {
            this.props.onNextStep( this.state.password );
        } else {
            Toast.show( I18n.t( Keys.password_format_hint ), { position: Toast.positions.CENTER } )
        }
    }

    render() {
        return (
            <View style={[ this.props.style ]}>
                <View style={[ { height: 45 }, commonStyles.mgt_normal, commonStyles.mgl_normal ]}>
                    <Text style={[ { fontSize: 32, fontWeight: 'bold' }, commonStyles.commonTextColorStyle ]}>
                        {
                            I18n.t( Keys.set_password )
                        }
                    </Text>
                </View>

                <Text
                    style={[ commonStyles.commonTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, {
                        marginTop: 4,
                        lineHeight: 24
                    } ]}>
                    {
                        I18n.t( Keys.set_password_hint )
                    }
                </Text>

                <Text
                    style={[ commonStyles.commonSubTextStyle, commonStyles.mgl_normal, commonStyles.mgr_normal, { marginTop: 40 } ]}>
                    {
                        I18n.t( Keys.password )
                    }
                </Text>

                <BottomLineTextInput
                    style={[ commonStyles.mgl_normal, commonStyles.mgr_normal, { marginTop: 10 } ]}
                    asPassword={true}
                    maxLength={16}
                    returnKeyType={'next'}
                    returnKeyLabel={I18n.t( Keys.next )}
                    onSubmitEditing={() => {
                        this._nextStep();
                    }}
                    onChangeText={( text ) => {
                        this.setState( {
                            password: text
                        } )
                    }}
                />

                <View
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}
                >

                    <View style={{ flex: 1 }}/>

                    <TouchableOpacity
                        disabled={!this.state.password || this.state.password.length < 8}
                        style={[ commonStyles.buttonRoundContainerStyle, commonStyles.mgr_normal, commonStyles.mgb_normal, {
                            backgroundColor: !this.state.password || this.state.password.length < 8 ? constStyles.DISABLED_BG_COLOR : constStyles.THEME_COLOR
                        } ]}
                        onPress={() => {
                            this._nextStep();
                        }}>
                        <Text
                            style={[ {
                                color: 'white',
                                textAlign: 'center',
                                fontSize: 18
                            } ]}>
                            {
                                I18n.t( Keys.complete )
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

export default SetupPasswordView