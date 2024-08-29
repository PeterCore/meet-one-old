import React, { Component } from 'react';
import { Image, ScrollView, StatusBar, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import TimeUtil from "../../../util/TimeUtil";


let addresKey = 'addresKey';

class NewsDetailPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: null,
        };
    };


    constructor( props ) {
        super( props );

        this.state = {}
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
    }

    componentWillUnmount() {
    }

    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>
                    <ScrollView style={[ commonStyles.wrapper, {} ]}>
                        <View style={[ commonStyles.wrapper, {
                            paddingTop: 10,
                            paddingBottom: 0,
                            paddingLeft: 15,
                            paddingRight: 15
                        } ]}>
                            <Text
                                style={[
                                    {
                                        fontSize: 22,
                                        fontWeight: 'bold',
                                        lineHeight: 30
                                    }, commonStyles.commonTextColorStyle
                                ]}
                            >
                                {this.props.news.title}
                            </Text>
                            <Text
                                style={[
                                    {
                                        fontSize: 12,
                                        marginTop: 10
                                    }, commonStyles.commonSubTextColorStyle ]}
                            >
                                {TimeUtil.formatWithTimeZone( this.props.news.time )}
                            </Text>

                            <Text
                                style={[
                                    { fontSize: 18, color: '#444444', paddingBottom: 20, lineHeight: 28, marginTop: 20 }
                                ]}
                            >
                                {this.props.news.content}
                            </Text>

                        </View>

                    </ScrollView>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <TouchableHighlight
                        underlayColor='#f7f7f7'
                        onPress={() => {

                            this.props.navigation.navigate( 'NewsSharePage',
                                {
                                    news: this.props.news,
                                    transition: 'forVertical'
                                }
                            );
                        }}
                        style={[ {} ]}>
                        <View style={[ { height: 50 }, commonStyles.justAlignCenter ]}>
                            <View style={[ {
                                flexDirection: 'row'
                            } ]}>
                                <Image
                                    source={require( '../../../imgs/news_icon_share.png' )}
                                    style={[ { width: 20, height: 20 } ]}
                                />
                                <Text style={[ { fontSize: 18, marginLeft: 10, color: constStyles.THEME_COLOR }, ]}
                                      numberOfLines={3}>
                                    {I18n.t( Keys.share_title )}
                                </Text>
                            </View>

                        </View>
                    </TouchableHighlight>


                </View>
            </SafeAreaView>
        )
            ;

    }
}


export default NewsDetailPageView;


