import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Clipboard, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import Util from "../../..//util/Util";
import Toast from "react-native-root-toast";

class EOSAuthManagePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t(Keys.account_info_auth_manage),
        };
    };

    constructor( props ) {
        super( props );


    }

    renderAuthItem (authList, isOwner) {
        return (
            authList.map((item, index) => (
                <View>
                    <View style={{
                        flexDirection: 'row',
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff'
                    }}>
                        <View style={{
                            position: 'relative',
                            flexShrink: 1,
                        }}>
                            {/* 公钥或者账户名 */}
                            <TouchableOpacity
                                onPress={()=>{
                                    Clipboard.setString( item.key );
                                    Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                                }}
                            >
                                <Text style={[
                                    {
                                        flexShrink: 1,
                                        fontSize: 15,
                                        lineHeight: 24,
                                        color: '#323232'
                                    }
                                    , commonStyles.monospace
                                ]}>{item.key}</Text>
                            </TouchableOpacity>

                            {/* 【当前】 lable */}
                            {
                                item.key === this.props.account.accountPublicKey
                                ?
                                <View style={[
                                    {
                                        position: 'absolute',
                                        width: 34,
                                        height: 18,
                                        backgroundColor: '#1ace9a',
                                        borderRadius: 2,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    item.is_account ?
                                    { bottom: 3, right: -50 }
                                    :
                                    { bottom: 3, right: 0 },

                                    isOwner ?
                                    { }
                                    :
                                    { bottom: 15, right: -76 }
                                ]}>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#ffffff'
                                    }}>{ I18n.t(Keys.auth_manage_now) }</Text>
                                </View>
                                :
                                null
                            }
                        </View>

                        <View style={{
                            marginLeft: 20,
                            width: 56,
                            height: 24,
                        }}>
                            {
                                // 是 Owner 权限，才显示更换按钮
                                isOwner
                                ?
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(26,206,154,0.10)'
                                    }}
                                    onPress={()=>{
                                        this.props.navigation.navigate('EOSAuthKeyChangePage', {
                                            primaryKey: this.props.account.primaryKey,
                                            permissionData: item,
                                            canDelete: (authList.length > 1)
                                        })
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        color: '#323232'
                                    }}>
                                        { I18n.t(Keys.auth_manage_change) }
                                    </Text>
                                </TouchableOpacity>
                                :
                                null
                            }
                        </View>

                    </View>

                    {/* 最后一项没有分割线 */}
                    {
                        (index === authList.length - 1)
                        ?
                        null
                        :
                        <View style={[commonStyles.commonIntervalStyle, { marginLeft: 15 } ]} />
                    }
                </View>
            ))
        )
    }

    render() {
        if ( !this.props.account || !this.props.account.permissions ) {
            return <View/>
        }

        const account = this.props.account;

        const ownerAuth = [];
        const activeAuth = [];
        let isOwner = false;
        let isActive = false;

        account.permissions.forEach(perm => {

            perm.required_auth.keys.forEach(key => {
                if (perm.perm_name === 'active') {

                    if (key.key === this.props.account.accountPublicKey) {
                        isActive = true;
                    }

                    activeAuth.push({
                        type: 'active',
                        is_account: false,
                        key: key.key,
                        weight: key.weight
                    })
                }
                if (perm.perm_name === 'owner') {

                    if (key.key === this.props.account.accountPublicKey) {
                        isOwner = true;
                    }

                    ownerAuth.push({
                        type: 'owner',
                        is_account: false,
                        key: key.key,
                        weight: key.weight
                    })
                }
            })

            perm.required_auth.accounts.forEach(account => {
                if (perm.perm_name === 'active') {
                    activeAuth.push({
                        type: 'active',
                        is_account: true,
                        key: account.permission.actor,
                        weight: account.weight
                    })
                }
                if (perm.perm_name === 'owner') {
                    ownerAuth.push({
                        type: 'owner',
                        is_account: true,
                        key: account.permission.actor,
                        weight: account.weight
                    })
                }
            })

        });

        // 既不是 Owner 也不是 Active 状态，弹一个警告
        // 如果快速返回上上级页面，会再弹一次alert，（不那么快速的返回就不会），待填坑。
        if (!isActive && !isOwner) {
            Alert.alert(
                I18n.t(Keys.notice),
                I18n.t(Keys.auth_manage_warning),
                [
                    {text: I18n.t(Keys.ok), onPress: () => {}}
                ]
            )
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <TouchableItemComponent
                        onPress={()=>{
                            Clipboard.setString( account.account_name );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}
                        title={ I18n.t( Keys.eos_account_name ) }
                        content={account.account_name}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#999999'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={true}
                    />

                    <Text style={styles.label}>
                        Owner
                    </Text>
                    <View style={commonStyles.commonIntervalStyle} />
                    {
                        this.renderAuthItem(ownerAuth, isOwner)
                    }
                    <View style={commonStyles.commonIntervalStyle} />

                    <Text style={styles.label}>
                        Active
                    </Text>
                    <View style={commonStyles.commonIntervalStyle} />
                    {
                        this.renderAuthItem(activeAuth, isOwner)
                    }
                    <View style={commonStyles.commonIntervalStyle} />

                    <Text style={[styles.tip, { marginTop: 20 } ]}>{ I18n.t( Keys.auth_manage_note ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.auth_manage_note_1 ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.auth_manage_note_2 ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.auth_manage_note_3 ) }</Text>

                </ScrollView>
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
    }
});

export default EOSAuthManagePageView;
