import { connect } from 'react-redux';
import EOSTokenDetailPageView from "./EOSTokenDetailPageView";
import { getEOSTransactions, updateTokenBalance } from '../../../actions/EOSAction';
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;
    const currentToken = params.token;
    const currentAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        account: currentAccount,
        currentToken: currentToken,
        recentAccount: state.eosStore.transferHistory,
        netType: getNetType(),
        exchangeList: state.eosStore.supportExchanges,
        oneStepTrade: state.settingStore.config.one_step_trade
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetEOSTransactions: ( account, data, callback ) => {
        dispatch( getEOSTransactions( account, data, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
    UpdateTokenBalance: ( account, token, callback) => {
        dispatch(updateTokenBalance (account, token, (error, resBody) => {
            callback && callback( error, resBody );
        }))
    }
});

const EOSTokenDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTokenDetailPageView );

export default EOSTokenDetailPage;
