import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import TouchableItemComponent from "../../components/TouchableItemComponent";

class DebugPageView extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: 'Debug',
        };
    };

    constructor( props ) {
        super( props );
        this.state = {};
    }

    componentWillUnmount() {
    }

    componentDidMount() {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.commonBorderTop ]}>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"FCM通知通知"}
                        onPress={() => {
                            this.props.onTapFCMPushTest();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"信鸽通知通知"}
                        onPress={() => {
                            this.props.onTapXGPushTest();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"验证码测试"}
                        onPress={() => {
                            this.props.onTapVerifyTest();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"分享测试"}
                        onPress={() => {
                            this.props.onTapShareTest();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"扫描本地文件"}
                        onPress={() => {
                            this.props.onTapScanLocalTest();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"EOS"}
                        onPress={() => {
                            this.props.onTapEOS();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"WebView测试@1"}
                        onPress={() => {
                            this.props.onTabWebview('https://meet.one/test/index.html');
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"WebView测试@2"}
                        onPress={() => {
                            this.props.onTabWebview('https://meet.one/test/index@2.html');
                        }}
                        headerInterval={true}
                        footerInterval={false}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        title={"公私钥界面"}
                        onPress={() => {
                            this.props.onTapEOSGenerator();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                    <TouchableItemComponent
                        containerStyle={[{}]}
                        title={"游戏中心入口"}
                        onPress={() => {
                            this.props.onTapGameCenter();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                    <TouchableItemComponent
                        containerStyle={[{}]}
                        title={"REX入口"}
                        onPress={() => {
                            this.props.onTabREX();
                        }}
                        headerInterval={true}
                        footerInterval={false}/>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

export default DebugPageView;
