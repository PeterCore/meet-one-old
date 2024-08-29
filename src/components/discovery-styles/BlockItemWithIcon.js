/*
 * type == 4
 * 带图标，带title + subtitle组成的块组件
 * @Author: JohnTrump
 * @Date: 2018-10-16 11:09:05
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 20:06:31
 */
import React from 'react';
import { Image, Text, TouchableOpacity, Alert, Dimensions, View } from 'react-native';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';

export default BlockItemWithIcon = ({
    title = '',
    subtitle = '',
    target = '',
    uri = '',
    isAlert = 1,
    isEOS = 0,
    id = null,
    relative_dapps_id = null,
    component = null,
    successCallback = () => {}
}) => {
    return (
        <TouchableOpacity
            style={{
                marginTop: 10,
                width: (Dimensions.get('window').width - 30 - 10) / 2,
                height: 80,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                shadowOpacity: 0.06,
                shadowRadius: 10,
                shadowColor: '#000',
                shadowOffset: { height: 2, width: 0 }
            }}
            activeOpacity={0.8}
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
                        successCallback({title, relative_dapps_id, subtitle, target, uri, isAlert, isEOS, id});
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
                                successCallback({title, relative_dapps_id, subtitle, target, uri, isAlert, isEOS, id});
                                NavigationUtil.openURI({component: component, url: target});
                            }}
                        ]
                    )
                } else {
                    successCallback({title, relative_dapps_id, subtitle, target, uri, isAlert, isEOS, id});
                    NavigationUtil.openURI({component: component, url: target});
                }
            }}>
            <Image
                style={{
                    width: 36,
                    height: 36,
                    marginHorizontal: 10
                }}
                source={{uri}}
            />
            <View>
                <Text
                    // 限定最大行数2行
                    numberOfLines={2}
                    style={{
                        width: (Dimensions.get('window').width - 140) / 2 - 15,
                        fontSize: Dimensions.get('window').width * .0370,
                        color: '#323232'
                    }}>{title}</Text>
                <Text
                    // 限定最大行数2行
                    numberOfLines={2}
                    style={{
                        marginTop: 3,
                        fontSize: Dimensions.get('window').width * .032,
                        width: (Dimensions.get('window').width - 140) / 2 - 15,
                        color: '#999'
                    }}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    )
}
