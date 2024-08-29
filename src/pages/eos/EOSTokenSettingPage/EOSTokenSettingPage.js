import { connect } from "react-redux";
import EOSTokenSettingPageView from "./EOSTokenSettingPageView";
import { eosWalletSupportTokenAdd, eosWalletSupportTokenRemove } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSupportTokens, getNetType, updateSupportTokens } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        supportTokens: getSupportTokens(),
        account: getCurrentWallet( state, params.primaryKey ),
        autoFocus: params.autoFocus ? true : false,
        netType: getNetType()
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onEOSWalletSupportTokenAdd: ( account, token, callback ) => {
        dispatch( eosWalletSupportTokenAdd( account, token, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },

    onEOSWalletSupportTokenRemove: ( account, token, callback ) => {
        dispatch( eosWalletSupportTokenRemove( account, token, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    updateSupportTokens: () => {
        dispatch( updateSupportTokens (null) );
    }
});

const EOSTokenSettingPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTokenSettingPageView );

export default EOSTokenSettingPage;
