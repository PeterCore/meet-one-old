/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import { StackNavigator, TabNavigator, } from 'react-navigation';

import { createReactNavigationReduxMiddleware, reduxifyNavigator, } from 'react-navigation-redux-helpers';
import { Dimensions, Image, Platform } from "react-native";
import { connect } from "react-redux";
import ETHQRCodePage from './pages/eth/ETHQRCodePage';
import ETHTransferPage from './pages/eth/ETHTransferPage';
import MainMinePage from "./pages/main/mine/MainMinePage";
import MineProfilePage from "./pages/main/mine/MineProfilePage";
import MineChangeNamePage from "./pages/main/mine/MineChangeNamePage";
import MineChangePasswordPage from "./pages/main/mine/MineChangePasswordPage";
import MineEmailPage from "./pages/main/mine/MineEmailPage";
import SystemSettingsPage from "./pages/setting/SystemSettingsPage";
import WalletListPage from "./pages/wallet/WalletListPage";
import ETHCreateWalletPage from "./pages/eth/ETHCreateWalletPage";
import ETHWalletSeedPhrasePage from "./pages/eth/ETHWalletSeedPhrasePage";
import ETHImportBySeedPhrasePage from "./pages/eth/ETHImportBySeedPhrasePage";
import ETHImportByPrivateKeyPage from "./pages/eth/ETHImportByPrivateKeyPage";
import ETHImportByKeystorePage from "./pages/eth/ETHImportByKeystorePage";
import MainWalletPage from "./pages/main/wallet/MainWalletPage";
import EOSMappingTipPage from "./pages/eosMapping/EOSMappingTipPage";
import EOSMappingGeneratePage from "./pages/eosMapping/EOSMappingGeneratePage";
import EOSMappingSubmitPage from "./pages/eosMapping/EOSMappingSubmitPage";
import EOSMappingSuccessPage from "./pages/eosMapping/EOSMappingSuccessPage";
import EOSMappingVerifyPage from "./pages/eosMapping/EOSMappingVerifyPage";
import ETHWalletInfoPage from "./pages/eth/ETHWalletInfoPage";
import ETHTokenListSettingPage from "./pages/eth/ETHTokenListSettingPage";
import ETHTokenDetailPage from "./pages/eth/ETHTokenDetailPage";
import QRScanPage from "./pages/QRScanPage";
import constStyles from "./styles/constStyles";
import WebViewPage from "./pages/WebViewPage";
import WalletPasswordChangePage from "./pages/wallet/WalletPasswordChangePage";
import ETHTransferProgressPage from "./pages/eth/ETHTransferProgressPage";
import ETHTransactionListPage from "./pages/eth/ETHTransactionListPage";
import AccountRegisterPage from "./pages/account/register/AccountRegisterPage";
import AccountLoginPage from "./pages/account/login/AccountLoginPage";
import CountrySelectPage from "./pages/account/countrySelect/CountrySelectPage";
import LanguageSettingPage from "./pages/setting/LanguageSettingPage";
import PushTestXGPage from "./pages/debug/PushTestXGPage";
import VerificationTestPage from "./pages/debug/VerificationTestPage";
import QRScanLocalTestPage from "./pages/debug/QRScanLocalTestPage";
import UMShareAuthTestPage from "./pages/debug/UMShareAuthTestPage";
import UMShareShareTestPage from "./pages/debug/UMShareShareTestPage";
import NotificationPage from "./pages/notification/NotificationPage";
import NewsMeetSelfPage from "./pages/main/news/NewsMeetSelfPage";
import NewsTwitterPage from "./pages/main/news/NewsTwitterPage";
import NewsWeiboPage from "./pages/main/news/NewsWeiboPage";
import NewsWechatPage from "./pages/main/news/NewsWechatPage";
import NewsDetailPage from "./pages/main/news/NewsDetailPage";
import NewsDetailWebPage from "./pages/main/news/NewsDetailWebPage";
import NewsSharePage from "./pages/main/news/NewsSharePage";
import ETHWalletNameEditPage from "./pages/eth/ETHWalletNameEditPage";
import ETHWalletBackupKeystorePage from "./pages/eth/ETHWalletBackupKeystorePage";
import ETHWalletBackupPrivateKeyPage from "./pages/eth/ETHWalletBackupPrivateKeyPage";
import I18n from "./I18n";
import Keys from "./configs/Keys";
import DebugPage from "./pages/debug/DebugPage";
import AboutPage from "./pages/about/AboutPage";
import MineRecommendMeetPage from "./pages/main/mine/MineRecommendMeetPage";
import PushNotificationSettingPage from "./pages/setting/PushNotificationSettingPage";
import ETHTransactionDetailPage from "./pages/eth/ETHTransactionDetailPage";
import MainDiscoveryPage from "./pages/main/discovery/MainDiscoveryPage";
// 迁移微信小程序到RN
import CandyPage from "./pages/main/discovery/candy/CandyPage.js";
import CandyDetailPage from "./pages/main/discovery/candy/CandyDetailPage.js";
// 新版游戏中心
import GameCenterView from './pages/main/discovery/game-center/GameCenterView';
import GameCenterSearchResult from './pages/main/discovery/game-center/GameCenterSearchResult';
// 批量创建帐号
import EOSAccountRegisterPage from './pages/main/discovery/account/EOSAccountRegisterPage.js' // EOS帐号注册页
import EOSAccountRegisterResultPage from './pages/main/discovery/account/EOSAccountRegisterResultPage.js' // EOS帐号注册结果页面
import RAMExchangePage from './pages/main/discovery/account/RAMExchangePage.js' // 交换RAM的页面
import REXExchangePage from './pages/main/discovery/account/REXExchangePage.js' // 交换REX的页面
// import EOSBPPage from "./pages/main/discovery/candy/MainCandyPage.js";
// import EOSBPDetailPage from "./pages/main/discovery/candy/MainCandyPage.js";
// 免费创建新账号
import EOSCreateWalletPage from './pages/eos/EOSCreateWalletPage/EOSCreateWalletPage';
// 新老用创建帐号入口
import EOSAccountRegisterIndexPage from './pages/main/discovery/account/EOSAccountRegisterIndexPage';
import EOSAccountRegisterFreshmanPage from './pages/main/discovery/account/EOSAccountRegisterFreshmanPage';
import EOSAccountRegisterOldmanPage from './pages/main/discovery/account/EOSAccountRegisterOldmanPage';
// 合约创建账号
import RegisterAccountByContract from './pages/main/discovery/account/RegisterAccountByContract/RegisterAccountByContract';
import RegisterAccountByContractResult from './pages/main/discovery/account/RegisterAccountByContract/RegisterAccountByContractResult'

import EOSAuthorationPage from "./pages/eos/EOSAuthorationPage/EOSAuthorationPage";

import EOSWalletImportPage from "./pages/eos/EOSWalletImportPage/EOSWalletImportPage";
import EOSImportAccountSelectPage from "./pages/eos/EOSWalletImportPage/EOSImportAccountSelectPage";

import EOSVotePage from "./pages/eos/EOSVotePage/EOSVotePage";
// import EOSDelegatebwPage from "./pages/eos/EOSDelegatebwPage/EOSDelegatebwPage";
import EOSNodeListPage from "./pages/eos/EOSNodeVotePage/EOSNodeListPage";
import EOSNodeDetailPage from "./pages/eos/EOSNodeVotePage/EOSNodeDetailPage";
import EOSNodeVoteProxyPage from "./pages/eos/EOSNodeVotePage/EOSNodeVoteProxyPage";

import EOSNodeVoteComfirmPage from "./pages/eos/EOSNodeVotePage/EOSNodeVoteComfirmPage";
import EOSChangeNodeConnectionPage from "./pages/eos/EOSChangeNodeConnectionPage/EOSChangeNodeConnectionPage";
// import EOSUnDelegatebwPage from "./pages/eos/EOSUnDelegatebwPage/EOSUnDelegatebwPage";
import EOSWalletInfoPage from "./pages/eos/EOSWalletInfoPage";
import EOSWalletBackupPrivateKeyPage from "./pages/eos/EOSWalletBackupPrivateKeyPage";

// 资源抵押赎回页
import EOSResourcesPage from "./pages/eos/EOSResourcesPage/EOSResourcesPage";
import EOSCustomDelegatePage from "./pages/eos/EOSResourcesPage/EOSCustomDelegatePage";
// 节点选择
import EOSNetWorkChangePage from "./pages/eos/EOSNetWorkChangePage/EOSNetWorkChangePage";

// EOS 转账
import EOSTransferSelectPage from "./pages/eos/EOSTransferPage/EOSTransferSelectPage";
import EOSTransferPage from './pages/eos/EOSTransferPage/EOSTransferPage';
import EOSTransferResultPage from './pages/eos/EOSTransferPage/EOSTransferResultPage';
import EOSQRCodePage from './pages/eos/EOSQRCodePage/EOSQRCodePage';
import EOSQRScanPage from './pages/eos/EOSQRScanPage/EOSQRScanPage';
import TransactionHistory from './pages/wallet/TransactionHistory';
import EOSTransactionDetailPage from './pages/eos/EOSTransactionListPage/EOSTransactionDetailPage';
import EOSGeneratorPage from './pages/eos/EOSGeneratorPage.js';

import EOSTokenSettingPage from './pages/eos/EOSTokenSettingPage/EOSTokenSettingPage';
import EOSTokenDetailPage from './pages/eos/EOSTokenDetailPage/EOSTokenDetailPage';
import EOSTokenInfoPage from './pages/eos/EOSTokenInfoPage/EOSTokenInfoPage';

import EOSAccountInfoPage from './pages/eos/EOSAccountInfoPage/EOSAccountInfoPage';
import EOSAuthManagePage from './pages/eos/EOSAuthManagePage/EOSAuthManagePage';
import EOSAuthKeyChangePage from './pages/eos/EOSAuthManagePage/EOSAuthKeyChangePage';
import ApplicationSecureSettingPage from './pages/setting/ApplicationSecureSettingPage';
import ApplicationSecurePasswordPage from './pages/setting/ApplicationSecurePasswordPage';

import EOSBrowserPage from './pages/eos/EOSBrowserPage/EOSBrowserPage';
import EOSBrowserSearchResultPage from './pages/eos/EOSBrowserPage/EOSBrowserSearchResultPage';

import EOSChainChangePage from './pages/eos/EOSChainChangePage/EOSChainChangePage';
import SideChainRamExchangePage from './pages/eos/SideChainRamExchangePage/SideChainRamExchangePage';

import BOSFastImportPage from './pages/bos/BOSFastImport/BOSFastImport';

const PropTypes = require( 'prop-types' );

process.env.REACT_NAV_LOGGING = (global.__DEV__);
const { width } = Dimensions.get( 'window' );

const NewsTabContainer = TabNavigator(
    {
        NewsMeetSelfPage: { screen: NewsMeetSelfPage },
        NewsTwitterPage: { screen: NewsTwitterPage },
        NewsWeiboPage: { screen: NewsWeiboPage },
        NewsWechatPage: { screen: NewsWechatPage },
    },
    {
        lazy: false,
        tabBarPosition: 'top',
        backBehavior: 'none',
        ...TabNavigator.Presets.AndroidTopTabs,
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
            activeTintColor: '#000000',
            inactiveTintColor: '#888888',
            inactiveBackgroundColor: 'white',
            activeBackgroundColor: 'white',
            showIcon: false,
            indicatorStyle: {
                alignSelf: 'center',
                width: 30,
                marginLeft: (width / (4 * 2)) - 15,
                borderBottomColor: constStyles.THEME_COLOR,
                borderBottomWidth: 2,
            },
            labelStyle: {
                fontSize: 12,
                elevation: 0
            },
            style: {
                backgroundColor: '#ffffff',
                elevation: 0,
            },
            tabStyle: {
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 0,
                marginTop: Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0
            },
        }
    }
);


const MainTabContainer = TabNavigator(
    {
        MainETHWallet: { screen: MainWalletPage, },
        MainDiscovery: { screen: MainDiscoveryPage, },
        NewsTabContainer: {
            screen: NewsTabContainer,
            navigationOptions: ( { navigation } ) => ({
                title: I18n.t( Keys.news_title ),
                tabBarIcon: ( { focused, tintColor } ) => (
                    focused ?
                        <Image
                            source={require( './imgs/tabbar_btn_news_active.png' )}
                            style={[ { width: 34, height: 34 } ]}
                        />
                        :
                        <Image
                            source={require( './imgs/tabbar_btn_news.png' )}
                            style={[ { width: 34, height: 34 } ]}
                        />
                ),
                header:null
            }),
        },
        MainMine: { screen: MainMinePage },
    },
    {
        lazy: true,
        tabBarPosition: 'bottom',
        swipeEnabled: false,//不让滑动
        animationEnabled: false,
        tabBarOptions: {
            activeTintColor: constStyles.THEME_COLOR,
            scrollEnabled: false,
            inactiveTintColor: '#999999',
            showIcon: true,
            style: {
                backgroundColor: '#ffffff',
                height: 50
            },
            indicatorStyle: {
                opacity: 0
            },
            tabStyle: {
                padding: 0,
                height: 50
            },
            labelStyle: {
                fontSize: 10,
                elevation: 0,
                paddingTop: 2,
                paddingBottom: Platform.OS === 'ios' ? 2 : 5,
                margin: 0
            },
        },
    }
);


const ETHImportTabContainer = TabNavigator(
    {
        ETHImportBySeedPhrase: { screen: ETHImportBySeedPhrasePage },
        ETHImportByPrivateKey: { screen: ETHImportByPrivateKeyPage },
        ETHImportByKeystore: { screen: ETHImportByKeystorePage },
    },
    {
        lazy: true,
        tabBarPosition: 'top',
        swipeEnabled: true,//不让滑动
        backBehavior: 'none',
        ...TabNavigator.Presets.AndroidTopTabs,
        tabBarOptions: {
            activeTintColor: constStyles.THEME_COLOR,
            inactiveTintColor: '#000000',
            inactiveBackgroundColor: 'white',
            activeBackgroundColor: 'white',
            showIcon: false,
            indicatorStyle: {
                alignSelf: 'center',
                width: 30,
                marginLeft: (width / (3 * 2)) - 15,
                borderBottomColor: constStyles.THEME_COLOR,
                borderBottomWidth: 2,
            },
            labelStyle: {
                fontSize: 16,
                elevation: 0
            },
            style: {
                backgroundColor: '#fafafa',
                elevation: 0,
            },
            tabStyle: {
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 0
            }

        }
    }
);

const routeConfiguration = {
    mainPage: {
        // TODO: 调试
        screen: MainTabContainer,
        // screen: EOSResourcesPage,
        // screen: REXExchangePage,
        navigationOptions: {
            headerLeft: null,
            header:null
        }
    },
    REXExchangePage: {
        screen: REXExchangePage
    },
    ETHQRCodePage: {
        screen: ETHQRCodePage,
    },
    ETHTransferPage: {
        screen: ETHTransferPage
    },
    WalletListPage: {
        screen: WalletListPage
    },
    ETHCreateWalletPage: {
        screen: ETHCreateWalletPage
    },
    ETHWalletSeedPhrasePage: {
        screen: ETHWalletSeedPhrasePage
    },
    ETHImportPage: {
        screen: ETHImportTabContainer,
        navigationOptions: ( { navigation } ) => ({
            title: I18n.t( Keys.import_wallet_title )
        })
    },
    EOSMappingTipPage: {
        screen: EOSMappingTipPage,
    },
    EOSMappingGeneratePage: {
        screen: EOSMappingGeneratePage,
    },
    EOSMappingSubmitPage: {
        screen: EOSMappingSubmitPage,
    },
    EOSMappingSuccessPage: {
        screen: EOSMappingSuccessPage,
    },
    EOSMappingVerifyPage: {
        screen: EOSMappingVerifyPage,
    },
    ETHWalletInfoPage: {
        screen: ETHWalletInfoPage,
    },
    ETHTokenListSettingPage: {
        screen: ETHTokenListSettingPage
    },
    ETHTokenDetailPage: {
        screen: ETHTokenDetailPage
    },
    QRScanPage: {
        screen: QRScanPage
    },
    WebViewPage: {
        screen: WebViewPage
    },
    WalletPasswordChangePage: {
        screen: WalletPasswordChangePage
    },
    ETHTransferProgressPage: {
        screen: ETHTransferProgressPage
    },
    ETHTransactionListPage: {
        screen: ETHTransactionListPage
    },
    SystemSettingsPage: {
        screen: SystemSettingsPage
    },
    AccountRegisterPage: {
        screen: AccountRegisterPage
    },
    AccountLoginPage: {
        screen: AccountLoginPage
    },
    MineProfilePage: {
        screen: MineProfilePage
    },
    MineChangePasswordPage: {
        screen: MineChangePasswordPage
    },
    MineChangeNamePage: {
        screen: MineChangeNamePage
    },
    AboutPage: {
        screen: AboutPage
    },
    MineRecommendMeetPage: {
        screen: MineRecommendMeetPage
    },
    MineEmailPage: {
        screen: MineEmailPage
    },
    CountrySelectPage: {
        screen: CountrySelectPage
    },
    LanguageSettingPage: {
        screen: LanguageSettingPage
    },
    PushTestXGPage: {
        screen: PushTestXGPage
    },
    VerificationTestPage: {
        screen: VerificationTestPage
    },
    QRScanLocalTestPage: {
        screen: QRScanLocalTestPage
    },
    UMShareAuthTestPage: {
        screen: UMShareAuthTestPage
    },
    UMShareShareTestPage: {
        screen: UMShareShareTestPage
    },
    NotificationPage: {
        screen: NotificationPage
    },
    NewsDetailPage: {
        screen: NewsDetailPage
    },
    NewsDetailWebPage: {
        screen: NewsDetailWebPage
    },
    NewsSharePage: {
        screen: NewsSharePage
    },
    ETHWalletNameEditPage: {
        screen: ETHWalletNameEditPage
    },
    ETHWalletBackupKeystorePage: {
        screen: ETHWalletBackupKeystorePage
    },
    ETHWalletBackupPrivateKeyPage: {
        screen: ETHWalletBackupPrivateKeyPage
    },
    DebugPage: {
        screen: DebugPage
    },
    PushNotificationSettingPage: {
        screen: PushNotificationSettingPage
    },
    ETHTransactionDetailPage: {
        screen: ETHTransactionDetailPage
    },
    // Discovery module
    CandyPage: {
        screen: CandyPage
    },
    CandyDetailPage: {
        screen: CandyDetailPage
    },

    GameCenterView: {
        screen: GameCenterView
    },
    GameCenterSearchResult: {
        screen: GameCenterSearchResult
    },

    RAMExchangePage: {
        screen: RAMExchangePage
    },

    EOSAccountRegisterPage: {
        screen: EOSAccountRegisterPage
    },

    EOSAccountRegisterResultPage: {
        screen: EOSAccountRegisterResultPage
    },

    EOSGeneratorPage: {
        screen: EOSGeneratorPage
    },

    //eos pomelo
    EOSWalletImportPage: { screen: EOSWalletImportPage },
    EOSImportAccountSelectPage: { screen: EOSImportAccountSelectPage },
    EOSVotePage: { screen: EOSVotePage },
    EOSNodeListPage: { screen: EOSNodeListPage },
    EOSChangeNodeConnectionPage: { screen: EOSChangeNodeConnectionPage },

    EOSNodeVoteProxyPage: { screen: EOSNodeVoteProxyPage },
    EOSNodeDetailPage: { screen: EOSNodeDetailPage },
    EOSNodeVoteComfirmPage: { screen: EOSNodeVoteComfirmPage },

    EOSNetWorkChangePage: { screen: EOSNetWorkChangePage },

    // EOSDelegatebwPage: { screen: EOSDelegatebwPage },
    // EOSUnDelegatebwPage: { screen: EOSUnDelegatebwPage },
    EOSResourcesPage: {
        screen: EOSResourcesPage
    },
    EOSCustomDelegatePage: { screen: EOSCustomDelegatePage },

    EOSAuthorationPage: { screen: EOSAuthorationPage },
    EOSWalletInfoPage: { screen: EOSWalletInfoPage },
    EOSWalletBackupPrivateKeyPage: { screen: EOSWalletBackupPrivateKeyPage },
    // eos transfer
    EOSTransferSelectPage: { screen: EOSTransferSelectPage },
    EOSTransferPage: { screen: EOSTransferPage },
    EOSQRCodePage: { screen: EOSQRCodePage },
    EOSTransferResultPage: { screen: EOSTransferResultPage },
    EOSQRScanPage: { screen: EOSQRScanPage },
    TransactionHistory: { screen: TransactionHistory },
    EOSTransactionDetailPage: { screen: EOSTransactionDetailPage },
    EOSCreateWalletPage: { screen: EOSCreateWalletPage },
    EOSAccountRegisterIndexPage: { screen: EOSAccountRegisterIndexPage },
    EOSAccountRegisterFreshmanPage: { screen: EOSAccountRegisterFreshmanPage },
    EOSAccountRegisterOldmanPage: { screen: EOSAccountRegisterOldmanPage },
    RegisterAccountByContract: { screen: RegisterAccountByContract },
    RegisterAccountByContractResult: { screen: RegisterAccountByContractResult },

    EOSTokenSettingPage: { screen: EOSTokenSettingPage },
    EOSTokenDetailPage: { screen: EOSTokenDetailPage },
    EOSTokenInfoPage: { screen: EOSTokenInfoPage },

    EOSAccountInfoPage: { screen: EOSAccountInfoPage },
    EOSAuthManagePage: { screen: EOSAuthManagePage },
    EOSAuthKeyChangePage: { screen: EOSAuthKeyChangePage },
    ApplicationSecureSettingPage : {screen: ApplicationSecureSettingPage},
    ApplicationSecurePasswordPage : {screen: ApplicationSecurePasswordPage},
    EOSBrowserPage: { screen: EOSBrowserPage },
    EOSBrowserSearchResultPage: { screen: EOSBrowserSearchResultPage },

    EOSChainChangePage: { screen: EOSChainChangePage },
    SideChainRamExchangePage: { screen: SideChainRamExchangePage },

    BOSFastImportPage: { screen: BOSFastImportPage }
};


const stackNavigatorConfiguration = {
    headerMode: 'screen',
    initialRouteName: 'mainPage',
    initialRouteParams: {},
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#fafafa',
            borderBottomWidth: 0,
            elevation: 0,
        },
        headerTitleStyle: {
            color: '#323232',
            fontSize: 19,
            fontWeight: 'bold'
        },
        headerTintColor: '#323232',
        headerBackTitle: null
    }
};

const RootNavigator = StackNavigator( routeConfiguration, stackNavigatorConfiguration );

// const AppWithNavigationState = ( { dispatch, nav } ) => (
//     <FDMallNavigator navigation={addNavigationHelpers( { dispatch, state: nav } )}/>
// );

// class AppWithNavigationState extends React.Component {
//     constructor( props ) {
//         super( props );

//         this._onBack = this.onBack.bind( this );
//     }

//     static shouldCloseApp( nav ) {
//         return nav.index === 0;
//     }

//     componentWillMount() {
//         BackHandler.addEventListener( 'backPress', this._onBack )
//     }

//     componentDidMount() {
//         // BackHandler.removeEventListener( 'backPress', this._onBack )
//     }

//     onBack() {
//         const { dispatch, nav } = this.props;
//         if ( AppWithNavigationState.shouldCloseApp( nav ) ) {
//             return false;
//         }

//         dispatch( {
//             type: 'Navigation/BACK'
//         } );

//         return true;
//     }

//     //noinspection JSMethodCanBeStatic
//     componentWillUnmount() {
//         BackHandler.removeEventListener( 'backPress' )
//     }

//     render() {
//         return (
//             <AppNavigator navigation={addNavigationHelpers( {
//                 dispatch: this.props.dispatch,
//                 state: this.props.nav,
//                 addListener: addListener
//             } )}/>
//         );
//     }
// }

// AppWithNavigationState.propTypes = {
//     dispatch: PropTypes.func,
//     nav: PropTypes.object,
// };

const navMiddleware = createReactNavigationReduxMiddleware(
    "root",
    state => state.nav,
);

const AppWithNavigationState = reduxifyNavigator( RootNavigator, 'root' );

const mapStateToProps = state => ({
    state: state.nav,
});

const AppNavigator = connect( mapStateToProps )( AppWithNavigationState );

export { RootNavigator, AppNavigator, navMiddleware };


