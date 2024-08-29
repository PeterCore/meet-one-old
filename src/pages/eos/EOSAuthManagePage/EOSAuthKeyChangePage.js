import { connect } from "react-redux";
import EOSAuthKeyChangePageView from "./EOSAuthKeyChangePageView";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { verifyAccountRegistered, EOSAuthChange } from "../../../actions/EOSAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey ),
        permissionData: params.permissionData,
        canDelete: params.canDelete
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, () => {
            success && success();
        }, () => {
            faild && faild();
        }));
    },
    // 更换Key的Action
    onAuthChange: (account, data, password, callback) => {
        dispatch(EOSAuthChange(account, data, password, (error, result) => {
            callback && callback( error, result );
        }));
    }
});

const EOSAuthKeyChangePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAuthKeyChangePageView );

export default EOSAuthKeyChangePage;
