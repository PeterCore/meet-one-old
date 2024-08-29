import React, { Component } from 'react';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import Toast from "react-native-root-toast";
import ethers from "ethers";
import ShareComponent from "../../components/ShareComponent";
import ViewShot, { captureRef } from "react-native-view-shot";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LinearGradient from 'react-native-linear-gradient';
import LoadingView from "../../components/LoadingView";
import { Clipboard, InteractionManager, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';

const { HDNode, providers, utils, Wallet } = ethers;

const QRCode = require( 'react-native-qrcode' );

class ETHQRCodePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.qr_code_title ),
            headerRight:
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.share()
                    }}
                >
                    {I18n.t( Keys.share_title )}
                </Button>
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            isOpenShare: false,
            shareBody: {},
            isRequesting: false
        }
    }

    componentWillMount() {
        this.share = this.share.bind( this );
        this.props.navigation.setParams( { share: this.share } );
    }

    share() {
        this.loadShareContent();
    }

    loadShareContent() {
        this.setState( {
            isRequesting: true
        } );

        InteractionManager.runAfterInteractions( () => {
            captureRef( this._contentView, {
                format: "png",
                quality: 0.8
            } )
                .then(
                    ( uri ) => {
                        // "/Users/xiechao/Library/Developer/CoreSimulator/Devices/64B35C26-D5C4-4387-9E31-DDDE2E625AC3/data/Containers/Data/Application/576C6A41-4753-4970-A925-26044B2A3ABA/tmp/ReactNative/C2A1E452-E5B4-4F2B-8524-98F870BF6977.png"
                        if ( Platform.OS !== 'ios' && uri.startsWith( "file://" ) ) {
                            uri = uri.substr( "file://".length )
                        }

                        this.setState( {
                            isRequesting: false,
                            isOpenShare: true,
                            shareBody: {
                                content: I18n.t( Keys.this_is_my_eth_wallet ),
                                image: uri,
                                // website: env.meet_url,
                                title: I18n.t( Keys.app_name )
                            }
                        } );
                    } )
                .catch( ( error ) => {
                    this.setState( {
                        isRequesting: false,
                    } );
                    Toast.show( I18n.t( Keys.failed_to_save_photo ) + ': ' + error.message, { position: Toast.positions.CENTER } );
                } );
        } );
    }

    render() {
        const address = utils.getAddress( this.props.account.jsonWallet.address );
        const { params } = this.props.navigation.state;
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.paddingCommon ]}>
                    <View style={[ commonStyles.justAlignCenter ]}>

                        <ViewShot
                            ref={( contentView ) => {
                                this._contentView = contentView;
                            }}
                            style={[ {}, commonStyles.justAlignCenter ]}
                        >
                            <LinearGradient
                                colors={[ '#1ACE9A', '#1ACE9B', '#17B6CC' ]}
                                style={[
                                    {
                                        borderRadius: 5,
                                        paddingTop: 28,
                                        paddingBottom: 28,
                                        paddingLeft: 25,
                                        paddingRight: 25,
                                    },
                                    commonStyles.justAlignCenter
                                ]}>
                                <Text style={[ { fontSize: 16, color: 'white' } ]}>
                                    {I18n.t( Keys.scan_qr_to_pay )}
                                </Text>
                                <View style={[ {
                                    paddingTop: 5,
                                    paddingBottom: 5,
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                    borderRadius: 5,
                                    backgroundColor: 'white',
                                    marginTop: 20
                                } ]}>
                                    <QRCode
                                        style={[ {} ]}
                                        value={'ethereum:' + address}
                                        size={230}
                                        bgColor={'#000000'}
                                        fgColor='white'
                                    />
                                </View>
                                <View style={[ { marginTop: 20 } ]}>
                                    <Text style={[ { fontSize: 16, color: 'white' } ]}>
                                        {I18n.t( Keys.eth_wallet_address )}
                                    </Text>
                                    <Text style={[ { fontSize: 18, color: 'white', marginTop: 10 } ]}>
                                        {address}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </ViewShot>

                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    width: 170,
                                    marginTop: 50,
                                    marginBottom: 20
                                }
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                Clipboard.setString( address );
                                Toast.show( I18n.t( Keys.copy_address_success ), { position: Toast.positions.CENTER } );
                            }}
                            title={null}
                            disabled={false}>
                            {I18n.t( Keys.copy_wallet_address )}
                        </Button>

                    </View>

                    <ShareComponent
                        isOpen={this.state.isOpenShare}
                        onClose={() => {
                            this.setState( {
                                isOpenShare: false
                            } );
                        }}
                        onCancel={() => {

                        }}
                        shareBody={this.state.shareBody}
                    />

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHQRCodePageView;