import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    Image,
    View,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../../styles/commonStyles";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

const colorTemplate = ['#E5A99F', '#95E0A9', '#94DDDF', '#99B8DE', '#C19DDE'];

class EOSTransferSelectPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.transfer_title ),
        };
    };

    constructor( props ) {
        super( props );

        this.state = {

        }
    }

    render() {

        const recentAccount = this.props.recentAccount;

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <View style={{
                        marginTop: 10,
                        marginHorizontal: 15,
                        height: 110,
                        backgroundColor: '#ffffff',
                        borderRadius: 5,
                        shadowColor: '#e8e8e8',
                        shadowOffset: {
                            width: 1,
                            height: 1
                        },
                        shadowRadius: 5,
                        shadowOpacity: 0.8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <TouchableOpacity style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                AnalyticsUtil.onEvent('WAtransfer8account');
                                this.props.navigation.navigate( 'EOSTransferPage', {
                                    currentToken: this.props.currentToken
                                } );
                            }}
                        >
                            <Image
                                style={{
                                    width: 44,
                                    height: 44
                                }}
                                source={require( '../../../imgs/transfer_btn_eos.png' )}
                            />
                            <Text style={{
                                marginTop: 10,
                            }}>
                                { I18n.t( Keys.eos_recentTrans_transfer ) }
                            </Text>
                        </TouchableOpacity>

                        <View style={[ commonStyles.commonIntervalStyle, {
                            width: Util.getDpFromPx( 1 ),
                            height: 50
                        } ]}/>

                        <TouchableOpacity  style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                AnalyticsUtil.onEvent('WAtransfer8QR');
                                this.props.navigation.navigate( 'EOSQRScanPage' );
                            }}
                        >
                            <Image
                                style={{
                                    width: 44,
                                    height: 44
                                }}
                                source={require( '../../../imgs/transfer_btn_scan.png' )}
                            />
                            <Text style={{
                                marginTop: 10,
                            }}>
                                { I18n.t( Keys.eos_recentTrans_scan ) }
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={{
                        marginLeft: 15,
                        fontSize: 14,
                        color: '#999999',
                        marginTop: 20,
                        marginBottom: 10
                    }}>
                        { I18n.t( Keys.eos_recentTrans_recent ) }
                    </Text>

                    <View style={[ commonStyles.commonIntervalStyle ]}/>
                    <View style={{
                        backgroundColor: '#ffffff'
                    }}>
                        {
                            recentAccount.map((account, index) => {

                                const colorIndex = index % 5;

                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            AnalyticsUtil.onEvent('WAtransfer8account');

                                            this.props.navigation.navigate( 'EOSTransferPage', {
                                                toAddress: account.name,
                                                currentToken: this.props.currentToken,
                                                memo: account.memo,
                                                history: true
                                            } );
                                        }}
                                    >
                                        <View style={{
                                            flexDirection: 'row',
                                            height: 64,
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                marginLeft: 15,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <View style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    backgroundColor: colorTemplate[colorIndex],
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={{
                                                        marginTop: -5,
                                                        fontFamily: 'DIN',
                                                        fontWeight: '700',
                                                        fontSize: 30,
                                                        color: '#ffffff'
                                                    }}>
                                                        { account.name.substring(0, 1) }
                                                    </Text>
                                                </View>

                                                <Text style={{
                                                    marginLeft: 15,
                                                    fontSize: 16,
                                                    color: '#323232'
                                                }}>
                                                    { account.name }
                                                </Text>
                                            </View>

                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 15
                                            }}>

                                                {/* <View  style={{
                                                    backgroundColor: '#1ACE9A',
                                                    color: '#ffffff',
                                                    paddingHorizontal: 4,
                                                    paddingVertical: 4,
                                                    borderRadius: 2
                                                }}>
                                                    <Text style={{
                                                        color: '#ffffff',
                                                        fontSize: 12
                                                    }}>
                                                        交易所
                                                    </Text>
                                                </View> */}

                                                <Image
                                                    style={{
                                                        width: 8,
                                                        height: 13,
                                                        marginLeft: 15,
                                                    }}
                                                    source={require( '../../../imgs/ic_right_arrow.png' )}
                                                />
                                            </View>

                                        </View>
                                        {
                                            index < recentAccount.length - 1 ?
                                            <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                                            :
                                            null
                                        }
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                    <View style={[ commonStyles.commonIntervalStyle, { marginBottom: 40 } ]}/>

                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default EOSTransferSelectPageView;
