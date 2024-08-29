import React, { Component } from 'react';
import {
    FlatList,
    InteractionManager,
    RefreshControl,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import ERC20TokenMap from "../../../data/ERC20TokenMap";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import ethers from "ethers";
import moment from "moment/moment";
import constStyles from "../../styles/constStyles";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";
import Util from "../../util/Util";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTokenDetailPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: state.params.token
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            isRequesting: false,
            refreshing: false,
            data: [],
            blockData: props.blockData,
        }
    }

    componentWillMount() {
        this.props.onGetTransactionCount( this.props.account, ( error, resBody ) => {
            if ( error ) {
                console.log( error.message );
            } else {
                console.log( JSON.stringify( resBody ) );
            }
        } );

        this.loadData( true );
    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    doLoadData( callback ) {
        if ( this.props.token === 'ETH' ) {

            this.props.onGetEtherTransactions( this.props.account, callback );
        } else {
            this.props.onGetTokenTransactionHistory( this.props.account, ERC20TokenMap[ this.props.token ].contract, callback );
        }
    }

    loadData( isInit ) {
        if ( isInit ) {
            this.setState( {
                isRequesting: true
            } );
        } else {
            if ( this.state.refreshing ) {
                return;
            }

            this.setState( {
                refreshing: true,
            } );
        }

        InteractionManager.runAfterInteractions( () => {
            this.doLoadData( ( error, resBody ) => {
                let data = this.state.data.slice();
                let isRequesting = false;
                let refreshing = false;


                if ( error ) {
                    // Toast.show( error.message , { position: Toast.positions.CENTER });
                } else {
                    data = resBody.result;

                    this.setState( {
                        data: data,
                        isRequesting: isRequesting,
                        refreshing: refreshing,
                    } );
                }

                this.setState( {
                    data: data,
                    isRequesting: isRequesting,
                    refreshing: refreshing,
                } );
            } );
        } );
    }

    _onRefresh() {
        this.loadData( false );
    }

    startTransfer() {
        this.props.navigation.navigate( 'ETHTransferPage',
            {
                primaryKey: this.props.account.primaryKey,
                token: this.props.token
            }
        );
    }

    showQRCode() {
        this.props.navigation.navigate( 'ETHQRCodePage',
            {
                primaryKey: this.props.account.primaryKey,
            }
        );
    }

    renderTokenItem( { item, index } ) {
        const addressFrom = ETHWalletUtil.optHexStringRemove64Len( item.topics[ 1 ] );
        const addressTo = ETHWalletUtil.optHexStringRemove64Len( item.topics[ 2 ] );
        const balance = utils.bigNumberify( item.data ).toString();
        const isSuccess = (!(item.txreceipt_status === '0' && item.isError === '1'));
        const hash = item.transactionHash;
        const blockNumber = item.blockNumber;
        const timeStamp = item.timeStamp;
        const gasPrice = item.gasPrice;
        const gasUsed = item.gasUsed;

        return this.renderItem( item, addressFrom, addressTo, balance, isSuccess, () => {
            this.props.navigation.navigate( 'ETHTransactionDetailPage', {
                primaryKey: this.props.account.primaryKey,
                transaction: {
                    addressFrom: addressFrom,
                    addressTo: addressTo,
                    balance: balance,
                    isSuccess: isSuccess,
                    hash: hash,
                    blockNumber: blockNumber,
                    timeStamp: timeStamp,
                    gasPrice: gasPrice,
                    gasUsed: gasUsed
                },
                token: this.props.token,
            } );
        } );
    }

    renderETHItem( { item, index } ) {
        const addressFrom = item.from;
        const addressTo = item.to;
        const balance = item.value;
        const isSuccess = (!(item.txreceipt_status === '0' && item.isError === '1'));
        const hash = item.hash;
        const blockNumber = item.blockNumber;
        const timeStamp = item.timeStamp;
        const gasPrice = item.gasPrice;
        const gasUsed = item.gasUsed;

        return this.renderItem( item, addressFrom, addressTo, balance, isSuccess, () => {
            this.props.navigation.navigate( 'ETHTransactionDetailPage', {
                primaryKey: this.props.account.primaryKey,
                transaction: {
                    addressFrom: addressFrom,
                    addressTo: addressTo,
                    balance: balance,
                    isSuccess: isSuccess,
                    hash: hash,
                    blockNumber: blockNumber,
                    timeStamp: timeStamp,
                    gasPrice: gasPrice,
                    gasUsed: gasUsed
                },
                token: this.props.token
            } );
        } );
    }

    renderItem( item, addressFrom, addressTo, balance, isSuccess, onPress ) {
        const options = {
            commify: true,
        };

        const balanceShow = this.props.token === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( '' + balance, options ) :
            ETHWalletUtil.formatDisplayTokenBalance( '' + balance, ERC20TokenMap[ this.props.token ].decimals, options );

        const timestamp = utils.bigNumberify( item.timeStamp ).toNumber() * 1000;

        return (
            <TouchableOpacity
                onPress={() => {
                    if ( onPress ) {
                        onPress();
                    }
                }}>
                <View style={[ {
                    flex: 1,
                    height: 64
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingBottom: 10,
                        paddingTop: 10
                    }, ]}>
                        <View>
                            <View style={[ {
                                backgroundColor: 'white',
                                flexDirection: 'row'
                            }, commonStyles.justAlignCenter ]}>
                                <View style={[ {}, commonStyles.wrapper ]}>
                                    <Text
                                        style={[ {
                                            fontSize: 18,
                                        }, commonStyles.commonTextColorStyle ]}
                                        numberOfLines={1}
                                        ellipsizeMode={'middle'}
                                    >
                                        {ETHWalletUtil.formatETHAddressShortForDisplay( addressFrom === utils.getAddress( this.props.account.jsonWallet.address ) ? addressTo : addressFrom )}
                                    </Text>
                                    <View style={[ { flexDirection: 'row', marginTop: 6 } ]}>
                                        <Text style={[ {
                                            fontSize: 12,
                                        }, commonStyles.commonSubTextColorStyle ]}
                                              numberOfLines={1}>
                                            {moment( timestamp ).format( 'L HH:mm:ss' )}
                                        </Text>

                                        {
                                            !isSuccess ?
                                                <Text style={[ {
                                                    fontSize: 12,
                                                    marginLeft: 10,
                                                    color: '#F65858'
                                                } ]}>
                                                    {I18n.t( Keys.failed_to_transfer )}
                                                </Text>
                                                :
                                                null
                                        }
                                    </View>
                                </View>
                                <Text style={[ {
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: '#000000'
                                }, ]}>
                                    {utils.getAddress( addressFrom ) === utils.getAddress( this.props.account.jsonWallet.address ) ? ('-' + balanceShow) : ('+' + balanceShow)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        const viewHeight = 64;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={commonStyles.wrapper}>
                    <FlatList
                        style={[ { backgroundColor: 'white', } ]}
                        data={this.state.data}
                        keyExtractor={( item, index ) => {
                            return index;
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind( this )}
                            />
                        }
                        ListEmptyComponent={() => {
                            return (
                                <Text
                                    style={[ {
                                        fontSize: 18,
                                        textAlign: 'center',
                                        marginTop: 200
                                    }, commonStyles.wrapper, commonStyles.commonSubTextColorStyle ]}>
                                    {
                                        I18n.t( Keys.empty_data )
                                    }
                                </Text>);
                        }}
                        renderItem={( { item, index } ) => {
                            if ( this.props.token === 'ETH' ) {
                                return this.renderETHItem( { item, index } );
                            } else {
                                return this.renderTokenItem( { item, index } );
                            }
                        }}
                        ItemSeparatorComponent={() => {
                            return <View style={[ commonStyles.commonIntervalStyle, {
                                height: separatorHeight,
                                marginLeft: 15,
                            } ]}/>
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                    />

                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <View style={[ { height: 50, backgroundColor: 'white', flexDirection: 'row' } ]}>
                        <TouchableHighlight
                            underlayColor='#f7f7f7'
                            onPress={() => {
                                this.startTransfer()
                            }}
                            style={[ {}, commonStyles.wrapper ]}>
                            <View style={[ {
                                height: 50
                            }, commonStyles.justAlignCenter ]}>
                                <Text style={[ { fontSize: 18, color: constStyles.THEME_COLOR } ]}>
                                    {I18n.t( Keys.transfer )}
                                </Text>
                            </View>
                        </TouchableHighlight>

                        <View style={[ commonStyles.commonIntervalStyle, {
                            width: 1,
                            height: 30,
                            marginTop: 10
                        } ]}/>

                        <TouchableHighlight
                            underlayColor='#f7f7f7'
                            onPress={() => {
                                this.showQRCode()
                            }}
                            style={[ {}, commonStyles.wrapper ]}>
                            <View style={[ {
                                height: 50
                            }, commonStyles.justAlignCenter ]}>
                                <Text style={[ { fontSize: 18, color: constStyles.THEME_COLOR } ]}>
                                    {I18n.t( Keys.receive )}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    </View>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHTokenDetailPageView;