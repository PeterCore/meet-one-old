import React from "react";
import { Dimensions, Image, Modal, Text, TouchableHighlight, View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";

class EOSTransferConfirmComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        isExternal: PropTypes.bool,
        onConfirm: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        data: PropTypes.object
    };

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen
        };
    }

    componentWillMount() { }

    componentWillUnmount() { }

    componentWillReceiveProps( nextProps ) {
        if (nextProps.isOpen !== this.state.isOpen) {
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
            }
        );
    }

    renderItem( title, content, hasTopInterval, hasBottomInterval, height, numberOfLines ) {
        return (
            <View>
                {
                    hasTopInterval ?
                        <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                        :
                        null
                }

                <View style={[
                    {
                        height: height,
                        paddingLeft: 15,
                        paddingRight: 15,
                        backgroundColor: 'white',
                        flexDirection: 'row'
                    },
                    commonStyles.justAlignCenter ]}>
                    <Text style={[ commonStyles.commonSubTextColorStyle, { fontSize: 16, width: 80 } ]}>
                        {
                            title
                        }
                    </Text>

                    <Text style={[ commonStyles.commonTextStyle, {
                        fontSize: 16,
                        marginLeft: 15,
                        textAlign: 'left'
                    }, commonStyles.wrapper ]}
                        // numberOfLines={numberOfLines}
                        >
                        {
                            content
                        }
                    </Text>
                </View>

                {
                    hasBottomInterval ?
                        <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                        :
                        null
                }
            </View>
        );
    }

    render() {

        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <View style={[ { height: Dimensions.get( 'window' ).height } ]}>
                    <PopupDialog
                        onDismissed={() => {
                            this.closeModal(-1);
                        }}
                        height={'auto'}
                        width={'100%'}
                        dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                        show={this.state.isOpen}
                    >
                        <View style={[ {} ]}>
                            <View style={[ commonStyles.mgl_normal, {
                                flexDirection: 'row',
                                height: 50,
                                marginLeft: 15
                            } ]}>
                                <Text style={[ {
                                    fontSize: 16,
                                    alignSelf: 'center',
                                    fontWeight: '600',
                                }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.order_confirm )}{this.props.data && this.props.data.dappName ? ' - ' + this.props.data.dappName : ''}</Text>
                                <TouchableHighlight
                                    underlayColor='#ddd'
                                    onPress={() => {
                                        this.closeModal(-1)
                                    }}
                                    style={[ { height: 50, width: 44 } ]}>
                                    <View style={[
                                        commonStyles.wrapper,
                                        commonStyles.justAlignCenter,
                                        {
                                            alignItems: 'center', height: 50, width: 44
                                        }
                                    ]}>
                                        <Image
                                            source={require( '../../../imgs/all_btn_close_modal.png' )}
                                            style={[ { width: 14, height: 14 } ]}
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                            {!this.props.isExternal && this.props.data ?
                                <View>
                                    {
                                        this.props.data.toAddress ? this.renderItem(
                                            I18n.t( Keys.eos_receiver_address ),
                                            this.props.data.toAddress,
                                            false,
                                            true,
                                            50,
                                            1 ) : null
                                    }
                                    {
                                        this.props.data.fromAddress ? this.renderItem(
                                            I18n.t( Keys.eos_sender_address ),
                                            this.props.data.fromAddress,
                                            false,
                                            true,
                                            50,
                                            1 ) : null
                                    }
                                    {
                                        this.props.data.amount ? this.renderItem(
                                            I18n.t( Keys.transaction_amount ),
                                            this.props.data.amount,
                                            false,
                                            true,
                                            50,
                                            1
                                        ) : null
                                    }
                                    {
                                        this.props.data.remark ? this.renderItem(
                                            I18n.t( Keys.eos_remark ),
                                            this.props.data.remark,
                                            false,
                                            false,
                                            50,
                                            1
                                        ) : null
                                    }
                                </View>
                                :
                                null
                            }

                            {this.props.isExternal && this.props.data ?
                                <View>
                                    {/* 支付金额 */}
                                    <View>
                                        <View style={[
                                            {
                                                height: 80,
                                                paddingLeft: 15,
                                                paddingRight: 15,
                                                backgroundColor: 'white',
                                                flexDirection: 'row'
                                            },commonStyles.justAlignCenter ]}>
                                            <Text style={[ commonStyles.titleText, commonStyles.commonTextStyle, {fontSize: 32, width: '100%'}]}>
                                                {/* 金额 */}
                                                {Number(this.props.data.amount).toFixed(this.props.data.tokenPrecision)} <Text style={{
                                                    fontSize: 20,
                                                    color: '#141414',
                                                }}>
                                                {/* 单位 */}
                                                {this.props.data.tokenName}
                                                </Text>
                                            </Text>
                                        </View>
                                    </View>
                                    {/* 支付帐号 */}
                                    {
                                        this.props.data.from ? this.renderItem(
                                            I18n.t(Keys.eos_sender_address),
                                            this.props.data.from.accountName ? this.props.data.from.accountName : "",
                                            false,
                                            true,
                                            50,
                                            1 ) : null
                                    }
                                    {/* 收款帐号 */}
                                    {
                                        this.props.data.to ? this.renderItem(
                                            I18n.t(Keys.eos_receiver_address),
                                            this.props.data.to,
                                            false,
                                            true,
                                            50,
                                            1 ) : null
                                    }
                                    {/* 订单信息 */}
                                    {
                                        this.props.data.orderInfo ? this.renderItem(
                                            I18n.t(Keys.eos_order_info),
                                            this.props.data.orderInfo,
                                            false,
                                            true,
                                            50,
                                            1 ) : null
                                    }
                                </View> : null
                            }


                            <Button
                                containerStyle={[
                                    commonStyles.buttonContainerStyle, {
                                        height: 50,
                                        marginTop: this.props.isExternal ? 30 : 20,
                                        backgroundColor: "#3D4144",
                                        marginLeft: 15,
                                        marginRight: 15,
                                        marginBottom: 40
                                    }
                                ]}
                                style={[ commonStyles.buttonContentStyle ]}
                                styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                onPress={() => {
                                    this.closeModal(0);

                                    if ( this.props.onConfirm ) {
                                        this.props.onConfirm();
                                    }
                                }}
                                title={null}
                                disabled={false}>
                                {I18n.t( Keys.ok )}
                            </Button>

                        </View>

                    </PopupDialog>
                </View>
            </Modal>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( EOSTransferConfirmComponent );
