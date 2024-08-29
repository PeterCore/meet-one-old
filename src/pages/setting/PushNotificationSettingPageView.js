import React, { Component } from 'react';
import { Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";

let addresKey = 'addresKey';

class PushNotificationSettingPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.push_setting_title ),
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            enableImportantNewsNotification: props.enableImportantNewsNotification
        }
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
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, {
                    paddingTop: 20,
                    paddingBottom: 20,
                } ]}>

                    <View style={[ {
                        flexDirection: 'row', backgroundColor: 'white', paddingTop: 10,
                        paddingBottom: 10, paddingLeft: 20, paddingRight: 20
                    }, commonStyles.justAlignCenter ]}>
                        <Text style={[ {
                            fontSize: 14,
                        }, commonStyles.commonTextColorStyle, commonStyles.wrapper ]}>
                            {I18n.t( Keys.push_setting_title )}
                        </Text>

                        <Switch
                            onValueChange={( value ) => {
                                if ( value ) {
                                    this.setState( {
                                        enableImportantNewsNotification: true
                                    } );
                                    this.props.onChangePushSetting( true );
                                } else {
                                    this.setState( {
                                        enableImportantNewsNotification: false
                                    } );
                                    this.props.onChangePushSetting( false )
                                }
                            }}
                            value={this.state.enableImportantNewsNotification}/>
                    </View>

                </View>
            </SafeAreaView>

        );

    }
}


export default PushNotificationSettingPageView;


