import React, { Component } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Toast from "react-native-root-toast";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

const moment = require('moment-timezone');
const DeviceInfo = require('react-native-device-info');
const timezone = DeviceInfo.getTimezone();
class EOSTransactionDetailPageView extends Component {
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

    componentDidMount() {
        AnalyticsUtil.onEvent('WAtransactiondetail');
    }

    renderItem( title, content, hasTopInterval, hasBottomInterval, longPress ) {
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
                        if (!longPress) {
                            Clipboard.setString(String(content));
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        } else {

                            if (this.props.netType === 'EOS') {
                                this.props.navigation.navigate( 'WebViewPage',
                                {
                                    url: "https://eosflare.io/tx/" + String(content)
                                } )
                            } else {
                                Clipboard.setString(String(content));
                                Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                            }
                        }
                    }}
                    onLongPress={() => {
                        if (longPress) {
                            Clipboard.setString(String(content));
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }
                    }}
                    style={[{
                        paddingLeft: 15,
                        paddingRight: 15,
                        backgroundColor: 'white'
                    }, ]}>
                    <Text style={[ commonStyles.commonSmallSubTextStyle, {
                        fontSize: 14,
                        marginTop: 10,
                        marginBottom: 10,
                    }]}>
                        {
                            title
                        }
                    </Text>

                    <Text style={[ commonStyles.commonTextStyle, {
                        fontSize: 16,
                        marginBottom: 10,
                        lineHeight: 24,
                        flexWrap: 'wrap'
                    }, commonStyles.wrapper ]}
                        numberOfLines={10}>
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
        if ( !this.props.transData ) {
            return <View/>
        }

        const tokenInfo = {
            "icon": "https://static.ethte.com/artboard-png(2018-09-11T14:55:00+08:00).png",
            "name": this.props.transData.quantity.split(' ')[1],
            "sub_name": this.props.publisher,
            "publisher": this.props.publisher,
            "precision": (this.props.transData.quantity.split(' ')[0]).split('.')[1] && (this.props.transData.quantity.split(' ')[0]).split('.')[1].length || 0,
            "can_hide": 1,
            "isCustom": 1
        }

        const allTokens = this.props.allTokens;
        let hasAdded = false;

        if ( tokenInfo.publisher === 'eosio.token' || this.props.netType !== 'EOS' ) {
            hasAdded = true;
        } else {
            for (let i = 0; i < allTokens.length; i++) {
                if (allTokens[i].name === tokenInfo.name && allTokens[i].publisher === tokenInfo.publisher) {
                    hasAdded = true;
                    break;
                }
            }
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <ScrollView>
                        <View style={[ { paddingTop: 20, paddingBottom: 20, } ]}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginBottom: 30
                            }}>
                                <Text style={[ {
                                        fontSize: 32,
                                        textAlign: 'center',
                                        fontFamily: 'DIN'
                                    }, commonStyles.commonTextColorStyle ]}>
                                    { (this.props.transData.from === this.props.account.account_name ? '-' : '+') + this.props.transData.quantity.split(' ')[0] }
                                </Text>
                                <Text style={{
                                    fontSize: 22,
                                    marginLeft: 10,
                                    marginTop: 10
                                }}>
                                    { this.props.transData.quantity.split(' ')[1] }
                                </Text>
                            </View>

                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            {
                                this.renderItem( I18n.t( Keys.eos_receiver_address ), this.props.transData.to, false, false, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.eos_sender_address ), this.props.transData.from, true, false, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.eos_remark ), this.props.transData.memo, true, false, false )
                            }

                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            <View style={[ { height: 10 } ]}/>

                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            {
                                this.renderItem( I18n.t( Keys.transaction_hash ), this.props.transactionId, false, false, true )
                            }

                            {
                                this.renderItem( I18n.t( Keys.block_number ), this.props.blockNum, true, false, false )
                            }

                            {
                                this.renderItem( I18n.t( Keys.transaction_time ),
                                    moment.utc( this.props.blockTime ).tz(timezone).format( 'YYYY-MM-DD' ) + ' ' + moment.utc( this.props.blockTime ).tz(timezone).format( 'HH:mm:ss' ),
                                    true, false, false )
                            }

                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            <View style={[ commonStyles.commonIntervalStyle , { marginTop: 10 }]}/>
                            {
                                this.renderItem( I18n.t( Keys.eos_token_publisher_title ), this.props.publisher, false, false, false )
                            }
                            <View style={[ commonStyles.commonIntervalStyle ]}/>

                            {
                                hasAdded ?
                                null
                                :
                                <TouchableOpacity onPress={() => {
                                    this.props.addCustomToken(tokenInfo, () => {
                                        this.props.accountAddToken(this.props.account, tokenInfo, () => {
                                            Toast.show( I18n.t( Keys.transaction_success ), { position: Toast.positions.CENTER } );
                                        } );
                                    })
                                }}>
                                    <View style={{
                                        marginHorizontal: 15,
                                        height: 44,
                                        marginTop: 30,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#4a4a4a',
                                        borderRadius: 2
                                    }}>
                                        <Text style={{
                                            fontSize: 17,
                                            color: '#ffffff'
                                        }}>{ I18n.t( Keys.eos_token_addtolist ) }</Text>
                                    </View>
                                </TouchableOpacity>
                            }

                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

export default EOSTransactionDetailPageView;
