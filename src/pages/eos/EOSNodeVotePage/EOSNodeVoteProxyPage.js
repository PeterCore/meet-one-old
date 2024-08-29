import { connect } from "react-redux";
import EOSNodeVoteProxyPageView from "./EOSNodeVoteProxyPageView";
import { voteProxy, getAccountInfo } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    return {
        account: account
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onVoteProxy: ( account, producers, password, callback ) => {
        dispatch( voteProxy( account, producers, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
    // 获取帐号信息
    getAccountInfo: (accountName, callback) => {
        dispatch(getAccountInfo(accountName, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
});

const EOSNodeVoteProxyPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNodeVoteProxyPageView );

export default EOSNodeVoteProxyPage;
