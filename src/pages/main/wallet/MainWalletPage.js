import React from 'react';
import { connect } from "react-redux";
import MainWalletPageView from "./MainWalletPageView";
import {
    getCurrentBlockData,
    getExchangeRates,
    updateAllAccountBalance,
    updateEOSMappingStatus,
    getEtherBalance,
    getEtherBalanceMulti,
    updateETHAccountWithCallback
} from "../../../actions/EthersAction";
import { getCurrentWallet } from "../../../actions/WalletAction";

import {
    EOSTransfer,
    EOSTransaction
} from "../../../actions/EOSAction";

import { versionCheckUpate, applicationConfigUpdate } from '../../../actions/VersionAction'

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet(state, state.walletStore.currentWalletPrimaryKey);
    return {
        account: walletAccount,
        walletAccount,
        isLoggedIn: state.userStore.isLoggedIn,
        versionInfo: state.settingStore.versionInfo,
        isInit: state.settingStore.isInit,
        waitingURI: state.settingStore.waitingURI
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    updateisInit: (isInit) => {
        dispatch({
            type: 'IS_INIT',
            isInit: isInit
        })
    },

    applicationConfigUpdate: (callback) => {
        dispatch(applicationConfigUpdate(callback));
    },

    checkUpdate: ( callback ) => {
        dispatch( versionCheckUpate( callback ) )
    },

    onGetEtherBalance: ( address, callback ) => {
        dispatch( getEtherBalance( address, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onGetEtherBalanceMulti: ( callback ) => {
        dispatch( getEtherBalanceMulti( [ '0xa14d93014eb1c2652b7cddba29549425d66a6ec8' ], ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    updateETHData: () => {
        // ETH更新逻辑
        dispatch( updateAllAccountBalance( null ) );
        dispatch( getExchangeRates( null ) );
        dispatch( getCurrentBlockData( null ) );
        dispatch( updateEOSMappingStatus( null ) );
    },

    updateEOSData: (account) => {
        // EOS更新逻辑
        // dispatch(updateAccount(account, null));
    },
    updateETHAccountWithCallback: ( callback ) => {
        dispatch( updateETHAccountWithCallback( ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    // 发起转账交易
    onTransfer: ( account, data, password, callback ) => {
        dispatch( EOSTransfer( account, data, password, ( error, resBody ) => {
            callback && callback( error, resBody );
        }));
    },

    // 发起事务
    onTransaction: (account, data, password, callback) => {
        dispatch(EOSTransaction(account, data, password, (error, resBody) => {
            callback && callback(error, resBody);
        }));
    },
});

const MainWalletPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MainWalletPageView );

export default MainWalletPage;
