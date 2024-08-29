import { connect } from "react-redux";
import EOSAuthManagePageView from "./EOSAuthManagePageView";
import { getCurrentWallet } from "../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    let account;
    if (params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        account: account
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

});

const EOSAuthManagePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAuthManagePageView );

export default EOSAuthManagePage;
