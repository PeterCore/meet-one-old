/*
 * EOS账户注册 - 新人页面
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:00:35
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-07-03 20:58:02
 */

import React from "react";
import EOSAccountRegisterFreshmanPageView from "./EOSAccountRegisterFreshmanPageView";
import { connect } from "react-redux";
import {generateKey} from "../../../../actions/EOSAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {}
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGenerateKey: (callback) => {
        dispatch(generateKey((error, result) => {
            callback && callback(error, result);
        }));
    }
});

const EOSAccountRegisterFreshmanPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)(EOSAccountRegisterFreshmanPageView);

export default EOSAccountRegisterFreshmanPage;
