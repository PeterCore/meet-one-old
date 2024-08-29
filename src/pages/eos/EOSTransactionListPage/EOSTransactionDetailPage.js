import { connect } from "react-redux";
import EOSTransactionDetailPageView from "./EOSTransactionDetailPageView";
import { eosWalletAddCustomToken, eosWalletSupportTokenAdd } from "../../../actions/EOSAction";
import { getNetType, getSupportTokens } from "../../../actions/ChainAction"

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        allTokens: getSupportTokens(),
        account: params.account,
        blockNum: params.blockNum,
        blockTime: params.blockTime,
        transactionId: params.transactionId,
        transData: params.transData,
        publisher: params.publisher,
        netType: getNetType()
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    addCustomToken: ( token, callback ) => {
        dispatch( eosWalletAddCustomToken( token, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    accountAddToken: ( account, token, callback ) => {
        dispatch( eosWalletSupportTokenAdd( account, token, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
});

const EOSTransactionDetailPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTransactionDetailPageView );

export default EOSTransactionDetailPage;
