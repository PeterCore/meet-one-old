import React from "react";
import { Dimensions, Image, Modal, Text, TouchableHighlight, View, ScrollView, TouchableOpacity } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";
import IconSet from "../../../components/IconSet";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSTransactionsConfirmComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        isExternal: PropTypes.bool,
        canSkip: PropTypes.bool, // 关闭Dapp前不再提示
        skipActionNames: PropTypes.array,
        onConfirm: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        data: PropTypes.object,
        // 交易元数据
        transactionRawData: PropTypes.array
    };

    static defaultProps = {
        transactionRawData: null,
        canSkip: false
    }

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen,
            isRemember: false,
        };

    }

    componentWillReceiveProps( nextProps ) {
        if (nextProps.isOpen !== this.state.isOpen) {
            // 如果有`关闭Dapp前不再提示`的选项并且用户选择记住该合约的话，则执行这个逻辑
            if (this.props.canSkip && this.state.isRemember && nextProps.isOpen) {
                let currentActionName = "";
                if (this.props.transactionRawData) {
                    currentActionName = this.props.transactionRawData[0] && this.props.transactionRawData[0].name;
                }
                if (this.props.skipActionNames.includes(currentActionName)) {
                    AnalyticsUtil.onEvent('WAwhitelist');
                    this.closeModal(0);
                    this.props.onConfirm && this.props.onConfirm({});
                } else {
                    // 如果用户没有勾选记住该合约的话，则显示对话确认框
                    this.setState({ isOpen: nextProps.isOpen });
                }
            } else {
                // 显示确认框
                this.setState({ isOpen: nextProps.isOpen });
            }
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
                    }, commonStyles.wrapper ]}>
                        { content }
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

        const screenHeight = Dimensions.get('window').height;
        const screenWidth = Dimensions.get('window').width;

        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <View style={[ { height: screenHeight } ]}>
                    <PopupDialog
                        onDismissed={() => {
                            this.closeModal(-1);
                        }}
                        height={'auto'}
                        width={'100%'}
                        dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                        show={this.state.isOpen} >
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

                            {
                                this.props.transactionRawData ?
                                (
                                    <View style={{
                                        paddingTop: 5,
                                        paddingHorizontal: 10,
                                    }}>
                                        <Text style={{
                                            fontSize: 18
                                        }}>Transaction Raw Data</Text>
                                        <ScrollView style={{
                                            height: this.props.canSkip ? screenHeight * 0.25 : screenHeight * 0.30
                                        }}>
                                            <View style={{ }}>
                                                <Text>
                                                    {JSON.stringify(this.props.transactionRawData, null, 4)}
                                                </Text>
                                            </View>
                                        </ScrollView>
                                    </View>

                                ) : null
                            }

                            {this.props.isExternal && this.props.data ?
                                <View>
                                    {/* 标题 */}
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
                                                {/* 标题 */}
                                                {this.props.data.description ? this.props.data.description : I18n.t( Keys.wait_to_confirm_transaction )}
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
                                </View> : null
                            }

                            {
                                this.props.canSkip ?
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            this.setState({
                                                isRemember: !this.state.isRemember
                                            }, () => {
                                                // this.props.skipCallback && this.props.skipCallback();
                                            });
                                        }}>
                                        <View
                                            style={{
                                                paddingLeft: 15,
                                                paddingRight: 15,
                                                paddingTop: 10,
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
                                                {I18n.t(Keys.remember_actions_tips)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                : null
                            }


                            <Button
                                containerStyle={[
                                    commonStyles.buttonContainerStyle, {
                                        height: 50,
                                        marginTop: this.props.isExternal ? (this.props.canSkip ? 10 : 10) : 20,
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
                                        const transactionRawData = this.props.transactionRawData && this.props.transactionRawData[0];
                                        const name = transactionRawData && transactionRawData.name || '';
                                        this.props.onConfirm({
                                            isRemember: this.state.isRemember,
                                            actionName: name
                                        });
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

export default connect( select )( EOSTransactionsConfirmComponent );
