import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LinearGradient from 'react-native-linear-gradient';

class ETHWalletSeedPhrasePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.wallet_seed_phrase_show_title ),
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            isShowNoScreenTip: true,
        }
    }

    close() {
        const { navigate, goBack, state } = this.props.navigation;
        if ( state.params && state.params.callback ) {
            state.params.callback( this.props.account );
        } else {
            goBack();
        }
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
                        }, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.wallet_seed_phrase_tip_1 )}</Text>

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
        const { navigate, goBack, state } = this.props.navigation;

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.paddingCommon ]}>
                    <View style={[ {
                        height: 103,
                        backgroundColor: '#F5F5F5',
                        marginTop: 10,
                        borderRadius: 5
                    }, commonStyles.pdt_normal, commonStyles.pdl_normal, commonStyles.pdr_normal ]}>
                        <Text style={[ {
                            fontSize: 18,
                        }, commonStyles.commonTextColorStyle ]}>{this.props.seedPhrase}</Text>
                    </View>

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
                            this.close()
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.close )}
                    </Button>

                    {this.renderNoScreenTipView()}

                </View>
            </SafeAreaView>
        );
    }
}

export default ETHWalletSeedPhrasePageView;