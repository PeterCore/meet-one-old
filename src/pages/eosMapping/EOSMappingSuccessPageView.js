import React, { Component } from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";

const { HDNode, providers, utils, Wallet } = ethers;

class EOSMappingSuccessPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_mapping_success_title ),
        };
    };

    constructor( props ) {
        super( props );
        const { navigate, goBack, state } = props.navigation;

        this.state = {}
    }

    verify() {
        this.props.navigation.navigate( 'EOSMappingVerifyPage',
            {
                eosWallet: this.props.eosWallet,
                primaryKey: this.props.account.primaryKey,
                transactionHash: this.props.transactionHash
            }
        );
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, {
                    marginTop: 60,
                    marginLeft: 15,
                    marginRight: 15,
                    marginBottom: 20
                }, commonStyles.justAlignCenter ]}>
                    <Image
                        source={require( '../../imgs/wallet_img_success.png' )}
                        style={[ {
                            width: 163,
                            height: 174,
                        } ]}
                    />

                    <Text style={[ { fontSize: 22 }, commonStyles.commonTextColorStyle ]}>提交映射成功</Text>

                    <View style={[ commonStyles.wrapper ]}/>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginLeft: 15,
                                marginRight: 15,
                                width: Dimensions.get( 'window' ).width - 40
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.verify()
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.eos_mapping_verify )}
                    </Button>

                </View>
            </SafeAreaView>
        );
    }
}

export default EOSMappingSuccessPageView;