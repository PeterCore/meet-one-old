import React, { Component } from "react";
import commonStyles from "../../styles/commonStyles";
// import Button from "react-native-button";
import {
    InteractionManager,
    RefreshControl,
    SectionList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
// import WalletSelectComponent from "../wallet/components/WalletSelectComponent";
import moment from "moment/moment";
import ethers from "ethers";
import Spinner from 'react-native-loading-spinner-overlay';
import LoadingMoreItem from "../../components/LoadingMoreItem";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import LoadingView from "../../components/LoadingView";
import { SafeAreaView } from 'react-navigation';

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTransactionListPageView extends Component {
    // static navigationOptions = ( props ) => {
    //     const { navigation } = props;
    //     const { state, setParams } = navigation;
    //     const { params } = state;

    //     return {
    //         title: I18n.t( Keys.transaction_list_title ),
    //         headerRight: (
    //             <Button
    //                 style={commonStyles.top_info_right_btn}
    //                 title=''
    //                 onPress={() => {
    //                     navigation.state.params.selectWallet()
    //                 }}
    //             >
    //                 {I18n.t( Keys.select )}
    //             </Button>
    //         ),
    //     };
    // };

    constructor( props ) {
        super( props );

        this.state = {
            // isOpenAccountSelect: false,
            account: props.account,

            isRequesting: false,
            refreshing: false,
            waitingMore: false,
            hasMoreData: true,
            currentPageNum: 0,
            data: [],
        }
    }


    componentWillMount() {
        // this.selectWallet = this.selectWallet.bind( this );
        // this.props.navigation.setParams( { selectWallet: this.selectWallet } );
    }

    componentDidMount() {
        if ( this.state.account ) {
            this.loadData( 0, true );
        }
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        if ( nextState.account !== null && nextState.account !== undefined && (utils.getAddress( nextState.account.jsonWallet.address ) !== utils.getAddress( this.state.account.jsonWallet.address )) ) {
            this.state.account = nextState.account;

            this.loadData( 0, true );
        }

        if ( nextProps.account !== null && nextProps.account !== undefined && nextProps.account !== this.state.account ) {
            this.state.account = nextProps.account;

            this.loadData( 0, true );
        }

        return true;
    }


    // selectWallet() {
    //     this.setState( {
    //         isOpenAccountSelect: true
    //     } );
    // }

    loadData( pageNum, isInit ) {
        const pageSize = 20;

        if ( isInit ) {
            this.setState( {
                isRequesting: true
            } );
        } else {
            if ( pageNum === 0 ) {
                if ( this.state.refreshing ) {
                    return;
                }

                this.setState( {
                    refreshing: true,
                    waitingMore: false
                } );
            } else {
                if ( pageNum > 0 && !this.state.hasMoreData ) {
                    return;
                }

                if ( this.state.waitingMore || this.state.refreshing ) {
                    return;
                }

                this.setState( {
                    waitingMore: true
                } );
            }
        }

        InteractionManager.runAfterInteractions( () => {
            this.props.onGetEtherTransactions( this.state.account, ( error, resBody ) => {
                if ( pageNum > 0 && this.state.refreshing ) {
                    return;
                }

                let data = this.state.data.slice();
                let isRequesting = false;
                let refreshing = false;
                let waitingMore = false;
                let hasMoreData = this.state.hasMoreData;
                let currentPageNum = this.state.currentPageNum;


                if ( error ) {
                    // Toast.show( error.message , { position: Toast.positions.CENTER });
                } else {
                    hasMoreData = false;//resBody.data.length >= pageSize;
                    if ( pageNum === 0 ) {
                        data = resBody.result;
                        currentPageNum = 0;
                    } else {
                        for ( let index = 0; index < resBody.result.length; index++ ) {
                            data.push( resBody.result[ index ] );
                        }

                        currentPageNum = pageNum;
                    }
                }

                this.setState( {
                    data: data,
                    isRequesting: isRequesting,
                    refreshing: refreshing,
                    waitingMore: waitingMore,
                    hasMoreData: hasMoreData,
                    currentPageNum: currentPageNum
                } );
            } );
        } );
    }

    _onRefresh() {
        this.loadData( 0, false );
    }

    onEndReached() {
        // this.loadData( this.state.currentPageNum + 1, false );
    }

    changeDataToSection() {
        const sectionData = [];

        this.state.data.sort( function ( a, b ) {
            const timestampA = utils.bigNumberify( a.timeStamp ).toNumber();
            const timestampB = utils.bigNumberify( b.timeStamp ).toNumber();

            return timestampB - timestampA
        } );

        for ( let index = 0; index < this.state.data.length; index++ ) {
            this.state.data[ index ].uiIndex = index;
        }

        let oldDayMoment = null;
        let childArray = [];
        for ( let index = 0; index < this.state.data.length; index++ ) {
            const currentMoment = moment( utils.bigNumberify( this.state.data[ index ].timeStamp ).toNumber() * 1000 );

            if ( oldDayMoment === null ) {
                oldDayMoment = currentMoment;
                childArray.push( this.state.data[ index ] );
            } else if ( currentMoment.isSame( oldDayMoment, 'month' ) ) {
                childArray.push( this.state.data[ index ] );
            } else {
                if ( childArray.length > 0 ) {
                    sectionData.push( {
                        data: childArray,
                        title: oldDayMoment.format( "YYYY-MM" )
                    } );
                }

                oldDayMoment = currentMoment;
                childArray = [];
                childArray.push( this.state.data[ index ] );

            }
        }

        if ( childArray.length > 0 ) {
            sectionData.push( {
                data: childArray,
                title: oldDayMoment.format( "YYYY-MM" )
            } );
        }


        return sectionData;
    }

    renderItem( item ) {
        const addressFrom = item.from;
        const addressTo = item.to;
        const balance = item.value;
        const isSuccess = (!(item.txreceipt_status === '0' && item.isError === '1'));
        const hash = item.hash;
        const blockNumber = item.blockNumber;
        const timeStamp = item.timeStamp;
        const gasPrice = item.gasPrice;
        const gasUsed = item.gasUsed;


        const options = {
            commify: true,
        };

        const balanceShow = ETHWalletUtil.formatDisplayETHBalance( '' + balance, options );

        const timestamp = utils.bigNumberify( item.timeStamp ).toNumber() * 1000;

        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.navigation.navigate( 'ETHTransactionDetailPage', {
                        primaryKey: this.state.account.primaryKey,
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
                        token: 'ETH'
                    } );
                }}>
                <View style={[ {
                    flex: 1,
                    height: 64,
                    backgroundColor: 'white',
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingBottom: 10,
                        paddingTop: 10
                    }, ]}>
                        <View>
                            <View style={[ { flexDirection: 'row' }, commonStyles.justAlignCenter ]}>
                                <View style={[ {}, commonStyles.wrapper ]}>
                                    <Text
                                        style={[ {
                                            fontSize: 18,
                                        }, commonStyles.commonTextColorStyle ]}
                                        numberOfLines={1}
                                        ellipsizeMode={'middle'}
                                    >
                                        {ETHWalletUtil.formatETHAddressShortForDisplay( addressFrom === utils.getAddress( this.state.account.jsonWallet.address ) ? addressTo : addressFrom )}
                                    </Text>
                                    <View style={[ { flexDirection: 'row', marginTop: 6 } ]}>
                                        <Text style={[ {
                                            fontSize: 12,
                                        }, commonStyles.commonSubTextColorStyle ]}
                                              numberOfLines={1}
                                        >
                                            {moment( timestamp ).format( 'L' ) + ' ' + moment( timestamp ).format( 'HH:mm:ss' )}
                                        </Text>

                                        {
                                            item.txreceipt_status === '0' && item.isError === '1' ?
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
                                } ]}>
                                    {utils.getAddress( addressFrom ) === utils.getAddress( this.state.account.jsonWallet.address ) ? ('-' + balanceShow) : ('+' + balanceShow)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={[ this.props.style, commonStyles.wrapper, commonStyles.commonBG ]}>

                <SectionList
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind( this )}
                        />
                    }
                    sections={this.changeDataToSection()}
                    initialNumToRender={5}
                    keyExtractor={( item, index ) => {
                        return index;
                    }}
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
                    renderItem={( { item } ) => {
                        return (
                            this.renderItem( item )
                        );
                    }}
                    renderSectionHeader={( { section } ) => {
                        return (
                            <Text style={[ {
                                height: 30,
                                backgroundColor: '#F5F5F5',
                                fontSize: 12,
                                paddingTop: 9,
                                paddingLeft: 15,
                                paddingRight: 15,
                            }, commonStyles.commonTextColorStyle ]}>{section.title}</Text>
                        );
                    }}
                    ListFooterComponent={() => {
                        return (<LoadingMoreItem {...this.props} waiting={this.state.waitingMore}/>)
                    }}
                    onEndReached={this.onEndReached.bind( this )}
                    ItemSeparatorComponent={() => {
                        return <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    }}
                    SectionSeparatorComponent={() => {
                        return <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    }}
                    onScroll={() => {
                        if ( this.props.onScroll ) {
                            this.props.onScroll();
                        }
                    }}
                />

                {/* <WalletSelectComponent
                    navigation={this.props.navigation}
                    isOpen={this.state.isOpenAccountSelect}
                    isSupportImport={false}
                    isSupportEOS={true}
                    defaultPrimaryKey={this.state.account ? this.state.account.primaryKey : 0}
                    onResult={( item ) => {
                        let account;
                        for ( let index = 0; index < this.props.accounts.length; index++ ) {
                            if ( item.primaryKey === this.props.accounts[ index ].primaryKey ) {
                                account = this.props.accounts[ index ];
                            }
                        }

                        this.setState( {
                            account: account,
                            data: [],
                        } );
                    }}
                    onImportWallet={( walletType ) => {
                        if ( walletType === 'ETH' ) {
                            this.props.navigation.navigate( 'ETHImportPage',
                                {
                                    callback: ( account ) => {
                                        const { navigate, goBack, state } = this.props.navigation;

                                        goBack();

                                        this.setState( {
                                            account: account,
                                            data: [],
                                        } );
                                    }
                                } );
                        }
                    }}
                    onClose={() => {
                        this.setState( {
                            isOpenAccountSelect: false
                        } );
                    }}
                /> */}

                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
            </View>
        );
    }
}


export default ETHTransactionListPageView;
