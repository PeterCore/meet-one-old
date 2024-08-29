/*
 * EOS账户注册 - 新人页面View
 * 生成公私钥对
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:01:12
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-10-17 09:32:19
 */

import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView, Alert, Clipboard, Image } from "react-native";
import Toast from "react-native-root-toast";
import Button from "react-native-button";
import { NavigationActions, SafeAreaView } from "react-navigation";

import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";

import AnalyticsUtil from "../../../../util/AnalyticsUtil";

export default class EOSAccountRegisterFreshmanPageView extends React.Component {
    static navigationOptions = (props) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        const title = (params && params.title) ? params.title : I18n.t( Keys.generate_keys );
        return {
            title
        }
    }

    constructor (props) {
        super(props);
        this.state = {
            privateKey: '',
            publicKey: '',
            // 提示不要截图
            isShowNoScreenTip: true,
        };
    }

    componentWillMount() {}

    componentDidMount() {
        AnalyticsUtil.onEvent('CTnewkeypair');
        this.props.onGenerateKey((error, data) => {
            if (!error) {
                const {privateKey, publicKey} = data;
                this.setState({
                    privateKey,
                    publicKey
                })
            } else {
                Toast.show(I18n.t(Keys.operate_failed), {position: Toast.positions.CENTER});
            }
        });
    }

    renderNoScreenTipView() {
        return (
            this.state.isShowNoScreenTip ?
                <View style={[ commonStyles.wrapper, {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    // height: Dimensions.get('window').height
                }, commonStyles.justAlignCenter ]}>
                    <Image
                        source={require( '../../../../imgs/wallet_icon_noscreenshot.png' )}
                        style={[ {
                            width: 55,
                            height: 55,
                        } ]}
                    />
                    <Text style={[ {
                        fontSize: 24,
                        color: '#F65858',
                        marginTop: 12
                    } ]}>{I18n.t( Keys.do_not_take_screenshots )}</Text>
                    <Text
                        style={[ {
                            fontSize: 16,
                            width: 245,
                            marginTop: 15
                        }, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.eth_private_key_tip_1 )}</Text>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                width: 135,
                                marginTop: 100,
                                backgroundColor: '#4a4a4a',
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.setState( {
                                isShowNoScreenTip: false
                            } );
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.i_know )}
                    </Button>



                </View>
                :
                null
        );
    }


    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                {backgroundColor: '#fff'}]}>
                <ScrollView style={[
                    this.state.isShowNoScreenTip ? { display: 'none' } : {},
                    commonStyles.wrapper ]}>

                    {/* private key here */}
                    <Text style={[styles.tipsRed, {marginBottom: 10}]}>{I18n.t( Keys.new_account_attention2 )}</Text>
                    <View style={[styles.keyWrapper, styles.mgl]}>
                        <Text style={styles.key}>{I18n.t( Keys.new_account_private_key )}</Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                Clipboard.setString(this.state.privateKey);
                                Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                            }}>
                            <Text style={styles.copy}>{I18n.t( Keys.copy )}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[{ backgroundColor: '#FFEAEA', padding: 20, marginBottom: 30 }, styles.mgl]}>
                        <Text style={[{
                            fontSize: 18,
                            color: '#323232',
                            letterSpacing: 1.8
                        }, commonStyles.monospace]}>
                            {this.state.privateKey}
                        </Text>
                    </View>

                    {/* divider line here */}
                    <View style={{
                        height: 10,
                        width: Dimensions.get( 'window' ).width,
                        backgroundColor: '#F8F9FA'}}>
                    </View>

                    <Text style={styles.tips}>{I18n.t( Keys.new_account_attention )}</Text>
                    {/* public key here */}
                    <View style={[styles.keyWrapper, styles.mgl]}>
                        <Text style={styles.key} >{I18n.t( Keys.new_account_public_key )}</Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                Clipboard.setString(this.state.publicKey);
                                Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                            }}>
                            <Text style={styles.copy}>{I18n.t( Keys.copy )}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[{backgroundColor: '#EAFFF1', padding: 20}, styles.mgl]}>
                        <Text style={[{
                            fontSize: 18,
                            color: '#323232',
                            letterSpacing: 1.8
                        }, commonStyles.monospace]}>
                            {this.state.publicKey}
                        </Text>
                    </View>


                    {/* tips here */}
                    <View style={[{ marginTop: 20, paddingBottom: 120 }, styles.mgl]}>
                        <Text style={styles.tips2_title}>{I18n.t( Keys.offline_save )}</Text>
                        <Text style={styles.tips2_subtitle}>{I18n.t( Keys.offline_save_info )}</Text>
                        <Text style={styles.tips2_title}>{I18n.t( Keys.do_not_use_net )}</Text>
                        <Text style={styles.tips2_subtitle}>{I18n.t( Keys.do_not_use_net_info )}</Text>
                    </View>
                </ScrollView>

                <Button
                    containerStyle={[
                        commonStyles.buttonContainerStyle,
                        {
                            position: 'absolute',
                            width: Dimensions.get( 'window' ).width - 30,
                            bottom: 30,
                            height: 44,
                            marginTop: 40,
                            // marginBottom: 40,
                            backgroundColor: '#4A4A4A'
                        },
                        styles.mgl,
                        this.state.isShowNoScreenTip ? {display: 'none'} : {}
                    ]}
                    style={[ commonStyles.buttonContentStyle ]}
                    styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                    onPress={() => {
                        Alert.alert(
                            I18n.t(Keys.make_sure_again),
                            I18n.t(Keys.make_sure_again_for_eos_private_key),
                            [
                                {text: I18n.t(Keys.good_saved), onPress: () => {
                                    this.props.navigation.dispatch( NavigationActions.back() );
                                }},
                                {text: I18n.t(Keys.check_again), onPress: () => {
                                    // 未处理的逻辑
                                }}
                            ]
                        )
                    }}
                    title={null}>
                    {I18n.t( Keys.confirm )}
                </Button>

                {/* 不要截图说明 */}
                {this.renderNoScreenTipView()}
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    tips: {
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: 'center',
        fontSize: 14,
        color: '#323232'
    },
    tipsRed: {
        marginVertical: 20,
        alignSelf: 'center',
        color: '#F75B5B'
    },
    keyWrapper: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    key: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#323232',
    },
    copy: {
        color: constStyles.THEME_COLOR,
        fontSize: 16
    },
    tips2_title: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
        marginBottom: 5,
        lineHeight: 21
    },
    tips2_subtitle: {
        fontSize: 14,
        color: '#484848',
        marginBottom: 5,
        lineHeight: 21
    },
    // 水平的分割线
    horizontalLine: {
        marginTop: 5,
        height: 1,
        backgroundColor: '#ccc',
    },
    mgl: {
        marginLeft: 15,
        marginRight: 15
    },
});
