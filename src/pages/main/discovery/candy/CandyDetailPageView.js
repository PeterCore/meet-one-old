/*
 * @Desc: 糖果详情页
 * @Author: JohnTrump
 * @Date: 2018-06-13 16:08:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-06-14 19:26:231
 */

import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import Button from "react-native-button";
import AutoLink from 'react-native-autolink';
import Spinner from 'react-native-loading-spinner-overlay';
import StarRating from 'react-native-star-rating';
import LoadingView from "../../../../components/LoadingView";
import commonStyles from "../../../../styles/commonStyles";
import ShareComponent from "../../../../components/ShareComponent";
import { netCandyDetail, netCandyDetailShare } from "../../../../net/DiscoveryNet";
import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";
import Footer from "../FooterView";
import Markdown from "../MarkdownView";
import AnalyticsUtil from "../../../../util/AnalyticsUtil";
import { getBestNodeServerHost } from "../../../../reducers/meta/metaReducer";

class CandyDetailPageView extends Component {

    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: '糖果详情',
            headerRight:
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.share()
                    }}>
                    {I18n.t(Keys.share_title)}
                </Button>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            id: props.navigation.state.params.id,
            isRequesting: true,
            shareBody: {},
            isOpenShare: false,
            detailData: {},
            total: 5
        }
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('DCcandydetail');
        // 获取接口信息
        netCandyDetail(this.state.id, (err, res) => {
            const receiveData = JSON.parse(res);
            this.setState({
                isRequesting: false,
                detailData: receiveData.data[0],
                total: receiveData.total
            });
        });
    }

    componentWillMount() {
        // 向Navigation注入分享逻辑 _share()
        this._share = this._share.bind(this);
        this.props.navigation.setParams({ share: this._share });
    }

    loadShareContent() {
        // 显示正在加载中
        this.setState({
            isRequesting: true
        });
        // 去获取分享的二维码
        netCandyDetailShare(this.state.id, (err, res) => {
            const receiveData = JSON.parse(res);
            url = receiveData.data.url[0];
            this.setState({
                isRequesting: false,
                isOpenShare: true,
                shareBody: {
                    content: '这个EOS糖果挺不错的，快来看下！',
                    // 调用这个方法获取当前的服务器地址
                    image: `${getBestNodeServerHost()}/${url}`,
                    // website: env.meet_url,
                    title: I18n.t(Keys.app_name)
                }
            });
        })
    }

    _share() {
        this.loadShareContent();
    }

    render() {
        const { goBack } = this.props.navigation;
        return (
            <View style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView>
                    {/* Banner */}
                    <Image
                        // Android层级显示出现了问题，调成-1试下
                        style={{ height: 140 }}
                        source={{ uri: this.state.detailData.banner_detail ? this.state.detailData.banner_detail : 'https://meet.one/mobile/images/wx_default_banner.png' + '?imageView2/0/w/750/h/240' }} />
                    {/* 空投的基本信息 */}
                    {/* Block-1 */}
                    <View style={[styles.card]}>
                        {/* Logo */}
                        <Image
                            style={[styles.logo, Platform.OS === 'ios' ? {} : { marginTop: 50 }]}
                            source={{ uri: this.state.detailData.logo ? this.state.detailData.logo : '' + '?imageView2/0/w/128/h/128' }}
                        ></Image>
                        {/* Title */}
                        <View style={[styles.item, { paddingVertical: 30 }]}>
                            <Text selectable={true} style={[styles.text, styles.name, Platform.OS === 'ios' ? {} : { marginLeft: 80 }]}>{this.state.detailData.name}</Text>
                        </View>

                        {/* 项目的评级 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>项目评级</Text>
                            <StarRating
                                containerStyle={{
                                    justifyContent: 'flex-start'
                                }}
                                starStyle={{
                                    paddingTop: 5,
                                    paddingRight: 3
                                }}
                                disabled={true}
                                maxStars={this.state.total}
                                rating={this.state.detailData.score}
                                starSize={20}
                                fullStarColor={'#EEA600'}
                            />
                            {/* </Text> */}
                        </View>

                        {/* 区域、类型、项目阶段 */}
                        <View style={[styles.item, {
                            paddingRight: 30,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }]}>
                            {/* 区域 */}
                            <View>
                                <Text style={[styles.label]}>区域</Text>
                                <Text style={[styles.text]}>{this.state.detailData.location ? this.state.detailData.location : '暂无数据'}</Text>
                            </View>
                            {/* 产品类型 */}
                            <View>
                                <Text style={[styles.label]}>产品类型</Text>
                                <Text style={[styles.text]}>{this.state.detailData.category ? this.state.detailData.category : '暂无数据'}</Text>
                            </View>
                            {/* 项目阶段 */}
                            <View>
                                <Text style={[styles.label]}>项目阶段</Text>
                                <Text style={[styles.text]}>{this.state.detailData.dev_progress ? this.state.detailData.dev_progress : '暂无数据'}</Text>
                            </View>
                        </View>

                        {/* 网址 */}
                        <View style={[styles.item, this.state.detailData.token ? null : styles.item_no_boder]}>
                            <Text style={[styles.label]}>网址</Text>
                            <AutoLink
                                style={[styles.text]}
                                linkStyle={[styles.website]}
                                stripPrefix={false}
                                phone={false}
                                text={this.state.detailData.link ? this.state.detailData.link : '暂无数据'}
                                onPress={(url) => this.props.openLink(url)} />
                        </View>

                        {/* Token */}
                        <View style={[styles.item, styles.item_no_boder, this.state.detailData.token ? null : { display: 'none' }]}>
                            <Text style={[styles.label]}>Token</Text>
                            <Text style={[styles.text]} selectable={true}>{this.state.detailData.token}</Text>
                        </View>

                    </View>

                    {/* Block-2 */}
                    <View style={[styles.card]}>
                        {/* :before for Title */}
                        <View style={[styles.card_title_before]}></View>
                        <Text style={[styles.card_title]}>糖果信息</Text>

                        {/* 空投时间 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>空投时间</Text>
                            <Text style={[styles.text]} selectable={true}>{this.state.detailData.airdrop_time_desc ? this.state.detailData.airdrop_time_desc : '暂无数据'}</Text>
                        </View>

                        {/* 快照时间 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>快照时间</Text>
                            <Text style={[styles.text]} selectable={true}>{this.state.detailData.snapshot_time_desc ? this.state.detailData.snapshot_time_desc : '暂无数据'}</Text>
                        </View>

                        {/* 糖果数量 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>糖果总量</Text>
                            <Text style={[styles.text]} selectable={true}>{this.state.detailData.count ? this.state.detailData.count : '暂无数据'}</Text>
                        </View>

                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>空投比例</Text>
                            <Text style={[styles.text]} selectable={true}>{this.state.detailData.proportion ? this.state.detailData.proportion : '暂无数据'}</Text>
                        </View>

                        <View style={[styles.item, styles.item_no_boder]}>
                            <Text style={[styles.label]}>空投规则</Text>
                            <View
                                style={[styles.item_text, { paddingTop: 5 }]}>
                                <Markdown
                                    openLink={this.props.openLink}
                                    text={this.state.detailData.rules ? this.state.detailData.rules : '暂无数据'} />
                            </View>
                        </View>
                    </View>

                    {/* Block-3 */}
                    <View style={[styles.card, { marginBottom: 0 }]}>
                        {/* :before for Title */}
                        <View style={[styles.card_title_before]}></View>
                        <Text style={[styles.card_title]}>项目介绍</Text>
                        <View
                            style={[styles.item_no_boder, styles.item_text, { paddingTop: 5 }]}>
                            <Markdown
                                openLink={this.props.openLink}
                                text={this.state.detailData.introduction ? this.state.detailData.introduction : '暂无数据'} />
                        </View>
                        <Footer />
                    </View>
                </ScrollView>
                {/* 返回上一页 */}
                {/* <GoBackView callback={goBack}/> */}
                {/* 分享 */}
                {/* <GoShareView callback={goBack}/> */}
                {/* 加载中 */}
                {/* 分享组件 */}
                <ShareComponent
                    isOpen={this.state.isOpenShare}
                    onClose={() => {
                        this.setState({
                            isOpenShare: false
                        });
                    }}
                    onCancel={() => {

                    }}
                    shareBody={this.state.shareBody}
                />
                <Spinner visible={this.state.isRequesting} children={<LoadingView />} />
            </View>
        )
    }

};

const styles = StyleSheet.create({

    card: {
        position: 'relative',
        marginBottom: 10,
        paddingTop: 10,
        paddingLeft: 15,
        paddingBottom: 0,
        paddingRight: 15,
        backgroundColor: '#fff',
    },

    card_title_before: {
        position: 'absolute',
        left: 10,
        width: 3,
        height: 12,
        marginTop: 18,
        backgroundColor: '#1BCE9A'
    },

    card_title: {
        lineHeight: 24,
        paddingLeft: 5,
        fontSize: 18,
        fontWeight: '600'
    },

    logo: {
        position: 'absolute',
        width: 64,
        height: 64,
        top: -34,
        left: 15,
        overflow: 'hidden',
        // 圆形带边框的样式
        backgroundColor: '#fff',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#fff'
    },

    name: {
        // paddingTop: 20,
        fontSize: 22,
        lineHeight: 24,
        fontWeight: '600'
    },

    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8'
    },

    // 正文
    item_text: {
        lineHeight: 24
    },

    item_no_boder: {
        borderBottomWidth: 0,
    },

    label: {
        fontSize: 14,
        lineHeight: 24,
        color: '#999'
    },

    text: {
        fontSize: 16,
        lineHeight: 24
    },

    website: {
        fontSize: 16,
        color: '#34abff'
    },

});

export default CandyDetailPageView;
