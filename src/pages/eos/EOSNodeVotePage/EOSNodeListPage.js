import { connect } from "react-redux";
import EOSNodeListPageView from "./EOSNodeListPageView";
import { getBPSAndNodeId, getProducerList } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    let selectedBPs = (account.voter_info && account.voter_info.producers) ? account.voter_info.producers : [];

    const { params } = ownProps.navigation.state;
    if (params && params.selectedBPs) {
        selectedBPs = params.selectedBPs;
    }

    return {
        account: account,
        selectedBPs: selectedBPs,
        netType: getNetType()
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

    getProducerList: ( callback ) => {
        dispatch( getProducerList( ( err, response ) => {
            callback && callback( err, response );
        } ) )
    }
});

const EOSNodeListPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNodeListPageView );

export default EOSNodeListPage;
