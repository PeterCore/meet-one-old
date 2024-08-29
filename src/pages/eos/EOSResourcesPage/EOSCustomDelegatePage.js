import { connect } from "react-redux";
import EOSCustomDelegatePageView from "./EOSCustomDelegatePageView";
import { delegatebw, undelegatebw, verifyAccountRegistered, getEOSTableRows } from "../../../actions/EOSAction";
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

    let isDelegate;
    if (params && params.unstake) {
        isDelegate = 0;
    } else {
        isDelegate = 1;
    }

    return {
        account: account,
        systemToken: getSystemToken().name,
        isDelegate
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( delegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
    onDispatchUnDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( undelegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res )
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
    // 获取抵押列表
    getDelegateList: (data, callback) => {
        dispatch(getEOSTableRows(data, (err, res) => {
            callback && callback( err, res )
        }))
    }
});

const EOSCustomDelegatePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSCustomDelegatePageView );

export default EOSCustomDelegatePage;
