/*
 *
 * Description:
 *
 * type == 1
 * 蛋蛋图 组件 (一张图片 + 一段文字)
 *
 * @Author: JohnTrump
 * @Date: 2018-10-16 10:02:37
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 19:55:31
 */
import React from 'react';
import { Image, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';

export default BannerItemComponent = ({
    title = '',
    icon = '',
    target = '',
    isAlert = 0,
    isEOS = 0,
    id = null,
    component = null,
    relative_dapps_id = null,
    imageStyle = {},
    successCallback = () => {},
    isDiscoveryRecent = false
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
                        successCallback({ relative_dapps_id, id, title, icon, target, isAlert, isEOS, isDiscoveryRecent });
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
                                successCallback({ relative_dapps_id, id, title, icon, target, isAlert, isEOS, isDiscoveryRecent });
                                NavigationUtil.openURI({component: component, url: target});
                            }}
                        ]
                    )
                } else {
                    successCallback({ relative_dapps_id, id, title, icon, target, isAlert, isEOS, isDiscoveryRecent });
                    NavigationUtil.openURI({component: component, url: target});
                }
            }}
            style={{
                width: (Dimensions.get('window').width - 30 - 15) / 4,
                marginHorizontal: 1,
                flexDirection: 'column',
                alignItems: 'center',
                marginVertical: 7.5,
            }}>
            <Image
                style={[{
                    width: 50,
                    height: 50,
                    backgroundColor: 'transparent',
                }, imageStyle]}
                source={{uri: icon}}
            />
            <Text
                // 限定最大行数2行
                numberOfLines={2}
                style={{
                    marginTop: 5,
                    fontSize: Dimensions.get('window').width * .037,
                    color: '#323232',
                    textAlign: 'center',
                    lineHeight: 20
                }}>{title}</Text>
        </TouchableOpacity>
    )
}
