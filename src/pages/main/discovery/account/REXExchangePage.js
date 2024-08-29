import { connect } from "react-redux";
import REXExchangePageView from "./REXExchangePageView";
import {
    updateAccount,
    getCurrentREXPrice,
    getCurrentAccountREX,
    getCurrentAccountFund,
    unstaketorex,
    sellREX,
    buyREX
} from "../../../../actions/EOSAction";
import { getCurrentWallet } from "../../../../actions/WalletAction";

// 格式化eos返回的描述资产的字符串
const _parseAsset = asset => asset.split(' ')[0];

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;
    let account;
    if (params && params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        account: account,
        REXPrice: state.eosStore.REXPrice,
        rexBalance: account && account.rexInfo && _parseAsset(account.rexInfo.rex_balance),
        rexMaturedBalance: account && account.rexInfo && (account.rexInfo.matured_rex / 10000) || 0
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({

    getCurrentREXPrice: (callback) => {
        dispatch(getCurrentREXPrice(callback));
    },

    getCurrentAccountREX: (account, callback) => {
        dispatch(getCurrentAccountREX(account, callback));
    },

    getCurrentAccountFund: (account, callback) => {
        dispatch(getCurrentAccountFund(account, callback));
    },

    buyREX: (account, password, quant, callback) => {
        dispatch(buyREX(account, password, quant, callback));
    },

    unstaketorex: (account, password, from_cpu, from_net, callback) => {
        dispatch(unstaketorex(account, password, from_cpu, from_net, callback));
    },

    sellREX: (account, password, quant, callback) => {
        dispatch(sellREX(account, password, quant, callback));
    },

    // 更新帐号信息
    updateEOSData: (account) => {
        dispatch(updateAccount(account, null));
    }
});

const REXExchangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( REXExchangePageView );

export default REXExchangePage;
