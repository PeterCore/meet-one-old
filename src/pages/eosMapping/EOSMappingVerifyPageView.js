import React, { Component } from 'react';
import { Image, InteractionManager, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import ethers from "ethers";
import Hyperlink from "react-native-hyperlink";
import * as env from "../../env";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;

class EOSMappingVerifyPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_mapping_verify_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            transaction: null,
            transactionReceipt: null,
            isRequesting: false
        }
    }


    componentWillMount() {
        this.setState( {
            isRequesting: true
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onGetTransaction( this.props.transactionHash, ( error, resBody ) => {
                if ( !error ) {
                    this.setState( {
                        isRequesting: false,
                        transaction: resBody.transaction,
                        transactionReceipt: resBody.transactionReceipt
                    } );
                } else {
                    this.setState( {
                        isRequesting: false
                    } );
                }
            } );
        } );
    }


    render() {
        if ( !this.state.transaction && !this.state.transactionReceipt ) {
            return <View/>
        }


        const link = env.tx_explorer + this.state.transaction.hash;

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.paddingCommon, commonStyles.commonBG ]}>

                    <View style={[ { marginTop: 40, flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                {I18n.t( Keys.eth_address_for_mapping )}
                            </Text>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 10
                            } ]}>
                                {utils.getAddress( this.props.account.jsonWallet.address )}
                            </Text>
                        </View>
                    </View>


                    <View style={[ { marginTop: 40, flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                {I18n.t( Keys.eos_public_key_for_return )}
                            </Text>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonSubTextColorStyle, {
                                marginRight: 20,
                                marginTop: 10
                            } ]}>
                                {this.props.eosWallet.publicKey}
                            </Text>
                        </View>
                    </View>

                    <View style={[ { marginTop: 40, flexDirection: 'row' } ]}>
                        <Image
                            source={require( '../../imgs/all_icon_selected.png' )}
                            style={[ {
                                width: 22,
                                height: 22,
                            } ]}
                        />
                        <View style={[ { marginLeft: 10 } ]}>
                            <Text style={[ { fontSize: 18 }, commonStyles.commonTextColorStyle ]}>
                                {I18n.t( Keys.verify_success )}
                            </Text>

                            <Hyperlink
                                style={[ {
                                    marginRight: 20,
                                    marginTop: 6
                                }
                                ]}
                                linkStyle={[ {
                                    fontSize: 14
                                }, commonStyles.commonSubTextColorStyle ]}
                                linkText={url => url === link
                                    ? I18n.t( Keys.progress_link )
                                    : url}
                                onPress={( url ) => {
                                    this.props.navigation.navigate( 'WebViewPage',
                                        {
                                            url: url,
                                            webTitle: I18n.t( Keys.view_progress )

                                        } )
                                }}>
                                <Text
                                    style={[ {
                                        fontSize: 14
                                    }, commonStyles.commonSubTextColorStyle
                                    ]}>
                                    {
                                        I18n.t( Keys.view_progress_1 ) + link
                                    }
                                </Text>
                            </Hyperlink>
                        </View>
                    </View>

                    <View style={[ commonStyles.wrapper ]}/>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            const { navigate, goBack, state } = this.props.navigation;
                            goBack()
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.finish_operation )}
                    </Button>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default EOSMappingVerifyPageView;