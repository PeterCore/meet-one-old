import { connect } from "react-redux";
import EOSImportAccountSelectPageView from "./EOSImportAccountSelectPageView";
import { addEOSWalletWithIndex } from "../../../actions/EOSAction";
import { getNetType } from "../../../actions/ChainAction"

const mapStoreToProps = ( state, ownProps ) => {
    // 获取所有账户名数组
    const accounts = state.eosStore.accounts.slice();
    const accountsList = accounts.map((account) => (
        account.accountName + '_' + account.walletType
    ))

    return {
        netType: getNetType(),
        accountsList: accountsList,
        primaryKey: state.walletStore.walletSelfIncrementPrimaryKey
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    addMultiEOSWallet: ( primaryKey, accountPrivateKey, accountName, password, passwordHint, callback ) => {
        dispatch( addEOSWalletWithIndex( primaryKey, accountPrivateKey, accountName, password, passwordHint, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) );
    },
});

const EOSImportAccountSelectPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSImportAccountSelectPageView );

export default EOSImportAccountSelectPage;
