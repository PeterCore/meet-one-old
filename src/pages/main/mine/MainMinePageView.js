import React, { Component } from 'react';
import { Alert, Image, InteractionManager, ScrollView, StatusBar, Text, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import constStyles from "../../../styles/constStyles";
import * as env from "../../../env";
import Toast from "react-native-root-toast";
import format from "string-format";
import NavigationUtil from '../../../util/NavigationUtil';
import RNExitApp from 'react-native-exit-app';
import AnalyticsUtil from '../../../util/AnalyticsUtil';

var DeviceInfo = require( 'react-native-device-info' );

class MainMinePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.main_tab_mine ),
            tabBarIcon: ( { focused, tintColor } ) => (
                focused ?
                    <Image
                        source={require( '../../../imgs/tabbar_btn_me_active.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
                    :
                    <Image
                        source={require( '../../../imgs/tabbar_btn_me.png' )}
                        style={[ { width: 34, height: 34 } ]}
                    />
            ),
        };
    };

    constructor( props ) {
        super( props );
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('OTminepage');
    }

    onShareMeet() {
        this.props.onTapRecommendToUser()
    }

    _onUpdate( err, resBody ) {
        if ( err ) {
            if ( err.message ) {
                Toast.show( err.message, { position: Toast.positions.CENTER } )
            } else {
                Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } )
            }
        } else {
            if ( (DeviceInfo.getVersion() < this.props.versionInfo.version) ) {
                Alert.alert(
                    this.props.versionInfo.title,
                    this.props.versionInfo.notes,
                    this.props.versionInfo.type === 1 ?
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    NavigationUtil.openBrowser( { url: this.props.versionInfo.download_url } )
                                    // 强制退出APP
                                    // https://github.com/wumke/react-native-exit-app
                                    setTimeout( () => {
                                        RNExitApp.exitApp();
                                    }, 1000 );
                                }
                            }
                        ] :
                        [
                            { text: I18n.t( Keys.ask_me_later ), onPress: () => console.log( 'Ask me later pressed' ) },
                            {
                                text: I18n.t( Keys.update_now ),
                                onPress: () => NavigationUtil.openBrowser( { url: this.props.versionInfo.download_url } )
                            }
                        ]
                )
            } else {
                Toast.show( I18n.t( Keys.is_newest_version ), { position: Toast.positions.CENTER } )
            }
        }
    }

    _onTapCheckUpdate() {
        InteractionManager.runAfterInteractions( () => {
            this.props.checkUpdate( ( err, resBody ) => {
                this._onUpdate( err, resBody );
            } )
        } );
    }

    reanderHeader() {
        return (
            <View style={[ { height: constStyles.ACTION_BAR_HEIGHT }, commonStyles.justAlignCenter ]}>
                <Text style={[ {
                    color: '#323232',
                    fontSize: 19,
                    fontWeight: 'bold'
                } ]}>{I18n.t( Keys.main_tab_mine )}</Text>
            </View>
        );
    }

    render() {

        return (
            <View style={[ commonStyles.wrapper, commonStyles.commonBG, {
                paddingTop: (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0)
            }  ]}>
                <StatusBar backgroundColor={'#3e9ce9'}/>

                {
                    this.reanderHeader()
                }

            <ScrollView style={[ commonStyles.wrapper ]}>
            <View style={[ { marginBottom: 20 } ]}>
            {/*
            //第一个版本不要登录了
            {
                this._renderLoginView()
            } */}

            <TouchableItemComponent
                containerStyle={[ {} ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.net_type_selection )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_changenet.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapSelectNet();
                }}
                headerInterval={true}
                footerInterval={false}/>

            <TouchableItemComponent
                containerStyle={[ {} ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.eos_node_selection )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_nodes.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapSelectNode();
                }}
                headerIntervalStyle={[ commonStyles.mgl_normal ]}
                headerInterval={true}
                footerInterval={false}/>


            <TouchableItemComponent
                containerStyle={[ { backgroundColor: '#FAFAFA' } ]}
                style={[ styles.itemHeight, this.props.walletAccount ? null : { display: 'none' } ]}
                title={I18n.t( Keys.transaction_history )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_history.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapTransactionHistory();
                }}
                headerIntervalStyle={[ commonStyles.mgl_normal ]}
                headerInterval={true}
                footerInterval={false}/>

            <TouchableItemComponent
                containerStyle={[ {} ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.manager_wallet )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_wallet.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapManagerWallet();
                }}
                headerIntervalStyle={[ commonStyles.mgl_normal ]}
                headerInterval={true}
                footerInterval={true}/>

            <TouchableItemComponent
                containerStyle={[ { backgroundColor: '#FAFAFA', marginTop: 10 } ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.recommend_to_friends )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_recommend.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.onShareMeet();
                }}
                headerInterval={true}
                footerInterval={true}/>

            <TouchableItemComponent
                containerStyle={[ { backgroundColor: '#FAFAFA', marginTop: 10 } ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.language_setting_title )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_language.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapLanguageSelect();
                }}
                headerInterval={true}
                footerInterval={false}/>

            {/* 应用安全 */}
            <TouchableItemComponent
                containerStyle={[ { backgroundColor: '#FAFAFA'} ]}
                style={[ styles.itemHeight ]}
                title={I18n.t(Keys.application_lock)}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_safety.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapApplicationSecure();
                }}
                headerIntervalStyle={[ commonStyles.mgl_normal ]}
                headerInterval={true}
                footerInterval={false}/>

            {
                env.IS_STORE ?
                    null
                    :
                    <TouchableItemComponent
                        containerStyle={[ { backgroundColor: '#FAFAFA' } ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.check_update )}
                        leftElement={
                            <Image
                                source={require( '../../../imgs/me_icon_update.png' )}
                                style={[ { width: 22, height: 22, marginRight: 10 } ]}
                            />
                        }
                        onPress={() => {
                            this._onTapCheckUpdate();
                        }}
                        content={DeviceInfo.getVersion() < this.props.versionInfo.version ?
                            format( I18n.t( Keys.have_new_version ), this.props.versionInfo.version )
                            :
                            format( I18n.t( Keys.newest ), DeviceInfo.getVersion() )
                        }
                        headerIntervalStyle={[ commonStyles.mgl_normal ]}
                        headerInterval={true}
                        footerInterval={false}/>
            }



            <TouchableItemComponent
                containerStyle={[ { backgroundColor: '#FAFAFA' } ]}
                style={[ styles.itemHeight ]}
                title={I18n.t( Keys.about_us )}
                leftElement={
                    <Image
                        source={require( '../../../imgs/me_icon_about.png' )}
                        style={[ { width: 22, height: 22, marginRight: 10 } ]}
                    />
                }
                onPress={() => {
                    this.props.onTapAbout();
                }}
                headerIntervalStyle={[ commonStyles.mgl_normal ]}
                headerInterval={true}
                footerInterval={true}/>

            {
                env.IS_DEBUG ?
                    <TouchableItemComponent
                    containerStyle={[ { marginTop: 10 } ]}
                    style={[ styles.itemHeight ]}
                    title={I18n.t( Keys.feedback )}
                    onPress={() => {
                        this.props.onTapFeedback();
                    }}
                    headerInterval={true}
                    footerInterval={true}/>
                    :
                    null
            }
            {
                env.IS_DEBUG ?
                    <TouchableItemComponent
                        containerStyle={[ { marginTop: 10 } ]}
                        style={[ styles.itemHeight ]}
                        title={"Debug"}
                        onPress={() => {
                            this.props.onTapDebug();
                        }}
                        headerInterval={true}
                        footerInterval={true}/>
                    :
                    null
            }

            </View>
            </ScrollView>

            <View
                style={[ commonStyles.commonIntervalStyle ]}/>
        </View>
        );

    }

    _renderLoginView() {
        return (
            this.props.isLoggedIn ? (<TouchableItemComponent
                    containerStyle={[ styles.loginContainer ]}
                    style={[ { height: 96 } ]}
                    leftElement={
                        <View
                        >
                            <Text
                                style={[ commonStyles.commonTextColorStyle,
                                    {
                                        fontSize: 20
                                    } ]}
                            >{!this.props.account.username ? this.props.account.mobile : this.props.account.username}</Text>
                        </View>}
                    onPress={() => {
                        this.props.onTapUserProfile();
                    }}
                    headerInterval={true}
                    footerInterval={true}/>)
                :
                <View
                    style={[ styles.loginContainer ]}
                >
                    <View
                        style={[ styles.loginContentContainer, commonStyles.pdl_normal ]}
                    >
                        <Text
                            style={[ commonStyles.commonTextColorStyle,
                                {
                                    fontSize: 20
                                } ]}
                        >{I18n.t( Keys.not_login_account )}</Text>

                        <View
                            style={[ {
                                flexDirection: 'row'
                            } ]}
                        >

                            <TouchableOpacity
                                style={[ { height: 36, marginRight: 20 }, commonStyles.justAlignCenter ]}
                                onPress={() => {
                                    this.props.onTapLogin();
                                }}
                            >
                                <Text
                                    style={[ {
                                        fontSize: 16,
                                        color: '#1ACE9A',
                                        textAlign: 'center'
                                    } ]}
                                >
                                    {I18n.t( Keys.login )}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    this.props.onTapRegister();
                                }}
                                style={[
                                    styles.loginButton,
                                ]}
                            >
                                <Text
                                    style={[ styles.loginButtonText ]}
                                >
                                    {I18n.t( Keys.register )}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={[ commonStyles.commonBorderBottom ]}
                    >
                    </View>
                </View>
        )
    }
}

const styles = StyleSheet.create( {
    loginContainer: {
        height: 106,
        backgroundColor: '#FAFAFA'
    },
    loginContentContainer: {
        height: 96,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 20
    },
    loginButton: {
        paddingLeft: 16,
        paddingRight: 16,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: constStyles.THEME_COLOR,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    loginButtonText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    },
    itemHeight: {
        height: 64
    }
} );

export default MainMinePageView;


