import React from 'react';
import { connect } from "react-redux";
import EOSNodeListPageView from "./EOSNodeListPageView";
import { getBPSAndNodeId } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";


const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );

    return {
        allAsset: account.BPs,
        account: account,
        totalVoteWeight: account.totalVoteWeight,
        showLabel: account.showLabel,

        bpProducerDic: account.bpProducerDic,
        contributors: account.contributors,
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    getNodesIDInfo: ( account, callback ) => {
        dispatch( getBPSAndNodeId( account, ( err, response ) => {
            callback && callback( err, response );
        } ) )
    },
});

const EOSNodeListPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSNodeListPageView );

export default EOSNodeListPage;
