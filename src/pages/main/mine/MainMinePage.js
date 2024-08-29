import React from 'react';
import MainMinePageView from "./MainMinePageView";
import { connect } from "react-redux";
import { versionCheckUpate } from '../../../actions/VersionAction'
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getNetType } from "../../../actions/ChainAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        isLoggedIn: state.userStore.isLoggedIn,
        account: state.userStore.account,
        versionInfo: state.settingStore.versionInfo,
        walletAccount: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey ),
        netType: getNetType()
    }
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTapSelectNet: () => {
        ownProps.navigation.navigate( 'EOSChainChangePage' )
    },
    onTapManagerWallet: () => {
        ownProps.navigation.navigate( 'WalletListPage' )
    },
    onTapTransactionHistory: () => {
        ownProps.navigation.navigate( 'TransactionHistory' )
    },
    onTapSystemSetting: () => {
        ownProps.navigation.navigate( 'SystemSettingsPage' )
    },
    onTapRegister: () => {
        ownProps.navigation.navigate( 'AccountRegisterPage', { flowType: 'register' } )
    },
    onTapLogin: () => {
        ownProps.navigation.navigate( 'AccountLoginPage' )
    },
    onTapUserProfile: () => {
        ownProps.navigation.navigate( 'MineProfilePage' )
    },
    onTapAbout: () => {
        ownProps.navigation.navigate( 'AboutPage' )
    },
    onTapDebug: () => {
        ownProps.navigation.navigate( 'DebugPage' )
    },
    onTapFeedback: () => {
    },
    onTapRecommendToUser: () => {
        ownProps.navigation.navigate( 'MineRecommendMeetPage' )
    },
    checkUpdate: ( callback ) => {
        dispatch( versionCheckUpate( callback ) )
    },
    onTapSelectNode: () => {
        ownProps.navigation.navigate( 'EOSNetWorkChangePage' )
    },
    onTapLanguageSelect: () => {
        ownProps.navigation.navigate( 'LanguageSettingPage' )
    },
    onTapApplicationSecure: () => {
        ownProps.navigation.navigate('ApplicationSecureSettingPage');
    }

});

const MainMinePage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MainMinePageView );

export default MainMinePage;
