/*
 * @Desc: EOS公钥私钥生成器
 * @Author: JohnTrump
 * @Date: 2018-06-27 13:33:22
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-10-15 15:13:59
 */

import React from "react";
import { StyleSheet, View, Text, Clipboard, Image, Alert, ScrollView } from "react-native";
import Toast from "react-native-root-toast";
import Button from "react-native-button";
import { NavigationActions, SafeAreaView } from "react-navigation";
import commonStyles from "../../styles/commonStyles";
import constStyles from "../../styles/constStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";

class EOSGeneratorPageView extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t(Keys.add_a_new_eos_wallet)
        };
    };

    constructor(props) {
        super(props);
        const {publicKey, privateKey} = props.navigation.state.params;

        this.state = {
            // 提示不要截图
            isShowNoScreenTip: true,
            publicKey,
            privateKey
        };
    }

    renderNoScreenTipView() {
        return (
            this.state.isShowNoScreenTip ?
                <View style={[ commonStyles.wrapper, {
                    position: 'absolute', top: 0, bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff'
                }, commonStyles.justAlignCenter ]}>
                    <Image
                        source={require( '../../imgs/wallet_icon_noscreenshot.png' )}
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

    componentDidMount() {}

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <ScrollView style={[commonStyles.wrapper, commonStyles.commonBG, commonStyles.paddingCommon]}>
                    <View>
                        <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold', lineHeight: 30 } ]}>
                            { I18n.t( Keys.backup_private_key_tip_1 ) }
                        </Text>

                        <Text style={[ { fontSize: 14, marginTop: 5, lineHeight: 20 }, commonStyles.commonTextColorStyle ]}>
                            { I18n.t( Keys.backup_private_key_tip_2 ) }
                        </Text>

                        <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold', marginTop: 15, lineHeight: 30 } ]}>
                            { I18n.t( Keys.backup_private_key_tip_3 ) }
                        </Text>

                        <Text style={[ { fontSize: 14, marginTop: 5, lineHeight: 20 }, commonStyles.commonTextColorStyle ]}>
                            { I18n.t( Keys.backup_private_key_tip_4 ) }
                        </Text>
                    </View>

                    <View style={[styles.block, styles.blockPink, {marginTop: 30}]}>
                        <Text style={[styles.blockTitle, {color: '#ff6d7e'}]}>{ I18n.t(Keys.eos_private_key) }</Text>
                        <View>
                            <Text
                                allowFontScaling={false}
                                style={[styles.blockKey, commonStyles.monospace]}>{this.state.privateKey}</Text>
                        </View>
                    </View>

                    <View style={[styles.block]}>
                        <Text style={styles.blockTitle}>{ I18n.t(Keys.eos_public_key) }</Text>
                        <View>
                            <Text
                                allowFontScaling={false}
                                style={[styles.blockKey, commonStyles.monospace]}>{this.state.publicKey}</Text>
                        </View>
                    </View>


                    <Button
                        containerStyle={[ { marginTop: 20 } ]}
                        style={[ { color: constStyles.THEME_COLOR, } ]}
                        title=''
                        onPress={() => {
                            Clipboard.setString(`公钥 Public Key:\n${this.state.publicKey}\n私钥 Private Key:\n${this.state.privateKey}`);
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}>
                        {I18n.t( Keys.copy )}
                    </Button>

                    <View style={{
                        alignSelf: 'flex-start',
                    }}>
                    </View>
                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                backgroundColor: '#4a4a4a',
                                height: 44,
                                width: '100%',
                                marginTop: 60,
                                marginBottom: 60
                            }
                        ]}
                        style={[commonStyles.buttonContentStyle]}
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
                        title={null}
                        disabled={false}>
                        {I18n.t(Keys.finish_operation)}
                    </Button>
                    {/* 不要截图说明 */}
                    {this.renderNoScreenTipView()}
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    block: {
        width: '100%',
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 10,
    },
    blockPink: {
        backgroundColor: '#ffe6e9',
    },
    blockTitle: {
        paddingVertical: 5,
        fontSize: 18
    },
    blockKey: {
        fontSize: 18,
        lineHeight: 22,
        letterSpacing: 1.8
    },
    tip: {
        color: '#999',
        fontSize: 14,
        lineHeight: 20
    }
});

export default EOSGeneratorPageView;
