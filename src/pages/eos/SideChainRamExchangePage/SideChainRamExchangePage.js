import React from 'react';
import { connect } from "react-redux";
import SideChainRamExchangePageView from "./SideChainRamExchangePageView";
import {
    updateAccount,
    getCurrentRAMPrice,
    buyRAM,
    sellRAM
} from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSystemToken } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;
    let account;
    if (params && params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        account: account,
        RAMPrice: state.eosStore.RAMPrice,
        systemToken: getSystemToken().name
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({

    updateRAMPrice: (account) => {
        dispatch(getCurrentRAMPrice(account));
    },

    buyRAM: (account, password, quant, callback) => {
        dispatch(buyRAM(account, password, quant, callback));
    },

    sellRAM: (account, password, quant, callback) => {
        dispatch(sellRAM(account, password, quant, callback));
    },

    updateEOSData: (account) => {
        dispatch(updateAccount(account, null));
    }
});

const SideChainRamExchangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( SideChainRamExchangePageView );

export default SideChainRamExchangePage;
