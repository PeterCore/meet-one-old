import React from 'react';
import EOSAccountRegisterPageView from "./EOSAccountRegisterPageView";
import { connect } from "react-redux";
import { getCurrentWallet,  } from "../../../../actions/WalletAction";
import { verifyAccountRegistered } from "../../../../actions/EOSAction";
import { getSystemToken, getNetType } from "../../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        isLoggedIn: state.userStore.isLoggedIn,
        account: state.userStore.account,
        versionInfo: state.settingStore.versionInfo,
        RAMPrice: state.eosStore.RAMPrice,
        walletAccount,
        systemToken: getSystemToken().name,
        netType: getNetType()
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, () => {
            success && success();
        }, () => {
            faild && faild();
        }));
    }
});

const EOSAccountRegisterPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAccountRegisterPageView );

export default EOSAccountRegisterPage;
