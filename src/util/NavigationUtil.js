/**
 *
 * Copyright 2016-present reading
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { NavigationActions, StackActions } from 'react-navigation';
import { Linking } from 'react-native';
import URLRouteUtil from "../util/URLRouteUtil";

const reset = ( navigation, routeName ) => {
    const resetAction = StackActions.reset( {
        index: 0,
        actions: [ NavigationActions.navigate( { routeName } ) ]
    } );
    navigation.dispatch( resetAction );
};


const openInApp = (navigation, routeName) => {
    navigation.navigate(routeName);
}

const openWebView = (navigation, {url, title, isShare = false, shareBody = {content: ''}}) => {
    navigation.navigate('WebViewPage', {
        url,
        webTitle: title,
        isShare,
        // sharebody{content, image, website, title}
        shareBody: Object.assign({
            title,
            website: url
        }, shareBody)
    });
}

const openBrowser = ({url = 'https://meet.one'}) => {
    // 避免不存在路径时的报错
    if (!url) {
        return
    }
    Linking.openURL(url).catch( err => console.error( 'An error occurred', err ) );
}

const openURI = ({component, url = 'https://meet.one'}) => {
    // 避免不存在路径时的报错
    if (!url) {
        return
    }
    if (URLRouteUtil.detectScheme(url, 'meetone://')) {
        URLRouteUtil.handleOpenURL(component, url, (err, res) => {
            console.log(err, res);
        });
    } else {
        Linking.openURL(url).catch( err => console.error( 'An error occurred', err ) );
    }
}

const openShareCodeTarget = ({component, url = 'https://meet.one'}) => {
    // 避免不存在路径时报错
    if (!url) {
        return
    }
    if (URLRouteUtil.detectScheme(url, 'meetone://')) {
        URLRouteUtil.handleOpenURL(component, url, (err, res) => {
            console.log(err, res);
        });
    } else {
        const {dispatch} = component.props;
        // 跳转到 WebViewPage组件并且打开
        dispatch(
            StackActions.push({
                routeName: 'WebViewPage',
                params: {
                    url,
                }
            })
        );
    }
}

export default {
    reset,
    openInApp,
    openWebView,
    openURI,
    openBrowser,
    openShareCodeTarget
};
