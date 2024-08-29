import React, { Component } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import TextUtil from "../../util/TextUtil";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHWalletNameEditPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.wallet_name_change_title ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            name: this.props.account.name
        };
    }

    isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.name )
    }


    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                    <Text style={[ commonStyles.commonSubTextColorStyle, {
                        fontSize: 14,
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 20
                    } ]}>
                        {
                            I18n.t( Keys.wallet_name )
                        }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>
                    <TextInput
                        style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                        underlineColorAndroid={'transparent'}
                        onChangeText={( text ) => {
                            this.setState( {
                                name: text
                            } );
                        }}
                        placeholder={I18n.t( Keys.wallet_name )}
                        defaultValue={this.state.name}
                        maxLength={40}
                    />
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>


                    <Button
                        containerStyle={[
                            this.isNextButtonDisabled() ? commonStyles.buttonContainerDisabledStyle : commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginTop: 30,
                                marginLeft: 15,
                                marginRight: 15,
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.props.onUpdateAccountName(
                                this.props.account.jsonWallet,
                                this.state.name,
                                () => {
                                }
                            );

                            const { navigate, goBack, state } = this.props.navigation;
                            goBack();
                        }}
                        title={null}
                        disabled={this.isNextButtonDisabled()}>
                        {I18n.t( Keys.finish_operation )}
                    </Button>


                </View>
            </SafeAreaView>
        );
    }
}

export default ETHWalletNameEditPageView;