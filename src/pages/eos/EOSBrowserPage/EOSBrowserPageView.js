import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View, FlatList, ScrollView, RefreshControl, ImageBackground, Alert } from "react-native";
import Button from "react-native-button";
import Util from "../../../util/Util";
import TextUtil from "../../../util/TextUtil";
import NavigationUtil from '../../../util/NavigationUtil';
import AnalyticsUtil from '../../../util/AnalyticsUtil';
import lodash from "lodash";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import {
    getDappsFeatured,
    getGameList as getDappsList,
    getGameListByIds as getDappsListByIds,
    getGameBySearch as getDappsBySearch
} from "../../../net/DiscoveryNet";

import BannerItemComponent from '../../../components/discovery-styles/BannerItemComponent';
import DappItemComponent from '../../../components/discovery-styles/DappItemComponent';
import BlockWrapperComponent from '../../../components/discovery-styles/BlockWrapperComponent';

import SearchBar from "../../../components/SearchGameBar";

class EOSBrowserPageView extends React.Component {
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
                        source={require('../../../imgs/back-icon-ios.png')}
                        style={[{ width: 44, height: 44 }]} />
                </Button>
        }
    };

    constructor(props) {
        super(props);
        const lang = (props.language || 'zh-CN').split('-')[0]; // 获取当前语系
        this.state = {
            address: '', // 当前输入的链接
            sort: 'recommend', // 排序方式，默认按推荐排序
            page: 1, // 当前页码
            isSearching: false,
            isFullLoad: false, // 是否全部加载完毕
            isRequesting: false, // 是否正在请求数据
            refreshing: false, // 是否正在下拉刷新
            browserHistory: props.browserHistory,
            featuredList: [],
            dappsList: [], // Dapps列表数组
            searchResultsList: [], // 搜索结果列表
            searchKey: '', // 搜索关键词
            searchPage: 1, // 搜索结果的页码
            searchSort: 'recommend', // 搜索排序方式，按照推荐排序
            searchIsRequesting: false, // 是否正在加载搜索
            searchIsFullLoad: false, // 搜索结果是否到底
            imageBackgroundURL:
                lang === 'zh' ? 'https://static.ethte.com/app/banner/dappcenter_cn.png' :
                    lang === 'en' ? 'https://static.ethte.com/app/banner/dappcenter_en.png' :
                        lang === 'ko' ? 'https://static.ethte.com/app/banner/dappcenter_ko.png' : 'https://static.ethte.com/app/banner/dappcenter_cn.png',
        };

        this.getDappsBySearchThrottle = lodash.throttle(this._getDappsBySearch, 500);
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('DCdappcenter');

        // 获取Dapps列表
        this._getDappsList();
        // 获取热门推荐列表
        this._getDappsFeatured();
        const ids = this.props.browserHistory.filter((item) => {
            let address = item + "";
            return (!address.match(/^(http|https):\/\//ig));
        });
        setTimeout(() => {
            this._getDappsByIds(ids);
        }, 500);
    }

    componentWillReceiveProps(nextProps) {
        // 更新最近使用
        if (nextProps.browserHistory.toString() != this.props.browserHistory.toString()) {
            const ids = nextProps.browserHistory.filter((item) => {
                let address = item + "";
                return (!address.match(/^(http|https):\/\//ig));
            });
            setTimeout(() => {
                this._getDappsByIds(ids);
            }, 500);
        }
        return true;
    }

    // 获取Dapps列表
    _getDappsList() {
        let { sort, page } = this.state;
        // 获取游戏列表数据
        let { isFullLoad, isRequesting } = this.state;
        if (isFullLoad || isRequesting) {
            return;
        }
        this.setState({
            isRequesting: true
        }, () => {
            try {
                getDappsList({ sort, page, category: 1 }, (err, res) => {
                    if (!err) {
                        const receiveData = JSON.parse(res);
                        if (receiveData.code === 0) {
                            if (receiveData.data.length !== 0) {
                                for (let item of receiveData.data) {
                                    this.state.dappsList.push(item);
                                }
                            } else {
                                this.setState({ isFullLoad: true });
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
                })
            } catch (error) {
                this.setState({
                    refreshing: false,
                    isRequesting: false
                });
            }
        })
    }

    // 获取热门推荐的列表
    _getDappsFeatured() {
        getDappsFeatured((err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res);
                this.setState({
                    isRequesting: false,
                    featuredList: receiveData.data
                });
            }
        });
    }

    // 获取历史使用列表
    _getDappsByIds(ids) {
        getDappsListByIds(ids, (err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res).data;
                const { browserHistory } = this.props;
                const resultArr = [];
                for (let index = browserHistory.length - 1; index >= 0; index--) {
                    const element = browserHistory[index] + "";
                    if (element.match(/^(http|https):\/\//ig)) {
                        resultArr[index] = element;
                    } else {
                        resultArr[index] = receiveData.pop();
                    }
                }
                this.setState({
                    isRequesting: false,
                    browserHistory: resultArr
                })
            }
        })
    }

    // 获取搜索结果
    _getDappsBySearch() {
        let { searchKey, searchPage, sort, searchIsFullLoad, searchIsRequesting } = this.state;
        if (searchIsRequesting || searchIsFullLoad) {
            return;
        }
        this.setState({
            searchIsRequesting: true
        }, () => {
            getDappsBySearch({ key: searchKey, page: searchPage, sort, category: 'all' }, (err, res) => {
                if (!err) {
                    const receiveData = JSON.parse(res);
                    if (receiveData.code === 0) {
                        if (receiveData.data.length !== 0) {
                            for (let item of receiveData.data) {
                                this.state.searchResultsList.push(item);
                            }
                        } else {
                            // 标记为加载完
                            this.setState({ searchIsFullLoad: true });
                        }

                    }
                    this.setState({
                        searchIsRequesting: false,
                        searchPage: searchPage + 1
                    }, () => {
                        // 如果是第一页的话，尝试获取第二页
                        if (searchPage === 1) this._getDappsBySearch();
                    });
                } else {
                    this.setState({ searchIsRequesting: false });
                }
            });
        })
    }

    // 渲染最近访问列表
    renderItem({ item, index }) {
        if ((typeof item) === 'string') {
            // 网站类型的最近访问
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        flexDirection: 'row'
                    }}
                    onPress={() => {
                        // 维护这个队列，如果该item已经存在于队列中了，则前置
                        this.props.updateEOSBrowserHistory(item);
                        this.props.navigation.navigate('WebViewPage', {
                            url: item
                        })
                    }}>

                    <View style={{
                        justifyContent: 'center',
                        marginRight: 10
                    }}>
                        {/* 头像地址 */}
                        <Image
                            style={{ width: 30, height: 30, borderRadius: 9 }}
                            // 针对URL的记录，使用一张默认的图片
                            source={{ uri: 'https://static.ethte.com/app/banner/website.png' }} />
                    </View>

                    <View style={{
                        flex: 9,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 48
                    }}>
                        {/* 网址 */}
                        <Text
                            style={{ flexShrink: 1, fontSize: 16, color: '#323232' }}
                            numberOfLines={1}>
                            {item}
                        </Text>

                        {/* 箭头 */}
                        <Image
                            style={{ width: 6, height: 12 }}
                            source={require('../../../imgs/ic_right_arrow.png')} />
                    </View>
                </TouchableOpacity>
            )
        } else {
            // id类型的最近访问
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        flexDirection: 'row'
                    }}
                    onPress={() => {
                        if (!!!item) {
                            return;
                        }
                        let { is_eos: isEOS, is_alert: isAlert, target, id, name } = item;
                        let { account, discoveryAlertList } = this.props;
                        const component = this;

                        // 判断是否有需要判断钱包类型
                        if (isEOS === 1) {
                            if (!account) {
                                NavigationUtil.openInApp(navigation, 'EOSWalletImportPage');
                                return
                            }
                        }

                        // 判断是否需要显示免责声明
                        if (isAlert === 1) {
                            if (discoveryAlertList.includes(id)) {
                                // 维护这个队列，如果该item已经存在于队列中了，则前置
                                this.props.updateEOSBrowserHistory(id);
                                NavigationUtil.openURI({ component: component, url: target });
                                return;
                            }
                            Alert.alert(
                                I18n.t(Keys.dapps_alert_title),
                                I18n.t(Keys.dapps_alert_body),
                                [
                                    { text: I18n.t(Keys.cancel), onPress: () => { } },
                                    {
                                        text: I18n.t(Keys.confirm), onPress: () => {
                                            discoveryAlertList.push(id);
                                            // 维护这个队列，如果该item已经存在于队列中了，则前置
                                            this.props.updateEOSBrowserHistory(id);
                                            this.props.updateDiscoveryAlert(props.discoveryAlertList);
                                            NavigationUtil.openURI({ component: component, url: target });
                                        }
                                    }
                                ]
                            )

                        } else {
                            // 维护这个队列，如果该item已经存在于队列中了，则前置
                            this.props.updateEOSBrowserHistory(id);
                            NavigationUtil.openURI({ component: component, url: target });
                        }

                        // 统计打点
                        AnalyticsUtil.onEventWithMap('DCdappall', { dappRecent: `dappId_${id}`, All: `dappId_${id}` });
                    }}>

                    <View style={{
                        justifyContent: 'center',
                        marginRight: 10
                    }}>
                        {/* 头像地址 */}
                        <Image
                            style={{ width: 30, height: 30, borderRadius: 9 }}
                            // 如果没有icon，则显示默认图片
                            source={{ uri: item && item.icon ? item.icon : 'https://static.ethte.com/app/banner/website.png' }} />
                    </View>

                    <View style={{
                        flex: 9,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 44,
                    }}>
                        {/* 网址 */}
                        <Text
                            style={{ flexShrink: 1, fontSize: 16, color: '#323232' }}
                            numberOfLines={1}>
                            {item && item.name ? item.name : I18n.t(Keys.empty_data)}
                        </Text>

                        {/* 箭头 */}
                        <Image
                            style={{ width: 6, height: 12 }}
                            source={require('../../../imgs/ic_right_arrow.png')} />
                    </View>
                </TouchableOpacity>
            )
        }
    }

    // 监听滚动
    _onScroll(event) {
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if (y + height >= contentHeight - 20) {
            if (this.state.isSearching) {
                if(this.state.searchIsRequesting || this.state.searchIsFullLoad){
                    return;
                }
                this._getDappsBySearch();
            } else {
                if (this.state.isRequesting || this.state.isFullLoad) {
                    return;
                }
                this._getDappsList();
            }
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
            dappsList: [],
            isFullLoad: false,
            isRequesting: false,
            refreshing: true,
            page: 1
        }, () => {
            this._getDappsList();
            this._getDappsFeatured();
        })
    }

    render() {
        const screenWidth = Dimensions.get('window').width; // 获取屏幕宽度
        const screenHeight = Dimensions.get('window').height; // 获取屏幕高度
        const isiPhoneFullDisplay = Util.isiPhoneFullDisplay(); // 是否为iphone系列的全面屏

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* 滚动组件 */}
                <ScrollView
                    keyboardDismissMode={'on-drag'}
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
                    {/* 背景图组件 */}
                    <ImageBackground
                        source={{ uri: this.state.imageBackgroundURL }}
                        style={{
                            position: 'absolute',
                            height: screenWidth / 3 * 2,
                            top: (!isiPhoneFullDisplay ? -24 : 0)
                        }}>
                        <View
                            style={{
                                width: screenWidth
                            }}
                        ></View>
                    </ImageBackground>

                    <View style={{
                        backgroundColor: 'transparent'
                    }}>
                        <View style={{
                            // paddingHorizontal: 15,
                            // 搜索框对机型屏幕进行适配
                            marginTop: isiPhoneFullDisplay ? 108 : 84
                        }}>
                            {/* 搜索框 */}
                            <SearchBar
                                scrollEventThrottle={1000}
                                onScroll={this._onScroll.bind(this)}
                                style={{
                                    width: '100%',
                                    paddingHorizontal: 15,
                                    // marginBottom: 20
                                }}
                                ref={(searchBar) => {
                                    this._searchBar = searchBar;
                                }}
                                showSubmit={false}
                                placeholder={I18n.t(Keys.search_bar_url)}
                                onSearchChange={(sourceText) => {
                                    // 去掉首尾空格
                                    let text = sourceText.trim();
                                    // 清空搜索结果
                                    this.setState({
                                        searchResultsList: [],
                                        searchPage: 1,
                                        searchKey: text,
                                        searchIsFullLoad: false,
                                        searchIsRequesting: false
                                    });

                                    if (text.length > 0) {
                                        this.setState({
                                            isSearching: true,
                                        }, () => {
                                            this.getDappsBySearchThrottle();
                                        })

                                    } else {
                                        // 无关键字
                                        this.setState({
                                            isSearching: false,
                                        })
                                    }
                                }} />

                            {!this.state.isSearching ? (
                                <View style={{
                                    paddingHorizontal: 15
                                }}>
                                    {/* 最近使用 */}
                                    {
                                        this.state.browserHistory.length > 0 ?
                                            (
                                                <View style={{
                                                    marginBottom: 30 ,
                                                    marginTop: 20
                                                }}>
                                                    {/* 最近访问Wrapper */}
                                                    <View style={{
                                                        justifyContent: 'space-between',
                                                        flexDirection: 'row',
                                                        // marginBottom: 10
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 14,
                                                            color: '#999',
                                                        }}>{I18n.t(Keys.recent_used)}</Text>
                                                        {/* 清空历史记录 */}
                                                        <TouchableOpacity onPress={() => {
                                                            // 提示是否清空历史记录
                                                            Alert.alert(
                                                                I18n.t(Keys.dapps_alert_title),
                                                                I18n.t(Keys.clean_recent_visited_alert),
                                                                [
                                                                    { text: I18n.t(Keys.cancel), onPress: () => { } },
                                                                    {
                                                                        text: I18n.t(Keys.confirm), onPress: () => {
                                                                            // 清空历史记录，增加一个Alert提示
                                                                            this.props.updateEOSBrowserHistory(null)
                                                                        }
                                                                    }
                                                                ]
                                                            )
                                                        }}>
                                                            <Text style={{
                                                                fontSize: 14,
                                                                color: '#999999'
                                                            }}>{I18n.t(Keys.eos_browser_history_clear)}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    {/* 最近访问FlatList */}
                                                    <FlatList
                                                        style={{ flex: 1, marginTop: 15 }}
                                                        data={this.state.browserHistory}
                                                        keyExtractor={(item, index) => {
                                                            return index + '';
                                                        }}
                                                        renderItem={({ item, index }) => {
                                                            return this.renderItem({ item, index });
                                                        }}
                                                        // 最底部的分割线
                                                        ListFooterComponent={() => {
                                                            return <View style={[{
                                                                height: Util.getDpFromPx(1),
                                                                backgroundColor: '#e8e8e8',
                                                                marginLeft: 40,
                                                                marginBottom: 4
                                                            }]} />
                                                        }}
                                                        // 每一项的分割线
                                                        ItemSeparatorComponent={() => {
                                                            return <View style={[{
                                                                height: Util.getDpFromPx(1),
                                                                backgroundColor: '#e8e8e8',
                                                                marginLeft: 40,
                                                                marginBottom: 4
                                                            }]} />
                                                        }}
                                                    />
                                                </View>
                                            ) : null
                                    }
                                    {/* 热门应用 */}
                                    {
                                        this.state.featuredList.length > 0 ?
                                            this.state.featuredList[0].type == 1 ? (
                                                // type == 1的情况，使用BannerItemComponent组件
                                                <View style={{
                                                    flexGrow: 1,
                                                }}>
                                                    <Text style={{
                                                        fontSize: 14,
                                                        color: '#999'
                                                    }}>{I18n.t(Keys.hot_dapps)}</Text>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        flexWrap: 'wrap',
                                                        paddingBottom: 40,
                                                        paddingTop: 20,
                                                        borderBottomWidth: Util.getDpFromPx(1),
                                                        borderColor: '#e8e8e8'
                                                    }}>
                                                        {
                                                            this.state.featuredList.map(item => {
                                                                return (
                                                                    <BannerItemComponent
                                                                        successCallback={(source) => {
                                                                            let { id, title } = source
                                                                            this.props.updateEOSBrowserHistory(id);
                                                                            // 统计打点
                                                                            AnalyticsUtil.onEventWithMap('DCdappall', { dappFeature: `dappId_${id}`, All: `dappId_${id}` });
                                                                        }}
                                                                        imageStyle={{
                                                                            borderWidth: 1,
                                                                            borderColor: '#e8e8e8',
                                                                            borderRadius: 15,
                                                                        }}
                                                                        id={item.id}
                                                                        title={item.title}
                                                                        icon={item.uri}
                                                                        isAlert={item.is_alert}
                                                                        isEOS={item.is_eos}
                                                                        target={item.target}
                                                                        component={this} />
                                                                )
                                                            })
                                                        }
                                                    </View>
                                                </View>
                                            ) : (
                                                    // type != 1的情况，使用BlockWrapperComponent组件
                                                    <View>
                                                        <Text style={{
                                                            fontSize: 14,
                                                            color: '#999'
                                                        }}>{I18n.t(Keys.hot_dapps)}</Text>
                                                        <BlockWrapperComponent
                                                            successCallback={(source) => {
                                                                let { id, title } = source
                                                                // 统计打点
                                                                AnalyticsUtil.onEventWithMap('DCdappall', { dappFeature: `dappId_${id}`, All: `dappId_${id}` });
                                                            }}
                                                            items={this.state.featuredList}
                                                            component={this}
                                                            style={{
                                                                paddingHorizontal: 0,
                                                                borderBottomWidth: Util.getDpFromPx(1),
                                                                paddingBottom: 30,
                                                                paddingTop: 15,
                                                                borderColor: '#e8e8e8'
                                                            }}
                                                            isDiscovery={false} />
                                                    </View>
                                                ) : null
                                    }
                                    {/* Dapps 列表 */}
                                    {
                                        this.state.dappsList.length > 0 ? (
                                            <View
                                                style={{
                                                    flexWrap: 'wrap',
                                                    paddingBottom: 30,
                                                    paddingTop: this.state.featuredList.length > 0 ? 15 : 0
                                                }}>
                                                {
                                                    this.state.dappsList.map(item => {
                                                        return (
                                                            <DappItemComponent
                                                                successCallback={(source) => {
                                                                    let { id, title } = source
                                                                    this.props.updateEOSBrowserHistory(id);
                                                                    // 统计打点
                                                                    AnalyticsUtil.onEventWithMap('DCdappall', { dappList: `dappId_${id}`, All: `dappId_${id}` });
                                                                }}
                                                                imageStyle={{
                                                                    borderWidth: 1,
                                                                    borderColor: '#e8e8e8',
                                                                    borderRadius: 15,
                                                                }}
                                                                desc={item.description}
                                                                id={item.id}
                                                                title={item.name}
                                                                icon={item.icon}
                                                                isAlert={item.is_alert}
                                                                isEOS={item.is_eos}
                                                                target={item.target}
                                                                component={this} />
                                                        )
                                                    })
                                                }
                                                {/* 加载状态 */}
                                                <Text style={[{ alignSelf: 'center', marginTop: 30, paddingVertical: 5 }]}>
                                                    {(!this.state.isFullLoad) ? I18n.t(Keys.loading) : I18n.t(Keys.token_detail_noMoreData)}
                                                </Text>
                                            </View>
                                        ) : null
                                    }
                                </View>) :
                                (
                                    <View>
                                        {/* 显示直接打开 */}
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 10,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 15,
                                                borderBottomColor: '#E8E8E8',
                                                borderBottomWidth: Util.getDpFromPx(1)
                                            }}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                // 使用浏览器直接打开
                                                const searchKey = this.state.searchKey;
                                                let address = searchKey;
                                                // 如果没有输入的话
                                                if (TextUtil.isEmpty(searchKey)) {
                                                    return;
                                                }
                                                if (!searchKey.match(/^(http|https):\/\//ig)) {
                                                    // 如果没有填写http的话，自动补齐成http
                                                    address = 'http://' + searchKey;
                                                }
                                                // 推到历史记录中
                                                this.props.updateEOSBrowserHistory(address);
                                                this.props.navigation.navigate('WebViewPage', {
                                                    url: address
                                                });
                                            }}>
                                            <Image
                                                style={{
                                                    width: 17.2,
                                                    height: 17.2,
                                                    marginLeft: 15,
                                                    marginRight: 10
                                                }}
                                                source={require('../../../imgs/browser-search.png')} />
                                            <Text
                                                numberOfLines={1}
                                                style={{ fontSize: 16, color: '#323232', width: screenWidth - 50 }}>
                                                {I18n.t(Keys.open_dapps_directly)} {this.state.searchKey}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={{ paddingHorizontal: 15 }}>
                                            {
                                                this.state.searchResultsList.map((item, index, array) => {
                                                    return (
                                                        <DappItemComponent
                                                            successCallback={(source) => {
                                                                let { id, title } = source
                                                                this.props.updateEOSBrowserHistory(id);
                                                                // 统计打点
                                                                AnalyticsUtil.onEventWithMap('DCdappall', { dappSearch: `dappId_${id}`, All: `dappId_${id}` });
                                                            }}
                                                            imageStyle={{
                                                                borderWidth: 1,
                                                                borderColor: '#e8e8e8',
                                                                borderRadius: 15,
                                                            }}
                                                            desc={item.description}
                                                            id={item.id}
                                                            title={item.name}
                                                            icon={item.icon}
                                                            isAlert={item.is_alert}
                                                            isEOS={item.is_eos}
                                                            target={item.target}
                                                            component={this} />
                                                    )
                                                })
                                            }
                                        </View>
                                        {/* 加载状态 */}
                                        <Text style={[{ alignSelf: 'center', marginTop: 5, paddingVertical: 15 }]}>
                                            {(!this.state.searchIsFullLoad) ? I18n.t(Keys.loading) : I18n.t(Keys.token_detail_noMoreData)}
                                        </Text>
                                    </View>
                                )
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default EOSBrowserPageView;
