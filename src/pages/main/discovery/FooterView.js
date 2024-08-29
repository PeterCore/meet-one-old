/*
 * 对Footer的封装
 * @Author: JohnTrump
 * @Date: 2018-06-14 11:08:11
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-06-14 11:16:43
 */
import React from 'react';
import {View, Image} from 'react-native';
const FooterView = ({theme = 'dark'}) => (
    <View style={{ paddingTop: 40, paddingBottom: 20 }}>
        <Image
            source={
                theme === 'dark'
                ? require('../../../imgs/footer_logo_dark.png')
                : require('../../../imgs/footer_logo_light.png')}
            style={{ alignSelf: 'center', width: 63, height: 65.5 }}/>
    </View>
)

export default FooterView;
