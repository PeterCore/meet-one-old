
import { connect } from "react-redux";
import EOSChainChangePageView from "./EOSChainChangePageView";
import { changeCurrentChain, changeCurrentNetwork, updateChainData, updateSupportTokens, updateHistoryNetworks } from "../../../actions/ChainAction";
import { updateEOS } from "../../../actions/EOSAction";
import walletActionTypes from "../../../reducers/wallet/walletActionTypes";
import eosActionTypes from "../../../reducers/eos/eosActionTypes";
import chainActionTypes from "../../../reducers/chain/chainActionTypes";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        chainData: state.chainStore.chainData,
        currentChain: state.chainStore.currentChain
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    ChangeCurrentChain: (chain, callback) => {
        dispatch( changeCurrentChain( chain, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    updateChainData: () => {
        dispatch(updateChainData());
    },
    updateNetworkByData: ( netType, data, callback ) => {
        if (netType === 'EOS') {
            dispatch( {
                type: eosActionTypes.EOS_UPDATE_NETWORKS,
                data: data
            } )
        } else {
            dispatch( {
                type: chainActionTypes.UPDATE_SIDECHAIN_NODES,
                data: data
            } )
        }
        callback && callback( );
    },
    updateEOS: () => {
        dispatch( updateEOS() );
    },
    updateSupportTokens: () => {
        dispatch( updateSupportTokens() )
    },
    updateHistoryNetworks: () => {
        dispatch( updateHistoryNetworks() )
    },
    changeCurrentNetwork: (data) => {
        dispatch( changeCurrentNetwork( data ));
    },
    reCalculateCurrentWallet: () => {
        dispatch( {
            type: walletActionTypes.RE_CALC_CURRENT_WALLET_ADDRESS
        } );
    }
});

const EOSChainChangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSChainChangePageView );

export default EOSChainChangePage;
