import EOSAccountRegisterResultPageView from "./EOSAccountRegisterResultPageView";
import { connect } from "react-redux";
import { getCurrentWallet } from "../../../../actions/WalletAction";
import { createNewAccount } from "../../../../actions/EOSAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        walletAccount: walletAccount,
        allAccounts: state.eosStore.accounts
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    createNewAccountPost: ( account, accountPrivateKey, data, callback ) => {
        dispatch( createNewAccount( account, accountPrivateKey, data, ( err, res ) => {
            callback && callback( err, res )
        }))
    },
});

const EOSAccountRegisterResultPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAccountRegisterResultPageView );

export default EOSAccountRegisterResultPage;
