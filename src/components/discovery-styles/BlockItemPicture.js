/*
 * type == 2
 * 一个图片块组件
 * @Author: JohnTrump
 * @Date: 2018-10-16 11:06:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 20:05:08
 */
import React from 'react';
import { Image, TouchableOpacity, Alert, Dimensions, Text } from 'react-native';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';

export default BlockItemPicture = ({
    uri = '',
    target = '',
    isAlert = 0,
    isEOS = 0,
    id = null,
    component = null,
    title = '',
    relative_dapps_id = null,
    isDiscovery = false, // 是否应用在发现页的组件
    successCallback = () => {}
}) => {

    const blockWidth = Dimensions.get('window').width / 2 - 20;
    const blockHeight = (Dimensions.get('window').width / 2 - 20) / 3 * 2;

    return (
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
                        successCallback({uri, relative_dapps_id, target, isAlert, isEOS, id, title});
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
                                successCallback({uri, relative_dapps_id, target, isAlert, isEOS, id, title});
                                NavigationUtil.openURI({component: component, url: target});
                            }}
                        ]
                    )
                } else {
                    successCallback({uri, relative_dapps_id, target, isAlert, isEOS, id, title});
                    NavigationUtil.openURI({component: component, url: target});
                }
            }}
            activeOpacity={0.8}>
            <Image
                style={{
                    marginTop: 10,
                    width: blockWidth,
                    height: blockHeight
                }}
                source={{uri: uri}}/>
            {
                // 判断是否有Title，有则显示
                !isDiscovery && title.trim() ? (
                <Text
                    // 限定最大行数1行
                    numberOfLines={1}
                    style={{
                        width: blockWidth,
                        fontSize: Dimensions.get('window').width * .0426,
                        color: '#323232',
                        lineHeight: 24 }}>{title}</Text>
                ) : null
            }
        </TouchableOpacity>
    )
}
