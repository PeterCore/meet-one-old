import React, { Component } from 'react';
import { Image, InteractionManager, Platform, StatusBar, StyleSheet, Text, View, WebView } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Toast from "react-native-root-toast";
import Button from "react-native-button";
import ShareComponent from "../../../components/ShareComponent";
import ViewShot, { captureRef } from "react-native-view-shot";
import Spinner from 'react-native-loading-spinner-overlay';
import LoadingView from "../../../components/LoadingView";
import { getStore } from "../../../setup";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class MineRecommendMeetPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.recommend_meet ),
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
            isRequesting: false,
            loading: true
        }
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
                        if ( Platform.OS !== 'ios' && uri.startsWith( "file://" ) ) {
                            uri = uri.substr( "file://".length )
                        }

                        this.setState( {
                            isRequesting: false,
                            isOpenShare: true,
                            shareBody: {
                                content: "",
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

    _share() {
        this.loadShareContent();
    }


    componentWillMount() {
        this._share = this._share.bind( this );
        this.props.navigation.setParams( { share: this._share } );
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('OTshare');
    }

    componentWillUnmount() {
    }

    render() {
        const store = getStore();
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>

                    <ViewShot
                        ref={( contentView ) => {
                            this._contentView = contentView;
                        }}
                        style={[ { backgroundColor: '#FFFFFF' }, commonStyles.wrapper ]}
                    >
                    <WebView
                        source={{
                            uri: store.getState().settingStore.language === 'zh-CN' ? 'https://dapp.ethte.com/recommend' : 'https://meet.one/recommend',
                            headers: {
                                'accept-language': store.getState().settingStore.language
                            }
                        }}
                        style={{width:'100%',height:'100%'}}
                        onLoad={() => {
                            this.setState({
                                loading: false
                            })
                        }}
                    />
                    </ViewShot>

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

                    {
                        this.state.loading || this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }

                    {/* <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/> */}
                </View>
            </SafeAreaView>
        );

    }

}

const styles = StyleSheet.create( {
    itemHeight: {
        height: 64
    }
} );

export default MineRecommendMeetPageView;


