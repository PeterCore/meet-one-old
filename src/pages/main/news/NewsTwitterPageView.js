import React, { Component } from 'react';
import { Image, StatusBar, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import moment from "moment/moment";
import DataListView from "./components/DataListView";
import ImageWithPlaceHolder from "../../../components/ImageWithPlaceHolder";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Autolink from 'react-native-autolink';
import AnalyticsUtil from "../../../util/AnalyticsUtil";

let addresKey = 'addresKey';

class NewsTwitterPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.news_type_title_twitter ),
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
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
        this.props.navigation.setParams( {
            onFocusedTabClick: this._onTabClick.bind( this )
        } )
    }

    componentWillUnmount() {
    }

    _onTabClick() {
        // console.log('_onTabClick')
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
                                    style={[ {} ]}>
                                    <View>
                                        <View style={[ {
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            paddingLeft: 15,
                                            paddingRight: 15,
                                        } ]}>
                                            <View style={[ {
                                                flexDirection: 'row'
                                            } ]}>
                                                <ImageWithPlaceHolder
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 18,
                                                    }}
                                                    placeholderForIcon={'md-image'}
                                                    source={{ uri: item.authorLogo }}
                                                />


                                                <View style={[ {}, commonStyles.wrapper, {
                                                    marginLeft: 10,
                                                    marginTop: 2
                                                } ]}>
                                                    <Text style={[ {
                                                        fontSize: 15,
                                                        fontWeight: 'bold'
                                                    }, commonStyles.commonTextColorStyle ]}>{item.auth}</Text>
                                                    <Text style={[ {
                                                        fontSize: 12,
                                                        marginTop: 2
                                                    }, commonStyles.commonSubTextColorStyle ]}
                                                          numberOfLines={1}>
                                                        {
                                                            moment( item.time ).format( moment( item.time ).isSame( moment(), 'year' ) ? 'M-D' : 'YYYY-M-D' )
                                                            + ' ' + moment( item.time ).format( 'HH:mm' )
                                                        }
                                                    </Text>
                                                </View>
                                            </View>

                                            {/*<View style={[ {}, commonStyles.wrapper, {*/}
                                            {/*backgroundColor: '#FAFAFA',*/}
                                            {/*borderRadius: 2,*/}
                                            {/*padding: 10,*/}
                                            {/*marginTop: 10,*/}
                                            {/*} ]}>*/}

                                            <Autolink style={[ {
                                                fontSize: 16, lineHeight: 24, marginTop: 10,
                                                color: '#323232'
                                            } ]}

                                                      linkStyle={{ color: '#466996' }}
                                                      url={true}
                                                      stripPrefix={false}
                                                      text={item.content}
                                                      phone={false}
                                            />

                                            <View style={[ commonStyles.commonIntervalStyle, {
                                                marginTop: 15,
                                                marginBottom: 11
                                            } ]}/>
                                            <Text style={[ {
                                                fontSize: 14,
                                            }, commonStyles.commonSubTextColorStyle ]}>{'自动翻译：'}</Text>

                                            <Autolink style={[ {
                                                fontSize: 14, lineHeight: 22, marginTop: 5,
                                                color: '#323232'
                                            } ]}

                                                      linkStyle={{ color: '#466996' }}
                                                      url={true}
                                                      stripPrefix={false}
                                                      text={item.contentTranslated}
                                                      phone={false}
                                            />
                                            {/*</View>*/}


                                            <TouchableOpacity
                                                style={[ {
                                                    height: 25,
                                                    borderRadius: 12.5,
                                                    borderWidth: 1,
                                                    borderColor: '#1ACE9A',
                                                    position: 'absolute',
                                                    top: 20,
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                    marginRight: 15,
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
                                                    style={[ { width: 10, height: 10, marginLeft: 2 } ]}
                                                    source={require( '../../../imgs/news_icon_btnshare.png' )}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableHighlight>


                            );
                        }}
                        loadData={( pageNum, pageSize, callback ) => {
                            this.props.onGetNews( pageNum, pageSize, callback );
                        }}
                        ItemSeparatorComponent={<View style={[ commonStyles.newsIntervalStyle ]}/>}
                        hasSectionTitle={false}
                    />

                    <View
                        style={[ commonStyles.commonIntervalStyle ]}/>

                </View>
        );

    }
}


export default NewsTwitterPageView;


