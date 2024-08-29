import React, { Component } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from 'react-navigation';
import IconSet from "../../../../components/IconSet";

import commonStyles from "../../../../styles/commonStyles";
import { netCandyFeatured, netCandyList } from "../../../../net/DiscoveryNet";
import Util from "../../../../util/Util";
import AnalyticsUtil from "../../../../util/AnalyticsUtil";

const screenRate = Dimensions.get( 'window' ).width / 375;

const SectionTitle = ({type, sort, text}) => {
    if (sort !== 'timeline') {
        if (text === 'overtime') {
            if (type === 'snapshot') {
                return (
                    <Text style={styles.sectionTitleText}>已快照</Text>
                )
            } else {
                return (
                    <Text style={styles.sectionTitleText}>已空投</Text>
                )
            }
        } else if (text === 'notime'){
            // 时间未定
            return (
                <Text style={styles.sectionTitleText}>时间未定</Text>
            )
        }
    }
    // 正常月份
    return (
        <Text style={styles.sectionTitleText}> {text} </Text>
    )

}

class CandyPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: 'EOS 糖果信息'
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            isRequesting: false,
            isFullLoad: false,
            candiesList: {},
            featuredList: [],
            type: 'airdrop',
            page: 1,
            sort: 'timeline'
        }
    }
    componentDidMount() {
        AnalyticsUtil.onEvent('DCcandylist');
        // 获取featured信息
        netCandyFeatured((err, res) => {
            if (!err) {
                const receiveData = JSON.parse(res);
                this.setState({
                    isRequesting: false,
                    featuredList: receiveData.data
                });
            }
        });

        this._getCandies();
    }

    _getCandies() {
        let {isFullLoad, isRequesting} = this.state;
        if (isFullLoad || isRequesting) {
            return;
        }

        this.setState({
            isRequesting: true
        });
        let {type, sort, page} = this.state;
        netCandyList({type, sort, page, time: Util.formatDate()}, (err, res) => {
            if (err) {
                return
            }
            const receiveData = JSON.parse(res);
            const KEY = this.state.type === 'snapshot' ? 'snapshot_time' : 'airdrop_time';
            // 原本的数据
            let candiesList = this.state.candiesList;
            let sort = this.state.sort;
            if (receiveData.code === 0) {
                if (receiveData.data.length !== 0) {
                    // 此分页有内容
                    for (let item of receiveData.data) {
                        if (sort === 'timeline') {
                            // 时间线排序
                            item[KEY] = item[KEY] ? Util.formatDate(item[KEY], 'YYYY/MM/DD') : '暂无数据';
                            let yearMonthDay = item[KEY].split('/');
                            let classTime = yearMonthDay[0] + ' 年 ' +yearMonthDay[1] + ' 月 ';
                            // 如果没有这个字段，则创建
                            if (item[KEY] && !candiesList[classTime]) {
                                candiesList[classTime] = [];
                            }
                            candiesList[classTime].push(item);
                        } else if (sort === 'overtime') {
                            // 已结束
                            if (item[KEY] && !candiesList['overtime']) {
                                candiesList['overtime'] = [];
                            }
                            candiesList['overtime'].push(item);
                        } else if (sort === 'notime') {
                            // 没有时间
                            if (item[KEY] && !candiesList['notime']) {
                                candiesList['notime'] = [];
                            }
                            candiesList['notime'].push(item);
                        }
                    }
                    // 处理完之后，更新
                    this.setState({
                        candiesList,
                        isRequesting: false,
                        page: this.state.page + 1
                    });
                } else {
                    // 此分页已经加载完
                    if (sort === 'timeline') {
                        this.setState({ page: 1, sort: 'notime', isRequesting: false }, () => {
                            this._getCandies();
                        });
                    } else if (sort === 'notime') {
                        this.setState({ page: 1, sort: 'overtime', isRequesting: false }, () => {
                            this._getCandies();
                        });
                    } else if (sort === 'overtime') {
                        this.setState({ isFullLoad: true, isRequesting: false });
                    }
                }
            }
        });
    }

    _onScroll(event) {
        if(this.state.isRequesting){
            return;
        }
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if(y + height >= contentHeight - 20){
            this._getCandies();
        }
    }

    render() {
        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView
                    onScroll={this._onScroll.bind(this)}
                    scrollEventThrottle={50}>
                    {/* 推荐 */}
                    <View style={[ styles.section, styles.paddingLeft ]}>

                        <View style={styles.titleContainer}>
                            <View style={styles.beforeTitle}></View>
                            <Text style={styles.title}>推荐</Text>
                        </View>

                        <FlatList
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            data={this.state.featuredList}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        this.props.navigation.navigate('CandyDetailPage', { id: item.id })
                                    }}
                                >
                                    <Image source={{uri: item.banner_ad}} style={styles.featureItem}/>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* 糖果列表 */}
                    <View style={[ styles.section, styles.paddingLeft ]}>

                        <View style={styles.titleContainer}>
                            <View style={styles.beforeTitle}></View>
                            <Text style={styles.title}>糖果列表</Text>
                        </View>

                        <View style={styles.sortBtn}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (this.state.type === 'snapshot') return;
                                    this.setState({
                                        type: 'snapshot',
                                        sort: 'timeline',
                                        isFullLoad: false,
                                        candiesList: [],
                                        page: 1
                                    }, () => {
                                        this._getCandies();
                                    })
                                }}>
                                <Text
                                    style={[
                                        styles.sortText,
                                        this.state.type === 'snapshot' ? styles.activeSort : {}]}>
                                    快照时间
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.line}></View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (this.state.type === 'airdrop') return;
                                    this.setState({
                                        type: 'airdrop',
                                        sort: 'timeline',
                                        isFullLoad: false,
                                        candiesList: [],
                                        page: 1
                                    }, () => {
                                        this._getCandies();
                                    })
                                }}>
                                <Text
                                    style={[
                                        styles.sortText,
                                        this.state.type === 'airdrop' ? styles.activeSort : {}]}>
                                    空投时间
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {
                            Object.keys(this.state.candiesList).map((section) => {
                                return (
                                    <View>
                                        <View>
                                            <View style={styles.sectionTitle}>
                                                <SectionTitle
                                                    type={this.state.type}
                                                    sort={this.state.sort}
                                                    text={section}/>
                                            </View>
                                        </View>
                                        {
                                            this.state.candiesList[section].map((candy, index, arr)=> {
                                                return (
                                                    <TouchableOpacity activeOpacity={0.7}
                                                        key={candy.id}
                                                        onPress={() => {
                                                            this.props.navigation.navigate('CandyDetailPage', { id: candy.id })
                                                        }}>
                                                        <View style={styles.candyContainer}>
                                                            <Image source={{uri: candy.logo}} style={styles.candyLogo}/>
                                                            <View
                                                                style={[
                                                                    styles.candyInfo,
                                                                    (index == arr.length - 1) ? {borderBottomWidth: 0} : {}
                                                                ]}>
                                                                <Text style={styles.candyNameText}>{ candy.name }</Text>
                                                                <Text
                                                                    numberOfLines={1}
                                                                    style={[styles.candyInfoText, {width: 250}]}>
                                                                    {/* <IconSet name="icon-candy"/> */}
                                                                    糖果总量：{ candy.count }
                                                                </Text>
                                                                <Text
                                                                    numberOfLines={1}
                                                                    style={[styles.candyInfoText, {width: 250}]}>
                                                                    {/* <IconSet style={{width: 12}} name="icon-date"/> */}
                                                                    {this.state.type === 'snapshot' ? '快照时间：' : '空投日期：'}
                                                                    { candy[this.state.type + '_time_desc'] }
                                                                </Text>
                                                            </View>
                                                            <IconSet name="icon-arrow" style={styles.arrowRight}/>
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                )
                            })
                        }
                    </View>

                    <Text style={[{ alignSelf: 'center', paddingBottom: 20 }]}>
                        {(!this.state.isFullLoad) ? '正在加载' : '没有更多数据'}
                    </Text>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    paddingLeft: {
        paddingLeft: 20
    },
    section: {
        marginBottom: 20
    },
    // 广告图
    featureItem: {
        width: screenRate * 200,
        height: screenRate * 120,
        marginRight: screenRate * 10,
        borderRadius: 5
    },
    // 大标题
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    beforeTitle: {
        width: 3,
        height: 12,
        marginRight: 8,
        backgroundColor: '#1BCE9A'
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 10
    },
    // 排序按钮
    sortBtn: {
        position: 'absolute',
        top: 12,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    sortText: {
        fontSize: 15,
        color: '#323232',
        opacity: 0.5
    },
    activeSort: {
        opacity: 1
    },
    line: {
        width: 1,
        height: 10,
        marginHorizontal: 10,
        backgroundColor: '#000000'
    },
    // 月份标题
    sectionTitle: {
        paddingVertical: 10,
        borderBottomColor: '#efefef',
        borderBottomWidth: 1
    },
    sectionTitleText: {
        fontSize: 18,
        color: '#323232'
    },
    // 糖果列表
    candyContainer: {
        flexDirection: 'row',
        paddingTop: 20
    },
    candyInfo: {
        flexGrow: 1,
        paddingBottom: 20,
        borderBottomColor: '#efefef',
        borderBottomWidth: 1
    },
    candyLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15
    },
    candyNameText: {
        fontSize: 18,
        color: '#323232',
        lineHeight: 32,
        fontWeight: '600'
    },
    candyInfoText: {
        fontSize: 14,
        color: '#999999',
        lineHeight: 20,
    },
    arrowRight: {
        color: '#1bce9a',
        width: 16,
        marginRight: 20,
        marginTop: 35
    }
});

export default CandyPageView;
