/*
 * EOS注册帐号入口首页
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:01:44
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-07-03 17:37:16
 */

import React from "react";
import EOSAccountRegisterIndexPageView from "./EOSAccountRegisterIndexPageView";
import { connect } from "react-redux";
import { getCurrentWallet } from "../../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        walletAccount
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

});

const EOSAccountRegisterIndexPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)(EOSAccountRegisterIndexPageView);

export default EOSAccountRegisterIndexPage;
