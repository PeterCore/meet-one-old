/*
 * 对Footer的封装
 * @Author: JohnTrump
 * @Date: 2018-06-14 11:08:11
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-06-15 11:49:30
 */
import React from 'react';
import {TouchableOpacity, Image, View} from 'react-native';

import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";

const GoBackView = ({callback = () => {}}) => (
    <TouchableOpacity
        style={[ commonStyles.justAlignCenter, {
            width: 44,
            height: 44,
            position: 'absolute',
            top: constStyles.STATE_BAR_HEIGHT,
            left: 5
        } ]}
        onPress={() => {
            // 点击逻辑
            callback();
        }}>
        <Image
            source={require( '../../../imgs/nav_btn_back_white.png' )}
            style={[{
                width: 22,
                height: 22,
            }]} />
    </TouchableOpacity>
)

export default GoBackView;
