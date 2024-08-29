import React from "react";
import DebugPageView from "./DebugPageView";
import { connect } from "react-redux";
import { getNews } from "../../actions/NewsAction";

import { getCurrentWallet,  } from "../../actions/WalletAction";
import {openWebView } from "../../util/NavigationUtil";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        currentAccount: getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey )
    }
};
const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onTapFCMPushTest: () => {
        // ownProps.navigation.navigate( 'PushTestPage' )
    },
    onTapXGPushTest: () => {
        ownProps.navigation.navigate( 'PushTestXGPage' )
    },
    onTapVerifyTest: () => {
        ownProps.navigation.navigate( 'VerificationTestPage' )
    },
    onTapShareTest: () => {
        ownProps.navigation.navigate( 'UMShareShareTestPage' )
    },
    onTapScanLocalTest: () => {
        ownProps.navigation.navigate( 'QRScanLocalTestPage' )
    },
    onTapEOS: () => {
        ownProps.navigation.navigate( 'EOSBrowserPage' )
    },
    onTapRAMExchange: () => {
        ownProps.navigation.navigate( 'RAMExchangePage' )
    },
    onTapEOSGenerator: () => {
        // 生成EOS的公钥私钥
        ownProps.navigation.navigate( 'EOSGeneratorPage', {
            publicKey: 'EOS6HMAa2FfKKjmZE6BvTFkC5PCGSKfVQ1yPBAX1rHEJR6f46muCT',
            privateKey: '5JmUydoJoQssbLPo6HPoHeEyVD9g6FybDzG9UGHkzYKJQmJxZVa'
        });
    },
    onTapTestNetwork: () => {
        dispatch( getNews( 0, 20, 2, null ) );
    },
    // 新老用户注册账户入口
    onTapNewAccount: () => {
        ownProps.navigation.navigate( 'EOSAccountRegisterIndexPage' )
    },

    // 游戏中心入口:
    onTapGameCenter: () => {
        ownProps.navigation.navigate('GameCenterView');
    },

    onTapEOSTokenList: (account) => {
        ownProps.navigation.navigate( 'EOSTokenSettingPage', {
            primaryKey: account.primaryKey
        })
    },
    onTapEOSTokenDetail: (account) => {
        ownProps.navigation.navigate( 'EOSTokenDetailPage', {
            primaryKey: account.primaryKey
        })
    },
    onTabWebview: (url) => {
        ownProps.navigation.navigate('WebViewPage', {
            url
        })
    },
    onTabREX: () => {
        ownProps.navigation.navigate( 'REXExchangePage' )
    }

});

const DebugPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( DebugPageView );

export default DebugPage;
