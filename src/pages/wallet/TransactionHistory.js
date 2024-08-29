import { connect } from "react-redux";
import TransactionHistoryView from "./TransactionHistoryView";
import { getCurrentWallet } from "../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {

    const eosAccounts = state.eosStore.accounts;
    const ethAccounts = state.ethStore.accounts;

    return {
        accounts: eosAccounts.concat(ethAccounts),
        account: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

});

const TransactionHistory = connect(
    mapStoreToProps,
    mapDispatchToProps
)( TransactionHistoryView );

export default TransactionHistory;
