import React, { Component } from 'react';
import {
    Image,
    Linking,
    Platform,
    StatusBar,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Dimensions,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import DataListView from "./components/DataListView";
import moment from "moment/moment";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import ImageViewer from 'react-native-image-zoom-viewer';

let addresKey = 'addresKey';

class NewsMeetSelfPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.news_type_title_meet_self ),
            tabBarOnPress: ( data ) => {
                var previousScene = data.previousScene;
                var scene = data.scene;
                if ( !scene.focused ) {
                    var analyticTab;
                    switch (scene.index) {
                        case 0:
                            analyticTab = 'kuaixun';
                            break;
                        case 1:
                            analyticTab = 'twitter';
                            break;
                        case 2:
                            analyticTab = 'weibo';
                            break;
                        case 3:
                            analyticTab = 'wechat';
                            break;
                        default:
                            break;
                    }
                    AnalyticsUtil.onEventWithLabel('NWzixun', analyticTab);
                    data.jumpToIndex( scene.index );
                } else {
                    navigation.state.params.onFocusedTabClick()
                }
            },
        };
    };


    constructor( props ) {
        super( props );
        this.lastTabClickTs = 0;

        this.state = {
            showImage: false,
            images: [{
                url: '',
            }]
        }
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        AnalyticsUtil.onEventWithLabel('NWzixun', 'kuaixun');
        this.props.navigation.setParams( {
            onFocusedTabClick: this._onTabClick.bind( this )
        } )
    }

    componentWillUnmount() {
    }

    _onTabClick() {
        let currentTs = new Date().getTime();
        // console.log('_onTabClick lastTabClickTs=' + this.lastTabClickTs)
        // console.log('_onTabClick currentTs=' + currentTs)
        if ( currentTs - this.lastTabClickTs < 300 ) {
            this._dataListView.scrollTopOrRefresh()
            this.lastTabClickTs = 0;
        } else {
            this.lastTabClickTs = currentTs;
        }
    }


    render() {

        const picWidth = Dimensions.get( 'window' ).width - 31 - 20;
        const picHeight = picWidth * 0.75;

        return (
            <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>
                    <DataListView
                        ref={( view ) => {
                            this._dataListView = view;
                        }}
                        renderItem={( item ) => {
                            return (
                                <TouchableHighlight
                                    underlayColor='#f7f7f7'
                                    // onPress={() => {
                                    //     this.props.navigation.navigate( 'NewsDetailPage',
                                    //         {
                                    //             news: item,
                                    //         }
                                    //     );
                                    // }}
                                    onLongPress={() => {
                                        this.props.navigation.navigate( 'NewsSharePage',
                                            {
                                                news: item,
                                                transition: 'forVertical'
                                            }
                                        );
                                    }}
                                    style={[ { backgroundColor: '#ffffff' } ]}>
                                    <View>
                                        <View style={[ {
                                            paddingTop: 10,
                                            paddingBottom: 10,
                                            paddingLeft: 31,
                                            paddingRight: 15,
                                        } ]}>
                                            <Text style={[ {
                                                fontSize: 14,
                                                color: '#B5B5B5',
                                                marginTop: 4

                                            } ]}>{moment( item.time ).format( 'HH:mm:ss' )}</Text>

                                            {/* 资讯标题 */}
                                            {
                                                (item.title && item.title !== "" && item.title !== "noContent") ?
                                                <Text style={[
                                                    {
                                                        fontSize: 15,
                                                        fontWeight: '600',
                                                        color: '#444444',
                                                        marginTop: 10,
                                                        lineHeight: 24
                                                    },
                                                    item.authorId === 'meetone_important' ?   // 重要标红
                                                    { color: '#f65858' }
                                                    :
                                                    { }
                                                ]}>
                                                    {item.title}
                                                </Text>
                                                :
                                                null
                                            }

                                            <Text
                                                style={[
                                                    {
                                                        fontSize: 15,
                                                        color: '#444444',
                                                        marginTop: 5,
                                                        lineHeight: 24
                                                    },
                                                    //item.authorId === 'meetone_important' ?  // 重要标红全文,暂时只标题
                                                    //{ color: '#f65858' }
                                                    //:
                                                    //{ }
                                                ]}
                                            >
                                                {item.content}
                                                {
                                                    (item.url == null || item.url === undefined || item.url === '') ?
                                                        (null)
                                                        :
                                                        (
                                                                <Text
                                                                    style={[ {
                                                                        color: '#406599',
                                                                        fontSize: 15
                                                                    } ]}
                                                                    onPress={() => {
                                                                        // this.props.navigation.navigate( 'WebViewPage',
                                                                        //     {
                                                                        //         url: item.url,
                                                                        //         webTitle: item.title
                                                                        //
                                                                        //     } )
                                                                        let url = item.url.startsWith( 'http' ) ? item.url : ('http://' + item.url)
                                                                        Linking.openURL( url ).catch( err => console.error( 'An error occurred', err ) );
                                                                    }}>
                                                                    {
                                                                        '  ' + I18n.t( Keys.view_more )
                                                                    }
                                                                </Text>
                                                        )
                                                }
                                            </Text>

                                            {/* 资讯单图 */}
                                            {
                                                (item.picUrl && item.picUrl !== "") ?

                                                <TouchableOpacity
                                                style={{
                                                    maxHeight: picHeight,
                                                    overflow: 'hidden'
                                                }}
                                                onPress={() => {
                                                    this.setState({
                                                        showImage: true,
                                                        images: [{
                                                            url: item.picUrl
                                                        }]
                                                    })
                                                }}>
                                                    <ScaledImage
                                                        style={{
                                                            width: picWidth,
                                                            height: picHeight,
                                                            maxHeight: picHeight
                                                        }}
                                                        uri={item.picUrl}
                                                        width={picWidth}
                                                    />
                                                </TouchableOpacity>

                                                :
                                                null
                                            }
                                        </View>


                                        <View style={[ {
                                            width: 2,
                                            backgroundColor: '#F5F5F5',
                                            position: 'absolute',
                                            left: 14,
                                            top: 0,
                                            bottom: 0
                                        } ]}/>

                                        <View style={[ {
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: constStyles.THEME_COLOR,
                                            position: 'absolute',
                                            left: 12,
                                            top: 19.5,
                                        } ]}/>


                                        <TouchableOpacity
                                            style={[ {
                                                height: 25,
                                                borderRadius: 12.5,
                                                borderWidth: 1,
                                                borderColor: '#1ACE9A',
                                                position: 'absolute',
                                                top: 10,
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                                marginRight: 20,
                                                flexDirection: 'row',
                                                right: 0,
                                            }, commonStyles.justAlignCenter ]}
                                            onPress={() => {
                                                this.props.navigation.navigate( 'NewsSharePage',
                                                    {
                                                        news: item,
                                                        transition: 'forVertical'
                                                    }
                                                );
                                            }}>
                                            <Text
                                                style={[ {
                                                    color: '#1ACE9A',
                                                    textAlign: 'center',
                                                    fontSize: 12
                                                } ]}>
                                                {
                                                    I18n.t( Keys.share )
                                                }
                                            </Text>
                                            <Image
                                                style={[ { width: 10, height: 10, marginLeft: 4 } ]}
                                                source={require( '../../../imgs/news_icon_btnshare.png' )}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableHighlight>


                            );
                        }}
                        loadData={( pageNum, pageSize, callback ) => {
                            this.props.onGetNews( pageNum, pageSize, callback );
                        }}
                        ItemSeparatorComponent={null}
                        hasSectionTitle={true}
                    />

                    <Modal visible={this.state.showImage} transparent={true} animationType={'fade'}>
                        <ImageViewer
                            imageUrls={this.state.images}
                            saveToLocalByLongPress={false}
                            onCancel={() => {
                                this.setState({
                                    showImage: false
                                })
                            }}
                            onClick={() => {
                                this.setState({
                                    showImage: false
                                })
                            }}
                        />
                    </Modal>

                    <View
                        style={[ commonStyles.commonIntervalStyle ]}/>
                </View>
        );

    }
}

class ScaledImage extends Component {
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

export default NewsMeetSelfPageView;


