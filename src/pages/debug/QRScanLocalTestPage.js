import React, { Component } from 'react';
import { Image, Platform, View } from 'react-native';
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import commonStyles from "../../styles/commonStyles";
import { SafeAreaView } from 'react-navigation';

const ImagePicker = require( 'react-native-image-picker' );
const QRCode = require( 'react-native-qrcode-local-image' );

class QRScanLocalTest extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            avatarSource: null
        };
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
    }

    componentWillUnmount() {
    }


    pickerPhoto() {

// More info on all the options is below in the README...just some common use cases shown here
        var options = {
            title: 'Select Avatar',
            customButtons: [
                { name: 'fb', title: 'Choose Photo from Facebook' },
            ],
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info below in README)
         */
        ImagePicker.showImagePicker( options, ( response ) => {
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

                this.setState( {
                    avatarSource: source
                } );

                this.scanQR( source );
            }
        } );

    }


    scanQR( source ) {
        let path = '';

        path = source.uri;
        const header = "file:\/\/";
        if ( path && path.indexOf( header ) === 0 ) {
            path = path.substr( header.length );
        }

        console.log( "path = " + path );

        QRCode.decode( path, ( error, result ) => {
            Toast.show( JSON.stringify( { error, result } ), { position: Toast.positions.CENTER } )
        } );
    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    <Button
                        style={commonStyles.top_info_right_btn}
                        title=''
                        onPress={() => {
                            this.pickerPhoto();
                        }}
                    >
                        {'扫一扫'}
                    </Button>

                    <Image source={this.state.avatarSource} style={[ {
                        width: 160,
                        height: 160
                    } ]}/>
                </View>
            </SafeAreaView>
        );
    }
}


export default QRScanLocalTest;