import React from "react";
import { Dimensions, Image, Text, TextInput, TouchableOpacity, View, FlatList, ScrollView, RefreshControl, ImageBackground, Platform, StyleSheet, Alert } from "react-native";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import { getGameBySearch as getDappsBySearch } from "../../../net/DiscoveryNet";

import DappItemComponent from '../../../components/discovery-styles/DappItemComponent';

class EOSBrowserSearchResultPageView extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: params && params.keys || '',
        }
    };

    constructor( props ) {
        super( props );
        const {navigation} = props;
        const {state} = navigation;
        const {params} = state;
        this.state = {
            key: params && params.keys || '', // 搜索关键词
            page: 1,
            sort: 'recommend', // 排序方式，按照推荐排序
            isRequesting: false, // 是否正在请求
            isFullLoad: false, // 分页是否加载完成,
            dappsList: []
        }
    }

    componentDidMount() {
        this._getDappsList();
    }

    // 获取Dapps列表
    _getDappsList() {
        let {key ,page, sort, isFullLoad, isRequesting} = this.state;
        if (isFullLoad || isRequesting) {
            return;
        }
        this.setState({
            isRequesting: true
        }, () => {
            try {
                // 根据搜索关键词获取DAPPS列表（需求，这个页面获取的是所有的DAPPS，无论category）
                getDappsBySearch({key, page, sort, category: 'all'}, (err, res) => {
                    if (!err) {
                        const receiveData = JSON.parse(res);
                        if (receiveData.code === 0) {
                            if (receiveData.data.length !== 0) {
                                for (let item of receiveData.data) {
                                    this.state.dappsList.push(item);
                                }
                            } else {
                                // 标记为加载完
                                this.setState({isFullLoad: true});
                            }
                        }
                        this.setState({
                            isRequesting: false,
                            page: this.state.page + 1
                        });
                    } else {
                        this.setState({
                            isRequesting: false
                        });
                    }
                });
            } catch (error) {
                this.setState({
                    isRequesting: false
                });
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
            this._getDappsList();
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <ScrollView
                    scrollEventThrottle={1000}
                    onScroll={this._onScroll.bind(this)}
                    style={{flex: 1}}>
                    {
                        this.state.dappsList.length > 0 ? (
                            <View style={{
                                marginLeft: 15,
                                marginVertical: 15
                            }}>
                            {
                                this.state.dappsList.map((item, index, array) => {
                                    return (
                                        <DappItemComponent
                                            successCallback={(source) => {
                                                let {id, title} = source
                                                this.props.updateEOSBrowserHistory(id);
                                                // 统计打点
                                                AnalyticsUtil.onEventWithMap('DCdappall', { dappSearch: `dappId_${id}`, All: `dappId_${id}` } );
                                            }}
                                            imageStyle={{
                                                borderWidth: 1,
                                                borderColor: '#e8e8e8',
                                                borderRadius: 15,
                                            }}
                                            desc={item.description}
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
                                {/* 加载状态 */}
                                <Text style={[{ alignSelf: 'center', marginTop: 30, paddingVertical: 5}]}>
                                    {(!this.state.isFullLoad) ? I18n.t(Keys.loading) : I18n.t(Keys.token_detail_noMoreData)}
                                </Text>
                            </View>
                        ) : null
                    }

                </ScrollView>
            </View>
        )
    }
}

export default EOSBrowserSearchResultPageView;
