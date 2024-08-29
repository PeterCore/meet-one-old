import { connect } from "react-redux";
import EOSWalletInfoPageView from "./EOSWalletInfoPageView";
import { getCurrentWallet } from "../../actions/WalletAction";
import { deleteEOSWallet, exportEOSWalletPrivateKey } from "../../actions/EOSAction";

const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;

    return {
        account: getCurrentWallet( state, params.primaryKey )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onExportEOSWalletPrivateKey: ( account, password, callback ) => {
        dispatch( exportEOSWalletPrivateKey( account, password, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    },
    onDeleteEOSWallet: ( account, password, callback ) => {
        dispatch( deleteEOSWallet( account, password, ( error, result ) => {
            callback && callback( error, result );
        } ) )
    }
});

const EOSWalletInfoPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSWalletInfoPageView );

export default EOSWalletInfoPage;
