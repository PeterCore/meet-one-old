import React from "react";
import { Dimensions, Image, Modal, Text, TextInput, TouchableHighlight, View, TouchableOpacity, Alert } from "react-native";
import commonStyles from "../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import I18n from "../I18n";
import Keys from "../configs/Keys";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as env from "../env";
import Util from "../util/Util";
import Toast from "react-native-root-toast";
import TextUtil from "../util/TextUtil";
import DEBUG_DATA from "../DEBUG_DATA";
import eosActionTypes from "../reducers/eos/eosActionTypes";
import IconSet from "./IconSet";
import settingActionTypes from "../reducers/setting/settingActionTypes";

class PasswordInputComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onResult: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        // 是否显示记住密码的选项 - default is `true`
        showRememberOptions: PropTypes.bool
    };

    static defaultProps = {
        showRememberOptions: true
    }

    constructor( props ) {
        super( props );

        this.state = {
            password: env.IS_DEBUG ? DEBUG_DATA.password : '',
            isOpen: props.isOpen,
            // 是否记住密码 - default is `false`
            isRemember: props.isRememberPassword
        };
    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.isOpen !== this.state.isOpen) {
            this.setState({
                isOpen: nextProps.isOpen
            });
        }
    }


    closeModal(code) {
        if ( this.props.onClose ) {
            this.props.onClose(code);
        }

        this.setState(
            {
                isOpen: false,
                password: env.IS_DEBUG ? DEBUG_DATA.password : ''
            }
        );
    }

    // 点击提交
    _submit() {

        if ( TextUtil.isEmpty( this.state.password ) ) {
            Toast.show( I18n.t( Keys.please_input_verify_password ), { position: Toast.positions.CENTER } );
            return;
        }

        if (this.state.isRemember) {
            const that = this;
            // 记住密码，操作前做一次提示弹窗提示
            Alert.alert(
                I18n.t(Keys.notice),
                I18n.t(Keys.remember_password_notice),
                [
                    {text: I18n.t(Keys.cancel), onPress: () => {
                        this.setState({
                            isRemember: false
                        }, () => {
                            this.props.dispatch({
                                type: settingActionTypes.APPLICATION_REMEMBER_PASSWORD,
                                isRememberPassword: false
                            });
                        });
                    }},
                    {text: I18n.t(Keys.ok), onPress: () => {
                        this.setState({
                            isRemember: true,
                        }, () => {
                            this.props.dispatch({
                                type: settingActionTypes.APPLICATION_REMEMBER_PASSWORD,
                                isRememberPassword: true
                            });
                        });
                        // 提交
                        if ( that.props.onResult ) {
                            // remember the password
                            // then EOSAction.verifyPassword will verify the password correct or not.
                            // if not, EOSAction will dispatch EOS_UPDATE_PSW to reset the password to null
                            if (that.state.isRemember) {
                                // 对tempPsw进行一层加密
                                const tempPsw = Util.encryptTempPsw(that.state.password);
                                that.props.dispatch && that.props.dispatch({
                                    type: eosActionTypes.EOS_UPDATE_PSW,
                                    tempPsw
                                });
                            }
                            that.props.onResult( that.state.password, that.state.isRemember );
                        }
                        that.closeModal(0);
                    }},
                ]
            )
        } else {
            // 提交逻辑同上
            if ( this.props.onResult ) {
                if (this.state.isRemember) {
                    const tempPsw = Util.encryptTempPsw(this.state.password);
                    this.props.dispatch && this.props.dispatch({
                        type: eosActionTypes.EOS_UPDATE_PSW,
                        tempPsw
                    });
                }
                this.props.onResult( this.state.password, this.state.isRemember );
                this.closeModal(0);
            }
        }
    }

    render() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen} >
                <KeyboardAwareScrollView
                    style={[ { height: Dimensions.get( 'window' ).height } ]} >
                    <View style={[ { height: Dimensions.get( 'window' ).height } ]}>
                        <PopupDialog
                            onDismissed={() => {
                                this.closeModal(-1);
                            }}
                            width={Dimensions.get( 'window' ).width}
                            height={
                                this.props.showRememberOptions ? 199 : 169
                            }
                            dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                            show={this.state.isOpen} >
                            <View style={[ { } ]}>
                                <View style={[ commonStyles.mgl_normal, {
                                    flexDirection: 'row',
                                    height: 44,
                                } ]}>
                                    <Text style={[ {
                                        fontSize: 16,
                                        marginTop: 14
                                    }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.verify_wallet_password )}</Text>
                                    <TouchableHighlight
                                        underlayColor='#ddd'
                                        onPress={() => {
                                            this.closeModal(-1)
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
                                                source={require( '../imgs/all_btn_close_modal.png' )}
                                                style={[ { width: 14, height: 14 } ]} />
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                                <View style={[ {
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                    paddingTop: 30,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap'
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
                                        onChangeText={( text ) => this.setState( { password: text } )}
                                        placeholder={I18n.t( Keys.wallet_password )}
                                        defaultValue={this.state.password}
                                        secureTextEntry={true}
                                        keyboardType={'default'}
                                        autoFocus={true}
                                        // 点击return/submit/search等触发提交逻辑
                                        onSubmitEditing={() => {this._submit()}} />
                                    <Button
                                        containerStyle={[
                                            commonStyles.buttonContainerStyle, {
                                                height: 44,
                                                width: 84,
                                                marginLeft: 10,
                                                backgroundColor: '#4A4A4A'
                                            }
                                        ]}
                                        style={[ commonStyles.buttonContentStyle ]}
                                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                        onPress={() => {this._submit()}}
                                        title={null}
                                        disabled={false}>
                                        { I18n.t( Keys.submit ) }
                                    </Button>
                                </View>

                                {/* 退出应用前免解锁 -> showRememberOptions === true */}
                                {
                                    this.props.showRememberOptions ?
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onPress={() => {
                                                this.setState({
                                                    isRemember: !this.state.isRemember
                                                }, () => {
                                                    this.props.dispatch({
                                                        type: settingActionTypes.APPLICATION_REMEMBER_PASSWORD,
                                                        isRememberPassword: this.state.isRemember
                                                    });
                                                });
                                            }}>
                                            <View
                                                style={{
                                                    paddingLeft: 15,
                                                    paddingRight: 15,
                                                    paddingVertical: 20,
                                                    flexDirection: 'row',
                                                }}>
                                                {/* ICON */}
                                                <IconSet
                                                    name={
                                                        this.state.isRemember ? "icon-backcopy3" : "icon-all_icon_checkbox_of"
                                                    }
                                                    style={{
                                                        color: '#1ACE9A',
                                                        fontSize: 16,
                                                        paddingTop: 2
                                                    }}
                                                />
                                                {/* 文本 */}
                                                <Text
                                                    style={{
                                                        paddingLeft: 5,
                                                        color: '#323232',
                                                        fontSize: 16,
                                                        lineHeight: 20,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                    {I18n.t(Keys.remember_password_tips)}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    : null
                                }
                            </View>
                        </PopupDialog>
                    </View>
                </KeyboardAwareScrollView>
            </Modal>
        );
    }
}

function select( store ) {
    return {
        isRememberPassword: store.settingStore.isRememberPassword
    }
}

export default connect( select )( PasswordInputComponent );
