import { connect } from "react-redux";
import WalletEOSWidgetView from "./WalletEOSWidgetView";
import { getAllWallet, getCurrentWallet, setDefaultWallet } from "../../../../../actions/WalletAction";
import {
    getBPSAndNodeId,
    updateEOSAccountWithCallback,
    refundbw,
    updateAccountToSecretData,
    toggleAssetsShow
} from "../../../../../actions/EOSAction";
import { getSystemToken, getNetType, getSupportTokens } from "../../../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    return {
        accounts: getAllWallet( state ), // 所有的钱包账户
        account: account, // 当前钱包账户
        BPs: account.BPs,
        totalVoteWeight: account.totalVoteWeight,
        USD: state.eosStore.USD,
        showLabel: account.showLabel,
        bpProducerDic: account.bpProducerDic,
        contributors: account.contributors,
        isLoggedIn: state.userStore.isLoggedIn,
        // 支持的eos token列表
        supportTokens: getSupportTokens(),
        recentAccount: state.eosStore.transferHistory,
        hideAssets: state.eosStore.hideAssets,
        tokenPrices: state.eosStore.tokenPrices,
        systemToken: getSystemToken().name,
        netType: getNetType(),
        ramPrice: state.eosStore.RAMPrice,
        exchangeList: state.eosStore.supportExchanges,
        oneStepTrade: state.settingStore.config.one_step_trade
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onUpdateAccountToSecretData: () => {
        dispatch(updateAccountToSecretData());
    },
    onRefundbw: (account, password, callback) => {
        dispatch(refundbw(account, password, (error, result) => {
            callback && callback( error, result );
        }));
    },
    onSetDefaultWallet: ( account, callback ) => {
        dispatch( setDefaultWallet( account, ( error, result ) => {
            callback && callback( error, result );
        }));
    },
    updateEOSAccountWithCallback: ( account, callback ) => {
        dispatch( updateEOSAccountWithCallback( account, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    getNodesIDInfo: ( account, callback ) => {
        dispatch( getBPSAndNodeId( account, ( err, response ) => {
            callback && callback( err, response );
        }));
    },
    onToggleAssetsShow: (data) => {
        dispatch( toggleAssetsShow( data ) )
    }
});

const WalletEOSWidget = connect(
    mapStoreToProps,
    mapDispatchToProps
)( WalletEOSWidgetView );

export default WalletEOSWidget;
