import React from "react";
import { Dimensions, Platform, StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, View } from "react-native";
import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import IconSet from "../../../../components/IconSet";
import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";
import { NavigationActions, StackActions } from "react-navigation";
import { netEmptyWallet } from '../../../../net/DiscoveryNet';
import { getNetType } from '../../../../actions/ChainAction';

class WalletEmptyView extends React.Component {

    static propTypes = {};

    constructor( props ) {
        super( props );

        this.state = {
            show_contract_register: false,
            show_friend_register: false
        }
    }

    createEOSAccount() {
        this.props.navigation.navigate( 'EOSCreateWalletPage',
            {
                callback: () => {

                    Promise.all( [
                        this.props.navigation.dispatch(
                            StackActions.reset(
                                {
                                    index: 0,
                                    actions: [
                                        NavigationActions.navigate( { routeName: 'mainPage', } ),
                                    ]
                                }
                            )
                        )
                    ] ).then( () => {
                        this.props.navigation.navigate( 'MainETHWallet' )
                    } )
                }
            } );
    }

    importEOSWallet() {
        this.props.navigation.navigate( 'EOSWalletImportPage' );
    }

    _getMainPageConfig() {
        netEmptyWallet((err, res) => {
            if (!err) {
                const resData = JSON.parse(res);
                this.setState({
                    show_contract_register: resData.show_contract_register,
                    show_friend_register: resData.show_friend_register
                });
            }
        });
    }

    componentWillMount() {
        this._getMainPageConfig()
    }

    render() {
        const netType = getNetType();

        return (
            <View style={[ commonStyles.wrapper, { paddingTop: (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0), } ]}>
                <ScrollView>
                    <View style={{ marginLeft: 15, marginRight: 15 }}>

                        <Text style={styles.bigTitle}>
                            { I18n.t( Keys.mainpage_title_1_left ) } { netType } { I18n.t( Keys.mainpage_title_1_right ) }
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                this.importEOSWallet();
                            }}>
                            <ImageBackground
                                source = {require('../../../../imgs/main_page_1.png')}
                                style = {styles.blockWrapper}>
                                <View style={styles.shrink}>
                                    <Text style={[styles.title, { color: '#fff'}]}>{ I18n.t( Keys.mainpage_btn1_title ) }</Text>
                                    <Text style={[styles.subTitle,  { color: '#fff'}]}>{ I18n.t( Keys.mainpage_btn1_subtitle ) }</Text>
                                </View>

                                <View>
                                    <IconSet name="icon-arrow" style={[ styles.iconset, {color: '#ffffff'} ]} />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>

                        {
                            netType == 'BOS' ?
                            <TouchableOpacity
                                style={{
                                    marginTop: 5
                                }}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.props.navigation.navigate( 'BOSFastImportPage' );
                                }}>
                                <ImageBackground
                                    source = {require('../../../../imgs/main_page_6.png')}
                                    style = {styles.blockWrapper}>
                                    <View style={styles.shrink}>
                                        <Text style={[styles.title, { color: '#fff'}]}>{ I18n.t( Keys.bos_fast_import_btn_text1 ) }</Text>
                                        <Text style={[styles.subTitle,  { color: '#fff'}]}>{ I18n.t( Keys.bos_fast_import_btn_text2 ) }</Text>
                                    </View>

                                    <View>
                                        <IconSet name="icon-arrow" style={[ styles.iconset, {color: '#ffffff'} ]} />
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            :
                            null
                        }

                        <Text style={styles.bigTitle}>
                            { I18n.t( Keys.mainpage_title_2_left ) } { netType } { I18n.t( Keys.mainpage_title_2_right ) }
                        </Text>
                        {
                            this.state.show_contract_register
                            ?
                            <TouchableOpacity
                                style={{
                                    marginTop: 5
                                }}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.props.navigation.navigate('RegisterAccountByContract');
                                }}>
                                <ImageBackground
                                    source = {require('../../../../imgs/main_page_2.png')}
                                    style = {styles.blockWrapper}>

                                    <View style={styles.shrink}>
                                        <Text style={styles.title}>{ I18n.t( Keys.mainpage_btn2_title ) }</Text>
                                        <Text style={styles.subTitle}>{ I18n.t( Keys.mainpage_btn2_subtitle ) }</Text>
                                    </View>

                                    <View>
                                        <IconSet name="icon-arrow" style={[ styles.iconset ]} />
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            :
                            null
                        }

                        {
                            this.state.show_friend_register || netType !== 'EOS'
                            ?
                            <TouchableOpacity
                                style={{
                                    marginTop: 5
                                }}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.props.navigation.navigate('EOSAccountRegisterIndexPage');
                                }}>
                                <ImageBackground
                                    source = { this.state.show_contract_register ? require('../../../../imgs/main_page_3.png') : require('../../../../imgs/main_page_2.png') }
                                    style = {styles.blockWrapper}>

                                    <View style={styles.shrink}>
                                        <Text style={styles.title}>{ I18n.t( Keys.mainpage_btn3_title ) }</Text>
                                        <Text style={styles.subTitle}>{ I18n.t( Keys.mainpage_btn3_subtitle ) }</Text>
                                    </View>

                                    <View>
                                        <IconSet name="icon-arrow" style={[ styles.iconset ]} />
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            :
                            null
                        }

                        {
                            netType === 'EOS'
                            ?
                            <TouchableOpacity
                                style={{
                                    marginTop: 5,
                                    marginBottom: 20
                                }}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.createEOSAccount();
                                }}>
                                <ImageBackground
                                source = { this.state.show_contract_register ? this.state.show_friend_register ? require('../../../../imgs/main_page_4.png') : require('../../../../imgs/main_page_3.png') : this.state.show_friend_register ? require('../../../../imgs/main_page_3.png') : require('../../../../imgs/main_page_2.png') }
                                    style = {styles.blockWrapper}>

                                    <View style={styles.shrink}>
                                        <Text style={styles.title}>{ I18n.t( Keys.mainpage_btn4_title ) }</Text>
                                        <Text style={styles.subTitle}>{ I18n.t( Keys.mainpage_btn4_subtitle ) }</Text>
                                    </View>

                                    <View>
                                        <IconSet name="icon-arrow" style={[ styles.iconset ]} />
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            :
                            null
                        }
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const { width } = Dimensions.get( 'window' );

const styles = StyleSheet.create( {
    bigTitle: {
        marginLeft: 5,
        marginTop: 30,
        marginBottom: 20,
        color: '#323232',
        fontSize: 24,
        fontWeight: '600'
    },
    blockWrapper: {
        width: '100%',
        height: (width - 30)/345 * 110,  // 等比缩放
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingHorizontal: 25,
    },
    shrink: {
        flexShrink: 1,
        marginLeft: 25
    },
    title: {
        marginTop: -10,
        fontSize: 20,
        lineHeight: 28,
        color: '#323232'
    },
    subTitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#323232',
        fontWeight: '300'
    },
    iconset: {
        marginRight: 25,
        marginTop: -10,
        fontSize: 18
    }
} );

export default WalletEmptyView;
