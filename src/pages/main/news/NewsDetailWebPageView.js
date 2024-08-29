import React, { Component } from 'react';
import { Image, StatusBar, Text, TouchableHighlight, View, WebView } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";


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
                <View style={[ commonStyles.wrapper, { backgroundColor: 'white' }, ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>
                    <View style={[ commonStyles.wrapper ]}>
                        <WebView
                            source={{ uri: this.props.news.url + "" }}
                        />
                    </View>

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


