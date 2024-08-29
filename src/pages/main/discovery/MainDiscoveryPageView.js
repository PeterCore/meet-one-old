import React, { Component } from 'react';
import { Image, Platform, ScrollView, View, RefreshControl } from 'react-native';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import {netDiscovery, getGameListByIds as getListByIds} from '../../../net/DiscoveryNet';
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import BannerWrapperComponent from '../../../components/discovery-styles/BannerWrapperComponent';
import BlockWrapperComponent from '../../../components/discovery-styles/BlockWrapperComponent';
import BannerItemComponent from '../../../components/discovery-styles/BannerItemComponent';

import defaultData_en from "../../../../data/discovery_data_en";
import defaultData_cn from "../../../../data/discovery_data_cn";

export default class MainDiscoveryPageView extends Component {
    static navigationOptions = ( props ) => {
        return {
            title: I18n.t( Keys.main_tab_discovery ),
            // TabBar图标的切换
            tabBarIcon: ( { focused, tintColor } ) => (
                focused ?
                    <Image
                        source={require( '../../../imgs/tabbar_btn_discover_active.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
                    :
                    <Image
                        source={require( '../../../imgs/tabbar_btn_discover.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
            ),
            header: null
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            receiveData: props.language === 'zh-CN' ? defaultData_cn.data : defaultData_en.data,
            refreshing: false,
            usedGamesList: [], // 最近使用
        }
    }

    componentWillReceiveProps(nextProps) {
        // 更新最新使用
        if (nextProps.ids.toString() != this.props.ids.toString()) {
            setTimeout(() => {
                this._getListByIds();
            }, 500);
        }

        // 切换用户后重新请求发现页
        if (this.props.account && (nextProps.account.accountName !== this.props.account.accountName )) {
            this._onRefresh();
        }
        return true;
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('DCmainpage');

        this._getDiscovery();
        // 获取最近使用的列表
        this._getListByIds();
    }

    /**
     * 根据ids获取最近使用的列表数据
     */
    _getListByIds() {
        getListByIds(this.props.ids, (err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res);
                if (receiveData.code === 0) {
                    this.setState({
                        discoveryUsedList: receiveData.data
                    });
                }
            }
        });
    }

    /**
     * 获取发现页数据结构
     */
    _getDiscovery() {
        this.setState({
            refreshing: true
        });
        netDiscovery({
            netType: this.props.netType
        },(err, res) => {
            if (!err) {
                try {
                    const receiveData = JSON.parse(res);
                    this.setState({
                        refreshing: false,
                        receiveData: receiveData.data
                    });
                } catch (error) {
                    console.log('netDiscovery occur an error');
                }
            }
        });
    }

    /**
     * 下拉刷新
     */
    _onRefresh = () => {
        this._getDiscovery();
        this._getListByIds();
    }

    render() {
        return (
            <View style={[commonStyles.wrapper, { backgroundColor: '#fafafa'}]}>
                <ScrollView
                    style={[
                        commonStyles.wrapper,
                        {backgroundColor: '#fafafa'}
                    ]}
                    refreshControl={
                        <RefreshControl
                            // 刷新状态
                            refreshing={false}
                            // 刷新逻辑
                            onRefresh={this._onRefresh} />
                    }>
                    {/* Banner Component */}
                    <BannerWrapperComponent
                        successCallback={({relative_dapps_id, id, title, isDiscoveryRecent}) => {
                            let analyticsId = `discId_${id}`;
                            if (relative_dapps_id) {
                                // dispatch to update recent used list
                                this.props.updateUsedList(relative_dapps_id);
                                // All 标签下的统计，如果有dappId，就用dappId
                                analyticsId = `dappId_${relative_dapps_id}`
                            }

                            if (isDiscoveryRecent) {
                                AnalyticsUtil.onEventWithMap('DCdappall', { DiscoveryRecent: `dappId_${relative_dapps_id}`, All: `dappId_${relative_dapps_id}` } );
                            } else {
                                AnalyticsUtil.onEventWithMap('DCdappall', { Discovery: `discId_${id}`, All: analyticsId } );
                            }
                        }}
                        component={this}
                        bannerItems={this.state.discoveryUsedList} // 最近使用
                        bannerSwiper={this.state.receiveData.banner_swiper} // 海报
                        imageBackgroundURL={this.state.receiveData.banner_background} // 背景图
                    />
                    {/* BlockWrapperComponent */}
                    {this.state.receiveData && this.state.receiveData.common_blocks && this.state.receiveData.common_blocks.map((item, index, arr) => {
                            return (
                                <View style={{
                                }}>
                                    <BlockWrapperComponent
                                        successCallback={({relative_dapps_id, id, title}) => {
                                            let analyticsId = `discId_${id}`;
                                            if (relative_dapps_id) {
                                                // dispatch to update recent used list
                                                this.props.updateUsedList(relative_dapps_id);
                                                // All 标签下的统计，如果有dappId，就用dappId
                                                analyticsId = `dappId_${relative_dapps_id}`
                                            }
                                            AnalyticsUtil.onEventWithMap('DCdappall', { Discovery: `discId_${id}`, All: analyticsId } );
                                        }}
                                        isDiscovery={true}
                                        component = {this}
                                        style={{
                                            paddingBottom: arr.length == index + 1 ? Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT + 20 : 20 : 0,
                                            backgroundColor: (!this.state.receiveData.banner_background && index === 0) ? '#fff' : 'transparent'
                                        }}
                                        items = {item.items}
                                        title={item.NAME}/>
                                    {/* BannerItemComponent */}
                                    {index == 0 && this.state.receiveData.banner_items && this.state.receiveData.banner_items.length > 0 ? (
                                        <View style={{
                                            backgroundColor: this.state.receiveData.banner_background ? 'transparent' : '#fff',
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            paddingHorizontal: 15,
                                            paddingBottom: 10,
                                            paddingTop: 10
                                        }}>
                                        {this.state.receiveData.banner_items && this.state.receiveData.banner_items.map(item => {
                                            return (
                                                <BannerItemComponent
                                                    successCallback={({relative_dapps_id, id, title}) => {
                                                        let analyticsId = `discId_${id}`;
                                                        if (relative_dapps_id) {
                                                            // dispatch to update recent used list
                                                            this.props.updateUsedList(relative_dapps_id);
                                                            // All 标签下的统计，如果有dappId，就用dappId
                                                            analyticsId = `dappId_${relative_dapps_id}`
                                                        }
                                                        AnalyticsUtil.onEventWithMap('DCdappall', { Discovery: `discId_${id}`, All: analyticsId } );
                                                    }}
                                                    relative_dapps_id={item.relative_dapps_id}
                                                    id = {item.id}
                                                    title={item.title}
                                                    icon={item.uri}
                                                    isAlert={item.is_alert}
                                                    isEOS={item.is_eos}
                                                    target={item.target}
                                                    component={this}/>
                                            )
                                        })}
                                        </View>
                                    ) : null}
                                </View>
                            )
                    })}
                </ScrollView>
            </View>
        );
    }
}
