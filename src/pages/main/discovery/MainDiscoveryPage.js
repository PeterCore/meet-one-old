import MainDiscoveryPageView from "./MainDiscoveryPageView";
import { connect } from "react-redux";
import { getCurrentWallet } from "../../../actions/WalletAction";
import settingActionTypes from "../../../reducers/setting/settingActionTypes";
import { getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        account: getCurrentWallet(state, state.walletStore.currentWalletPrimaryKey),
        discoveryAlertList: state.settingStore.discoveryAlertList,
        language: state.settingStore.language,
        netType: getNetType(),
        ids: Object.assign([], state.settingStore.discoveryUsedList)
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // 将当前的免责声明Dapps id记录下来
    updateDiscoveryAlert: (discoveryAlertList) => {
        dispatch({'type': settingActionTypes.DISCOVERY_ALERT_UPDATE, discoveryAlertList})
    },
    // 更新最近使用的历史记录
    updateUsedList: (id) => {
        // 发现页最近使用列表
        dispatch({'type': settingActionTypes.DISCOVERY_USED_LIST_UPDATE, id});
    }
});

const MainDiscoveryPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MainDiscoveryPageView );

export default MainDiscoveryPage;
