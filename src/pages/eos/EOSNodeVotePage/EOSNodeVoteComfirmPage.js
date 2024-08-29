import { connect } from "react-redux";
import EOSNodeVoteComfirmPageView from "./EOSNodeVoteComfirmPageView";
import { delegatebw, voteProducers } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSystemToken } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    const { params } = ownProps.navigation.state;

    return {
        account: account,
        selectedNodes: params && params.selectedNodes,
        systemToken: getSystemToken().name
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( delegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },

    onVoteProducers: ( account, producers, password, callback ) => {
        dispatch( voteProducers( account, producers, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    }
});

const EOSNodeVoteComfirmPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNodeVoteComfirmPageView );

export default EOSNodeVoteComfirmPage;
