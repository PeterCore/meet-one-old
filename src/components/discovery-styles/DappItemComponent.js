/*
 *
 * Description:
 *
 * DAPP列表（带描述）
 *
 * @Author: JohnTrump
 * @Date: 2018-10-16 10:02:37
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-12 16:05:57
 */
import React from 'react';
import { Image, Text, TouchableOpacity, Alert, Dimensions, View } from 'react-native';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';
import Util from '../../util/Util';

export default DappItemComponent = ({
    title = '',
    desc = '',
    icon = '',
    target = '',
    isAlert = 0,
    isEOS = 0,
    id = null,
    component = null,
    imageStyle = {},
    successCallback = () => {}
}) => {

    let {props} = component;
    let account = props.account || null;
    let navigation = props.navigation || null;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                // 判断是否有需要判断钱包类型
                if (isEOS === 1) {
                    if (!account) {
                        NavigationUtil.openInApp(navigation, 'EOSWalletImportPage');
                        return
                    }
                }
                // 判断是否需要显示免责声明
                if (isAlert === 1) {
                    if (props.discoveryAlertList.includes(id)) {
                        successCallback({id, title, icon, target, isAlert, isEOS});
                        NavigationUtil.openURI({component: component, url: target});
                        return;
                    }
                    Alert.alert(
                        I18n.t(Keys.dapps_alert_title),
                        I18n.t(Keys.dapps_alert_body),
                        [
                            {text: I18n.t(Keys.cancel), onPress: () => {}},
                            {text: I18n.t(Keys.confirm), onPress: () => {
                                props.discoveryAlertList.push(id);
                                props.updateDiscoveryAlert(props.discoveryAlertList);
                                successCallback({id, title, icon, target, isAlert, isEOS});
                                NavigationUtil.openURI({component: component, url: target});
                            }}
                        ]
                    )
                } else {
                    successCallback({id, title, icon, target, isAlert, isEOS});
                    NavigationUtil.openURI({component: component, url: target});
                }
            }}
            style={{
                // width: (Dimensions.get('window').width - 30 - 15) / 4,
                // marginHorizontal: 1,
                // justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                height: 80,
                // marginVertical: 7.5,
            }}>
            {/* 头像 */}
            <Image
                style={[{
                    width: 50,
                    height: 50,
                    backgroundColor: 'transparent',
                    marginRight: 15
                }, imageStyle]}
                source={{uri: icon}}/>

            {/* 标题与描述 */}
            <View style={{
                height: 80,
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                borderBottomColor: '#e8e8e8',
                borderBottomWidth: Util.getDpFromPx(1),
            }}>

                {/* 标题 */}
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 16,
                        color: '#323232',
                        fontWeight: '600',
                    }}>{title}</Text>

                {/* 描述 */}
                {
                    desc ? (
                        <Text
                        numberOfLines={1}
                        style={{
                            fontSize: 14,
                            color: '#999',
                            marginTop: 4,
                        }}>{desc}</Text>
                    ) : null
                }
            </View>
            {/* 箭头 */}
            <Image
                style={{
                    position: 'absolute',
                    right: 6,
                    width: 6,
                    height: 12,
                }}
                source={require( '../../imgs/ic_right_arrow.png' )}/>
        </TouchableOpacity>
    )
}
