import React, { Component } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import commonStyles from "../styles/commonStyles";


class BottomLineTextInput extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            borderBottomColor: '#B5B5B5',
            showPassword: false,
        }
    }

    _onChangeText( text ) {
        this.props.onChangeText && this.props.onChangeText( text )
    }

    _onFocus() {
        this.props.onFocus && this.props.onFocus();
        this.setState( {
            borderBottomColor: '#1ACE9A'
        } );
    }

    _onBlur() {
        this.props.onBlur && this.props.onBlur();
        this.setState( {
            borderBottomColor: '#B5B5B5'
        } );
    }

    focus() {
        if ( this._textInputView ) {
            this._textInputView.focus()
        }
    }

    blur() {
        if ( this._textInputView ) {
            this._textInputView.blur()
        }
    }


    render() {
        return (
            <View
                style={[ this.props.style, {
                    borderBottomColor: this.state.borderBottomColor,
                    borderBottomWidth: 1,
                    flexDirection: 'row',
                    paddingBottom: 10
                } ]}
            >

                {this.props.leftElement ? this.props.leftElement : null}

                <TextInput
                    ref={( view ) => {
                        this._textInputView = view;
                    }}
                    {...this.props}
                    style={[ commonStyles.commonInputTextStyle, this.props.inputStyle, { flex: 1 } ]}
                    onChangeText={( text ) => {
                        this._onChangeText( text )
                    }}
                    editable={true}
                    padding={0}
                    underlineColorAndroid={'transparent'}
                    secureTextEntry={this.props.asPassword && !this.state.showPassword}
                    onFocus={() => {
                        this._onFocus();
                    }}
                    onBlur={() => {
                        this._onBlur();
                    }}
                />

                {
                    this.props.asPassword ? (this.state.showPassword ?

                        <TouchableOpacity style={styles.passwordIconContainer}
                                          onPress={() => {
                                              this.setState( {
                                                  showPassword: false
                                              } )
                                          }}
                        >
                            <Image
                                source={require( '../imgs/login_pwd_display_on.png' )}
                                style={[ styles.passwordIcon ]}
                            />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.passwordIconContainer}
                                          onPress={() => {
                                              this.setState( {
                                                  showPassword: true
                                              } )
                                          }}>
                            <Image
                                source={require( '../imgs/login_pwd_display_off.png' )}
                                style={[ styles.passwordIcon ]}
                            />
                        </TouchableOpacity>)
                        :
                        null
                }

                {
                    this.props.showCheckMark ?
                        <Image
                            source={require( '../imgs/all_icon_selected.png' )}
                            style={[ styles.checkmark ]}
                        />
                        :
                        null
                }

            </View>
        );
    }
}


BottomLineTextInput.propTypes = {
    style: ViewPropTypes.style,
    inputStyle: ViewPropTypes.style,
    onChangeText: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    asPassword: PropTypes.bool,
    showCheckMark: PropTypes.bool,
    leftElement: PropTypes.element
};

BottomLineTextInput.defaultProps = {
    asPassword: false,
    showCheckMark: false,
    inputStyle: {}
};

const styles = StyleSheet.create( {
    passwordIconContainer: {
        padding: 6,
        alignSelf: 'flex-start'
    },
    passwordIcon: {
        width: 22,
        height: 22
    },

    checkmark: {
        alignSelf: 'center',
        width: 22,
        height: 22
    },
} );

export default BottomLineTextInput;