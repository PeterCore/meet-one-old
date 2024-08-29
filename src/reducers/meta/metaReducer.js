import serverHost from "../../../data/server_host.json";
import * as env from "../../env";
import metaActionTypes from "./metaActionTypes";
import { getStore } from "../../setup";

const initialState = {
    serverHostUrlData: serverHost,
    bestServerHostUrl: env.apiDomain
};

export default function metaReducer( state = initialState, action ) {
    switch ( action.type ) {
        case metaActionTypes.META_UPDATE_BEST_SERVER_HOST:
            return {
                ...state,
                bestServerHostUrl: action.bestServerHostUrl,
            };
        case metaActionTypes.META_UPDATE_SERVER_HOST_DATA:
            return {
                ...state,
                serverHostUrlData: action.serverHostUrlData,
            };
        default:
            return state;
    }
}


export function getBestServerHost() {
    const store = getStore();

    const bestServerUrl = store.getState().metaStore.bestServerHostUrl;

    if ( !bestServerUrl || bestServerUrl.length <= 0 ) {
        return env.apiDomain;
    }

    return bestServerUrl;
}

// 获取最好的Node服务器地址
// TODO: 暂时没有写网络测试的逻辑，直接根据语系来判断
export function getBestNodeServerHost() {
    const store = getStore();

    // 系统的语言
    const {language = 'en'} = store.getState().settingStore;

    const {IS_DEBUG = false} = env;

    const lang = language.split('-')[0];

    if (IS_DEBUG) return 'http://39.108.187.237:6677';

    let result = 'https://www.ethte.com';

    switch (lang) {
        case 'en':
        case 'ko':
            result = 'https://api.wanteos.com'
            break;
        case 'zh':
            break;
    }

    return result;
}
