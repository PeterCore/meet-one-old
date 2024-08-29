/*
 * EOS注册帐号入口首页View
 * @Author: JohnTrump
 * @Date: 2018-07-03 17:02:37
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-07-04 00:54:39
 */

import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform, Image, ImageBackground, Dimensions } from "react-native";
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import I18n from "../../../../I18n";
import Keys from "../../../../configs/Keys";
// import { width } from "window-size";
import NavigationUtil from "../../../../util/NavigationUtil";

export default class EOSAccountRegisterIndexPageView extends React.Component {
    static navigationOptions = (props) => {
        const { navigation } = props;
        return {
            title: I18n.t( Keys.eos_account )
        }
    }

    constructor (props) {
        super(props);
    }

    componentWillMount() {}

    componentDidMount() {}
    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                commonStyles.commonBG]}>
                <View style={[
                    commonStyles.wrapper,
                    {
                        marginLeft: 15,
                        marginRight: 15
                    },
                    {paddingTop: (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0)}]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            this.props.navigation.navigate('EOSAccountRegisterFreshmanPage');
                        }}>
                        {/* 我是新用户入口 */}
                        <ImageBackground
                            source = {require('../../../../imgs/account_register_new.png')}
                            style = {styles.blockWrapper}>
                            <Text style={styles.title}>{I18n.t( Keys.im_new )}</Text>
                            <Text style={styles.subTitle}>{I18n.t( Keys.need_help )}</Text>
                        </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            if (this.props.walletAccount) {
                                this.props.navigation.navigate('EOSAccountRegisterOldmanPage');
                            } else {
                                alert(I18n.t(Keys.eos_only));
                            }
                        }}>
                        {/* 我是老用户 */}
                        <ImageBackground
                            source = {require('../../../../imgs/account_register_old.png')}
                            style = {styles.blockWrapper}>
                            <Text style={styles.title}>{I18n.t( Keys.im_old )}</Text>
                            <Text style={styles.subTitle}>{I18n.t( Keys.help_other )}</Text>
                        </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            NavigationUtil.openWebView(this.props.navigation, {
                                title: I18n.t(Keys.how_to_regist_sub_title),
                                url: I18n.t(Keys.how_to_get_regist_address)
                            });
                        }}>
                        <Text style={{
                            alignSelf: 'center',
                            color: constStyles.THEME_COLOR,
                            marginTop: 35,
                            fontSize: 16}}>
                            {I18n.t(Keys.how_to_regist_title)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}

const { width } = Dimensions.get( 'window' );

const styles = StyleSheet.create({
    blockWrapper: {
        paddingLeft: 0,
        justifyContent: 'center',
        width: '100%',
        height: (width - 30)/355 * 145  // 等比缩放
    },
    title: {
        fontWeight: '700',
        fontSize: 30,
        // 为了对齐
        marginTop: -10,
        marginLeft: 35,
        color: '#fff',
        letterSpacing: 0
    },
    subTitle: {
        marginLeft: 35,
        fontSize: 20,
        lineHeight: 30,
        color: '#fff',
        letterSpacing: 0
    }
});
