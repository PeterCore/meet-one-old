import React, { Component } from 'react';
import { Image, InteractionManager, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import ethers from "ethers";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;

class EOSMappingTipPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_mapping_tip_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            isRequesting: false
        }
    }

    componentWillMount() {

    }

    startCreate() {
        this.setState( {
            isRequesting: true
        } );

        InteractionManager.runAfterInteractions( () => {
            this.props.onGenerateEOSWallet( ( error, resBody ) => {
                this.setState( {
                    isRequesting: false
                } );

                if ( error ) {
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                } else {
                    this.props.navigation.navigate( 'EOSMappingGeneratePage',
                        {
                            eosWallet: resBody,
                        }
                    );
                }
            } );
        } );
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <ScrollView style={[ {}, commonStyles.wrapper, commonStyles.commonBG, ]}>
                    <View style={[ commonStyles.wrapper, commonStyles.justAlignCenter, {
                        paddingTop: 30,
                        paddingBottom: 30,
                        paddingLeft: 30,
                        paddingRight: 30
                    } ]}>
                        <Image
                            source={require( '../../imgs/wallet_img_generate.png' )}
                            style={[ {
                                width: 164,
                                height: 164,
                            } ]}
                        />

                        <Text style={[ commonStyles.commonTextColorStyle, { fontSize: 22, marginTop: 30 } ]}>
                            {I18n.t( Keys.create_eos_wallet )}
                        </Text>
                        <Text style={[ commonStyles.commonTextColorStyle, { fontSize: 16, marginTop: 20 } ]}>
                            {I18n.t( Keys.eos_wallet_mapping_description )}
                        </Text>

                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    width: 135,
                                    marginTop: 30
                                }
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                this.startCreate();
                            }}
                            title={null}
                            disabled={false}>
                            {I18n.t( Keys.start_create )}
                        </Button>

                        <Image
                            source={require( '../../imgs/wallet_img_githublogo.png' )}
                            style={[ {
                                width: 28,
                                height: 28,
                                marginTop: 30
                            } ]}
                        />
                        <Text style={[ commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginTop: 4
                        } ]}>{I18n.t( Keys.github_open_source_address )}</Text>

                        <TouchableOpacity
                            style={[ {} ]}
                            onPress={() => {
                                this.props.navigation.navigate( 'WebViewPage',
                                    {
                                        url: "https://github.com/meet-one/eos-generate",
                                        webTitle: I18n.t( Keys.eos_mapping_open_source )

                                    } )
                            }}
                        >
                            <Text
                                style={[ commonStyles.commonSubTextColorStyle, { fontSize: 12, } ]}>https://github.com/meet-one/eos-generate</Text>
                        </TouchableOpacity>


                        <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default EOSMappingTipPageView;