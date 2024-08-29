import React from 'react';

import BlockItemPicture from './BlockItemPicture'; // type == 2
import PosterComponent from './PosterComponent'; // type == 3
import BlockItemWithIcon from './BlockItemWithIcon'; // type == 4

export default BlockItemComponent = ({
    successCallback = () => {},
    component = null, // 组件对象
    isDiscovery = false, // 是否应用在发现页的组件
    itemData = null, // 数据
}) => {
    let result = null;
    let {type = 0, title = '', subtitle = '', target = '', uri = '', is_alert: isAlert = 0, is_eos: isEOS = 0, id = null, relative_dapps_id = null} = itemData;
    switch (type) {
        case 2:
            result = (
                <BlockItemPicture
                    id={id}
                    isEOS={isEOS}
                    isAlert={isAlert}
                    target={target}
                    title={title}
                    uri={uri}
                    relative_dapps_id={relative_dapps_id}
                    isDiscovery={isDiscovery}
                    successCallback={successCallback}
                    component={component} />
            );
            break;
        case 3:
            result = (
                <PosterComponent
                    id={id}
                    isEOS={isEOS}
                    isAlert={isAlert}
                    target={target}
                    title={title}
                    relative_dapps_id={relative_dapps_id}
                    uri={uri}
                    successCallback={successCallback}
                    component={component} />
            );
            break;
        case 4:
            result = (
                <BlockItemWithIcon
                    id={id}
                    isEOS={isEOS}
                    isAlert={isAlert}
                    title={title}
                    subtitle={subtitle}
                    target={target}
                    relative_dapps_id={relative_dapps_id}
                    uri={uri}
                    successCallback={successCallback}
                    component={component}/>
            );
        default:
            break;
    }
    return result;
}
