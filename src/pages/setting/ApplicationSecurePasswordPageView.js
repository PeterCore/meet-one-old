import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import TouchID from 'react-native-touch-id';
import commonStyles from '../../styles/commonStyles';
import PasswordInputComponentWithDash from "../../components/PasswordInputComponentWithDash";
import settingActionTypes from "../../reducers/setting/settingActionTypes";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import URLRouteUtil from "../../util/URLRouteUtil";
import { connect } from "react-redux";

class ApplicationSecurePasswordPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        let config = {
            title: I18n.t(Keys.application_lock_psw_setting),
            // 无导航栏
            headerLeft: null,
            headerRight: (
                <TouchableOpacity
                    style={commonStyles.top_info_right_btn}
                    onPress={() => {
                        // 执行取消回调
                        params && params.cancelCallback && params.cancelCallback();
                        navigation.goBack();
                    }} >
                    <Text style={{
                        fontSize: 16,
                        color: '#323232',
                    }}> {I18n.t(Keys.cancel)} </Text>
                </TouchableOpacity>
            ),
            headerStyle: {
                borderBottomWidth: 0,
                backgroundColor: '#fff'
            },
            // 禁止右滑后退
            gesturesEnabled: false,
        }

        if (params.type === 'unlock') {
            config = Object.assign({}, config , {
                title: '',
                header: null,
                headerLeft: null,
                headerRight: null
            });
        } else if (params.type === 'setting_close') {
            config = Object.assign({}, config, {
                title: I18n.t(Keys.application_lock_auth_required)
            });
        }
        return config;
    }

    constructor(props) {
        super(props);
        this.state = {
            // 失败次数
            errorTimes: 0,
            errorTips: '',
            isVerify: false,
            isPasswordCorrect: false,
            password: '',
            // step = 0 -> 输入密码
            // step = 1 -> 再次输入密码
            step: 0
        }

        this._onBack = this.onBack.bind( this );
    }

    onBack() {
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener( 'hardwareBackPress', this._onBack );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener( 'hardwareBackPress', this._onBack )
    }

    // 密码验证成功处理逻辑
    _handleSuccess() {
        this.props.navigation.goBack();
        this.props.dispatch({
            type: settingActionTypes.APPLICATION_NUMBER_UNLOCK,
            isNumberUnlock: false
        })
    }

    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                {
                    backgroundColor: '#fff',
                }]}>
                    <View
                        style={{
                            alignItems: 'center'
                        }}>
                        {/* 请输入密码文案 */}
                        <Text style={{
                            marginTop: 100,
                            fontSize: 20,
                            fontWeight: '800',
                            color: '#323232',
                            textAlign: 'center'
                        }}>
                            {
                                this.props.navigation.state.params.type === 'setting_modify' ? (
                                    this.state.isPasswordCorrect ? I18n.t(Keys.application_lock_psw_input) : I18n.t(Keys.application_lock_old_psw_input)
                                ) : I18n.t(Keys.application_lock_psw_input)
                            }
                        </Text>

                        {/* 密码输入框 - setting_close */}
                        {
                            this.props.navigation.state &&
                            this.props.navigation.state.params &&
                            this.props.navigation.state.params.type === 'setting_close' ?
                            (
                            <PasswordInputComponentWithDash
                                style={{
                                    marginTop: 30
                                }}
                                ref={(passwordInput) => {
                                    this._passwordInput = passwordInput;
                                }}
                                maxLength={6}
                                onChange={(text) => {
                                    if (this.state.errorTips) {
                                        // 消除错误提示
                                        this.setState({ errorTips: '' });
                                    }
                                }}
                                onEnd={(text) => {
                                    setTimeout(() => {
                                        if (this.props.applicationPsw === text) {
                                            // 密码判断正确
                                            // 执行成功的回调
                                            this.props.navigation.state.params && this.props.navigation.state.params.successCallback && this.props.navigation.state.params.successCallback();
                                            this.props.navigation.goBack();
                                        } else {
                                            // 判断，如果错误的话，失败次数+1
                                            this.setState({
                                                errorTimes: ++this.state.errorTimes,
                                                errorTips: I18n.t(Keys.application_lock_psw_error),
                                            }, () => {
                                                this._passwordInput._clearInput();
                                            });
                                        }
                                    }, 150);
                                }}/>
                            ) : null
                        }

                        {/* 密码输入框 - 原密码 - setting */}
                        {
                            this.props.navigation.state &&
                            this.props.navigation.state.params &&
                            this.props.navigation.state.params.type === 'setting_modify' &&
                            !this.state.isPasswordCorrect ?
                            (
                                <PasswordInputComponentWithDash
                                    style={{
                                        marginTop: 30
                                    }}
                                    ref={(passwordInput) => {
                                        this._passwordInput = passwordInput;
                                    }}
                                    maxLength={6}
                                    onChange={(text) => {
                                        if (this.state.errorTips) {
                                            // 消除错误提示
                                            this.setState({ errorTips: '' });
                                        }
                                    }}
                                    onEnd={(text) => {
                                        setTimeout(() => {
                                            if (this.props.applicationPsw === text) {
                                                // 验证成功
                                                this.setState({ isPasswordCorrect: true });
                                            } else {
                                                // 判断，如果错误的话，失败次数+1
                                                this.setState({
                                                    errorTimes: ++this.state.errorTimes,
                                                    errorTips: I18n.t(Keys.application_lock_psw_error),
                                                }, () => {
                                                    this._passwordInput._clearInput();
                                                });
                                            }
                                        }, 150);
                                    }}/>
                            ) : null
                        }

                        {/* 密码输入框 - 新密码 - setting */}
                        {
                            this.props.navigation.state &&
                            this.props.navigation.state.params &&
                            (
                                (this.props.navigation.state.params.type === 'setting' && !this.state.isVerify) ||
                                (this.props.navigation.state.params.type === 'setting_modify' && this.state.step === 0 && this.state.isPasswordCorrect)
                            ) ?
                            (
                                <PasswordInputComponentWithDash
                                    style={{marginTop: 30}}
                                    maxLength={6}
                                    onChange={(text) => {
                                        if (this.state.errorTips && text.length < 6) {
                                            this.setState({
                                                errorTips: ''
                                            });
                                        }
                                    }}
                                    onEnd={(text) => {
                                        setTimeout(() => {
                                            // 输入完成后自动触发的逻辑
                                            this.setState({
                                                password: text,
                                                step: 1,
                                                isVerify: true
                                            });
                                        }, 150);
                                    }}
                                />
                            ) : null
                        }

                        {/* 再次输入密码 - setting */}
                        {
                            this.props.navigation.state &&
                            this.props.navigation.state.params &&
                            (
                                (this.props.navigation.state.params.type === 'setting' && this.state.isVerify) ||
                                (this.props.navigation.state.params.type === 'setting_modify' && this.state.step === 1)
                            ) ?
                            (
                                <PasswordInputComponentWithDash
                                    style={{marginTop: 30}}
                                    maxLength={6}
                                    onChange={(text) => { }}
                                    onEnd={(text) => {
                                        setTimeout(() => {
                                            // 验证一下
                                            if (this.state.password && this.state.password === text) {
                                                // 验证通过, 更新密码
                                                this.props.dispatch({
                                                    type: settingActionTypes.APPLICATION_PASSWORD_UPDATE,
                                                    applicationPsw: text
                                                });
                                                TouchID.isSupported()
                                                    .then(biometryType => {
                                                        if (biometryType === 'FaceID') {
                                                            this.props.dispatch({
                                                                type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                                                                biologyType: 'FaceID'
                                                            });
                                                        } else {
                                                            this.props.dispatch({
                                                                type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                                                                biologyType: 'TouchID'
                                                            });
                                                        }
                                                    })
                                                    .finally(() => {
                                                        // 执行成功的回调
                                                        this.props.navigation.state.params && this.props.navigation.state.params.successCallback && this.props.navigation.state.params.successCallback();
                                                        this.props.navigation.goBack();
                                                    })
                                                    .catch(error => {
                                                        this.props.dispatch({
                                                            type: settingActionTypes.APPLICATION_LOCK_BIOLOGY_TYPE,
                                                            biologyType: null
                                                        });
                                                    })
                                            } else {
                                                this.setState({
                                                    errorTips: I18n.t(Keys.application_lock_psw_error),
                                                    isVerify: false,
                                                    password: ''
                                                })
                                            }
                                        }, 150);
                                    }}
                                />
                            ) : null
                        }

                        {/* 密码输入框 - unlock */}
                        {
                            this.props.navigation.state &&
                            this.props.navigation.state.params &&
                            this.props.navigation.state.params.type === 'unlock' ?
                            (
                                <PasswordInputComponentWithDash
                                    style={{
                                        marginTop: 30
                                    }}
                                    ref={(passwordInput) => {
                                        this._passwordInput = passwordInput;
                                    }}
                                    maxLength={6}
                                    onChange={(text) => {
                                        if (this.state.errorTips) {
                                            // 消除错误提示
                                            this.setState({ errorTips: '' });
                                        }
                                    }}
                                    onEnd={(text) => {
                                        setTimeout(() => {
                                            if (this.props.applicationPsw === text) {
                                                this._handleSuccess();
                                                if (this.props.waitingComponent && this.props.waitingURI) {
                                                    URLRouteUtil.handleOpenURL(this.props.waitingComponent, this.props.waitingURI, (err, res) => {
                                                        console.log(err, res);
                                                    });
                                                }
                                            } else {
                                                // 判断，如果错误的话，失败次数+1
                                                this.setState({
                                                    errorTimes: ++this.state.errorTimes,
                                                    errorTips: I18n.t(Keys.application_lock_psw_error),
                                                }, () => {
                                                    this._passwordInput._clearInput();
                                                });
                                            }
                                        }, 150);
                                    }}/>
                            ) : null
                        }

                        {/* 密码错误提示 - unlock */}
                        {
                            this.state.errorTips ? (
                                <View
                                    style={[
                                        styles.tipsWrapperStyle,
                                        { backgroundColor: 'rgba(246,88,88,0.10)' }
                                    ]}>
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 14,
                                            lineHeight: 32,
                                            color: '#F65858'
                                        }}>{this.state.errorTips}</Text>
                                </View>
                            ) : null
                        }

                        {/* 再次输入密码提示 - setting */}
                        {
                            this.state.isVerify ? (
                                <View
                                    style={[
                                        styles.tipsWrapperStyle,
                                        {backgroundColor: 'rgba(26, 206, 154, 0.10)'}
                                    ]}>
                                    <Text style={[
                                        styles.tipsFontStyle,
                                        { color: '#1ace9a' }
                                    ]}>{I18n.t(Keys.application_lock_psw_verify)}</Text>
                                </View>
                            ) : null
                        }
                    </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    tipsWrapperStyle: {
        marginTop: 50,
        paddingHorizontal: 15,
        height: 32,
        borderRadius: 16
    },
    tipsFontStyle: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 32
    },
    underLinePlaceholder: {
        width: 30,
        height: 2,
        backgroundColor: '#1ACE9A',
        marginHorizontal: 1
    }
});

function select( store ) {
    return {
        waitingURI: store.settingStore.waitingURI,
        waitingComponent: store.settingStore.waitingComponent
    };
}

export default connect( select )( ApplicationSecurePasswordPageView );
