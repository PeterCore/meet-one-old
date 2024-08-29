/*
 * @Author: JohnTrump
 * @Date: 2018-10-15 19:58:01
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-11-14 15:06:18
 */
import React from 'react';
import { Text, View } from 'react-native';

import BlockItemComponent from './BlockItemComponent';

export default BlockWrapperComponent = ({
    title = '',
    items,
    component,
    isDiscovery = false, // 是否应用在发现页的组件
    style,
    successCallback = () => {}
}) => {
    return (
        <View style={{
            paddingHorizontal: 15,
            ...style,
        }}>
            {
                title ? (
                    <Text style={{
                        fontSize: 14,
                        color: '#B5B5B5',
                        marginTop: 15,
                    }}>{title}</Text>
                ) : null
            }
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap'}}>
                {
                    items && items.map(i => {
                        return (
                            <BlockItemComponent
                                isDiscovery={isDiscovery}
                                successCallback={successCallback}
                                component={component}
                                itemData = {i}/>
                        )
                    })
                }
            </View>
        </View>
    )
}
