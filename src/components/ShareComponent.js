import React from "react";
import { Dimensions, Image, Modal, Text, TouchableHighlight, View } from "react-native";
import commonStyles from "../styles/commonStyles";
import { connect } from "react-redux";
import Button from "react-native-button";
import PopupDialog from 'react-native-popup-dialog';
import constants from "../constants/constants";
import moment from "moment/moment";
import ImageWithPlaceHolder from "../components/ImageWithPlaceHolder";
import ShareUtile from '../../native/ShareUtil'
import Toast from "react-native-root-toast";
import Keys from "../configs/Keys";
import I18n from "../I18n";
import Util from "../util/Util";
import {IS_DEBUG} from "../env";
import AnalyticsUtil from "../util/AnalyticsUtil";

const window = Dimensions.get( 'window' );
const PropTypes = require( 'prop-types' );

const QRCode = require( 'react-native-qrcode' );

class ShareComponent extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        shareBody: PropTypes.object.isRequired,
        webviewComponent: PropTypes.object
    };

    static defaultProps = {
        webviewComponent: null
    }

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen,
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
                        } ]}>{moment( item.time ).format( 'HH:mm:ss' )}</Text>
                        <Text style={[ { fontSize: 15, color: '#444444', marginTop: 6 } ]}
                            numberOfLines={3}>
                            {item.content}
                        </Text>
                    </View>
                );
            case constants.NEWS_TWITTER:
                return (
                    <View style={[ { flexDirection: 'row' } ]}>
                        <ImageWithPlaceHolder
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                            }}
                            placeholderForIcon={'md-image'}
                            source={null}
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
                                {moment( item.time ).format( 'L' ) + ' ' + moment( item.time ).format( 'HH:mm:ss' )}
                            </Text>
                            <Text style={[ {
                                fontSize: 16, marginTop: 11
                            }, commonStyles.commonTextColorStyle ]}>{item.content}</Text>
                            <View style={[ commonStyles.commonIntervalStyle, {
                                marginTop: 15,
                                marginBottom: 11
                            } ]}/>
                            <Text style={[ {
                                fontSize: 14,
                            }, commonStyles.commonSubTextColorStyle ]}>{'自动翻译：'}</Text>
                            <Text style={[ {
                                fontSize: 14, marginTop: 5
                            }, commonStyles.commonTextColorStyle ]}>{item.contentTranslated}</Text>
                        </View>

                    </View>
                );
            case constants.NEWS_WEI_CHAT:
                return (
                    <View>
                        <Text style={[ {
                            fontSize: 17, height: 48
                        }, commonStyles.commonTextColorStyle ]}
                            numberOfLines={2}>{item.title}</Text>
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
                                {moment( item.time ).format( 'L' ) + ' ' + moment( item.time ).format( 'HH:mm:ss' )}
                            </Text>
                        </View>
                    </View>
                );
            case constants.NEWS_WEI_BO:
                return (
                    <View>
                        <ImageWithPlaceHolder
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                            }}
                            placeholderForIcon={'md-image'}
                            source={null}
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
                                {moment( item.time ).format( 'L' ) + ' ' + moment( item.time ).format( 'HH:mm:ss' )}
                            </Text>
                            <Text style={[ {
                                fontSize: 16, marginTop: 11
                            }, commonStyles.commonTextColorStyle ]}>{item.content}</Text>
                        </View>
                    </View>
                );
            default:
                return (null)
        }
    }

    componentWillReceiveProps( nextProps ) {
        if (
            nextProps.isOpen !== this.state.isOpen
        ) {
            this.setState( {
                isOpen: nextProps.isOpen
            } );
        }
    }

    closeModal() {

        let callbackId = this.props.callbackId;

        if ( this.props.onClose ) {
            this.props.onClose();
        }

        this.setState({isOpen: false}, () => {
            if (this.props.webviewComponent) {
                let params = Util.schemeEncode(999, 999, {})
                this.props.webviewComponent.postMessage(JSON.stringify({
                    params,
                    callbackId,
                }));
            }
        });
    }

    renderShareFunctionItem( icon, name, type ) {
        let callbackId = this.props.callbackId;
        return (
            <TouchableHighlight
                underlayColor='#f7f7f7'
                onPress={() => {
                    this.setState( {
                        isOpen: false
                    } );

                    this.closeModal();
                    IS_DEBUG ? Toast.show(JSON.stringify(this.props.shareBody), {} ) : null;
                    switch ( type ) {
                        case "wechat" :
                            ShareUtile.share( this.props.shareBody.content, this.props.shareBody.image, this.props.shareBody.website, this.props.shareBody.title, 2, ( code, message ) => {
                                if (this.props.webviewComponent) {
                                    let params = Util.schemeEncode(code, 300, {message})
                                    this.props.webviewComponent.postMessage(JSON.stringify({
                                        params,
                                        callbackId
                                    }));
                                }
                                if ( code !== -1 ) {
                                    Toast.show( message, { position: Toast.positions.CENTER } );
                                }
                                if ( code === 200) {
                                    AnalyticsUtil.onEventWithLabel('OTshareSuccess', 'wechat');
                                }
                            } );
                            break;
                        case "moments" :
                            ShareUtile.share( this.props.shareBody.content, this.props.shareBody.image, this.props.shareBody.website, this.props.shareBody.title, 3, ( code, message ) => {
                                if (this.props.webviewComponent) {
                                    let params = Util.schemeEncode(code, 300, {message})
                                    this.props.webviewComponent.postMessage(JSON.stringify({
                                        params,
                                        callbackId,
                                    }));
                                }
                                if ( code !== -1 ) {
                                    Toast.show( message, { position: Toast.positions.CENTER } );
                                }
                                if ( code === 200) {
                                    AnalyticsUtil.onEventWithLabel('OTshareSuccess', 'wxmoment');
                                }
                            } );
                            break;
                        case  "weibo" :
                            ShareUtile.share( this.props.shareBody.content, this.props.shareBody.image, this.props.shareBody.website, this.props.shareBody.title, 1, ( code, message ) => {
                                if (this.props.webviewComponent) {
                                    let params = Util.schemeEncode(code, 300, {message})
                                    this.props.webviewComponent.postMessage(JSON.stringify({
                                        params,
                                        callbackId,
                                    }));
                                }
                                if ( code !== -1 ) {
                                    Toast.show( message, { position: Toast.positions.CENTER } );
                                }
                                if ( code === 200) {
                                    AnalyticsUtil.onEventWithLabel('OTshareSuccess', 'weibo');
                                }
                            } );
                            break;
                        case "qq" :
                            ShareUtile.share( this.props.shareBody.content, this.props.shareBody.image, this.props.shareBody.website, this.props.shareBody.title, 0, ( code, message ) => {
                                if (this.props.webviewComponent) {
                                    let params = Util.schemeEncode(code, 300, {message})
                                    this.props.webviewComponent.postMessage(JSON.stringify({
                                        params,
                                        callbackId: this.props.callbackId
                                    }));
                                }
                                if ( code !== -1 ) {
                                    Toast.show( message, { position: Toast.positions.CENTER } );
                                }
                                if ( code === 200) {
                                    AnalyticsUtil.onEventWithLabel('OTshareSuccess', 'qq');
                                }
                            } );
                            break;
                    }
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
            </TouchableHighlight>
        );
    }


    render() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >

                <PopupDialog
                    onDismissed={() => {
                        this.closeModal();
                    }}
                    width={Dimensions.get( 'window' ).width}
                    height={185}
                    show={this.state.isOpen}
                    dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                    // haveOverlay={false}
                >
                    <View style={[ { height: 185 } ]}>
                        <View style={[ { height: 185, paddingTop: 15, backgroundColor: 'white' } ]}>
                            <View style={[ { paddingLeft: 15, paddingRight: 15, flexDirection: 'row' } ]}>
                                {this.renderShareFunctionItem( require( '../imgs/news_btn_share_wechat.png' ), '微信', 'wechat' )}
                                {this.renderShareFunctionItem( require( '../imgs/news_btn_share_moments.png' ), '朋友圈', 'moments' )}
                                {this.renderShareFunctionItem( require( '../imgs/news_btn_share_weibo.png' ), '微博', 'weibo' )}
                                {this.renderShareFunctionItem( require( '../imgs/news_btn_share_qq.png' ), 'QQ', 'qq' )}
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
                                    if ( this.props.onCancel ) {
                                        this.props.onCancel();
                                    }

                                    this.closeModal();
                                }}
                                title={null}
                                disabled={false}>
                                {I18n.t( Keys.cancel )}
                            </Button>
                        </View>

                    </View>

                </PopupDialog>
            </Modal>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( ShareComponent );
