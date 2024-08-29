import React, { Component } from "react";
import { Text, View, FlatList, InteractionManager, TouchableOpacity } from "react-native";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import { getAccountActions } from "../../../net/3thNet";

import LoadingMoreItem from "../../../components/LoadingMoreItem";
import LoadingView from "../../../components/LoadingView";

import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

const moment = require('moment-timezone');
const DeviceInfo = require('react-native-device-info');
const timezone = DeviceInfo.getTimezone();

class EOSTransactionListPageView extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            account: props.account,
            transferData: [],
            useNode: props.netType !== 'EOS',
            // 从节点查用的参数
            pos: -1,
            offset: -50,
            // 从服务器查询用的参数
            page: 0,
            limit: 50,
            filterSpam: true,
            isRequesting: true,
            waitingMore: false,
            hasMoreData: true,
            hasInited: false
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if ( nextProps.account !== null && nextProps.account !== undefined && nextProps.account !== this.state.account ) {

            this.state.account = nextProps.account;
            this.state.transferData = [];
            this.state.useNode = false;
            this.state.pos = -1;
            this.state.offset = -50;
            this.state.page = 0;
            this.state.limit = 50;
            this.state.isRequesting = true;
            this.state.waitingMore = false;
            this.state.hasMoreData = true;

            this.loadData();
        }
        return true;
    }

    componentDidMount () {
        AnalyticsUtil.onEvent('WAtransactionlist');
        this.loadData ()
    }

    getHistoryFromServer() {
        getAccountActions({
            account: this.state.account.accountName,
            page: this.state.page,
            limit: this.state.limit,
            filterSpam: this.state.filterSpam
        }, ( err, res ) => {
            if ( err ) {
                Toast.show( err.message , { position: Toast.positions.CENTER });
            } else {
                const resData = res.body;
                if (resData.use_node) {
                    this.setState({
                        useNode: true
                    }, () => {
                        this.getHistoryFromNode();
                    })
                    return
                }

                let transferData = [];
                let hasMoreData = false;

                if (resData.err_code === 0) {
                    // 过滤出 Transfer 类型
                    transferData = resData.actions.filter((item)=> {
                        if (item.name === 'transfer' && item.data.from && item.data.to && item.data.quantity) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    // 判断是否还有数据
                    if (resData.actions.length === this.state.limit) {
                        hasMoreData = true
                    }
                } else {
                    Toast.show( resData.err_msg , { position: Toast.positions.CENTER });
                }

                this.setState((prevState, props) => ({
                    transferData: prevState.transferData.concat(transferData),
                    hasMoreData: hasMoreData,
                    page: prevState.page + 1,
                    isRequesting: false,
                    waitingMore: false,
                    hasInited: true
                }), ()=>{
                    if (this.state.transferData.length < 8) {
                        this.loadData()
                    }
                })
            }
        } );
    }

    getHistoryFromNode() {
        this.props.onGetEOSTransactions( this.state.account, { pos: this.state.pos, offset: this.state.offset }, ( error, resBody ) => {
            if ( error ) {
                Toast.show( error.message , { position: Toast.positions.CENTER });
            } else {
                const rawData = resBody.actions;
                const transferData = [];
                let hasMoreData = true;
                let pos = this.state.pos;

                let prev;
                let current;
                const prevLast = this.state.prevLast;

                for (let i = 0; i < rawData.length; i++) {
                    current = rawData[i]

                    // 判断与上一个请求的最后一个记录是否重复
                    if (prevLast &&
                        prevLast.action_trace.trx_id === current.action_trace.trx_id &&
                        prevLast.action_trace.act.name === current.action_trace.act.name &&
                        prevLast.action_trace.act.data.from === current.action_trace.act.data.from &&
                        prevLast.action_trace.act.data.to === current.action_trace.act.data.to &&
                        prevLast.action_trace.act.data.quantity === current.action_trace.act.data.quantity &&
                        prevLast.action_trace.act.data.memo === current.action_trace.act.data.memo) {
                        continue;
                    }

                    // 只有 transfer 类型的才显示
                    if (current.action_trace.act.name === 'transfer' && current.action_trace.act.data.quantity) {
                        // 重复就跳过
                        if (prev &&
                            prev.action_trace.trx_id === current.action_trace.trx_id &&
                            prev.action_trace.act.name === current.action_trace.act.name &&
                            prev.action_trace.act.data.from === current.action_trace.act.data.from &&
                            prev.action_trace.act.data.to === current.action_trace.act.data.to &&
                            prev.action_trace.act.data.quantity === current.action_trace.act.data.quantity &&
                            prev.action_trace.act.data.memo === current.action_trace.act.data.memo) {
                            continue;
                        } else {
                            transferData.push(rawData[i]);
                            prev = rawData[i];
                        }
                    }
                }
                if (rawData.length > 0) {
                    pos = rawData[0].account_action_seq - 1;
                    if (rawData[0].account_action_seq === 0) {
                        hasMoreData = false;
                    }
                } else {
                    hasMoreData = false;
                }

                transferData.reverse();

                this.setState((prevState, props) => ({
                    transferData: prevState.transferData.concat(transferData),
                    hasMoreData: hasMoreData,
                    pos: pos,
                    isRequesting: false,
                    waitingMore: false,
                    hasInited: true,
                    prevLast: transferData[transferData.length -1]
                }), ()=>{
                    if (this.state.transferData.length < 8) {
                        this.loadData()
                    }
                })
            }
        } );
    }

    getTransHistory () {
        if (this.state.useNode) {
            this.getHistoryFromNode();
        } else {
            this.getHistoryFromServer();
        }
    }

    loadData () {
        if (this.state.hasMoreData && !this.state.waitingMore) {
            this.setState({
                waitingMore: true
            }, ()=>{
                InteractionManager.runAfterInteractions( () => {
                    this.getTransHistory()
                })
            })
        }
    }

    onEndReached() {
        this.loadData();
    }

    renderItem (item) {

        const blockNum = item.block_num;
        const blockTime = item.block_time;

        const actionTrace = item.action_trace;
        const transactionId =  actionTrace ? actionTrace.trx_id : item.trx_id;
        const transData = actionTrace ? actionTrace.act.data : item.data;
        const publisher = actionTrace ? actionTrace.act.account : item.account;

        return (

            <TouchableOpacity onPress={() => {
                this.props.navigation.navigate( 'EOSTransactionDetailPage', {
                    account: this.state.account,
                    blockNum,
                    blockTime,
                    transactionId,
                    transData,
                    publisher
                } );
            }}>
                <View style={[ {
                    flex: 1,
                    height: 64
                }, commonStyles.commonBG]}>
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
                                        {transData.to === this.state.account.accountName ? transData.from : transData.to }
                                    </Text>
                                    <View style={[ { flexDirection: 'row', marginTop: 6 } ]}>
                                        <Text style={[ {
                                            fontSize: 12,
                                        }, commonStyles.commonSubTextColorStyle ]}
                                              numberOfLines={1}
                                        >
                                            {moment.utc( blockTime ).tz(timezone).format( 'YYYY-MM-DD' ) + ' ' + moment.utc( blockTime ).tz(timezone).format( 'HH:mm:ss' )}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[ {
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: '#000000'
                                } ]}>
                                    { transData.from === this.state.account.accountName ? '-' + transData.quantity : '+' + transData.quantity }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={[ this.props.style, commonStyles.wrapper ]}>
                <FlatList
                    data={this.state.transferData}
                    renderItem={( { item } ) => {
                        return (
                            this.renderItem( item )
                        );
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    }}
                    ListEmptyComponent={() => {
                        return (
                            this.state.isRequesting ?
                            null
                            :
                            <Text
                                style={[ {
                                    fontSize: 18,
                                    textAlign: 'center',
                                    marginTop: 200
                                }, commonStyles.wrapper, commonStyles.commonSubTextColorStyle ]}>
                                {
                                    I18n.t( Keys.empty_data )
                                }
                            </Text>
                        );
                    }}
                    ListFooterComponent={() => {
                        if(this.state.hasInited){
                            return (<LoadingMoreItem waiting={this.state.waitingMore}/>)
                        } else {
                            return null
                        }
                    }}
                    onEndReached={this.onEndReached.bind( this )}
                    onEndReachedThreshold={0.9}
                />

                {
                    this.state.isRequesting ?
                    <LoadingView/>
                    :
                    null
                }

                {/* <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/> */}
            </View>
        );
    }
}


export default EOSTransactionListPageView;
