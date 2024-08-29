import React from 'react';
import { connect } from "react-redux";
import EOSVotePageView from "./EOSVotePageView";
import { getAccount, getBPSAndNodeId, voteProducers } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";


const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    return {
        account: account,
        BPs: account.BPs,
        selectedNodeList: params.selectedNodeList,
        bpProducerDic: account.bpProducerDic,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchGetVoteBpsPost: ( account, callback ) => {
        dispatch( getBPSAndNodeId( account, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
    getAccountInfo: ( account, callback ) => {
        dispatch( getAccount( account, ( err, res ) => {
            callback && callback( err, res )
        } ) )
    },

    onDispatchVoteVotingList: ( account, producers, password, callback ) => {
        dispatch( voteProducers( account, producers, password, ( err, res ) => {
            callback && callback( err, res );
        } ) );
    },
});

const EOSVotePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSVotePageView );

export default EOSVotePage;
