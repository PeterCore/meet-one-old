import { connect } from "react-redux";
import BOSFastImportPageView from "./BOSFastImportView";

import { addBOSWalletFromEOS } from "../../../actions/EOSAction";
import { getNetType } from "../../../actions/ChainAction"

const mapStoreToProps = ( state, ownProps ) => {
    // 获取所有账户名数组
    const accounts = JSON.parse(JSON.stringify(state.eosStore.accounts));
    const accountsMap = {};

    accounts.forEach((account, index) => {
        if (account.walletType === 'EOS') {
            accountsMap[account.accountName] = account
        }
    })

    return {
        netType: getNetType(),
        accountsMap: accountsMap,
        primaryKey: state.walletStore.walletSelfIncrementPrimaryKey
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    addBOSWalletFromEOS: ( index, accountPublicKey, aloha, accountName, passwordHint, callback ) => {
        dispatch( addBOSWalletFromEOS( index, accountPublicKey, aloha, accountName, passwordHint, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) );
    },
});

const BOSFastImportPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( BOSFastImportPageView );

export default BOSFastImportPage;
