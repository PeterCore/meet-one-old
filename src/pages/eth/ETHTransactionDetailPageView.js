import React, { Component } from 'react';
import { ScrollView, Text, View, Clipboard, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Toast from "react-native-root-toast";
import commonStyles from "../../styles/commonStyles";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import ERC20TokenMap from "../../../data/ERC20TokenMap";
import moment from "moment/moment";
import ETHWalletUtil from "../../util/ETHWalletUtil";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTransactionDetailPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.transaction_detail ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {}
    }


    componentWillMount() {

    }

    renderItem( title, content, hasTopInterval, hasBottomInterval ) {
        return (
            <View>
                {
                    hasTopInterval ?
                        <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                        :
                        null
                }

                <TouchableOpacity
                    onPress={() => {
                        Clipboard.setString(String(content));
                        Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                    }}
                    style={[{
                        height: 64,
                        paddingLeft: 15,
                        paddingRight: 15,
                        backgroundColor: 'white',
                        flexDirection: 'row'
                    }, commonStyles.justAlignCenter ]}>
                    <Text style={[ commonStyles.commonTextStyle, { fontSize: 20 } ]}>
                        {
                            title
                        }
                    </Text>

                    <Text style={[ commonStyles.commonSmallSubTextStyle, {
                        fontSize: 20,
                        marginLeft: 10,
                        textAlign: 'right'
                    }, commonStyles.wrapper ]}
                          numberOfLines={1}
                    >
                        {
                            content
                        }
                    </Text>
                </TouchableOpacity>

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
        if ( !this.props.transaction ) {
            return <View/>
        }


        const options = {
            commify: true,
        };

        const balanceShow = this.props.token === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( '' + this.props.transaction.balance, options ) :
            ETHWalletUtil.formatDisplayTokenBalance( '' + this.props.transaction.balance, ERC20TokenMap[ this.props.token ].decimals, options );

        const timestamp = utils.bigNumberify( this.props.transaction.timeStamp ).toNumber() * 1000;


        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <ScrollView>
                        <View style={[ { paddingTop: 20, paddingBottom: 20, } ]}>
                            <Text
                                style={[ {
                                    fontSize: 20,
                                    textAlign: 'center',
                                }, commonStyles.commonSubTextColorStyle ]}>
                                {
                                    (utils.getAddress( this.props.transaction.addressFrom ) === utils.getAddress( this.props.account.jsonWallet.address ) ? ('-' + balanceShow) : ('+' + balanceShow)) + ' ' + this.props.token
                                }
                            </Text>

                            <Text style={[ {
                                fontSize: 16,
                                textAlign: 'center',
                                color: this.props.transaction.isSuccess ? '#888888' : '#F65858',
                                marginTop: 10,
                                marginBottom: 20
                            } ]}>
                                {this.props.transaction.isSuccess ? I18n.t( Keys.success_to_transfer ) : I18n.t( Keys.failed_to_transfer )}
                            </Text>

                            {
                                this.renderItem( I18n.t( Keys.receiver_address ), utils.getAddress( this.props.transaction.addressTo ), true, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.sender_address ), utils.getAddress( this.props.transaction.addressFrom ), true, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.miner_fee ),
                                    ETHWalletUtil.formatDisplayETHBalance( utils.bigNumberify( this.props.transaction.gasPrice ).mul( utils.bigNumberify( this.props.transaction.gasUsed ) ) ) + ' ether',
                                    true, true )
                            }

                            <View style={[ { height: 10 } ]}/>

                            {
                                this.renderItem( I18n.t( Keys.transaction_hash ), this.props.transaction.hash, true, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.block_number ), this.props.transaction.blockNumber, true, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.transaction_time ),
                                    moment( timestamp ).format( 'L' ) + ' ' + moment( timestamp ).format( 'HH:mm:ss' ),
                                    true, true )
                            }

                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHTransactionDetailPageView;
