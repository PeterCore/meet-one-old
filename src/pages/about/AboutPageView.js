import React, { Component } from 'react';
import { Clipboard, Image, StatusBar, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import TouchableItemComponent from "../../components/TouchableItemComponent";
import commonStyles from "../../styles/commonStyles";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import constants from "../../constants/constants";
import format from "string-format";
import Toast from "react-native-root-toast";
import { SafeAreaView } from 'react-navigation';
import AnalyticsUtil from '../../util/AnalyticsUtil';

import WebAddressInputComponent from "./WebAddressInputComponent";

var DeviceInfo = require( 'react-native-device-info' );
let addresKey = 'addresKey';

class AboutPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {

            title: I18n.t( Keys.about_us ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            counter: 0,
            showDialog: false
        }
    }

    componentDidMount () {
        AnalyticsUtil.onEvent('OTaboutus');
    }

    showChainChangeBtn () {
        if (this.state.counter < 9) {
            this.setState((prevState, props) => {
                return {
                    counter: prevState.counter + 1
                };
            })
        } else {
            this.setState({
                counter: 0
            })
            this.props.showChangeChainBtn();
        }
    }

    render() {

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>


                    <Image
                        source={require( '../../imgs/login_logo.png' )}
                        style={[ { width: 74, height: 101, marginTop: 10, alignSelf: 'center' } ]}
                    />

                    <Text
                        style={[
                            commonStyles.commonTextColorStyle,
                            {
                                fontSize: 20,
                                alignSelf: 'center',
                                marginTop: 10
                            },
                        ]}
                    >
                        MEET.ONE
                    </Text>

                    <Text
                        style={[ commonStyles.commonSmallSubTextStyle, { alignSelf: 'center' } ]}
                    >
                        {
                            I18n.t( Keys.eos_entrance )
                        }
                    </Text>

                    <TouchableOpacity onPress={() => {
                        this.showChainChangeBtn()
                    }}>
                        <Text
                            style={[ commonStyles.commonSubTextColorStyle, {
                                alignSelf: 'center',
                                marginTop: 15,
                                fontSize: 12
                            } ]}
                        >
                            {
                                format( I18n.t( Keys.current_version ), DeviceInfo.getVersion() )
                            }
                        </Text>
                    </TouchableOpacity>

                    <TouchableItemComponent
                        containerStyle={[ { marginTop: 15 } ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.user_agreement )}
                        onPress={() => {
                            this.props.openTerms(this.props.language);
                        }}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        headerInterval={false}
                        footerInterval={true}/>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.privacy )}
                        onPress={() => {
                            this.props.openTerms(this.props.language);
                        }}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        headerInterval={false}
                        footerInterval={true}/>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.wechat_public_account )}
                        onPress={() => {
                            Clipboard.setString( constants.WECHAT_PUBLIC_ACCOUNT );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        content={"EOSMeetOne"}
                        hideRightNav={true}
                        headerInterval={false}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={'Telegram'}
                        onPress={() => {
                            this.props.openTelegramWebsit(this.props.language);
                        }}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        headerInterval={false}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.submit_dapp )}
                        onPress={() => {
                            this.props.openSubmitDAppPage(this.props.language);
                        }}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        headerInterval={false}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.official_website )}
                        onPress={() => {
                            this.props.openOfficalWebsit();
                        }}
                        headerInterval={false}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.help_center )}
                        onPress={() => {
                            this.props.openHelpCenter(this.props.language);
                        }}
                        headerInterval={false}
                        footerInterval={true}/>

                    {
                        this.props.showChangeBtn ?
                        <TouchableItemComponent
                            containerStyle={[ {} ]}
                            style={[ styles.itemHeight ]}
                            title={'网络设置'}
                            onPress={() => {
                                this.props.openChainChangePage();
                            }}
                            headerInterval={false}
                            footerInterval={true}/>
                        :
                        null
                    }

                    <WebAddressInputComponent
                        isOpen={this.state.showDialog}
                        onResult={( address ) => {
                            this.props.navigation.navigate( 'WebViewPage', {
                                url: address
                            })
                        }}
                        onClose={() => {
                            this.setState( {
                                showDialog: false
                            } );
                        }}
                    />
                </ScrollView>
            </SafeAreaView>
        );

    }

}

const styles = StyleSheet.create( {
    itemHeight: {
        height: 64
    }
} );

export default AboutPageView;


