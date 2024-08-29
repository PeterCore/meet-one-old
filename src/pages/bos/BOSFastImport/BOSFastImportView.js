import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-navigation";
import { getBOSAccount } from "../../../net/DiscoveryNet";

import LoadingView from "../../../components/LoadingView";

import commonStyles from "../../../styles/commonStyles";

class BOSFastImportPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.bos_fast_import_btn_text1 ) ,
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            accountsMap: this.props.accountsMap,
            selectedAccount: [],
            nowIndex: this.props.primaryKey,
            loading: true
        };
    }

    componentWillMount() {
        const accountsMap = this.state.accountsMap;
        const accountArray = Object.keys(accountsMap);

        if (accountArray.length > 0) {
            getBOSAccount({
                accountArray: JSON.stringify(accountArray)
            }, ( err, resBody ) => {
                if (!err) {
                    const resData = JSON.parse(resBody);
                    if (resData.code === 0) {
                        const BOSAccountList = resData.data;
                        BOSAccountList.forEach((item) => {
                            accountsMap[item.eos_account].bos_account = item.bos_account;
                        })
                    }
                }

                const defaultSelected = [];
                accountArray.forEach((account) => {
                    if (accountsMap[account].bos_account) {
                        defaultSelected.push(accountsMap[account].accountName);
                    }
                })
                this.setState({
                    selectedAccount: defaultSelected,
                    loading: false
                })
            })
        }
    }

    importAccounts() {
        const accountsMap = this.state.accountsMap;
        const selectedAccount = this.state.selectedAccount;
        let count = 0;
        let primaryKey = this.state.nowIndex;

        if (selectedAccount.length === 0) {
            return
        }

        selectedAccount.forEach((accountName, i) => {

            const { aloha, accountPublicKey, bos_account, passwordHint } = accountsMap[accountName];

            const index = primaryKey + i;

            this.props.addBOSWalletFromEOS( index, accountPublicKey, aloha, bos_account, passwordHint, ( err, res ) => {
                count ++;
                if (count === selectedAccount.length) {
                    if (err) {
                        if (typeof err === 'string') {
                            Toast.show( err, { position: Toast.positions.CENTER } );
                        } else {
                            Toast.show(err.message, { position: Toast.positions.CENTER });
                        }
                        return;
                    } else {
                        Toast.show( I18n.t( Keys.import_success ) , { position: Toast.positions.CENTER });
                    }
                    this.props.navigation.navigate('mainPage');
                }
            } );
        })
    };

    render() {

        const accountsMap = this.state.accountsMap;
        const accountArray = Object.keys(accountsMap);

        let hasBOSAccount = false;
        accountArray.forEach(( accountName ) => {
            if (accountsMap[accountName].bos_account) {
                hasBOSAccount = true;
            }
        });

        const selectedAccount = JSON.parse(JSON.stringify(this.state.selectedAccount));

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                <Text style={{
                    marginVertical: 20,
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#323232'
                }}>{ I18n.t( Keys.bos_fast_import_title ) }</Text>

                <View style={[{
                    flex: 1,
                    marginHorizontal: 15,
                    backgroundColor: '#ffffff',
                    borderRadius: 5,

                }]}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 44,
                        paddingHorizontal: 15
                    }}>
                        <Text style={styles.accountTitle}>{ I18n.t( Keys.bos_fast_import_label1 ) }</Text>
                        <Text style={styles.accountTitle}>{ I18n.t( Keys.bos_fast_import_label2 ) }</Text>
                    </View>
                    <View style={[ commonStyles.commonIntervalStyle ]}/>

                    {
                        hasBOSAccount ?
                        <ScrollView style={[ commonStyles.wrapper, { backgroundColor: '#ffffff'} ]}>
                            {
                                accountArray.map(( accountName, index) => {
                                    // 有对应的 BOS 账号才显示
                                    if (accountsMap[accountName].bos_account) {
                                        const hasSelected = selectedAccount.includes(accountName);
                                        return (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (hasSelected) {
                                                        selectedAccount.splice(selectedAccount.indexOf(accountName), 1);
                                                    } else {
                                                        selectedAccount.push(accountName);
                                                    }

                                                    this.setState({
                                                        selectedAccount: selectedAccount
                                                    });
                                                }}
                                                key={index}>
                                                    <View style={{
                                                        height: 44,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        backgroundColor: '#ffffff'
                                                    }}>
                                                        <View style={{
                                                            flex: 1
                                                        }}>
                                                            <Text style={{
                                                                fontSize: 16,
                                                                color: '#323232',
                                                                marginLeft: 15
                                                            }}>
                                                                {accountName}
                                                            </Text>
                                                        </View>

                                                        <View style={{
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <Text style={{
                                                                fontSize: 16,
                                                                color: '#323232'
                                                            }}>
                                                                {accountsMap[accountName].bos_account}
                                                            </Text>

                                                            {
                                                                hasSelected ?
                                                                <Image
                                                                    source={require( '../../../imgs/all_icon_selected.png' )}
                                                                    style={[ { width: 16, height: 16, marginRight: 15 } ]}
                                                                />
                                                                :
                                                                null
                                                            }
                                                        </View>
                                                    </View>
                                                    {
                                                        index === (accountArray.length - 1) ?
                                                        null
                                                        :
                                                        <View style={[ commonStyles.commonIntervalStyle, { marginHorizontal: 15 } ]}/>
                                                    }

                                            </TouchableOpacity>
                                        )
                                    } else {
                                        return null
                                    }
                                })
                            }
                        </ScrollView>
                        :
                        <View style={[
                            commonStyles.wrapper,
                            {
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ffffff'

                            }
                        ]}>
                            <Image
                                source={require('../../../imgs/sidechain_fast_import.png')}
                                style={[{ width: 88, height: 76 }]} />
                            <Text style={{
                                fontSize: 16,
                                color: '#323232',
                                marginTop: 30
                            }}>{ I18n.t( Keys.bos_fast_import_empty1 ) }</Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#888888',
                                textAlign: 'center',
                                marginTop: 10,
                                marginHorizontal: 60,
                                lineHeight: 20
                            }}>{ I18n.t( Keys.bos_fast_import_empty2 ) }</Text>
                        </View>
                    }
                </View>

                <View style={{
                    marginTop: 20,
                    marginHorizontal: 15
                }}>
                    <Text style={styles.tip}>{ I18n.t( Keys.bos_fast_import_tip1 ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.bos_fast_import_tip2 ) }</Text>
                    <Text style={styles.tip}>{ I18n.t( Keys.bos_fast_import_tip3 ) }</Text>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        this.importAccounts();
                    }}
                >
                    <View style={{
                        marginHorizontal: 15,
                        marginBottom: 50,
                        marginTop: 40,
                        height: 44,
                        backgroundColor: '#4a4a4a',
                        borderRadius: 2,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 17,
                            color: '#ffffff'
                        }}>{ I18n.t( Keys.import ) }</Text>
                    </View>
                </TouchableOpacity>


                {
                    this.state.loading ?
                    <LoadingView/>
                    :
                    null
                }
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
    accountTitle: {
        flex: 1,
        fontSize: 16,
        color: 'rgba(0,0,0,0.85)'
    },
    tip: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 4
    }
} );

export default BOSFastImportPageView;
