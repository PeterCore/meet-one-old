
import { connect } from "react-redux";
import EOSNetWorkChangePageView from "./EOSNetWorkChangePageView";
import { updateEOS } from "../../../actions/EOSAction";
import { getNetType, changeCurrentNetwork, updateNetworks, getCurrentNetwork } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {

    let eosNetworks;
    const netType = getNetType();
    if (netType !== 'EOS') {
        eosNetworks = state.chainStore.sideChainNodes;
    } else {
        eosNetworks = state.eosStore.eosNetworks;
    }

    return {
        eosNetworks: eosNetworks,
        currentNetwork: getCurrentNetwork()
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    ChangeCurrentNetwork: (network, callback) => {
        dispatch( changeCurrentNetwork( network, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    updateEOS: () => {
        dispatch( updateEOS() );
    },
    updateNetworks: () => {
        dispatch( updateNetworks() );
    }
});

const EOSNetWorkChangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNetWorkChangePageView );

export default EOSNetWorkChangePage;
