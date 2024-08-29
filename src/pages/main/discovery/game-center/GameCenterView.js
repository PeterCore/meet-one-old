import React from "react";
import {View, Text, Image, Dimensions, ScrollView, RefreshControl, ImageBackground, Platform, TouchableOpacity, StyleSheet} from "react-native";
import Button from "react-native-button";
import { connect } from "react-redux";

import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";

import constStyles from "../../../../styles/constStyles";
import {getGameFeatured, getGameList, getGameListByIds} from "../../../../net/DiscoveryNet";

import BannerItemComponent from '../../../../components/discovery-styles/BannerItemComponent';
import GameCenterItem from '../../../../components/discovery-styles/GameCenterItem';
import BlockWrapperComponent from '../../../../components/discovery-styles/BlockWrapperComponent';

import SearchBar from "../../../../components/SearchGameBar";

import settingActionTypes from "../../../../reducers/setting/settingActionTypes";
import {getCurrentWallet} from "../../../../actions/WalletAction";

import Util from "../../../../util/Util";
import AnalyticsUtil from "../../../../util/AnalyticsUtil";

// TODO: 提供默认数据
// import defaultData_en from "../../../../../data/discovery_data_en";
// import defaultData_cn from "../../../../../data/discovery_data_cn";

class GameCenterView extends React.Component {

    static navigationOptions = (props) => {
        // 设置透明的头
        return {
            title: '',
            headerStyle: {
                elevation: 0,
                borderBottomWidth: 0,
            },
            headerTransparent: true,
            headerLeft:
                <Button
                    style={{ width: 44, height: 44 }}
                    onPress={() => { props.navigation.goBack(); }}>
                    <Image
                        source={ require( '../../../../imgs/back-icon-ios.png' ) }
                        style={[ { width: 44, height: 44 } ]} />
                </Button>
        }
    }

    constructor(props) {
        super(props);
        const lang = (props.language || 'zh-CN').split('-')[0]; // 获取当前语系
        this.state = {
            sort: 'recommend', // 排序方式，默认按推荐排序
            page: 1, // 当前页码
            isFullLoad: false, // 是否全部加载完毕
            isRequesting: false, // 是否正在请求数据
            refreshing: false, // 是否正在下拉刷新
            gamesList: [], // 游戏列表， TODO: 提供默认数据
            featuredList: [], // 推荐列表, TODO: 提供默认数据
            usedGamesList: [], // 最近使用
            imageBackgroundURL:
                lang === 'zh' ? 'https://static.ethte.com/app/banner/gamecenter_cn.png' :
                lang === 'en' ? 'https://static.ethte.com/app/banner/gamecenter_en.png' :
                lang === 'ko' ? 'https://static.ethte.com/app/banner/gamecenter_ko.png' : 'https://static.ethte.com/app/banner/gamecenter_cn.png',
            // receiveData: props.language === 'zh-CN' ? defaultData_cn.data : defaultData_en.data, // 游戏数据（默认） TODO: 测试数据而已
        }
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('DCgamecenter');
        // 获取游戏列表
        this._getGameList();
        // 获取推荐的游戏列表
        this._getGameFeatured();
        // 获取最近使用的列表
        this._getGameListByIds();
    }

    componentWillReceiveProps(nextProps) {
        // 更新最新使用
        if (nextProps.ids.toString() != this.props.ids.toString()) {
            setTimeout(() => {
                this._getGameListByIds();
            }, 500);
        }
        return true;
    }

    /**
     * 根据ids获取游戏列表数据
     */
    _getGameListByIds() {
        getGameListByIds(this.props.ids, (err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res);
                if (receiveData.code === 0) {
                    this.setState({
                        isRequesting: false,
                        usedGamesList: receiveData.data
                    });
                }
            }
        });
    }

    /**
     * 获取推荐的游戏列表数据
     */
    _getGameFeatured() {
        getGameFeatured((err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res);
                this.setState({
                    isRequesting: false,
                    featuredList: receiveData.data
                });
            }
        });
    }

    /**
     * 获取游戏列表数据
     */
    _getGameList() {
        let {sort, page} = this.state;
        // 获取游戏列表数据
        let {isFullLoad, isRequesting} = this.state;
        if (isFullLoad || isRequesting) {
            return;
        }
        this.setState({
            isRequesting: true
        }, () => {
            try {
                getGameList({sort, page}, (err, res) => {
                    if (!err) {
                        const receiveData = JSON.parse(res);
                        if (receiveData.code === 0) {
                            if (receiveData.data.length !== 0) {
                                for (let item of receiveData.data) {
                                    this.state.gamesList.push(item);
                                }
                            } else {
                                this.setState({isFullLoad: true});
                            }
                        }
                        this.setState({
                            refreshing: false,
                            isRequesting: false,
                            page: this.state.page + 1
                        });
                    } else {
                        this.setState({
                            refreshing: false,
                            isRequesting: false
                        })
                    }
                });
            } catch (error) {
                this.setState({
                    refreshing: false,
                    isRequesting: false
                })
            }
        });
    }

    // 监听滚动
    _onScroll(event) {
        if(this.state.isRequesting || this.state.isFullLoad){
            return;
        }
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if(y + height >= contentHeight - 20){
            this._getGameList();
        }
    }

    /**
     * 下拉刷新
     */
    _onRefresh = () => {
        if (this.state.refreshing || this.state.isRequesting) {
            return;
        }
        this.setState({
            featuredList: [],
            gamesList: [],
            isFullLoad: false,
            isRequesting: false,
            refreshing: true,
            page: 1
        }, () => {
            this._getGameFeatured();
            this._getGameList();
            this._getGameListByIds();
        })
    }

    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#fff' }}>
                <ScrollView
                    scrollEventThrottle={1000}
                    onScroll={this._onScroll.bind(this)}
                    style={{ flex: 1 }}
                    // 刷新组件
                    refreshControl={
                        <RefreshControl
                            // 刷新状态
                            refreshing={this.state.refreshing}
                            // 刷新逻辑
                            onRefresh={this._onRefresh} />
                    }>
                        <ImageBackground
                            source={{uri: this.state.imageBackgroundURL}}
                            style={{
                                position: 'absolute',
                                height: Dimensions.get('window').width / 3 * 2,
                                top: (!Util.isiPhoneFullDisplay() ? -24 : 0)
                            }}>
                            <View
                                style={{
                                    width: Dimensions.get('window').width
                                }}
                            ></View>
                        </ImageBackground>

                        <View
                            style={{
                                backgroundColor: 'transparent'
                            }}>
                            <View style={{
                                paddingHorizontal: 15,
                                // 搜索框对机型屏幕进行适配
                                marginTop: Util.isiPhoneFullDisplay() ? 108 : 84
                            }}>
                                <SearchBar
                                    style={{
                                        width: '100%'
                                    }}
                                    ref={( searchBar ) => {
                                        this._searchBar = searchBar;
                                    }}
                                    placeholder={I18n.t( Keys.search )}
                                    onSubmitEditing={(text) => {
                                        this.props.navigation.navigate('GameCenterSearchResult', {keys: text})
                                    }}/>
                            </View>
                            {
                                this.state.usedGamesList.length > 0 ? (
                                    <View>
                                        <Text style={{
                                            fontSize: 14,
                                            color: '#b5b5b5',
                                            marginTop: 20,
                                            marginLeft: 15
                                        }}>{ I18n.t(Keys.recent_used) }</Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            marginHorizontal: 15,
                                            paddingBottom: 7.5,
                                            paddingTop: 10
                                        }}>
                                            {
                                                this.state.usedGamesList.map(item => {
                                                    return (
                                                        <BannerItemComponent
                                                            successCallback={(source) => {
                                                                let {id, title} = source
                                                                this.props.updateUsedList(id);
                                                                // 统计打点
                                                                AnalyticsUtil.onEventWithMap('DCdappall', { gameRecent: `dappId_${id}`, All: `dappId_${id}` } );
                                                            }}
                                                            imageStyle={{
                                                                borderWidth: 1,
                                                                borderColor: '#e8e8e8',
                                                                borderRadius: 15,
                                                            }}
                                                            id = {item.id}
                                                            title = {item.name}
                                                            icon={item.icon}
                                                            isAlert={item.is_alert}
                                                            isEOS={item.is_eos}
                                                            target={item.target}
                                                            component={this} />
                                                    )
                                                })
                                            }
                                        </View>
                                    </View>
                                ) : null
                            }
                        </View>

                        {/* 推荐栏位 */}
                        {
                            this.state.featuredList.length > 0 ? (
                                <BlockWrapperComponent
                                    successCallback = {(source) => {
                                        let {id, title} = source
                                        this.props.updateUsedList(id);
                                        // 统计打点
                                        AnalyticsUtil.onEventWithMap('DCdappall', { gameRecommend: `dappId_${id}`, All: `dappId_${id}` } );
                                    }}
                                    style={{
                                        paddingBottom: Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT + 0 : 0
                                    }}
                                    component = {this}
                                    items = {this.state.featuredList}
                                    title={I18n.t(Keys.game_center_recommend)}/>
                            ) : null
                        }

                        {/* 排序方法 */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 15,
                            marginBottom: 15,
                            marginTop: Platform.OS === 'ios' ? 15 : 40,
                        }}>

                            <TouchableOpacity
                                activeOpacity={
                                    this.state.isRequesting || this.state.sort === 'recommend' ? 1 : 0.7
                                }
                                onPress={() => {
                                    if (
                                        this.state.sort === 'recommend' ||
                                        this.state.isRequesting
                                    ) return;
                                    this.setState({
                                        sort: 'recommend',
                                        page: 1,
                                        gamesList: [],
                                        isFullLoad: false,
                                    }, () => {
                                        this._getGameList();
                                    })
                                }}>
                                <Text style={[
                                    styles.sortText,
                                    this.state.sort === 'recommend' ? styles.activeSort : {}
                                ]}>{I18n.t(Keys.sort_by_recommend)}</Text>
                            </TouchableOpacity>

                            <View style={styles.line}></View>

                            <TouchableOpacity
                                activeOpacity={
                                    this.state.isRequesting || this.state.sort === 'vol' ? 1 : 0.7
                                }
                                onPress={() => {
                                    if (
                                        this.state.sort === 'vol' ||
                                        this.state.isRequesting
                                    ) return;
                                    this.setState({
                                        sort: 'vol',
                                        page: 1,
                                        gamesList: [],
                                        isFullLoad: false,
                                    }, () => {
                                        this._getGameList();
                                    })
                                }}>
                                <Text style={[
                                    styles.sortText,
                                    this.state.sort === 'vol' ? styles.activeSort : {}
                                ]}>{I18n.t(Keys.sort_by_hot)}</Text>
                            </TouchableOpacity>

                        </View>
                        {
                            this.state.gamesList.map((item, index, array) => {
                                return (
                                    <GameCenterItem
                                        successCallback={(source) => {
                                            let {id, title} = source
                                            this.props.updateUsedList(id);
                                            // 统计打点
                                            AnalyticsUtil.onEventWithMap('DCdappall', { gameList: `dappId_${id}`, All: `dappId_${id}` } );
                                        }}
                                        desc={item.description}
                                        index={index}
                                        id={item.id}
                                        title={item.name}
                                        target={item.target}
                                        uri={item.icon}
                                        isAlert={item.is_alert}
                                        isEOS={item.is_eos}
                                        dau={ item['24h_active'] }
                                        volume={ item['24h_vol'] }
                                        dauPercent={ item['24h_active_percent'] }
                                        volumePercent={ item['24h_vol_percent'] }
                                        // 最否显示分割线
                                        hasDivider={ true }
                                        component={this}
                                    />
                                )
                            })
                        }
                        <Text style={[{ alignSelf: 'center', paddingVertical: 20 }]}>
                            {(!this.state.isFullLoad) ? I18n.t(Keys.loading) : I18n.t(Keys.token_detail_noMoreData)}
                        </Text>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    line: {
        width: 1,
        height: 10,
        marginHorizontal: 10,
        backgroundColor: '#e8e8e8'
    },
    sortText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999'
    },
    activeSort: {
        color: '#323232'
    }
});

// here is react-redux connect logic
function GameCenterProps ( store ) {
    return {
        account: getCurrentWallet(store, store.walletStore.currentWalletPrimaryKey),
        language: store.settingStore.language, // 当前语言
        discoveryAlertList: store.settingStore.discoveryAlertList_v2,
        ids: Object.assign([], store.settingStore.gamesUsedList)
    };
}
function GameCenterDispatch (dispatch) {
    return {
        dispatch,
        // 将当前的免责声明Dapps id记录下来
        updateDiscoveryAlert: (discoveryAlertList) => {
            dispatch({'type': settingActionTypes.DISCOVERY_ALERT_UPDATE, discoveryAlertList})
        },
        // 更新最近使用的历史记录
        updateUsedList: (id) => {
            // 游戏中心最近使用列表
            dispatch({'type': settingActionTypes.GAMES_USED_LIST_UPDATE, id});
            // 发现页最近使用列表
            dispatch({'type': settingActionTypes.DISCOVERY_USED_LIST_UPDATE, id});
        }
    }
}

export default connect(GameCenterProps, GameCenterDispatch)(GameCenterView);
