import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from '../../styles/commonStyles';
import CustomSwitch from '../../components/CustomSwitch';
import TouchableItemComponent from '../../components/TouchableItemComponent';
import I18n from '../../I18n';
import Keys from '../../configs/Keys';
import AnalyticsUtil from "../../util/AnalyticsUtil";


class ApplicationSecureSettingPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t(Keys.application_lock)
        }
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                {/* <Text>
                    { JSON.stringify(this.props) }
                </Text> */}
                <View style={commonStyles.container}>

                    {/* 登录密码 */}
                    <TouchableItemComponent
                        onPress={() => {
                            this.enableLock._toggleSwitch();
                        }}
                        rightNav={
                            <CustomSwitch
                                modalStyle={styles.modalStyle}
                                ref={(component) => {this.enableLock = component}}
                                toggleAction={(value) => {
                                    if (this.props.enableLock) {
                                        // 关闭密码验证前验证一下应用密码
                                        this.props.navigation.navigate({
                                            routeName: 'ApplicationSecurePasswordPage',
                                            params: {
                                                type: 'setting_close',
                                                successCallback: () => {
                                                    // close application password
                                                    this.props.onTapEnableLock(value);
                                                },
                                                cancelCallback: () => {
                                                    this.enableLock._toggleSwitch();
                                                }
                                            }
                                        })
                                    } else {
                                        // open application password
                                        this.props.navigation.navigate({
                                            routeName: 'ApplicationSecurePasswordPage',
                                            params: {
                                                type: 'setting',
                                                successCallback: () => {
                                                    AnalyticsUtil.onEvent('OTsafelogin');
                                                    this.props.onTapEnableLock(value);
                                                },
                                                cancelCallback: () => {
                                                    this.enableLock._toggleSwitch();
                                                }
                                            }
                                        });
                                    }
                                }}
                                switchStatus={this.props.enableLock}/>
                        }
                        hideRightNav={true}
                        title={I18n.t(Keys.application_lock_login_psw)}
                        headerInterval={false}
                        footerInterval={true} />

                    {
                        this.props.enableLock ?
                        <View>
                            <TouchableItemComponent
                                // 修改密码
                                containerStyle={[{}]}
                                title={I18n.t(Keys.application_lock_modify_psw)}
                                onPress={() => {
                                    this.props.navigation.navigate({
                                        routeName: 'ApplicationSecurePasswordPage',
                                        params: {
                                            type: 'setting_modify'
                                        }
                                    })
                                }}
                                headerInterval={true}
                                footerInterval={true}/>

                            {/* 设置指纹 */}
                            {
                                this.props.biologyType !== null ? (
                                <TouchableItemComponent
                                    // 指纹密码
                                    onPress={() => {
                                        this.enableBiologyId._toggleSwitch();
                                    }}
                                    rightNav={
                                        <CustomSwitch
                                            modalStyle={styles.modalStyle}
                                            ref={(component) => {this.enableBiologyId= component}}
                                            toggleAction={(value) => {
                                                this.props.onTapEnableBiologyId(value);
                                            }}
                                            switchStatus={this.props.enableBiologyId}/>
                                    }
                                    hideRightNav={true}
                                    title={
                                        this.props.biologyType === 'TouchID' ?
                                        I18n.t(Keys.application_lock_fingerprint) :
                                        this.props.biologyType === 'FaceID' ?
                                        I18n.t(Keys.application_lock_face) : null
                                    }
                                    headerInterval={true}
                                    footerInterval={true} />
                                ) : null
                            }

                            <TouchableItemComponent
                                // 进入后台立即锁定
                                onPress={() => {
                                    this.enableLockWhenBackground._toggleSwitch();
                                }}
                                rightNav={
                                    <CustomSwitch
                                        modalStyle={styles.modalStyle}
                                        ref={(component) => {this.enableLockWhenBackground= component}}
                                        toggleAction={(value) => {
                                            this.props.onTapEnableBackground(value);
                                        }}
                                        switchStatus={this.props.enableLockWhenBackground}/>
                                }
                                hideRightNav={true}
                                title={I18n.t(Keys.application_lock_background)}
                                headerInterval={true}
                                footerInterval={true} />
                        </View>
                        :
                        null
                    }

                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    // 需要从外面传递给CustomSwitch组件覆盖原来组件的样式
    modalStyle: {
        position: 'absolute',
        width: '100%',
        height: '135%',
        left: 0,
        top: 0,
        zIndex: 2
    }
});

export default ApplicationSecureSettingPageView;
