import { connect } from 'react-redux';
import EOSAuthorationPageView from "./EOSAuthorationPageView";
import { getAllWallet, getCurrentWallet, setDefaultWallet } from "../../../actions/WalletAction"
import {updateAccount} from "../../../actions/EOSAction"

const mapStoreToProps = ( state, ownProps ) => {
    const account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    return {
        accounts: getAllWallet( state ), // 所有的钱包账户
        account: account, // 当前钱包账户
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    dispatch,
    onSetDefaultWallet: ( account, callback ) => {
        dispatch( setDefaultWallet( account, ( error, result ) => {
            callback && callback( error, result );
        }));
    },
    // 同种类型钱包之间切换，要更新钱包信息
    onUpdateAccount: (account) => {
        dispatch( updateAccount( account, null ) );
    },
});

const EOSAuthorationPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSAuthorationPageView );

export default EOSAuthorationPage;
