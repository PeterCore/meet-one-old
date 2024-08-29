import React, { Component } from 'react';
import { Dimensions, InteractionManager, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";

import QRCodeScanner from 'react-native-qrcode-scanner';
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import Button from "react-native-button";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import LoadingView from "../../../components/LoadingView";

const ImagePicker = require( 'react-native-image-picker' );
const QRCode = require( 'react-native-qrcode-local-image' );
import Util from "../../../util/Util";
import URLRouteUtil from "../../../util/URLRouteUtil";
import { connect } from "react-redux";

class EOSQRScanPageView extends Component {
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
        const strRegex = "^(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]";
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
        const { goBack, state } = this.props.navigation;
        try {
            if ( EOSQRScanPageView.isURL( result ) ) {
                if ( state.params && state.params.callback ) {
                    state.params && state.params.callback && state.params.callback( result );
            
                    goBack();
                } else {
                    this.props.navigation.navigate( 'WebViewPage',
                    {
                            url: result,
                            webTitle: I18n.t( Keys.website_title )
            
                        } )
                }
            } else {
                const resultObj = JSON.parse(result);
            // 调试 将二维码内容吐司出来
            // Toast.show(result, {position: Toast.positions.CENTER});
            const {protocol, action} = resultObj;
            let url = ''; // 内部协议地址
            // Simplewallet 协议
            if (protocol === 'SimpleWallet') {
                // 根据action转换成App内部协议
                switch (action) {
                    // 场景：使用钱包扫码登录
                    case 'login':
                        url = Util.generateURI({
                            routeName: 'eos/authorize',
                            params: Object.assign({from: 'qrcode'}, resultObj)
                        });
                        break;
                    // 场景：钱包扫描二维码进行支付
                    case 'transfer':
                        let formatObj = {
                            tokenPrecision: resultObj.precision,
                            tokenContract: resultObj.contract,
                            tokenName: resultObj.symbol,
                            memo: resultObj.dappData,
                            orderInfo: resultObj.desc
                        };
                        url = Util.generateURI({
                            routeName: 'eos/transfer',
                            params: Object.assign({source: 'qrcode'}, resultObj, formatObj)
                        });
                        goBack();
                        break;
                    default:
                        Toast.show('暂不支持此协议', {position: Toast.positions.CENTER});
                }
                if (url && this.props.waitingComponent) {
                    URLRouteUtil.handleOpenURL(this.props.waitingComponent, url, (err, res) => {
                        console.log(err, res);
                    });
                }
            } else if (protocol === 'MEET.ONE') {
                // MEET.ONE协议
                switch(action) {
                    case 'navigate':
                        url = Util.generateURI({
                            routeName: 'app/navigate',
                            params: Object.assign({from: 'qrcode'}, resultObj)
                        });
                        if ( state.params && state.params.callback ) {
                            state.params && state.params.callback && state.params.callback(url);
                            goBack();
                            return;
                        }
                        break;
                    default:
                        Toast.show('暂不支持此协议', {position: Toast.positions.CENTER});
                }
                if (url && this.props.waitingComponent) {
                    URLRouteUtil.handleOpenURL(this.props.waitingComponent, url, (err, res) => {
                        console.log(err, res);
                    });
                }
            }
            }
        } catch (error) {
            // 兼容纯文本的QRCode
            if (result.match(/^[1-5a-z]{1,12}$/g)) {
                // 如果结果满足EOS普通帐号的格式需求,则跳转到付款页面
                let url = Util.generateURI({
                    routeName: 'app/navigate',
                    params: Object.assign({from: 'qrcode'}, {
                        target: "EOSTransferPage",
                        to: result
                    })
                });
                if (url && this.props.waitingComponent) {
                    URLRouteUtil.handleOpenURL(this.props.waitingComponent, url, (err, res) => {
                        console.log(err, res);
                    });
                }
            } else {
                // 否则则认定二维码解析错误
                Toast.show( I18n.t( Keys.error_parse), { position: Toast.positions.CENTER } );
            }
        }
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={commonStyles.wrapper}>

                    <QRCodeScanner
                        cameraStyle={{ height: Dimensions.get( 'window' ).height, }}
                        onRead={this.onSuccess.bind( this )}
                        topContent={EOSQRScanPageView._topContent()}
                        bottomContent={EOSQRScanPageView._bottomContent()}
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

function select( store ) {
    return {
        waitingComponent: store.settingStore.waitingComponent
    };
}

export default connect( select )( EOSQRScanPageView );


