import React, { Component } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import TouchableItemComponent from "../../components/TouchableItemComponent";
import commonStyles from "../../styles/commonStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import AnalyticsUtil from "../../util/AnalyticsUtil";

let addresKey = 'addresKey';

class LanguageSettingPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.language_setting_title ),
        };
    };

    constructor( props ) {
        super( props );
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        AnalyticsUtil.onEvent('OTlanguage');
    }

    componentWillUnmount() {
    }


    render() {

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={I18n.t( Keys.language_chinese )}
                        onPress={() => {
                            this.props.onChangeLanguage( 'zh-CN' );
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={I18n.t( Keys.language_english )}
                        onPress={() => {
                            this.props.onChangeLanguage( 'en-US' );
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={I18n.t( Keys.language_korean )}
                        onPress={() => {
                            this.props.onChangeLanguage( 'ko-KR' );
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={I18n.t( Keys.language_japanese )}
                        onPress={() => {
                            this.props.onChangeLanguage( 'ja-JP' );
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                </View>
            </SafeAreaView>

        );

    }
}


export default LanguageSettingPageView;


