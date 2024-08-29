import { connect } from "react-redux";
import EOSCreateWalletPageView from "./EOSCreateWalletPageView";
import { createEOSAccount, addEOSWallet, verifyAccountRegistered } from "../../../actions/EOSAction";
import { getCurrentWallet,  } from "../../../actions/WalletAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        language: state.settingStore.language,
        showHowToGet: state.settingStore.config.how_to_get_invitecode
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({

    onCreateEOSAccount: ( name, voucher, callback ) => {
        dispatch(createEOSAccount( name, voucher, (error, twokey, resData) => {
            callback && callback(error, twokey, resData);
        }));
    },

    addToEOSWallet: ( accountPrivateKey, accountName, password, passwordHint, callback ) => {
        dispatch( addEOSWallet( accountPrivateKey, accountName, password, passwordHint, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) );
    },

    // updateNewAccount: (newAccount) => {
    //     dispatch( updateAccount( newAccount, null ) );
    // },

    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, () => {
            success && success();
        }, () => {
            faild && faild();
        }));
    }
});

const EOSCreateWalletPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSCreateWalletPageView );

export default EOSCreateWalletPage;
