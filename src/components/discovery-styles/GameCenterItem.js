/*
 * Component GameCenterItem
 *
 * Description:
 *  包含24H成交量、活跃用户等数据的组件
 *
 * @Author: JohnTrump
 * 2018-10-20: 2018-10-20 14:54
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 10:25:41
 */
import React from 'react';

import IconSet from "../IconSet";

import { View, TouchableOpacity, Image, Text, Alert, Dimensions, StyleSheet } from "react-native";

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';
import Util from '../../util/Util';
import { isNull } from 'util';

export default GameCenterItem = ({
    title = '',
    target = '',
    uri = '',
    desc = '', // 描述
    isAlert = 1,
    isEOS = 0,
    id = null,
    component = null,
    index = 0,
    hasDivider = true, // 是否有分割线（通常来说，列表项的最后一个没有分割线）
    dau = 0, // 24H活跃用户
    dauPercent = 0, // 24H活跃用户变化百分比
    volume = 0, // 24小时成交量
    volumePercent = 0, // 24小时成交量百分比
    successCallback = () => {}
}) => {
    return (
        <View style={{
            flex: 1,
            paddingBottom: hasDivider ? 0 : 5 }}>
            <TouchableOpacity
                onPress={() => {
                    // 判断是否有需要判断钱包类型
                    if (isEOS === 1) {
                        if (!component.props.account) {
                            NavigationUtil.openInApp(component.props.navigation, 'EOSWalletImportPage');
                            return
                        }
                    }
                    // 判断是否需要显示免责声明
                    if (isAlert === 1) {
                        if (component.props.discoveryAlertList.includes(id)) {
                            successCallback({title, target, uri, isAlert, isEOS, id, hasDivider, dau, dauPercent, volume, volumePercent});
                            NavigationUtil.openURI({component: component, url: target});
                            return;
                        }
                        Alert.alert(
                            I18n.t(Keys.dapps_alert_title),
                            I18n.t(Keys.dapps_alert_body),
                            [
                                {text: I18n.t(Keys.cancel), onPress: () => {}},
                                {text: I18n.t(Keys.confirm), onPress: () =>  {
                                    component.props.discoveryAlertList.push(id);
                                    component.props.updateDiscoveryAlert(component.props.discoveryAlertList);
                                    successCallback({title, target, uri, isAlert, isEOS, id, hasDivider, dau, dauPercent, volume, volumePercent});
                                    NavigationUtil.openURI({component: component, url: target});
                                }}
                            ]
                        )
                    } else {
                        successCallback({title, target, uri, isAlert, isEOS, id, hasDivider, dau, dauPercent, volume, volumePercent});
                        NavigationUtil.openURI({component: component, url: target});
                    }
                }}
                activeOpacity={0.8}
                style={{
                    flexDirection: 'row'
                }}>
                <View style={{
                    paddingLeft: 15,
                    paddingTop: index == 0 ? 0 : 15,
                    flexDirection: 'row',
                    // alignItems: 'center',
                    height: '100%'}}>
                    <Image style={{
                            width: 50,
                            height: 50,
                            borderWidth: Util.getDpFromPx(1), // 边框宽度为0.5pt
                            borderColor: '#e8e8e8',
                            borderRadius: 15,
                            backgroundColor: 'transparent'
                        }}
                        source={{uri: uri}}/>
                    <View style={{
                        marginLeft: 15,
                        paddingTop: 2.5
                    }}>
                        <View>
                            <Text style={{
                                fontSize: 16,
                                marginLeft: -5,
                                textAlign: 'left',
                                color: '#323232',
                                marginBottom: desc ? 0 : 5
                            }}> {title} </Text>

                            {
                                desc ? (
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            marginLeft: -5,
                                            textAlign: 'left',
                                            marginVertical: 8,
                                            color: '#999',
                                            width: '62%'
                                        }}> {desc} </Text>
                                ) : null
                            }

                        </View>
                        <View>
                            <View style={[{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingBottom: 6.5,
                                width: Dimensions.get('window').width * .780
                            }, hasDivider ? {
                                // 是否有分割线
                                borderBottomWidth: Util.getDpFromPx(1), // 分割线高度为0.5pt
                                borderBottomColor: '#e8e8e8',
                            } : null]}>
                                <View style={{ flex: 1 }}>
                                    {/* VOL */}
                                    <Text style={{ fontSize: 10, color: '#999', fontWeight: '300' }}>{I18n.t(Keys.game_center_volume)}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        {
                                            // 新增判断，如果是NULL的话，则显示无数据
                                            (!isNull(volume)) ? (
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.valueNumber}>
                                                    {Util.numberStandard(volume, 1)}
                                                </Text>
                                            ) : <Text style={[styles.valueNumber, {fontSize: 12, fontWeight: '300'}]}>{I18n.t(Keys.empty_data)}</Text>
                                        }
                                        <View style={{ marginLeft: 10, flexDirection: 'row' }}>
                                            {percentWithIcon(volumePercent)}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                    {/* DAU */}
                                    <Text style={{ fontSize: 10, color: '#999', fontWeight: '300' }}>{I18n.t(Keys.game_center_dau)}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        {
                                            // 新增判断，如果是NULL的话，则显示无数据
                                            (!isNull(dau)) ? (
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.valueNumber}>
                                                    {Util.numberStandard(dau, 0)}
                                                </Text>
                                            ) : <Text style={[styles.valueNumber, {fontSize: 12}]}>{I18n.t(Keys.empty_data)}</Text>
                                        }
                                        <View style={{ flexDirection: 'row' }}>
                                            {percentWithIcon(dauPercent)}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* 箭头 */}
                <View style={{
                    position: 'absolute',
                    right: 15,
                    top: index == 0 ? '32%' : '45%'
                }}>
                    <Image
                        source={require('../../imgs/ic_right_arrow.png')}
                        style={[{ width: 6, height: 12 }]} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

// 涨跌比例
const percentWithIcon = (num, decimal = 1, optionStr = '%') => {
    if (num > 0) {
        return (
            <View style={{flexDirection: 'row'}}>
                <IconSet style={[styles.iconSet, styles.up]} name="icon-up"/>
                <Text style={[styles.percentNumber, styles.up]}>{Util.toFixed(num, decimal) + optionStr}</Text>
            </View>
        )
    } else if (num < 0) {
        return (
            <View style={{flexDirection: 'row'}}>
                <IconSet style={[styles.iconSet, styles.down]} name="icon-down"/>
                <Text style={[styles.percentNumber, styles.down]}>{Util.toFixed(num, decimal) + optionStr}</Text>
            </View>
        )
    } else {
        return (
            <View style={{flexDirection: 'row'}}></View>
        )
    }
}

// 样式
const styles = StyleSheet.create({
    iconSet: {
        fontSize: 6,
        lineHeight: 27,
        marginRight: 2
    },
    // 涨
    up: {
        color: '#7ed321'
    },
    // 跌
    down: {
        color: '#d0021b'
    },
    valueNumber: {
        fontFamily: 'DIN',
        fontSize: 14,
        color: '#323232',
        lineHeight: 27,
        width: Dimensions.get('window').width * .186
    },
    percentNumber: {
        fontSize: 13,
        fontFamily: 'DIN',
        lineHeight: 27
    }
});
