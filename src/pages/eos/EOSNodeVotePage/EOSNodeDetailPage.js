import { connect } from "react-redux";
import EOSNodeDetailPageView from "./EOSNodeDetailPageView";
import { getCurrentWallet } from "../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    const { params } = ownProps.navigation.state;
    const selectedBPs = params.selectedNodes.map((item) => {
        return item.owner
    });
    const selectedNodes = params.selectedNodes;
    const currentNode = params.currentNode;

    if (!selectedBPs.includes(currentNode.owner)) {
        selectedNodes.push(currentNode)
    }

    return {
        selectedNodes: selectedNodes,
        selectedBPs: selectedBPs,
        currentNode: currentNode,
        account: account
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

});

const EOSNodeDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNodeDetailPageView );

export default EOSNodeDetailPage;
