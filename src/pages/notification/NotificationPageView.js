import React, { Component } from 'react';
import {
    FlatList,
    Image,
    InteractionManager,
    RefreshControl,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Toast from "react-native-root-toast";
import moment from "moment/moment";
import { getNotificationIcon } from "../../actions/NotificatiponAction";
import Spinner from 'react-native-loading-spinner-overlay';
import LoadingMoreItem from "../../components/LoadingMoreItem";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";

let addresKey = 'addresKey';

class NotificationPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.notification_page_title )
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isRequesting: false,
            refreshing: false,
            waitingMore: false,
            hasMoreData: true,
            currentPageNum: 0,
            data: [],
        };
    }


    componentDidMount() {
        this.loadData( 0, true );
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

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
            this.props.onGetNotification( this.props.account.id, pageNum, pageSize, ( error, resBody ) => {
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
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                } else {
                    hasMoreData = resBody.data.length >= pageSize;
                    if ( pageNum === 0 ) {
                        data = resBody.data;
                        currentPageNum = 0;
                    } else {
                        for ( let index = 0; index < resBody.data.length; index++ ) {
                            data.push( resBody.data[ index ] );
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
        this.loadData( this.state.currentPageNum + 1, false );
    }

    renderItem( item, index ) {
        return (
            <TouchableOpacity style={[
                commonStyles.wrapper,
                {}
            ]}
                              underlayColor='#ddd'
                              onPress={() => {
                              }}>
                <View
                    style={[
                        commonStyles.wrapper, {
                            height: 72,
                            paddingLeft: 15,
                            paddingRight: 15,
                            flexDirection: 'row',
                            backgroundColor: 'white'
                        },
                        commonStyles.justAlignCenter
                    ]}>
                    <Image
                        source={getNotificationIcon( item.type )}
                        style={[ { width: 44, height: 44 } ]}
                    />
                    <View style={[ commonStyles.wrapper, { marginLeft: 15 } ]}>
                        <Text style={[ { fontSize: 16, color: '#101010', lineHeight: 24 } ]} numberOfLines={2}>
                            {item.title}
                            <Text style={[ {
                                fontSize: 12,
                                color: '#3A3A3A',
                                alignItems: 'flex-end',
                            } ]}>{'  ' +
                            (moment( item.time ).isSame( moment(), 'day' ) ?
                                    ''
                                    :
                                    (moment( item.time ).format( moment( item.time ).isSame( moment(), 'year' ) ?
                                        'M-D'
                                        :
                                        'YYYY-M-D' )
                                        + ' ')
                            )
                            + moment( item.time ).format( 'HH:mm' )}</Text>
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    render() {
        const viewHeight = 72;
        const separatorHeight = 1;

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>


                    <StatusBar backgroundColor={'#3e9ce9'}/>
                    <FlatList
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind( this )}
                            />
                        }
                        data={this.state.data}
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
                        renderItem={( { item, index } ) => {
                            return this.renderItem( item, index );
                        }}
                        ListHeaderComponent={() => {
                            return (null);
                        }}
                        ListFooterComponent={() => {
                            return (<LoadingMoreItem {...this.props} waiting={this.state.waiting}/>)
                        }}
                        onEndReached={this.onEndReached.bind( this )}
                        ItemSeparatorComponent={() => {
                            return <View
                                style={[ commonStyles.commonIntervalStyle, {
                                    height: separatorHeight,
                                    marginLeft: 15
                                } ]}/>
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                        onScroll={() => {
                        }}
                    />


                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                </View>
            </SafeAreaView>

        );

    }
}


export default NotificationPageView;


