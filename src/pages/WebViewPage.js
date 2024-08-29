import View from "./WebViewPageView";
import { connect } from "react-redux";
import { getCurrentWallet  } from "../actions/WalletAction";
import { EOSTransfer, EOSTransaction} from "../actions/EOSAction";
import { getNetType } from "../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    const cpuFloatBtnSetting = state.settingStore.cpuFloatBtnSetting;
    return {
        walletAccount,
        cpuFloatBtnSetting,
        netType: getNetType(),
        showCPUBtn: state.settingStore.config.cpubaole
    }
};
const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    onTransaction: (account, data, password, callback) => {
        dispatch(EOSTransaction(account, data, password, (error, resBody) => {
            callback && callback(error, resBody);
        }));
    },

    onTransfer: ( account, data, password, callback ) => {
        dispatch( EOSTransfer( account, data, password, ( error, resBody ) => {
            callback && callback( error, resBody );
        }));
    },
    toggleFloatButtonState: ( showStatus ) => {
        dispatch( ( dispatch ) => {
            dispatch( { type: 'TOGGLE_CPU_FLOAT_BUTTON', floatBtnShow: showStatus } );
        } );
    }
});

const WebViewPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( View );

export default WebViewPage;
