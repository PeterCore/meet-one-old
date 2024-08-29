import { connect } from "react-redux";
import EOSTransferPageView from "./EOSTransferPageView";

import { EOSTransfer, verifyAccountRegistered, getAccountContract } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSystemToken, getSupportTokens } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const walletAccount = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    const { params } = ownProps.navigation.state;
    const {queryObj, callbackId} = params ? params : {};

    const EOSTokenList = getSupportTokens();

    // 获取账号支持的token列表
    const supportTokenList = Object.keys( walletAccount.supportToken );
    const tokenSelectList = [];

    for ( let index = 0; index < EOSTokenList.length; index++ ) {
        const tokenItem = EOSTokenList[index];
        const { name, publisher } = tokenItem;
        const publisher_token = `${publisher}_${name}`;

        if ( name && publisher && supportTokenList.includes(publisher_token) && walletAccount.supportToken[publisher_token].isShow ) {
            tokenSelectList.push(tokenItem);
        }
    }

    // 从token详情页过来的, 设置当前token
    let currentToken = getSystemToken();

    if (params && params.currentToken) {
        currentToken = params.currentToken;
    }

    // 是否从最近转账过来的，控制memo底下小字显示
    let history = false;
    if (params && params.history) {
        history = params.history;
    }
    // 最近转账过来的 memo
    let memo = '';
    if (params && params.memo) {
        memo = params.memo;
    }

    let toAddress = '';
    if (history) {
        toAddress = params && params.toAddress;
    } else {
        toAddress = queryObj && queryObj.params && queryObj.params.to;
    }

    return {
        walletAccount: walletAccount,
        toAddress: toAddress,
        // schemaCallback: params && params.schemaCallback, // 这里是为了测试协议唤起是否能够成功回调
        tokenSelectList: tokenSelectList,
        currentToken: currentToken,
        memo: memo,
        history: history
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTransfer: ( account, data, password, callback ) => {
        dispatch( EOSTransfer( account, data, password, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, () => {
            success && success();
        }, () => {
            faild && faild();
        }));
    },
    // 获取合约信息
    getAccountContract: (accountName, callback) => {
        dispatch(getAccountContract(accountName, (err, res) => {
            callback && callback(err, res);
        }));
    }
});

const EOSTransferPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTransferPageView );

export default EOSTransferPage;
