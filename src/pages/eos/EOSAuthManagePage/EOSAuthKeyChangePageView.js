import React, { Component } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LoadingView from "../../../components/LoadingView";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";
import TextUtil from '../../../util/TextUtil';
import { handleError } from "../../../net/parse/eosParse";
import { NavigationActions } from "react-navigation";
import Toast from "react-native-root-toast";

class EOSAuthManagePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.auth_change_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            newPublicKey: '',
            errorMsg0: '',
            newAccountName: '',
            errorMsg1: '',

            isDelete: false,   // true 删除  false 变更
            isRequesting: false,
            isPswdOpen: false
        };
    }
    // 验证公钥合理
    _validateAccountKey() {
        const newPublicKey = this.state.newPublicKey;
        if (newPublicKey.length > 0) {
            if (newPublicKey && /^EOS|eos/.test(newPublicKey) && newPublicKey.length === 53) {
                this.setState({
                    errorMsg0: ''
                });
            } else {
                this.setState({
                    errorMsg0: I18n.t( Keys.old_account_errorMsg0 )
                });
            }
        }
    }

    // 验证账号名
    _validateAccountName() {
        const newAccountName = this.state.newAccountName;
        if (newAccountName.length > 0) {
            if ( !newAccountName.match(/^[1-5\.a-z]{1,12}$/g)) {
                this.setState({
                    errorMsg1: I18n.t( Keys.please_input_correct_account )
                });
                return;
            }

            this.setState({
                errorMsg1: I18n.t(Keys.loading)
            });

            // 向节点查询注册状态
            this.props.getAccountPost({}, {accountName: newAccountName}, () => {
                // 未被注册
                this.setState({
                    errorMsg1: I18n.t(Keys.account_not_exist)
                });
            }, () => {
                // 已被注册
                this.setState({
                    errorMsg1: ''
                });
            })
        }
    }

    // 按钮状态
    _isNextButtonDisabled() {
        if (this.props.permissionData.is_account) {
            return TextUtil.isEmpty( this.state.newAccountName) || !TextUtil.isEmpty(this.state.errorMsg1)
        } else {
            return TextUtil.isEmpty( this.state.newPublicKey) || !TextUtil.isEmpty(this.state.errorMsg0)
        }
    }

    // 变更权限调用
    doChangeAuth(password, isDelete) {
        const account = this.props.account;
        const authType = this.props.permissionData.type;
        const isAccount = this.props.permissionData.is_account;

        let authData;

        account.permissions.forEach(perm => {
            if (perm.perm_name === authType) {
                // 深拷贝，以免修改到 account
                authData = JSON.parse(JSON.stringify(perm.required_auth));
            }
        });

        // accountName 权限
        if (isAccount) {
            const oldName = this.props.permissionData.key;
            const newName = this.state.newAccountName;
            authData.accounts.forEach((account, index) => {
                if (account.permission.actor === oldName) {
                    // 删除或者变更
                    if (isDelete) {
                        authData.accounts.splice(index, 1);
                    } else {
                        authData.accounts[index].permission.actor = newName;
                    }
                }
            });
        // 公钥权限
        } else {
            const oldKey = this.props.permissionData.key;
            const newKey = this.state.newPublicKey;
            authData.keys.forEach((key,index) => {
                if (key.key === oldKey) {
                    // 删除或者变更
                    if (isDelete) {
                        authData.keys.splice(index, 1);
                    } else {
                        authData.keys[index].key = newKey;
                    }
                }
            });
        }

        let parent = 'owner';
        if (authType === 'owner') {
            parent = '';
        }
        const data = {
            "account": account.account_name,
            "permission": authType,
            "parent": parent,
            "auth": authData
        }

        this.setState({
            isRequesting: true
        }, () => {
            this.props.onAuthChange (account, data, password, (error, result) => {
                this.setState({
                    isRequesting: false
                })
                if (!error) {
                    Toast.show(  I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } );
                    this.props.navigation.dispatch( NavigationActions.back() );
                } else {
                    handleError(error);
                }
            })
        })
    }

    renderKeyChange() {
        return (
            <View>
                <Text style={styles.label}>
                    { I18n.t( Keys.auth_change_oldkey ) }
                </Text>

                <View style={commonStyles.commonIntervalStyle} />
                <Text style={[
                    {
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        lineHeight: 24,
                        fontSize: 16,
                        color: '#323232',
                        backgroundColor: '#ffffff'
                    }, commonStyles.monospace
                ]}>
                    {this.props.permissionData.key}
                </Text>
                <View style={commonStyles.commonIntervalStyle} />

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                    }}>
                    <Text style={styles.label} >
                        { I18n.t( Keys.auth_change_newkey ) }
                    </Text>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate( 'EOSAccountRegisterFreshmanPage', {
                                title: I18n.t( Keys.generat_pk )
                            } );
                        }}>
                        <Text style={[
                            {
                                marginRight: 15,
                                fontSize: 14,
                                color: '#1ace9a'
                            }
                        ]}>{ I18n.t( Keys.generat_pk ) }</Text>
                    </TouchableOpacity>
                </View>

                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                <TextInput
                    style={[styles.textInput, commonStyles.monospace, {height: 88, lineHeight: 24 }]}
                    value={this.state.newPublicKey}
                    multiline
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    keyboardType={'email-address'}
                    placeholder={ I18n.t( Keys.auth_change_newkey_placeholder ) }
                    placeholderTextColor={"#B5B5B5"}
                    onBlur={() => {
                        this.setState({
                            errorMsg0: ''
                        }, () => {
                            this._validateAccountKey();
                        });
                    }}
                    onChangeText={(text) => {
                        this.setState({
                            // fuck the `\n` wrap to avoid the private key invalid
                            newPublicKey: text.replace(/\n/ig, "").trim()
                        });
                    }}
                    underlineColorAndroid={"transparent"}/>
                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                <Text style={[commonStyles.commonSubTextColorStyle, {
                    fontSize: 12,
                    marginLeft: 15,
                    marginRight: 15,
                    marginTop: 10,
                }, this.state.errorMsg0 && this.state.errorMsg0.length ? {color: 'red'} : {}]}>{this.state.errorMsg0}</Text>
            </View>
        )
    }

    renderAccountChange() {
        return (
            <View>
                <Text style={styles.label}>
                    { I18n.t( Keys.auth_change_oldName ) }
                </Text>

                <View style={commonStyles.commonIntervalStyle} />
                <Text style={[
                    {
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        lineHeight: 24,
                        fontSize: 16,
                        color: '#323232',
                        backgroundColor: '#ffffff'
                    }, commonStyles.monospace
                ]}>
                    {this.props.permissionData.key}
                </Text>
                <View style={commonStyles.commonIntervalStyle} />

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Text style={styles.label} >
                        { I18n.t( Keys.auth_change_newName ) }
                    </Text>
                </View>

                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                <TextInput
                    style={[styles.textInput, commonStyles.monospace ]}
                    value={this.state.newAccountName}
                    maxLength={12}
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    keyboardType={'email-address'}
                    placeholder={ I18n.t( Keys.auth_change_newName_placeholder ) }
                    placeholderTextColor={"#B5B5B5"}
                    onBlur={() => {
                        this.setState({
                            errorMsg1: ''
                        }, () => {
                            this._validateAccountName();
                        });
                    }}
                    onChangeText={(text) => {
                        this.setState({
                            // fuck the `\n` wrap to avoid the private key invalid
                            newAccountName: text.replace(/\n/ig, "").trim()
                        });
                    }}
                    underlineColorAndroid={"transparent"}/>
                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                <Text style={[commonStyles.commonSubTextColorStyle, {
                    fontSize: 12,
                    marginLeft: 15,
                    marginRight: 15,
                    marginTop: 10,
                }, this.state.errorMsg1 && this.state.errorMsg1.length ? {color: 'red'} : {}]}>{this.state.errorMsg1}</Text>
            </View>
        )
    }

    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <KeyboardAwareScrollView>
                    {
                        this.props.permissionData.is_account
                        ?
                        this.renderAccountChange()
                        :
                        this.renderKeyChange()
                    }

                    <Text style={[styles.tip, { marginTop: 20 } ]}>{ I18n.t( Keys.auth_manage_note ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.auth_change_note_1 ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.auth_change_note_2 ) }</Text>

                    <View style={{ marginTop: 100 }}>
                        {
                            this.props.canDelete
                            ?
                            <Button
                                containerStyle={[
                                    commonStyles.buttonContainerDisabledStyle,
                                    {
                                        height: 44,
                                        marginBottom: 15,
                                        marginLeft: 15,
                                        marginRight: 15,
                                        borderColor: '#f65858',
                                        borderWidth: Util.getDpFromPx( 1 ),
                                        backgroundColor: '#fafafa'
                                    },
                                ]}
                                style={[ commonStyles.buttonContentStyle, { color: '#f65858' } ]}
                                disabled={false}
                                onPress={() => {
                                    Alert.alert(
                                        I18n.t(Keys.notice),
                                        I18n.t(Keys.auth_change_deletewarning),
                                        [
                                            {text: I18n.t(Keys.cancel), onPress: () => {}},
                                            {text: I18n.t(Keys.ok), onPress: () => {
                                                this.setState({
                                                    isDelete: true,
                                                    isPswdOpen: true
                                                });
                                            }},
                                        ]
                                    )
                                }}
                                title={null}>
                                { I18n.t(Keys.auth_change_delete) }
                            </Button>
                            :
                            null
                        }
                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerDisabledStyle,
                                {
                                    height: 44,
                                    marginBottom: 40,
                                    marginLeft: 15,
                                    marginRight: 15
                                },
                                this._isNextButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            disabled={this._isNextButtonDisabled()}
                            onPress={() => {
                                Alert.alert(
                                    I18n.t(Keys.notice),
                                    I18n.t(Keys.auth_change_changewarning),
                                    [
                                        {text: I18n.t(Keys.cancel), onPress: () => {}},
                                        {text: I18n.t(Keys.ok), onPress: () => {
                                            this.setState({
                                                isDelete: false,
                                                isPswdOpen: true
                                            });
                                        }},
                                    ]
                                )
                            }}
                            title={null}>
                            { I18n.t(Keys.auth_change_submit) }
                        </Button>
                    </View>
                    <PasswordInputComponent
                        showRememberOptions={false}
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            this.doChangeAuth(password, this.state.isDelete)
                        }}
                        onClose={() => {
                            this.setState( {
                                isPswdOpen: false
                            } );
                        }}/>
                    {
                        this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: '#999999',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10
    },
    tip: {
        fontSize: 14,
        color: '#999999',
        lineHeight: 20,
        paddingHorizontal: 15,
        marginTop: 5
    },
    textInput: {
        flexGrow: 1,
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        backgroundColor: "#fff",
        color: "#323232",
    }
});

export default EOSAuthManagePageView;
