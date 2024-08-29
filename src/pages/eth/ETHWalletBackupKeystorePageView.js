import React, { Component } from 'react';
import { Clipboard, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import Toast from "react-native-root-toast";
import constStyles from "../../styles/constStyles";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHWalletBackupKeystorePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.backup_keystore ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {};
    }


    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.paddingCommon ]}>
                    <ScrollView style={[ commonStyles.wrapper ]}>
                        <View>
                            <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold' } ]}>
                                {
                                    I18n.t( Keys.save_offline )
                                }
                            </Text>

                            <Text style={[ { fontSize: 14, marginTop: 5 }, commonStyles.commonTextColorStyle ]}>
                                {
                                    I18n.t( Keys.save_keystore_tip_1 )
                                }
                            </Text>

                            <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold', marginTop: 15 } ]}>
                                {
                                    I18n.t( Keys.save_keystore_tip_2 )
                                }
                            </Text>

                            <Text style={[ { fontSize: 14, marginTop: 5 }, commonStyles.commonTextColorStyle ]}>
                                {
                                    I18n.t( Keys.save_keystore_tip_3 )
                                }
                            </Text>

                            <Text style={[ { color: 'red', fontSize: 16, fontWeight: 'bold', marginTop: 15 } ]}>
                                {
                                    I18n.t( Keys.save_keystore_tip_4 )
                                }
                            </Text>

                            <Text style={[ { fontSize: 14, marginTop: 5 }, commonStyles.commonTextColorStyle ]}>
                                {
                                    I18n.t( Keys.save_keystore_tip_5 )
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
                                {this.props.keystore}
                            </Text>

                            <Button
                                containerStyle={[ { marginTop: 20 } ]}
                                style={[ commonStyles.top_info_right_btn, { color: constStyles.THEME_COLOR, } ]}
                                title=''
                                onPress={() => {
                                    Clipboard.setString( this.props.keystore );
                                    Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                                }}
                            >
                                {I18n.t( Keys.copy )}
                            </Button>
                        </View>
                    </ScrollView>
                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginTop: 30,
                                marginBottom: 20
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

                </View>
            </SafeAreaView>
        );
    }
}

export default ETHWalletBackupKeystorePageView;