/*
 * 对Footer的封装
 * @Author: JohnTrump
 * @Date: 2018-06-14 11:08:11
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-06-15 11:44:56
 */
import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Button from "react-native-button";

import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

const GoShareView = ({callback = () => {}}) => (
    <TouchableOpacity
        style={[ commonStyles.justAlignCenter, {
            width: 44,
            height: 44,
            position: 'absolute',
            top: constStyles.STATE_BAR_HEIGHT,
            right: 5
        } ]}
        onPress={() => {
            // 点击逻辑
            callback();
        }}>
        <Text style={{
            color: '#fff'
        }}> {I18n.t( Keys.share_title )} </Text>
    </TouchableOpacity>
)

export default GoShareView;
