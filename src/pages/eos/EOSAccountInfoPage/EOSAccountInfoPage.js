import { connect } from "react-redux";
import EOSAccountInfoPageView from "./EOSAccountInfoPageView";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getAccount, getCurrencyBalance } from "../../../actions/EOSAction";
import { getSystemToken, getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    let account;
    if (params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        netType: getNetType(),
        systemToken: getSystemToken().name,
        account: account
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    //更新eos余额、ram、cpu、net、授权等信息
    updateAccountData: (account) => {
        dispatch(getCurrencyBalance(account,null));
        dispatch(getAccount(account, null));
    },
});

const EOSAccountInfoPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAccountInfoPageView );

export default EOSAccountInfoPage;
