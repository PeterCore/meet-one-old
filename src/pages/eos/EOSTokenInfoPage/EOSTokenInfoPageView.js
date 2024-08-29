import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Platform, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-navigation';

import AutoLink from 'react-native-autolink';
import Toast from "react-native-root-toast";

import StarRating from 'react-native-star-rating';
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import { getTokenInfo } from "../../../net/DiscoveryNet";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import Util from "../../../util/Util";

class EOSTokenInfoPageView extends Component {

    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: params.token.name
        }
    };

    constructor( props ) {
        super( props );
        this.state = {
            id: props.navigation.state.params.token.id,
            isRequesting: true,
            detailData: {},
        }
    }

    componentDidMount() {
        // 获取 Token 详情
        getTokenInfo(this.state.id, (err, res) => {
            try {
                const receiveData = JSON.parse(res);
                this.setState({
                    isRequesting: false,
                    detailData: receiveData.data[0]
                });
            } catch (error) {
                Toast.show(I18n.t(Keys.request_failed), { position: Toast.positions.CENTER } );
            }
        });
    }

    render() {
        const { goBack } = this.props.navigation;
        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG]}>
                    {/* Banner */}
                    <Image
                        // Android层级显示出现了问题，调成-1试下
                        style={{
                            height: 140,
                        }}
                        source={{uri: this.state.detailData.banner ? this.state.detailData.banner : 'https://meet.one/mobile/images/wx_default_banner.png' + '?imageView2/0/w/750/h/240'}} />

                    {/* 顶部信息 */}
                    <View style={[styles.card]}>
                        {/* Logo */}
                        <Image
                            style={[styles.logo, Platform.OS === 'ios' ? {} : { marginTop: 50 }]}
                            source={{uri: this.state.detailData.logo ? this.state.detailData.logo : '' + '?imageView2/0/w/128/h/128'}}
                            ></Image>
                        {/* Title */}
                        <View style={[styles.item, styles.item_no_boder, {paddingBottom: 10, paddingTop: 30}, Platform.OS === 'ios' ? {} : { paddingTop: 80 } ]}>
                            <Text selectable={true} style={[styles.text, styles.name]}>{ this.state.detailData.token_name }</Text>
                        </View>

                        {/* 简介 */}
                        <View style={[styles.item, styles.item_no_boder, {paddingVertical: 0, marginBottom: 15 }]}>
                            <Text style={{ fontSize: 14, textAlign: 'center', color: '#323232', lineHeight: 21 }}>{ this.state.detailData.desc ? this.state.detailData.desc : I18n.t(Keys.no_info)}</Text>
                        </View>
                    </View>

                    {/* Block-1 */}
                    <View style={[styles.card]}>
                        {/* :before for Title */}
                        <View style={[styles.card_title_before]}></View>
                        <Text style={[styles.card_title]}>{I18n.t(Keys.token_info)}</Text>

                        {/* 项目名称 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_name)}</Text>
                            <Text style={[styles.text]} selectable={true}>{ this.state.detailData.name }</Text>
                        </View>

                        {/* 官网 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_homepage)}</Text>

                            <AutoLink
                                style={[styles.text]}
                                linkStyle={[styles.website]}
                                stripPrefix={false}
                                phone={false}
                                text={this.state.detailData.homepage ? this.state.detailData.homepage : I18n.t(Keys.no_info)}
                                onPress={(url) => this.props.openLink(url)}/>
                        </View>

                        {/* 合约地址 */}
                        <View style={[styles.item, styles.item_no_boder,]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_address)}</Text>
                            <Text style={[styles.text]} selectable={true}>{ this.state.detailData.publisher ? this.state.detailData.publisher : I18n.t(Keys.no_info)}</Text>
                        </View>
                    </View>


                    {/* Block-2 */}
                    <View style={[styles.card]}>
                        {/* :before for Title */}
                        <View style={[styles.card_title_before]}></View>
                        <Text style={[styles.card_title]}>{I18n.t(Keys.token_info_publish)}</Text>

                        {/* 发行时间 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_publish_time)}</Text>
                            <Text style={[styles.text]} selectable={true}>{ this.state.detailData.publish_time ? this.state.detailData.publish_time : I18n.t(Keys.no_info)}</Text>
                        </View>

                        {/* 总发行数量 */}
                        <View style={[styles.item, {}]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_publish_total)}</Text>
                            <Text style={[styles.text]} selectable={true}>{ this.state.detailData.publish_count ? this.state.detailData.publish_count : I18n.t(Keys.no_info)}</Text>
                        </View>



                        {/* 总市值 */}
                        <View style={[styles.item, styles.item_no_boder,]}>
                            <Text style={[styles.label]}>{I18n.t(Keys.token_info_publish_market)}</Text>
                            <Text style={[styles.text]} selectable={true}>{ this.state.detailData.total_price ? this.state.detailData.total_price : I18n.t(Keys.no_info)}</Text>
                        </View>
                    </View>

                    {
                        this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }

                </ScrollView>
            </SafeAreaView>
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
        width: 76,
        height: 76,
        top: -45,
        left: Dimensions.get('window').width / 2,
        marginLeft: -38,
        overflow: 'hidden',
        // 圆形带边框的样式
        backgroundColor: '#fff',
        borderRadius: 38,
        borderColor: '#ddd',
        borderWidth: Util.getDpFromPx(1)
    },

    name: {
        // paddingTop: 20,
        fontSize: 22,
        textAlign: 'center',
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

export default EOSTokenInfoPageView;
