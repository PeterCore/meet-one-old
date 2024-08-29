import React, { Component } from 'react';
import { Image, InteractionManager, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Hyperlink from "react-native-hyperlink";
import ethers from "ethers";
import * as env from "../../env";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import format from "string-format";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTransferProgressPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.transfer_progress_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            transaction: null,
            transactionReceipt: null,
            isRequesting: false
        }
    }


    componentWillMount() {
        this.setState( {
            isRequesting: true
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onGetTransaction( this.props.transactionHash, ( error, resBody ) => {
                if ( !error ) {
                    this.setState( {
                        isRequesting: false,
                        transaction: resBody.transaction,
                        transactionReceipt: resBody.transactionReceipt
                    } );
                } else {
                    this.setState( {
                        isRequesting: false
                    } );
                }
            } );
        } );
    }

    render() {
        if ( !this.state.transaction && !this.state.transactionReceipt ) {
            return <View/>
        }

        const link = env.tx_explorer + this.state.transaction.hash;

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.paddingCommon, commonStyles.commonBG ]}>

                    <View style={[ { flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                {
                                    I18n.t( Keys.success_to_submit_order )
                                }
                            </Text>

                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 6
                            } ]}>
                                {I18n.t( Keys.receiver_address )}
                            </Text>
                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                            } ]}>
                                {utils.getAddress( this.props.toAddress )}
                            </Text>

                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 6
                            } ]}>
                                {I18n.t( Keys.sender_address )}
                            </Text>
                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                            } ]}>
                                {this.state.transaction.from}
                            </Text>

                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 6
                            } ]}>
                                {I18n.t( Keys.transfer_amount )}
                                <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                    marginRight: 20,
                                } ]}>
                                    {ETHWalletUtil.formatDisplayETHBalance( this.state.transaction.value ) + ' ether'}
                                </Text>
                            </Text>

                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 10
                            } ]}>
                                {I18n.t( Keys.miner_fee )}
                                <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                    marginRight: 20,
                                } ]}>
                                    {
                                        (
                                            this.state.transactionReceipt ?
                                                ETHWalletUtil.formatDisplayETHBalance( this.state.transaction.gasPrice.mul( this.state.transactionReceipt.gasUsed ) )
                                                :
                                                ETHWalletUtil.formatDisplayETHBalance( this.state.transaction.gasPrice.mul( this.state.transaction.gasLimit ) )
                                        )
                                        +
                                        ' ether'
                                    }
                                </Text>
                            </Text>

                        </View>
                    </View>


                    <View style={[ { marginTop: 40, flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                {I18n.t( Keys.wait_to_confirm_transaction )}
                                <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                    marginRight: 20,
                                } ]}>
                                    {format( I18n.t( Keys.waiting_time_for_transaction ), 0 )}
                                </Text>
                            </Text>
                            <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 6
                            } ]}>
                                {I18n.t( Keys.transaction_tip )}
                            </Text>

                            <Hyperlink
                                style={[ {
                                    marginRight: 20,
                                    marginTop: 6
                                }
                                ]}
                                linkStyle={[ {
                                    fontSize: 14
                                }, commonStyles.commonSubTextColorStyle ]}
                                linkText={url => url === link
                                    ? I18n.t( Keys.progress_link )
                                    : url}
                                onPress={( url ) => {
                                    this.props.navigation.navigate( 'WebViewPage',
                                        {
                                            url: url,
                                            webTitle: I18n.t( Keys.view_progress )

                                        } )
                                }}>
                                <Text
                                    style={[ {
                                        fontSize: 14
                                    }, commonStyles.commonSubTextColorStyle
                                    ]}>
                                    {
                                        I18n.t( Keys.view_progress_1 ) + link
                                    }
                                </Text>
                            </Hyperlink>
                        </View>
                    </View>

                    <View style={[ { marginTop: 40, flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                转账成功
                            </Text>
                        </View>
                    </View>


                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHTransferProgressPageView;