import React from "react";
import { Dimensions, Image, Keyboard, Modal, Text, TouchableOpacity, View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import PopupDialog from 'react-native-popup-dialog';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Verification from 'react-native-verification';
import BottomLineTextInput from "../../../components/BottomLineTextInput";


const SCREEN_HEIGHT = Dimensions.get( 'window' ).height;

class ImageVerifyInputComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onResult: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };
    _onKeyboardWillShow = ( e ) => {

        const visibleHeight = SCREEN_HEIGHT - e.endCoordinates.height;

        // if (Platform.OS === 'ios') {
        //     LayoutAnimation.configureNext( LayoutAnimation.create(
        //         e.duration,
        //         LayoutAnimation.Types[ e.easing ]
        //     ) );
        // }

        this.setState( {
            visibleHeight
        } );

        console.log( "_onKeyboardWillShow" )
    };
    _onKeyboardWillHide = () => {
        console.log( "_onKeyboardWillHide" )
        this.setState( {
            visibleHeight: SCREEN_HEIGHT,
        } );
    };

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen,
            code: "",
            visibleHeight: SCREEN_HEIGHT
        };
    }

    componentWillMount() {
        Keyboard.addListener( 'keyboardDidShow', this._onKeyboardWillShow );
        Keyboard.addListener( 'keyboardDidHide', this._onKeyboardWillHide );
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners( 'keyboardDidShow' );
        Keyboard.removeAllListeners( 'keyboardDidHide' );
    }

    componentDidMount() {
        if ( this._textInput ) {
            this._textInput.focus()
        }
    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.isOpen !== this.state.isOpen ) {
            this.setState( {
                isOpen: nextProps.isOpen
            } );
        }
    }


    closeModal() {
        if ( this.props.onClose ) {
            this.props.onClose();
        }

        this.setState(
            {
                isOpen: false,
            }
        );
    }

    render() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
                onRequestClose={() => {
                    this.closeModal()
                }}
            >

                {/*Dimensions.get( 'window' ).width - 80*/}
                <PopupDialog
                    containerStyle={[ {
                        height: this.state.visibleHeight
                    } ]}
                    onDismissed={() => {
                        this.closeModal();
                    }}
                    width={235}
                    height={205}
                    show={this.state.isOpen}
                >
                    <View style={[ commonStyles.justAlignCenter, {
                        flex: 1, paddingLeft: 32,
                        paddingRight: 32,
                    } ]}>
                        <Text
                            style={[ {
                                fontSize: 18,
                                textAlign: 'center',
                                marginBottom: 20
                            }, commonStyles.commonTextColorStyle ]}
                        >{I18n.t( Keys.pls_input_image_verify_code )}</Text>

                        <Verification
                            type={'number'}  //number - 数字验证    img - 图片验证
                            num={4} //num - 数字验证的数量
                            stringArr={[ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]}
                            getValue={( value ) => {
                                this.setState( {
                                    code: value
                                } )
                            }}  //返回内容，如果是数字验证，返回随机的内容，如果是图片验证，返回true／false

                        />

                        <BottomLineTextInput
                            ref={( view ) => {
                                this._textInput = view
                            }}
                            style={[ {
                                marginTop: 10
                            } ]}
                            inputStyle={{ textAlign: 'center' }}
                            maxLength={4}
                            keyboardType={'numeric'}
                            onChangeText={( text ) => {
                                if ( text && text === this.state.code ) {
                                    this.closeModal()
                                    this.props.onVerifySuccess && this.props.onVerifySuccess()
                                }
                            }}
                        />


                        <TouchableOpacity
                            style={[ commonStyles.justAlignCenter,
                                {
                                    position: 'absolute',
                                    top: 0,
                                    left: 235 - 40,
                                    width: 40,
                                    height: 40
                                }
                            ]}
                            onPress={() => {
                                this.closeModal()
                            }}>
                            <Image
                                source={require( '../../../imgs/all_btn_close_modal.png' )}
                                style={{
                                    width: 10,
                                    height: 10
                                }}
                            >

                            </Image>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>

            </Modal>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( ImageVerifyInputComponent );
