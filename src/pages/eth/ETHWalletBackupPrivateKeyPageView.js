import React, { Component } from 'react';
import { Clipboard, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import Toast from "react-native-root-toast";
import constStyles from "../../styles/constStyles";
import LinearGradient from 'react-native-linear-gradient';

const { HDNode, providers, utils, Wallet } = ethers;

class ETHWalletBackupPrivateKeyPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.backup_private_key_title ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isShowNoScreenTip: true
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
                                marginTop: 100
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


                    <LinearGradient colors={[ '#ffffff', '#c7eae6' ]} style={[ {
                        height: 80,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    } ]}>

                    </LinearGradient>
                </View>
                :
                null
        );
    }

    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.paddingCommon ]}>
                    <View style={[ commonStyles.wrapper ]}>
                        <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold' } ]}>
                            {
                                I18n.t( Keys.backup_private_key_tip_1 )
                            }
                        </Text>

                        <Text style={[ { fontSize: 14, marginTop: 5 }, commonStyles.commonTextColorStyle ]}>
                            {
                                I18n.t( Keys.backup_private_key_tip_2 )
                            }
                        </Text>

                        <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold', marginTop: 15 } ]}>
                            {
                                I18n.t( Keys.backup_private_key_tip_3 )
                            }
                        </Text>

                        <Text style={[ { fontSize: 14, marginTop: 5 }, commonStyles.commonTextColorStyle ]}>
                            {
                                I18n.t( Keys.backup_private_key_tip_4 )
                            }
                        </Text>

                        <Text style={[ {
                            paddingLeft: 15,
                            paddingRight: 15,
                            paddingTop: 15,
                            paddingBottom: 15,
                            fontSize: 20,
                            backgroundColor: 'white',
                            marginTop: 30
                        }, commonStyles.commonTextColorStyle ]}>
                            {this.props.privateKey}
                        </Text>

                        <Button
                            containerStyle={[ { marginTop: 20 } ]}
                            style={[ commonStyles.top_info_right_btn, { color: constStyles.THEME_COLOR, } ]}
                            title=''
                            onPress={() => {
                                Clipboard.setString( this.props.privateKey );
                                Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                            }}
                        >
                            {I18n.t( Keys.copy )}
                        </Button>
                    </View>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginTop: 30,
                                marginBottom: 20,
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            const { navigate, goBack, state } = this.props.navigation;
                            goBack();
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.finish_operation )}
                    </Button>

                    {this.renderNoScreenTipView()}

                </View>
            </SafeAreaView>
        );
    }
}

export default ETHWalletBackupPrivateKeyPageView;