import { connect } from "react-redux";
import WalletListPageView from "./WalletListPageView";
import { getAllWallet } from "../../actions/WalletAction";
import { getSystemToken, getNetType } from "../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const accounts = state.eosStore.accounts.slice();
    const currentNetAccount = [];
    const netType = getNetType();

    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].walletType === netType) {
            currentNetAccount.push(accounts[i]);
        }
    }

    return {
        systemToken: getSystemToken().name,
        netType: netType,
        accounts: currentNetAccount,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({});

const WalletListPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( WalletListPageView );

export default WalletListPage;
