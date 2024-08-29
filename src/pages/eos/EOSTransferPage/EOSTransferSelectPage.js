import { connect } from "react-redux";
import EOSTransferSelectPageView from "./EOSTransferSelectPageView";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSystemToken } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    const { params } = ownProps.navigation.state;

    let currentToken = getSystemToken();
    // 从token详情页过来的, 设置当前token
    if (params && params.currentToken) {
        currentToken = params.currentToken;
    }

    return {
        walletAccount: walletAccount,
        currentToken: currentToken,
        recentAccount: state.eosStore.transferHistory
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

});

const EOSTransferSelectPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTransferSelectPageView );

export default EOSTransferSelectPage;
