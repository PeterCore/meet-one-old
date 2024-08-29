/*
 * Component GameCenterSearchResult
 *
 * Description:
 *  游戏中心搜索结果页面
 *
 * @Author: JohnTrump
 * 2018-10-26: 2018-10-26 10:50
 * @Last Modified by: Dai.Bing
 * @Last Modified time: 2018-12-20 15:00:22
 */
import React from 'react';

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { connect } from "react-redux";

import {getCurrentWallet} from "../../../../actions/WalletAction";
import {getGameBySearch} from "../../../../net/DiscoveryNet";

import settingActionTypes from "../../../../reducers/setting/settingActionTypes";

import GameCenterItem from '../../../../components/discovery-styles/GameCenterItem';

import AnalyticsUtil from "../../../../util/AnalyticsUtil"

import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";

class GameCenterSearchResult extends React.Component {

    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: params.keys,
            // headerRight:
            //     <Button
            //         style={commonStyles.top_info_right_btn}
            //         title=''
            //         onPress={() => {
            //             navigation.state.params.share()
            //         }}>
            //         {I18n.t( Keys.share_title )}
            //     </Button>
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            key: props.navigation.state.params.keys, // 搜索关键词
            page: 1,
            sort: 'recommend', // 排序方式，默认按推荐排序
            isRequesting: false, // 是否正在请求
            isFullLoad: false, // 分页是否加载完成
            gamesList: []
        };
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <ScrollView
                    scrollEventThrottle={1000}
                    onScroll={this._onScroll.bind(this)}
                    style={{ flex: 1 }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 15,
                        marginVertical: 15
                    }}>
                        <TouchableOpacity
                            activeOpacity={
                                this.state.isRequesting || this.state.sort === 'recommend' ? 1 : 0.7
                            }
                            onPress={() => {
                                if (this.state.sort === 'recommend' || this.state.isRequesting) return
                                this.setState({
                                    sort: 'recommend',
                                    page: 1,
                                    gamesList: [],
                                    isFullLoad: false
                                }, () => {
                                    this._getGameBySearch()
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
                                this.state.isRequesting || this.state.sort === 'hot' ? 1 : 0.7
                            }
                            onPress={() => {
                                if (this.state.sort === 'hot' || this.state.isRequesting) return
                                this.setState({
                                    sort: 'hot',
                                    page: 1,
                                    gamesList: [],
                                    isFullLoad: false
                                }, () => {
                                    this._getGameBySearch()
                                })
                            }}>
                            <Text style={[
                                styles.sortText,
                                this.state.sort === 'hot' ? styles.activeSort : {}
                            ]}>{I18n.t(Keys.sort_by_hot)}</Text>
                        </TouchableOpacity>

                        <View style={styles.line}></View>

                        <TouchableOpacity
                            activeOpacity={
                                this.state.isRequesting || this.state.sort === 'vol' ? 1 : 0.7
                            }
                            onPress={() => {
                                if ( this.state.sort === 'vol' || this.state.isRequesting) return;
                                this.setState({
                                    sort: 'vol',
                                    page: 1,
                                    gamesList: [],
                                    isFullLoad: false
                                }, () => {
                                    this._getGameBySearch();
                                })
                            }}>
                            <Text style={[
                                styles.sortText,
                                this.state.sort === 'vol' ? styles.activeSort : {}
                            ]}>{I18n.t(Keys.sort_by_volume)}</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.gamesList.map((item, index, array) => {
                            return (
                                <GameCenterItem
                                    key={item.id}
                                    successCallback={(source) => {
                                        let {id, title} = source
                                        this.props.updateUsedList(id);
                                        // 统计打点
                                        AnalyticsUtil.onEventWithMap('DCdappall', { gameSearch: `dappId_${id}`, All: `dappId_${id}` } );
                                    }}
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

    _onScroll(event) {
        if(this.state.isRequesting || this.state.isFullLoad){
            return;
        }
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if(y + height >= contentHeight - 20){
            this._getGameBySearch();
        }
    }

    /**
     * 根据关键词获取搜索结果
     */
    _getGameBySearch() {
        let {key, page, sort} = this.state;
        let {isFullLoad, isRequesting} = this.state;
        if (isFullLoad || isRequesting) {
            return;
        }
        this.setState({
            isRequesting: true
        }, () => {
            try {
                getGameBySearch({key, page, sort}, (err, res) => {
                    if (!err) {
                        const receiveData = JSON.parse(res);
                        if (receiveData.code === 0) {
                            if (receiveData.data.length !== 0) {
                                for (let item of receiveData.data) {
                                    this.state.gamesList.push(item);
                                }
                            } else {
                                // 标记为加载完
                                this.setState({isFullLoad: true});
                            }
                        }
                        this.setState({
                            isRequesting: false,
                            page: this.state.page + 1
                        })
                    } else {
                        this.setState({
                            isRequesting: false
                        });
                    }
                })
            } catch (error) {
                this.setState({
                    isRequesting: false
                });
            }
        });
    }

    // 组件完成加载时调用，整个生命周期只调用一次
    componentDidMount() {
        this._getGameBySearch()
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
        color: '#999'
    },
    activeSort: {
        color: '#323232'
    }
});

// here is react-redux connect logic
function GameCenterSearchResultProps ( store ) {
    return {
        account: getCurrentWallet(store, store.walletStore.currentWalletPrimaryKey),
        language: store.settingStore.language, // 当前语言
        discoveryAlertList: store.settingStore.discoveryAlertList_v2,
        ids: Object.assign([], store.settingStore.gamesUsedList)
    };
}
function GameCenterSearchResultDispatch (dispatch) {
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

export default connect(GameCenterSearchResultProps, GameCenterSearchResultDispatch)(GameCenterSearchResult);
