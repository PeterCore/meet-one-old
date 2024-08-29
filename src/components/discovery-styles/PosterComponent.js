/*
 * type === 3
 * 单独一张海报（非轮播）组件
 * @Author: JohnTrump
 * @Date: 2018-10-16 10:50:47
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 20:05:53
 */

import React from 'react';
import { Image, TouchableOpacity, Alert, Dimensions } from 'react-native';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';

export default PosterComponent = ({
    uri = '',
    target = '',
    isAlert = 0,
    isEOS = 0,
    id = null,
    title = '',
    component = null,
    relative_dapps_id = null,
    successCallback = () => {}
}) => {

    let {props} = component;
    let account = props.account || null;
    let navigation = props.navigation || null;

    return (
        <TouchableOpacity
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
                        successCallback({uri, target, relative_dapps_id, isAlert, isEOS, id, title});
                        NavigationUtil.openURI({component: component, url: target});
                        return;
                    }
                    Alert.alert(
                        I18n.t(Keys.dapps_alert_title),
                        I18n.t(Keys.dapps_alert_body),
                        [
                            {text: I18n.t(Keys.cancel), onPress: () => {}},
                            {text: I18n.t(Keys.confirm), onPress: () =>  {
                                props.discoveryAlertList.push(id);
                                props.updateDiscoveryAlert(props.discoveryAlertList);
                                successCallback({uri, relative_dapps_id, target, isAlert, isEOS, id, title});
                                NavigationUtil.openURI({component: component, url: target});
                            }}
                        ]
                    )
                } else {
                    successCallback({uri, relative_dapps_id,target, isAlert, isEOS, id, title});
                    NavigationUtil.openURI({component: component, url: target});
                }
            }}
            activeOpacity={0.8}>
            <Image
                style={{
                    marginTop: 10,
                    width: Dimensions.get('window').width - 30 ,
                    height: (Dimensions.get('window').width - 30) * .37
                }}
                source={{uri: uri}}/>
        </TouchableOpacity>
    )
}
