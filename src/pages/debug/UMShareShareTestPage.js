/**
 * Created by wangfei on 17/8/28.
 */
/**
 * Created by wangfei on 17/8/28.
 */
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import ColorUtil from '../ColorUtil'
import ShareUtile from '../../../native/ShareUtil'
import commonStyles from "../../styles/commonStyles";

export default class UMShareShareTestPage extends Component {
    constructor( props ) {
        super( props );
        this.state = { result: "结果" };
    }

    sinashare() {
        // alert('ok');
        ShareUtile.share( 'sssss', '/storage/emulated/0/Android/data/one.meet/files/tmp.png', 'http://www.umeng.com/', 'title', 1, ( code, message ) => {
            this.setState( { result: message } );
        } );

        // ShareUtile.share( 'sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 1, ( code, message ) => {
        //     this.setState( { result: message } );
        // } );
    }

    qqshare() {
        ShareUtile.share( 'sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 0, ( code, message ) => {
            this.setState( { result: message } );

        } );
    }

    wxshare() {
        ShareUtile.share( 'sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 2, ( code, message ) => {
            this.setState( { result: message } );

        } );
    }

    shareboard() {
        var list = [ 0, 1, 2 ]
        ShareUtile.shareboard( 'sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', list, ( code, message ) => {
            this.setState( { result: message } );

        } );
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={styles.u_c}>
                    <Text>{this.state.result}</Text>
                    <TouchableOpacity
                        style={styles.u_c_item}
                        onPress={this.sinashare.bind( this )}
                    >
                        <Text style={styles.u_c_text}>{'新浪分享'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.u_c_item}
                        onPress={this.wxshare.bind( this )}
                    >
                        <Text style={styles.u_c_text}>{'微信分享'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.u_c_item}
                        onPress={this.qqshare.bind( this )}
                    >
                        <Text style={styles.u_c_text}>{'QQ分享'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.u_c_item}
                        onPress={this.shareboard.bind( this )}
                    >
                        <Text style={styles.u_c_text}>{'分享面板'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
    u_c: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: ColorUtil.background,
    },
    u_c_item: {
        margin: 10,
        backgroundColor: ColorUtil.default_primary_color,
        elevation: 10,
        borderColor: ColorUtil.default_primary_color,
        borderRadius: 15,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 0 },
        shadowColor: ColorUtil.default_primary_color,
        shadowOpacity: 1,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',

    },
    u_c_text: {
        fontSize: 26,

        color: ColorUtil.text_primary_color
    },
} );