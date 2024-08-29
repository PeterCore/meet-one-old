/*
 * 轮播组件, 如果只有单张图的话，显示单张
 * @Author: JohnTrump
 * @Date: 2018-10-16 16:28:23
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 19:58:36
 */
import React from 'react';
import { Image, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import NavigationUtil from '../../util/NavigationUtil';

import BlockItemPicture from './PosterComponent';

export default BannerSwiperComponent = ({
    isSwiper = false,
    items = null,
    component = null,
    successCallback = () => {}
}) => {

    let {props} = component;
    let account = props.account || null;
    let navigation = props.navigation || null;

    return (
        <View
            style={{ paddingHorizontal: 15 }}>
            {isSwiper ? (<View>
                <Swiper
                    height={(Dimensions.get('window').width - 30) * .43 }
                    dot={<View style={{width: 5, height: 5, borderRadius: 4, borderColor: '#fff', borderWidth: 1, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                    activeDot={<View style={{backgroundColor: '#fff', width: 5, height: 5, borderRadius: 2.4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                    paginationStyle={{
                        bottom: 25,
                        left: null,
                        right: 15
                    }}
                    autoplay>
                    {items && items.map(item => {
                        return (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    // 判断是否有需要判断钱包类型
                                    if (item.is_eos === 1) {
                                        if (!account) {
                                            NavigationUtil.openInApp(navigation, 'EOSWalletImportPage');
                                            return
                                        }
                                    }
                                    // 判断是否需要显示免责声明
                                    if (item.is_alert === 1) {
                                        const id = item.id;
                                        if (props.discoveryAlertList.includes(id)) {
                                            successCallback({
                                                relative_dapps_id: item.relative_dapps_id,
                                                id: item.id,
                                                title: item.title
                                            });
                                            NavigationUtil.openURI({component: component, url: item.target});
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
                                                    successCallback({
                                                        relative_dapps_id: item.relative_dapps_id,
                                                        id: item.id,
                                                        title: item.title
                                                    });
                                                    NavigationUtil.openURI({component: component, url: item.target});
                                                }}
                                            ]
                                        )
                                    } else {
                                        successCallback({
                                            relative_dapps_id: item.relative_dapps_id,
                                            id: item.id,
                                            title: item.title
                                        });
                                        NavigationUtil.openURI({component: component, url: item.target});
                                    }
                                }}>
                                <Image
                                    style={{
                                        marginTop: 20,
                                        width: Dimensions.get('window').width - 30,
                                        height: (Dimensions.get('window').width - 30) * .37
                                    }}
                                    source={{ uri: item.uri }} />
                            </TouchableOpacity>
                        )
                    })}
                </Swiper>
            </View>) : (<View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap'}}>
                {items && items.map(item => {
                    return (
                        <BlockItemPicture
                            title={item.title}
                            id={item.id}
                            uri={item.uri}
                            target={item.target}
                            isEOS={item.is_eos}
                            isAlert={item.is_alert}
                            component={component}/>
                    )
                })}
            </View>)}
        </View>
    )
}
