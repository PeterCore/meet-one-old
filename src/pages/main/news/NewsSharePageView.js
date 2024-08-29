import React from "react";

import {
    Dimensions,
    Image,
    InteractionManager,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    WebView
} from "react-native";
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import constants from "../../../constants/constants";
import ImageWithPlaceHolder from "../../../components/ImageWithPlaceHolder";
import ViewShot, { captureRef } from "react-native-view-shot";
import Toast from "react-native-root-toast";
import Button from "react-native-button";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import ShareUtile from "../../../../native/ShareUtil";
import LoadingView from "../../../components/LoadingView";
import TimeUtil from "../../../util/TimeUtil";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

const QRCode = require( 'react-native-qrcode' );
const window = Dimensions.get( 'window' );
const PropTypes = require( 'prop-types' );
const RNFS = require( 'react-native-fs' );

class NewsSharePageView extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.share_title ),
            header: null
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isRequesting: false
        };
    }

    static renderContent( item ) {
        switch ( item.type ) {
            case constants.NEWS_MEET_SELF:
                return (
                    <View>
                        <Text style={[ {
                            fontSize: 14,
                            color: '#B5B5B5'
                        } ]}>{TimeUtil.formatWithTimeZone( item.time )}</Text>

                        {
                            (item.title && item.title !== "" && item.title !== "noContent") ?
                            <Text style={{ fontSize: 16, color: '#323232', fontWeight: '600', marginTop: 10, lineHeight: 24 }}>
                                {item.title}
                            </Text>
                            :
                            null
                        }

                        <Text style={[ { fontSize: 15, color: '#444444', marginTop: 10, lineHeight: 24 } ]}>
                            {item.content}
                        </Text>

                        {
                            (item.picUrl && item.picUrl !== "") ?
                            <ScaledImage
                                style={{
                                    width: window.width - 50 - 40,
                                    height: (window.width - 50 - 40) * 0.75,
                                }}
                                uri={item.picUrl}
                                width={window.width - 50 - 40}
                            />
                            :
                            null
                        }
                    </View>
                );
            case constants.NEWS_TWITTER:
                return (
                    <View style={[ {} ]}>
                        <View style={[ { flexDirection: 'row' } ]}>
                            <ImageWithPlaceHolder
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                }}
                                placeholderForIcon={'md-image'}
                                source={{ uri: item.authorLogo }}
                            />

                            <View style={[ {}, commonStyles.wrapper, { marginLeft: 10 } ]}>
                                <Text style={[ {
                                    fontSize: 14,
                                }, commonStyles.commonTextColorStyle ]}>{item.auth}</Text>
                                <Text style={[ {
                                    fontSize: 10,
                                    marginTop: 2
                                }, commonStyles.commonSubTextColorStyle ]}
                                      numberOfLines={3}>
                                    {TimeUtil.formatWithTimeZone( item.time )}
                                </Text>

                            </View>
                        </View>

                        <Text style={[ {
                            fontSize: 15, marginTop: 11, lineHeight: 24
                        }, commonStyles.commonTextColorStyle ]}>{item.content}</Text>
                        {/*<View style={[ commonStyles.commonIntervalStyle, {*/}
                        {/*marginTop: 15,*/}
                        {/*marginBottom: 11*/}
                        {/*} ]}/>*/}
                        {/*<Text style={[ {*/}
                        {/*fontSize: 14,*/}
                        {/*}, commonStyles.commonSubTextColorStyle ]}>{I18n.t( Keys.auto_translate )}</Text>*/}
                        {/*<Text style={[ {*/}
                        {/*fontSize: 14, marginTop: 5, lineHeight: 22*/}
                        {/*}, commonStyles.commonTextColorStyle ]}>{item.contentTranslated}</Text>*/}
                    </View>
                );
            case constants.NEWS_WEI_CHAT:
                return (
                    <View>
                        <View style={[ { flexDirection: 'row', marginTop: 11 } ]}>
                            <Text
                                style={[
                                    {
                                        fontSize: 12, color: '#B5B5B5'
                                    },
                                    commonStyles.wrapper ]}
                                numberOfLines={1}
                            >
                                {item.auth}
                            </Text>
                            <Text
                                style={[
                                    {
                                        fontSize: 12,
                                        color: '#B5B5B5'
                                    } ]}
                                numberOfLines={1}
                            >
                                {TimeUtil.formatWithTimeZone( item.time )}
                            </Text>
                        </View>

                        <Text style={[ {
                            fontSize: 15, marginTop: 11, lineHeight: 24
                        }, commonStyles.commonTextColorStyle ]}>{item.title}</Text>

                        {/* <WebView
                            style={{ marginTop: 11, height: 200 }}
                            source={{ html: item.content, baseUrl: '' }}
                            scalesPageToFit={true}
                        /> */}

                        <Text style={[ {
                            fontSize: 12, marginTop: 10
                        }, commonStyles.commonSubTextColorStyle ]}>{
                            I18n.t( Keys.share_read_more )
                        }</Text>
                    </View>
                );
            case constants.NEWS_WEI_BO:
                return (
                    <View style={[ {} ]}>
                        <View style={[ { flexDirection: 'row' } ]}>
                            <ImageWithPlaceHolder
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                }}
                                placeholderForIcon={'md-image'}
                                source={{ uri: item.authorLogo }}
                            />

                            <View style={[ {}, commonStyles.wrapper, { marginLeft: 10 } ]}>
                                <Text style={[ {
                                    fontSize: 14,
                                }, commonStyles.commonTextColorStyle ]}>{item.auth}</Text>
                                <Text style={[ {
                                    fontSize: 10,
                                    marginTop: 2
                                }, commonStyles.commonSubTextColorStyle ]}
                                      numberOfLines={3}>
                                    {TimeUtil.formatWithTimeZone( item.time )}
                                </Text>

                            </View>
                        </View>

                        <Text style={[ {
                            fontSize: 15, marginTop: 11, lineHeight: 24
                        }, commonStyles.commonTextColorStyle ]}>{item.content}</Text>
                    </View>
                );
            default:
                return (null)
        }
    }

    componentDidMount() {
        // this.loadData( 0, true );
        AnalyticsUtil.onEvent('NWshare');
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    doShare( type ) {
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
                            isRequesting: false
                        } );

                        switch ( type ) {
                            case "wechat" :
                                ShareUtile.share( "", uri, "", I18n.t( Keys.app_name ), 2, ( code, message ) => {
                                    if ( code !== -1 ) {
                                        Toast.show( message, { position: Toast.positions.CENTER } );
                                    }
                                    if ( code === 200) {
                                        AnalyticsUtil.onEventWithLabel('NWshareSuccess', type);
                                    }
                                } );
                                break;
                            case "moments" :
                                ShareUtile.share( "", uri, "", I18n.t( Keys.app_name ), 3, ( code, message ) => {
                                    if ( code !== -1 ) {
                                        Toast.show( message, { position: Toast.positions.CENTER } );
                                    }
                                    if ( code === 200) {
                                        AnalyticsUtil.onEventWithLabel('NWshareSuccess', type);
                                    }
                                } );
                                break;
                            case  "weibo" :
                                ShareUtile.share( "", uri, "", I18n.t( Keys.app_name ), 1, ( code, message ) => {
                                    if ( code !== -1 ) {
                                        Toast.show( message, { position: Toast.positions.CENTER } );
                                    }
                                    if ( code === 200) {
                                        AnalyticsUtil.onEventWithLabel('NWshareSuccess', type);
                                    }
                                } );
                                break;
                            case "qq" :
                                ShareUtile.share( "", uri, "", I18n.t( Keys.app_name ), 0, ( code, message ) => {
                                    if ( code !== -1 ) {
                                        Toast.show( message, { position: Toast.positions.CENTER } );
                                    }
                                    if ( code === 200) {
                                        AnalyticsUtil.onEventWithLabel('NWshareSuccess', type);
                                    }
                                } );
                                break;
                        }
                    } )
                .catch( ( error ) => {
                    this.setState( {
                        isRequesting: false
                    } );

                    console.log( error.message )
                } );
        } );
    }

    renderShareFunctionItem( icon, name, type ) {
        return <TouchableHighlight
            underlayColor='#f7f7f7'
            onPress={() => {
                this.doShare( type );
            }}
            style={[ { height: 85, width: (window.width - 30) / 4 }, ]}>
            <View style={[ commonStyles.justAlignCenter ]}>
                <Image
                    source={icon}
                    style={[ { width: 60, height: 60 } ]}
                />
                <Text style={[ commonStyles.commonSubTextColorStyle, { marginTop: 5, fontSize: 14 } ]}>
                    {name}
                </Text>
            </View>
        </TouchableHighlight>;
    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ this.props.style, commonStyles.wrapper, { backgroundColor: '#EEEEEE' } ]}>

                    <ScrollView>
                        <View style={[ {
                            paddingTop: 25,
                            paddingRight: 25,
                            paddingLeft: 25,
                            paddingBottom: 25,
                        } ]}>
                            <View style={[ {
                                borderRadius: 10,
                                overflow: 'hidden',
                            } ]}>
                                <ViewShot style={[ {
                                    backgroundColor: 'white',
                                    minHeight: 500
                                } ]}
                                          ref={( contentView ) => {
                                              this._contentView = contentView;
                                          }}
                                >
                                    {
                                        this.topImage( this.props.news.type )
                                    }

                                    {
                                        <View style={[ {
                                            paddingTop: 15,
                                            paddingBottom: 20,
                                            paddingLeft: 20,
                                            paddingRight: 20
                                        } ]}>
                                            {
                                                NewsSharePageView.renderContent( this.props.news )
                                            }
                                        </View>
                                    }

                                    <View
                                        style={{ flex: 1 }}
                                    />

                                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                                    <View style={[ {
                                        height: 80,
                                        flexDirection: 'row',
                                        paddingLeft: 15,
                                    }, commonStyles.justAlignCenter ]}>

                                        {/*<QRCode*/}
                                        {/*style={[ { top: 15 } ]}*/}
                                        {/*value={env.meet_url}*/}
                                        {/*size={50}*/}
                                        {/*bgColor='black'*/}
                                        {/*fgColor='white'*/}
                                        {/*/>*/}

                                        <Image
                                            source={require( '../../../imgs/share_orcode.png' )}
                                            style={[ {
                                                width: 60,
                                                height: 60,
                                            } ]}/>

                                        <View style={[ commonStyles.wrapper, { paddingLeft: 10, paddingRight: 10 } ]}>
                                            <Text style={[ commonStyles.commonSubTextColorStyle, {
                                                fontSize: 12,
                                                lineHeight: 18
                                            } ]}>
                                                {I18n.t( Keys.qr_share_tip_1 )}
                                            </Text>
                                            <Text style={[ commonStyles.commonSubTextColorStyle, {
                                                fontSize: 12,
                                                lineHeight: 18
                                            } ]}>
                                                {I18n.t( Keys.qr_share_tip_2 )}
                                            </Text>
                                        </View>

                                        {/*<View style={[ commonStyles.justAlignCenter ]}>*/}
                                        {/*<Image*/}
                                        {/*source={require( '../../imgs/share_img_logo.png' )}*/}
                                        {/*style={[ { width: 19, height: 28 } ]}*/}
                                        {/*/>*/}

                                        {/*<Text style={[ commonStyles.commonTextColorStyle, {*/}
                                        {/*fontSize: 8,*/}
                                        {/*marginTop: 4*/}
                                        {/*} ]}>*/}
                                        {/*MEET.ONE*/}
                                        {/*</Text>*/}
                                        {/*</View>*/}
                                    </View>
                                </ViewShot>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[ { height: 185, paddingTop: 15, backgroundColor: 'white' } ]}>
                        <View style={[ { paddingLeft: 15, paddingRight: 15, flexDirection: 'row' } ]}>
                            {this.renderShareFunctionItem( require( '../../../imgs/news_btn_share_wechat.png' ), I18n.t( Keys.share_to_wechat ), "wechat" )}
                            {this.renderShareFunctionItem( require( '../../../imgs/news_btn_share_moments.png' ), I18n.t( Keys.share_to_wechat_moment ), "moments" )}
                            {this.renderShareFunctionItem( require( '../../../imgs/news_btn_share_weibo.png' ), I18n.t( Keys.share_to_weibo ), "weibo" )}
                            {this.renderShareFunctionItem( require( '../../../imgs/news_btn_share_qq.png' ), I18n.t( Keys.share_to_qq ), "qq" )}
                        </View>
                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    marginTop: 21,
                                    marginLeft: 15,
                                    marginRight: 15
                                },
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                const { navigate, goBack, state } = this.props.navigation;
                                goBack();
                            }}
                            title={null}
                            disabled={false}>
                            {I18n.t( Keys.cancel )}
                        </Button>
                    </View>
                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }

    topImage( type ) {
        switch ( type ) {
            case constants.NEWS_MEET_SELF:
                return (<Image
                    source={require( '../../../imgs/news_img_sharebanner_breaking.png' )}
                    style={[ {
                        width: window.width - 25 * 2,
                        height: (window.width - 25 * 2) * 160 / 325,
                    } ]}/>);
            case constants.NEWS_TWITTER:
                return (<Image
                    source={require( '../../../imgs/news_img_sharebanner_twitter.png' )}
                    style={[ {
                        width: window.width - 25 * 2,
                        height: (window.width - 25 * 2) * 160 / 325,
                    } ]}/>);
            case constants.NEWS_WEI_CHAT:
                return (<Image
                    source={require( '../../../imgs/news_img_sharebanner.png' )}
                    style={[ {
                        width: window.width - 25 * 2,
                        height: (window.width - 25 * 2) * 160 / 325,
                    } ]}/>);
            case constants.NEWS_WEI_BO:
                return (<Image
                    source={require( '../../../imgs/news_img_sharebanner_weibo.png' )}
                    style={[ {
                        width: window.width - 25 * 2,
                        height: (window.width - 25 * 2) * 160 / 325,
                    } ]}/>);
            default:
                return (<Image
                    source={require( '../../../imgs/news_img_sharebanner.png' )}
                    style={[ {
                        width: window.width - 25 * 2,
                        height: (window.width - 25 * 2) * 160 / 325,
                    } ]}/>);
        }
    }
}

class ScaledImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            source: {
                uri: this.props.uri
            }
        };
    }

    componentWillMount() {
        Image.getSize(this.props.uri, (width, height) => {
            this.setState({
                width: this.props.width,
                height: height * (this.props.width / width)
            });
        });
    }

    render() {
        return (
            <View style={[ this.props.style, commonStyles.justAlignCenter, { marginTop: 10, height: this.state.height, width: this.state.width } ]}>
                <Image source={this.state.source} style={[ this.props.style, { height: this.state.height, width: this.state.width } ]}/>
            </View>
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    recommendService: {
        flex: 1,
    }
} );

export default NewsSharePageView;
