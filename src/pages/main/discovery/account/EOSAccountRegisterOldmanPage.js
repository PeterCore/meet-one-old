/*
 * EOS账户注册 - 我是老用户
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:04:10
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-07-16 14:13:40
 */

import React from "react";
import EOSAccountRegisterOldmanPageView from "./EOSAccountRegisterOldmanPageView";
import { connect } from "react-redux";

import { getCurrentWallet } from "../../../../actions/WalletAction";
import { verifyAccountRegistered, createEOSAccountWithPublicKey } from "../../../../actions/EOSAction";
import { getNetType, getSystemToken } from "../../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        RAMPrice: state.eosStore.RAMPrice,
        walletAccount,
        netType: getNetType(),
        systemToken: getSystemToken().name
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onCreateEOSAccountWithPublicKey: (account, password, data, callback) => {
        dispatch(createEOSAccountWithPublicKey(account, password, data, (err, result) => {
            callback && callback(err, result);
        }));
    },
    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, () => {
            success && success();
        }, () => {
            faild && faild();
        }));
    }
});

const EOSAccountRegisterOldmanPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)(EOSAccountRegisterOldmanPageView);

export default EOSAccountRegisterOldmanPage;
