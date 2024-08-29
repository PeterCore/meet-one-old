import React, { Component } from 'react';
import { Alert, Image, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import constStyles from "../../styles/constStyles";
import LinearGradient from 'react-native-linear-gradient';
import WalletSelectComponent from "../wallet/components/WalletSelectComponent";
import ethers from "ethers";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;


class EOSMappingGeneratePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_mapping_title ),
        };
    };

    constructor( props ) {
        super( props );

        const { navigate, goBack, state } = props.navigation;

        this.state = {
            eosWallet: state.params.eosWallet,
            isRequesting: false,
            isShowNoScreenTip: true,
            isOpenAccountSelect: false
        }
    }

    reload() {
        this.props.onGenerateEOSWallet( ( error, resBody ) => {

            if ( error ) {
                Toast.show( error.message, { position: Toast.positions.CENTER } );
            } else {
                this.setState( {
                    eosWallet: resBody
                } );
            }
        } );
    }

    next() {
        Alert.alert(
            I18n.t( Keys.make_sure_again ),
            I18n.t( Keys.make_sure_again_for_eos_private_key ),
            [
                {
                    text: I18n.t( Keys.check_again ),
                    onPress: () => {

                    },
                },
                {
                    text: I18n.t( Keys.good_saved ),
                    onPress: () => {
                        if ( this.props.accounts.length > 0 ) {
                            if ( this.props.accounts.length === 1 ) {
                                this.props.navigation.navigate( 'EOSMappingSubmitPage', {
                                    address: utils.getAddress( this.props.account.jsonWallet.address ),
                                    eosWallet: this.state.eosWallet
                                } );
                            } else {
                                this.setState( {
                                    isOpenAccountSelect: true
                                } );
                            }
                        } else {
                            this.props.navigation.navigate( 'ETHImportPage',
                                {
                                    callback: ( account ) => {
                                        const { navigate, goBack, state } = this.props.navigation;

                                        this.props.navigation.navigate( 'EOSMappingSubmitPage', {
                                            address: utils.getAddress( account.jsonWallet.address ),
                                            eosWallet: this.state.eosWallet
                                        } );
                                    }
                                } );
                        }
                    },
                    style: 'cancel'
                },
            ],
            { cancelable: true }
        )


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
                        }, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.eos_private_key_tip_1 )}</Text>

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

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <ScrollView>
                        <View style={[ commonStyles.wrapper, commonStyles.paddingCommon ]}>
                            <Text
                                style={[
                                    { fontSize: 18, },
                                    commonStyles.commonTextColorStyle,
                                ]}>
                                {
                                    I18n.t( Keys.eos_public_key )
                                }
                            </Text>
                            <View style={[ {
                                height: 103,
                                backgroundColor: '#F5F5F5',
                                marginTop: 10,
                                borderRadius: 5
                            }, commonStyles.pdt_normal, commonStyles.pdl_normal, commonStyles.pdr_normal ]}>
                                <Text
                                    style={[
                                        commonStyles.commonTextColorStyle,
                                        {
                                            fontSize: 18
                                        },
                                        { fontFamily: 'Menlo' }
                                    ]}>
                                    {
                                        this.state.eosWallet.publicKey
                                    }
                                </Text>
                            </View>
                            <Text style={[
                                {
                                    fontSize: 18,
                                    color: '#FF6D7E',
                                    marginTop: 20
                                }
                            ]}>
                                {I18n.t( Keys.eos_private_key )}
                            </Text>
                            <View style={[ {
                                height: 103,
                                backgroundColor: '#FFEFEF',
                                marginTop: 10,
                                borderRadius: 5
                            }, commonStyles.pdt_normal, commonStyles.pdl_normal, commonStyles.pdr_normal ]}>
                                <Text
                                    style={[
                                        commonStyles.commonTextColorStyle,
                                        {
                                            fontSize: 18
                                        },
                                        { fontFamily: 'Menlo' }
                                    ]}>
                                    {
                                        this.state.eosWallet.privateKey
                                    }
                                </Text>
                            </View>

                            <View style={[ { marginTop: 30 }, commonStyles.justAlignCenter, ]}>
                                <TouchableHighlight
                                    underlayColor='#ddd'
                                    onPress={() => {
                                        this.reload();
                                    }}
                                    style={[ { width: 90, height: 44 } ]}>
                                    <View
                                        style={[ {
                                            flexDirection: 'row',
                                            paddingTop: 13
                                        }, commonStyles.justAlignCenter ]}>
                                        <Image
                                            source={require( '../../imgs/all_icon_refresh.png' )}
                                            style={[ {
                                                width: 18,
                                                height: 18,
                                            } ]}
                                        />
                                        <Text style={[ {
                                            fontSize: 16,
                                            color: constStyles.THEME_COLOR
                                        } ]}>{I18n.t( Keys.create_again )}</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <Text style={[ {
                                fontSize: 16,
                                marginTop: 30
                            }, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.eos_key_save_tip_2 )}</Text>
                            <Text style={[ {
                                fontSize: 14,
                                marginTop: 10
                            }, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.eos_key_save_tip_3 )}</Text>
                            <Text style={[ {
                                fontSize: 14,
                                color: '#FF6D7E'
                            } ]}>{I18n.t( Keys.eos_key_save_tip_4 )}</Text>

                            <Button
                                containerStyle={[
                                    commonStyles.buttonContainerStyle, {
                                        height: 44,
                                        marginTop: 30
                                    }
                                ]}
                                style={[ commonStyles.buttonContentStyle ]}
                                styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                                onPress={() => {
                                    this.next();
                                }}
                                title={null}
                                disabled={false}>
                                {I18n.t( Keys.next_step )}
                            </Button>


                        </View>
                    </ScrollView>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                    {this.renderNoScreenTipView()}

                    <WalletSelectComponent
                        navigation={this.props.navigation}
                        isOpen={this.state.isOpenAccountSelect}
                        isSupportImport={true}
                        isSupportEOS={false}
                        isSupportETH={true}
                        defaultPrimaryKey={this.props.account ? this.props.account.primaryKey : 0}
                        onResult={( item ) => {
                            this.props.navigation.navigate( 'EOSMappingSubmitPage', {
                                address: utils.getAddress( item.jsonWallet.address ),
                                eosWallet: this.state.eosWallet
                            } );
                        }}
                        onImportWallet={( walletType ) => {
                            if ( walletType === 'ETH' ) {
                                this.props.navigation.navigate( 'ETHImportPage',
                                    {
                                        callback: ( account ) => {
                                            const { navigate, goBack, state } = this.props.navigation;

                                            this.props.navigation.navigate( 'EOSMappingSubmitPage', {
                                                address: utils.getAddress( account.jsonWallet.address ),
                                                eosWallet: this.state.eosWallet
                                            } );
                                        }
                                    } );
                            } else {
                            }
                        }}
                        onClose={() => {
                            this.setState( {
                                isOpenAccountSelect: false
                            } );
                        }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

export default EOSMappingGeneratePageView;
