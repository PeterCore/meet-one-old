/*
 * Component BannerWrapperComponent
 *
 * Description:
 *
 * 广告BannerWrapper - 带有背景颜色的
 *
 * @Author: JohnTrump
 * 2018-10-15: 2018-10-15 16:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-22 10:41:13
 */
import React from 'react';
import { ImageBackground, View, Dimensions, Text } from "react-native";

import BannerSwiperComponent from './BannerSwiperComponent';
import BannerItemComponent from './BannerItemComponent';

import Util from "../../util/Util";

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import constStyles from "../../styles/constStyles";

export default BannerWrapperComponent = ({
    imageBackgroundURL = '', // 背景图片的URL
    bannerSwiper = null,
    bannerItems = [],
    component = null,
    successCallback = () => {}
}) => {
    return (
        <View>
            <ImageBackground
                    source={{uri: imageBackgroundURL}}
                    style={{
                        backgroundColor: imageBackgroundURL ? 'transparent' : '#fff',
                        // 发现页的背景图片宽度 = 高度 = 屏幕的宽度
                        height: imageBackgroundURL ? Dimensions.get('window').width / 9 * 16 : Dimensions.get('window').width,
                        position: 'absolute'
                    }}>
                <View style={{ width: Dimensions.get('window').width }} ></View>
            </ImageBackground>

            <View style={{
                backgroundColor: imageBackgroundURL ? 'transparent' : '#fafafa' ,
                paddingTop: (Util.isiPhoneFullDisplay() ? constStyles.STATE_BAR_HEIGHT : 20)
            }}>
                {/* BannerSwiperComponent Wrapper */}
                <View
                    style={{
                        backgroundColor: imageBackgroundURL ? 'transparent' : '#fff'
                    }}>
                    <BannerSwiperComponent
                        component = {component}
                        // 只判断是否为3 如果是3的话,则显示可以轮播的组件,否则都是图片块
                        isSwiper={
                            bannerSwiper &&
                            bannerSwiper[0] &&
                            bannerSwiper[0].type === 3
                        }
                        successCallback={successCallback}
                        items={bannerSwiper}/>
                </View>

                {/* BannerItemComponent Wrapper */}
                {bannerItems && bannerItems.length > 0 ?
                (
                    <View style={{ backgroundColor: imageBackgroundURL ? 'transparent' : '#fff' }}>
                        <Text style={{
                                fontSize: 14,
                                color: '#B5B5B5',
                                marginTop: 15,
                                paddingHorizontal: 15
                            }}>{ I18n.t(Keys.recent_used) }</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                marginHorizontal: 15,
                                // paddingBottom: 10,
                                paddingTop: 10
                            }}>
                            {bannerItems && bannerItems.map(item => {
                                return (
                                    <BannerItemComponent
                                        relative_dapps_id={item.id} // 这里会比较特殊，因为这里的最近使用，relative_dapps_id就是item.id
                                        id = {item.id}
                                        title={item.name}
                                        icon={item.icon}
                                        isAlert={item.is_alert}
                                        isEOS={item.is_eos}
                                        target={item.target}
                                        imageStyle={{
                                            borderWidth: 1,
                                            borderColor: '#e8e8e8',
                                            borderRadius: 15,
                                        }}
                                        isDiscoveryRecent={true}
                                        successCallback={successCallback}
                                        component={component}/>
                                )
                            })}
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    )
}
