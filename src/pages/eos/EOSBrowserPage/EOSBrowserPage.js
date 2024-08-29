import EOSBrowserPageView from "./EOSBrowserPageView";
import { updateEOSBrowserHistory } from "../../../actions/EOSAction";
import {getCurrentWallet} from "../../../actions/WalletAction";
import settingActionTypes from "../../../reducers/setting/settingActionTypes";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: getCurrentWallet(state, state.walletStore.currentWalletPrimaryKey), // 当前帐号
        discoveryAlertList: state.settingStore.discoveryAlertList_v2, // 主要用于记录免责声明（v2版本）
        browserHistory: state.eosStore.browserHistory, // 历史浏览记录(包含http(s)的链接，也包含id)
        language: state.settingStore.language, // 当前语言
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    // 派发更新浏览记录的方法
    updateEOSBrowserHistory: ( data ) => {
        dispatch( updateEOSBrowserHistory ( data ))
        if (data) {
            const pattern = new RegExp('^((https?:)?\\/\\/)?'+ // protocol
            '(?:\\S+(?::\\S*)?@)?' + // authentication
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
            if (!pattern.test(data)) {
                // 如果不是网页的话，则
                dispatch({'type': settingActionTypes.DISCOVERY_USED_LIST_UPDATE, id: data});
            }
        }
    },
    // 将当前的免责声明DAPPS id记录下来
    updateDiscoveryAlert: (discoveryAlertList) => {
        dispatch({'type': settingActionTypes.DISCOVERY_ALERT_UPDATE, discoveryAlertList})
    }
});

const EOSBrowserPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSBrowserPageView );

export default EOSBrowserPage;
