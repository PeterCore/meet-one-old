import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import Toast from "react-native-root-toast";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";

class EOSWalletImportPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.select_account ),
        };
    };

    constructor( props ) {
        super( props );
        // 之前的路由,主要是授权页用,从导入页继续传进来
        const before = props.navigation.state.params && props.navigation.state.params.before;
        // 导入页传来的数据
        const accountArray = props.navigation.state.params && props.navigation.state.params.accountArray;
        const key = props.navigation.state.params && props.navigation.state.params.key;
        const password = props.navigation.state.params && props.navigation.state.params.password;
        const passwordHint = props.navigation.state.params && props.navigation.state.params.passwordHint;
        const queryObj = props.navigation.state.params && props.navigation.state.params.queryObj;

        this.state = {
            before: before,
            queryObj: queryObj,
            key: key,
            password: password,
            passwordHint: passwordHint,
            accountArray: accountArray,
            selectedAccount: [],
            nowIndex: this.props.primaryKey
        };
    }

    importAccounts() {

        const key = this.state.key;
        const password = this.state.password;
        const passwordHint = this.state.passwordHint;
        const before = this.state.before;
        const selectedAccount = this.state.selectedAccount;
        const queryObj = this.state.queryObj;
        let count = 0;
        let primaryKey = this.state.nowIndex;

        if (selectedAccount.length === 0) {
            Toast.show( I18n.t( Keys.select_account_tip ) , { position: Toast.positions.CENTER });
            return
        }

        selectedAccount.forEach((accountName, i) => {

            const pk = primaryKey + i;

            this.props.addMultiEOSWallet( pk, key, accountName, password, passwordHint, ( err, res ) => {

                count ++;

                if (count === selectedAccount.length) {
                    const { state } = this.props.navigation;
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

                    if ( state.params && state.params.callback ) {
                        state.params && state.params.callback && state.params.callback();
                    } else if (before) {
                        this.props.navigation.dispatch(
                            StackActions.reset({
                                index: 1,
                                actions: [
                                    NavigationActions.navigate( { routeName: 'mainPage' } ),
                                    NavigationActions.navigate( { routeName: before, params: {queryObj: queryObj}} ),
                                ]
                            })
                        )
                    } else {
                        this.props.navigation.navigate('mainPage');
                    }
                }
            } );
        })
    };

    render() {

        const accountArray = this.state.accountArray;
        const accountsList = this.props.accountsList;

        const selectedAccount = JSON.parse(JSON.stringify(this.state.selectedAccount));

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                    <View>

                        <Text style={{
                            fontSize: 14,
                            color: '#999999',
                            marginTop: 15,
                            marginBottom: 10,
                            marginLeft: 15
                        }}>{ I18n.t( Keys.select_account_tip ) }</Text>

                        <View style={[ commonStyles.commonIntervalStyle ]}/>
                        {
                            accountArray.map(( accountName, index) => {

                                const hasImported = accountsList.includes(`${accountName}_${this.props.netType}`);
                                const hasSelected = selectedAccount.includes(accountName);

                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            // 未导入可进行勾选
                                            if (!hasImported) {

                                                if (hasSelected) {
                                                    selectedAccount.splice(selectedAccount.indexOf(accountName), 1);
                                                } else {
                                                    selectedAccount.push(accountName);
                                                }

                                                this.setState({
                                                    selectedAccount: selectedAccount
                                                });
                                            }
                                        }}
                                        key={index}>
                                            <View style={{
                                                height: 44,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    color: '#323232',
                                                    marginLeft: 15
                                                }}>
                                                    {accountName}
                                                </Text>

                                                {
                                                    hasImported ?
                                                    <Text style={{
                                                        fontSize: 16,
                                                        color: '#999999',
                                                        marginRight: 15
                                                    }}>{ I18n.t( Keys.hasImported ) }</Text>
                                                    :
                                                    hasSelected ?
                                                    <Image
                                                        source={require( '../../../imgs/all_icon_selected.png' )}
                                                        style={[ { width: 16, height: 16, marginRight: 15 } ]}
                                                    />
                                                    :
                                                    null
                                                }
                                            </View>
                                            {
                                                index === (accountArray.length - 1) ?
                                                null
                                                :
                                                <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>
                                            }
                                    </TouchableOpacity>
                                )
                            })
                        }
                        <View style={[ commonStyles.commonIntervalStyle ]}/>

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
                </ScrollView>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create( {

} );

export default EOSWalletImportPageView;
