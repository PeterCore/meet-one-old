import React, { Component } from 'react';
import { Dimensions, InteractionManager, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../styles/commonStyles";

import QRCodeScanner from 'react-native-qrcode-scanner';
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import Button from "react-native-button";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import ethers from "ethers";
import LoadingView from "../components/LoadingView";

const ImagePicker = require( 'react-native-image-picker' );
const QRCode = require( 'react-native-qrcode-local-image' );

const { HDNode, providers, utils, Wallet } = ethers;

class QRScanPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.qr_scan_title ),
            headerRight: (
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.takeFromAlbum()
                    }}
                >
                    {I18n.t( Keys.album )}
                </Button>
            ),
        };
    };


    constructor( props ) {
        super( props );
        this.state = {
            isRequesting: false
        }
    }

    static isURL( str_url ) {
        const strRegex = "^((https|http|ftp|rtsp|mms)?://)"
            + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
            + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // 如果没有文件名，则不需要斜杠
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        var re = new RegExp( strRegex );
        //re.test()
        if ( re.test( str_url ) ) {
            return (true);
        } else {
            return (false);
        }
    }

    static _topContent() {
        return (
            <View style={{ height: 0 }}/>
        )
    }

    static _bottomContent() {
        return (
            <View style={{ height: 0 }}/>
        )
    }

    componentWillMount() {
        console.log( 'componentWillMount' );
        this.takeFromAlbum = this.takeFromAlbum.bind( this );
        this.props.navigation.setParams( { takeFromAlbum: this.takeFromAlbum } );
    }

    componentDidMount() {
        console.log( 'componentDidMount' );
    }

    componentWillUnmount() {
    }

    takeFromAlbum() {
        var options = {
            title: I18n.t( Keys.select_qr_code ),
        };

        ImagePicker.launchImageLibrary( options, ( response ) => {
            // Same code as in above section!
            console.log( 'Response = ', response );

            if ( response.didCancel ) {
                console.log( 'User cancelled image picker' );
            }
            else if ( response.error ) {
                console.log( 'ImagePicker Error: ', response.error );
            }
            else if ( response.customButton ) {
                console.log( 'User tapped custom button: ', response.customButton );
            }
            else {
                let source = { uri: Platform.OS === 'ios' ? response.uri : response.path };

                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.scanLocalQR( source );
            }
        } );
    }

    scanLocalQR( source ) {
        let path = '';

        path = source.uri;
        const header = "file:\/\/";
        if ( path && path.indexOf( header ) === 0 ) {
            path = path.substr( header.length );
        }

        console.log( "path = " + path );

        this.setState( {
            isRequesting: true
        } );

        InteractionManager.runAfterInteractions( () => {
            QRCode.decode( path, ( error, result ) => {
                this.setState( {
                    isRequesting: false
                } );

                if ( error ) {
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                } else {
                    this.dealWithResult( result );
                }
            } );
        } );
    }

    onSuccess( result ) {
        this.dealWithResult( result.data );
    }

    dealWithResult( result ) {
        const { navigate, goBack, state } = this.props.navigation;

        // if ( QRScanPageView.isURL( result ) ) {
        //     if ( state.params && state.params.callback ) {
        //         state.params && state.params.callback && state.params.callback( result );
        //
        //         goBack();
        //     } else {
        //         this.props.navigation.navigate( 'WebViewPage',
        //             {
        //                 url: result,
        //                 webTitle: I18n.t( Keys.website_title )
        //
        //             } )
        //     }
        // } else {
        const subStartString = 'ethereum:';
        if ( result.startsWith( subStartString ) ) {
            let ethAddress = result.substring( subStartString.length );

            ethAddress = utils.getAddress( ethAddress );

            if ( state.params && state.params.callback ) {
                state.params && state.params.callback && state.params.callback( ethAddress );

                goBack();
            } else {
                this.props.navigation.navigate( 'ETHTransferPage',
                    {
                        toAddress: ethAddress,
                        token: 'ETH'
                    }
                );
            }
        } else {
            Toast.show( I18n.t( Keys.invalid_eth_wallet_address ), { position: Toast.positions.CENTER } );
            // if ( state.params && state.params.callback ) {
            //     state.params && state.params.callback && state.params.callback( result );
            //
            //     goBack();
            // }
            // else {
            //     Toast.show( I18n.t( Keys.invalid_qr_code ) );
            // }
        }
        // }
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={commonStyles.wrapper}>

                    <QRCodeScanner
                        cameraStyle={{ height: Dimensions.get( 'window' ).height, }}
                        onRead={this.onSuccess.bind( this )}
                        topContent={QRScanPageView._topContent()}
                        bottomContent={QRScanPageView._bottomContent()}
                        showMarker={true}
                        checkAndroid6Permissions={true}
                    />

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );

    }
}

const styles = StyleSheet.create( {
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777',
    },

    textBold: {
        fontWeight: '500',
        color: '#000',
    },

    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)',
    },

    buttonTouchable: {
        padding: 16,
    },
} );


export default QRScanPageView;


