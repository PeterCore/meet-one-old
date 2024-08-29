import React from "react";
import { Dimensions, Image, Modal, Text, TextInput, TouchableHighlight, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import TextUtil from "../../util/TextUtil";
import Util from "../../util/Util";
import Toast from "react-native-root-toast";

class WebAddressInputComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onResult: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor( props ) {
        super( props );

        this.state = {
            address: '',
            isOpen: props.isOpen
        };
    }

    componentWillReceiveProps( nextProps ) {
        if (
            nextProps.isOpen !== this.state.isOpen
        ) {
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
                address: ''
            }
        );
    }

    _submit() {
        if ( TextUtil.isEmpty( this.state.address ) ) {
            return;
        }
        this.closeModal();
        if ( this.props.onResult ) {
            this.props.onResult( this.state.address );
        }
    }

    render() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <KeyboardAwareScrollView
                    style={[ { height: Dimensions.get( 'window' ).height } ]}
                >
                    <View style={[ { height: Dimensions.get( 'window' ).height } ]}>
                        <PopupDialog
                            onDismissed={() => {
                                this.closeModal();
                            }}
                            width={Dimensions.get( 'window' ).width}
                            height={169}
                            dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                            show={this.state.isOpen}
                        >
                            <View style={[ {} ]}>
                                <View style={[ commonStyles.mgl_normal, {
                                    flexDirection: 'row',
                                    height: 44
                                } ]}>
                                    <Text style={[ {
                                        fontSize: 16,
                                        marginTop: 14
                                    }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{ '请输入网页地址' }</Text>
                                    <TouchableHighlight
                                        underlayColor='#ddd'
                                        onPress={() => {
                                            this.closeModal()
                                        }}
                                        style={[ { height: 44, width: 44 } ]}>
                                        <View style={[
                                            commonStyles.wrapper,
                                            commonStyles.justAlignCenter,
                                            {
                                                alignItems: 'center', height: 44, width: 44
                                            }
                                        ]}>
                                            <Image
                                                source={require( '../../imgs/all_btn_close_modal.png' )}
                                                style={[ { width: 14, height: 14 } ]}
                                            />
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                                <View style={[ {
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                    paddingTop: 30,
                                    flexDirection: 'row'
                                } ]}>

                                    <TextInput
                                        style={[
                                            commonStyles.commonInput,
                                            {
                                                borderWidth: Util.getDpFromPx( 1 ),
                                                borderColor: '#e8e8e8',
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                            },
                                            commonStyles.wrapper
                                        ]}
                                        underlineColorAndroid={'transparent'}
                                        onChangeText={( text ) => this.setState( { address: text } )}
                                        placeholder={'请输入页面地址'}
                                        defaultValue={this.state.password}
                                        keyboardType={'default'}
                                        autoFocus={true}
                                        // 点击return/submit/search等触发提交逻辑
                                        onSubmitEditing={() => {this._submit()}}
                                    />

                                    <Button
                                        containerStyle={[
                                            commonStyles.buttonContainerStyle, {
                                                height: 44,
                                                width: 84,
                                                marginLeft: 10
                                            }
                                        ]}
                                        style={[ commonStyles.buttonContentStyle ]}
                                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                        onPress={() => {this._submit()}}
                                        title={null}
                                        disabled={false}>
                                        {'提交'}
                                    </Button>

                                </View>

                            </View>

                        </PopupDialog>
                    </View>
                </KeyboardAwareScrollView>
            </Modal>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( WebAddressInputComponent );
