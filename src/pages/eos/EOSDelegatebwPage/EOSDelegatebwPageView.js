import React, { Component } from "react";
import { InteractionManager, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Toast from "react-native-root-toast";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import I18n from "../../../I18n";
import Spinner from "react-native-loading-spinner-overlay";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import Keys from "../../../configs/Keys";
import { handleError } from "../../../net/parse/eosParse";
import { getStore } from "../../../setup";
import Util from "../../../util/Util";
import AnalyticsUtil from "../../../util/AnalyticsUtil";


class EOSDelegatebwPageView extends Component {
    static navigationOptions = ( props ) => {
        let title = I18n.t( Keys.DelegatebwPage_Title );
        return {
            title: title
        };
    };


    constructor( props ) {
        super( props );
        this.state = {
            CPU: "",
            Network: "",
            isRequesting: false,
            isPswdOpen: false
        };
    }


    // 验证要抵押的PCU资源输入是否合法
    IsStateCpuLegal() {
        if ( this.state.CPU < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), {
                position: 30,
            } );
            return false
        } else if ( Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.cpu ) < Number( this.state.CPU ) ) {
            Toast.show( 'CPU <' + (Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.cpu )).toFixed( 4 ), {
                position: 30,
            } );
            return false
        } else {
            return true
        }
    };

    // 验证要抵押的NET数量输入是否合法
    IsStateNetworkLegal() {
        if ( this.state.Network < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false
        } else if ( Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.net ) < Number( this.state.Network ) ) {
            Toast.show( 'network <' + (Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.net )).toFixed( 4 ), {
                position: 30,
            } );
            return false
        } else {
            return true
        }
    };

    DelegatebwConfirmFn() {
        console.log( `use: `, (Number( this.state.CPU ) + Number( this.state.Network )), 'have ', (Number( this.props.account.currencyBalance ) + Number( this.props.account.refunds )), (Number( this.state.CPU ) + Number( this.state.Network )) > (Number( this.props.account.currencyBalance ) + Number( this.props.account.refunds )) );
        if ( !this.state.CPU && !this.state.Network ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return
        } else if ( (Number( this.state.CPU ) + Number( this.state.Network )) > (Number( this.props.account.currencyBalance ) + Number( this.props.account.refunds )) ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoEnoughBW ), { position: Toast.positions.CENTER } );
            return
        } else if ( !this.IsStateCpuLegal() || !this.IsStateNetworkLegal() ) {
            return
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.doDelegatebwConfirmFn(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    };

    doDelegatebwConfirmFn( password ) {

        const accountPrivateKey = this.props.account.accountPrivateKey;
        const accountName = this.props.account.accountName;
        const data = {
            from: accountName,
            receiver: accountName,
            stake_net_quantity: Number( this.state.Network ).toFixed(4) + " EOS",
            stake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " EOS",
            transfer: 0,
        };

        this.setState( {
            isRequesting: true,
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onDispatchDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );

                if ( !err ) {
                    Toast.show( I18n.t( Keys.transaction_success ) + '!', { position: Toast.positions.CENTER } );
                    this.props.navigation.dispatch(
                        StackActions.reset(
                            {
                                index: 0,
                                actions: [
                                    NavigationActions.navigate( { routeName: 'mainPage' } ),
                                ]
                            }
                        )
                    );
                } else {
                    handleError(err);
                }
            } );
        } );
    };

    render() {
        const stake = (Number( this.state.CPU ) + Number( this.state.Network )).toFixed( 4 );
        const currencyBalance = (this.props.account.currencyBalance).toFixed( 4 );
        const refunds = (this.props.account.refunds).toFixed( 4 );

        const availableBW = (Number( currencyBalance ) + Number( refunds )).toFixed( 4 );

        // 安卓会出现中文,改成拼接字符串试试
        const CPU_placeholder = (Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.cpu )).toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );
        const Network_placeholder = (Number( this.props.account.currencyBalance ) + Number( this.props.account.refundMoneyDetail.net )).toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );

        const BalanceIntl = I18n.t( Keys.DelegatebwPage_availableBW );
        const StakeCountIntl = I18n.t( Keys.DelegatebwPage_StakeCount );
        const StakeQuantityIntl = I18n.t( Keys.DelegatebwPage_StakeQuantity );
        const CPUIntl = I18n.t( Keys.DelegatebwPage_CPU );
        const NetworkIntl = I18n.t( Keys.DelegatebwPage_Network );
        const RuleIntl = I18n.t( Keys.DelegatebwPage_Rule );
        const Rule1Intl = I18n.t( Keys.DelegatebwPage_Rule1 );
        const Rule2Intl = I18n.t( Keys.DelegatebwPage_Rule2 );
        const Rule3Intl = I18n.t( Keys.DelegatebwPage_Rule3 );
        // const Rule4Intl = I18n.t(Keys.EOSDelegatebwPage Rule4);
        const ConfirmIntl = I18n.t( Keys.DelegatebwPage_Confirm );


        return (
            <SafeAreaView style={[ commonStyles.wrapper ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <View style={styles.countBox}>
                            <View style={styles.countItem}>
                                <Text style={styles.countName}>{BalanceIntl}</Text>
                                <Text style={styles.countValue}>
                                    {availableBW} <Text style={styles.countValueUnit}>EOS</Text>
                                </Text>
                            </View>
                            <View style={[ styles.countItem, { borderBottomWidth: 0, } ]}>
                                <Text style={styles.countName}>{StakeCountIntl}</Text>
                                <Text style={styles.countStakeValue}>
                                    {stake} <Text style={styles.countValueUnit}>EOS</Text>
                                </Text>
                            </View>
                        </View>
                        <View style={styles.stakeBox}>
                            <View style={styles.titleTipBox}>
                                <Text style={styles.titleTip}>{StakeQuantityIntl}</Text>
                            </View>
                            <View style={styles.stakeConBox}>
                                <View style={styles.stakeItem}>
                                    <Text style={styles.stakeName}>{CPUIntl}</Text>
                                    <View style={styles.stakeValue}>
                                        <TextInput
                                            style={styles.stakeValueInput}
                                            placeholder={CPU_placeholder}
                                            placeholderTextColor={"#999"}
                                            keyboardType="numeric"
                                            returnKeyType="done"
                                            onChangeText={( CPU ) => this.setState( { CPU } )}
                                            underlineColorAndroid={"transparent"}
                                        />
                                    </View>
                                </View>
                                <View style={styles.stakeItem}>
                                    <Text style={styles.stakeName}>{NetworkIntl}</Text>
                                    <View style={styles.stakeValue}>
                                        <TextInput
                                            style={styles.stakeValueInput}
                                            placeholder={Network_placeholder}
                                            placeholderTextColor={"#999"}
                                            keyboardType="numeric"
                                            returnKeyType="done"
                                            onChangeText={( Network ) => this.setState( { Network } )}
                                            underlineColorAndroid={"transparent"}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ruleBox}>
                            <Text style={styles.ruleTitle}>{RuleIntl}:</Text>
                            <Text style={styles.ruleDesc}>{Rule1Intl}</Text>
                            <Text style={styles.ruleDesc}>{Rule2Intl}</Text>
                            <Text style={styles.ruleDesc}>{Rule3Intl}</Text>
                        </View>
                        <View style={{ height: 50 }}></View>
                    </KeyboardAwareScrollView>
                    <View style={styles.btnBox}>
                        <Text style={styles.btn} onPress={() => this.DelegatebwConfirmFn()}>{ConfirmIntl}</Text>
                    </View>
                </View>
                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this.doDelegatebwConfirmFn( password )
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}/>
                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create( {
    countBox: {
        position: "relative",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    countItem: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    countName: {
        color: "#222",
        fontSize: 16,
        lineHeight: 60,
    },
    countValue: {
        color: "#181818",
        fontSize: 20,
        fontWeight: "600",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    countStakeValue: {
        color: "#F65858",
        fontSize: 20,
        fontWeight: "600",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    countValueUnit: {
        fontSize: 14,
        color: "#0c0c0c",
    },
    stakeBox: {
        position: "relative",
        marginTop: 25,
    },
    titleTipBox: {
        position: "relative",
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 15,
    },
    titleTip: {
        color: "#999",
        fontSize: 16,
    },
    stakeConBox: {
        position: "relative",
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: "#fff",
    },
    stakeItem: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    stakeName: {
        color: "#222",
        fontSize: 16,
        lineHeight: 60,
    },
    stakeValue: {
        position: "relative",
    },
    stakeValueInput: {
        width: 180,
        height: 60,
        lineHeight: 60,
        color: "#222",
        textAlign: "right",
    },
    ruleBox: {
        position: "relative",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 25,
    },
    ruleTitle: {
        marginBottom: 5,
        color: "#555",
        fontSize: 16,
    },
    ruleDesc: {
        color: "#555",
        fontSize: 14,
        lineHeight: 28,
    },
    btnBox: {
        position: "absolute",
        bottom: 5,
        width: "96%",
        left: "2%",
        backgroundColor: "#3D4144",
    },
    btn: {
        color: "#fff",
        fontSize: 18,
        lineHeight: 44,
        textAlign: "center",
    },
} );

export default EOSDelegatebwPageView;
