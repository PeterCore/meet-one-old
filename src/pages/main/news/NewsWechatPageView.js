import React, { Component } from 'react';
import { StatusBar, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import moment from "moment/moment";
import DataListView from "./components/DataListView";
import ImageWithPlaceHolder from "../../../components/ImageWithPlaceHolder";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

let addresKey = 'addresKey';

class NewsWechatPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.news_type_title_wechat ),
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
        console.log( '_onTabClick lastTabClickTs=' + this.lastTabClickTs )
        console.log( '_onTabClick currentTs=' + currentTs )
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
                                    onPress={() => {
                                        this.props.navigation.navigate( 'NewsDetailWebPage',
                                            {
                                                news: item,
                                            }
                                        );
                                    }}
                                    style={[ {} ]}>
                                    <View>
                                        <View style={[ {
                                            paddingTop: 18,
                                            paddingBottom: 18,
                                            paddingLeft: 15,
                                            paddingRight: 15,
                                            flexDirection: 'row',
                                            height: 110
                                        } ]}>
                                            <View style={[ {}, commonStyles.wrapper, {
                                                marginEnd: 20,
                                                justifyContent: 'space-between'
                                            } ]}>
                                                <Text style={[ {
                                                    fontSize: 17, lineHeight: 24,
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
                                                        {
                                                            moment( item.time ).format( moment( item.time ).isSame( moment(), 'year' ) ? 'M-DD' : 'YYYY-M-D' )
                                                            + ' ' + moment( item.time ).format( 'HH:mm' )
                                                        }
                                                    </Text>
                                                </View>
                                            </View>

                                            <ImageWithPlaceHolder
                                                style={{
                                                    width: 70,
                                                    height: 70,
                                                    marginTop: 2,
                                                    marginBottom: 2
                                                }}
                                                placeholderForIcon={'md-image'}
                                                source={{ uri: item.picUrl }}
                                            />
                                        </View>
                                    </View>
                                </TouchableHighlight>


                            );
                        }}
                        loadData={( pageNum, pageSize, callback ) => {
                            this.props.onGetNews( pageNum, pageSize, callback );
                        }}
                        ItemSeparatorComponent={<View
                            style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>}
                        hasSectionTitle={false}
                    />


                    <View
                        style={[ commonStyles.commonIntervalStyle ]}/>
                </View>
        );

    }
}


export default NewsWechatPageView;


