import React from "react";
import { Dimensions, Image, Modal, Text, TouchableHighlight, View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import ethers from "ethers";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTransferConfirmComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
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

    componentWillMount() {

    }

    componentWillUnmount() {

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
                    <Text style={[ commonStyles.commonSubTextColorStyle, { fontSize: 14 } ]}>
                        {
                            title
                        }
                    </Text>

                    <Text style={[ commonStyles.commonTextStyle, {
                        fontSize: 16,
                        marginLeft: 10,
                        textAlign: 'right'
                    }, commonStyles.wrapper, ]}
                          numberOfLines={numberOfLines}
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
        let toAddress = this.props.data.toAddress;
        try {
            toAddress = this.props.data && this.props.data.toAddress ? utils.getAddress( this.props.data.toAddress ) : '';
        }
        catch ( err ) {
            console.log( err.message )
        }

        let receiverAddress = '';
        try {
            receiverAddress = this.props.data && this.props.data.fromAddress ? utils.getAddress( this.props.data.fromAddress ) : '';
        }
        catch ( err ) {
            console.log( err.message )
        }

        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <View style={[ { height: Dimensions.get( 'window' ).height } ]}>
                    <PopupDialog
                        onDismissed={() => {
                            this.closeModal();
                        }}
                        width={Dimensions.get( 'window' ).width}
                        height={385}
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
                                }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.order_confirm )}</Text>
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
                                            source={require( '../../../imgs/all_btn_close_modal.png' )}
                                            style={[ { width: 14, height: 14 } ]}
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                            {this.props.data ?
                                <View>
                                    {
                                        this.renderItem(
                                            I18n.t( Keys.receiver_address ),
                                            toAddress,
                                            false,
                                            true,
                                            64,
                                            2 )
                                    }
                                    {
                                        this.renderItem(
                                            I18n.t( Keys.sender_address ),
                                            receiverAddress,
                                            false,
                                            true,
                                            64,
                                            2 )
                                    }
                                    {
                                        this.renderItem(
                                            I18n.t( Keys.transaction_amount ),
                                            this.props.data.amount,
                                            false,
                                            true,
                                            44,
                                            1
                                        )
                                    }
                                    {
                                        this.renderItem(
                                            I18n.t( Keys.miner_fee ),
                                            this.props.data.miner_fee,
                                            false,
                                            true,
                                            44,
                                            1 )
                                    }
                                    {
                                        this.renderItem(
                                            I18n.t( Keys.remark ),
                                            this.props.data.remark,
                                            false,
                                            false,
                                            44,
                                            1
                                        )
                                    }
                                </View>
                                :
                                null
                            }

                            <Button
                                containerStyle={[
                                    commonStyles.buttonContainerStyle, {
                                        height: 44,
                                        marginTop: 20
                                    }
                                ]}
                                style={[ commonStyles.buttonContentStyle ]}
                                styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                onPress={() => {
                                    this.closeModal();

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

export default connect( select )( ETHTransferConfirmComponent );
