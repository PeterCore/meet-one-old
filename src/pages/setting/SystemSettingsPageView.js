import React, { Component } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import TouchableItemComponent from "../../components/TouchableItemComponent";
import commonStyles from "../../styles/commonStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";

class SystemSettingsPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.system_settings ),
        };
    };

    constructor( props ) {
        super( props );
    }

    componentWillMount() {
    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    render() {

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={commonStyles.container}>


                    <StatusBar backgroundColor={'#3e9ce9'}/>

                    <TouchableItemComponent
                        containerStyle={[{}]}
                        title={I18n.t( Keys.language_setting_title )}
                        onPress={() => {
                            this.props.onTapLanguageSelect();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[{}]}
                        title={ I18n.t( Keys.eos_node_selection ) }
                        onPress={() => {
                            this.props.navigation.navigate( 'EOSNetWorkChangePage' )
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[{}]}
                        title={'解锁与安全'}
                        onPress={() => {
                            this.props.navigation.navigate( 'ApplicationSecureSettingPage' );
                        }}
                        headerInterval={true}
                        footerInterval={true}/>

                    {/* <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={I18n.t( Keys.push_setting_title )}
                        onPress={() => {
                            this.props.onTapPushNotificationSetting();
                        }}
                        headerInterval={true}
                        footerInterval={false}/> */}
                </View>
            </SafeAreaView>
        );

    }
}

export default SystemSettingsPageView;
