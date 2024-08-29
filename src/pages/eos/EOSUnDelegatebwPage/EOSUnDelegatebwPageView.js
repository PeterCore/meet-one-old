import React, { Component } from "react";
import { InteractionManager, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import I18n from "../../../I18n";
import Toast from "react-native-root-toast";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import Spinner from "react-native-loading-spinner-overlay";
import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import Keys from "../../../configs/Keys";
import { handleError } from "../../../net/parse/eosParse";
import { getStore } from "../../../setup";
import Util from "../../../util/Util";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSUnDelegatebwPageView extends Component {
    static navigationOptions = ( props ) => {
        let title = I18n.t( Keys.UnDelegatebwPage_Title );
        return {
            title: title
        };
    };
    IsStateCpuLegal = () => {
        let IsLegal = true;
        if ( Number( this.state.CPU ) > Number( this.cpu_weight ) || Number( this.state.CPU ) < 0 ) {
            Toast.show( I18n.t( Keys.The_CPU_Number_is_illegal ), {
                position: Toast.positions.CENTER,
            } );
            IsLegal = false;
        }
        return IsLegal;
    };
    IsStateNetworkLegal = () => {
        let IsLegal = true;
        if ( Number( this.state.Network ) > Number( this.net_weight ) || Number( this.state.Network ) < 0 ) {
            Toast.show( I18n.t( Keys.The_Network_Number_is_illegal ), {
                position: Toast.positions.CENTER,
            } );
            IsLegal = false;
        }
        return IsLegal;
    };
    UnDelegatebwConfirmFn = () => {
        if ( (!this.state.CPU && !this.state.Network) || !this.IsStateCpuLegal() || !this.IsStateNetworkLegal() ) {
            return;
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.doUnDelegatebwConfirmFn(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }

    };
    doUnDelegatebwConfirmFn = ( password ) => {
        const accountPrivateKey = this.props.account.accountPrivateKey;
        const accountName = this.props.account.accountName;
        const data = {
            from: accountName,
            receiver: accountName,
            unstake_net_quantity: Number( this.state.Network ).toFixed(4) + " EOS",
            unstake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " EOS",
        };

        this.setState( {
            isRequesting: true,
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onDispatchUnDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );

                if ( !err ) {
                    Toast.show( I18n.t( Keys.transaction_success ) + '!', { position: Toast.positions.CENTER });
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

    constructor( props ) {
        super( props );
        this.state = {
            Network: "",
            CPU: "",
            cpu_weight: 0,
            net_weight: 0,
            isRequesting: false,
            isPswdOpen: false
        };
    }

    render() {

        const { self_delegated_bandwidth } = this.props.account;

        let { cpu_weight, net_weight } = self_delegated_bandwidth ? self_delegated_bandwidth : {
            cpu_weight: "0 EOS",
            net_weight: "0 EOS"
        };

        this.cpu_weight = cpu_weight.split( ' ' )[ 0 ];
        this.net_weight = net_weight.split( ' ' )[ 0 ];
        const Stake = (Number( this.cpu_weight ) + Number( this.net_weight )).toFixed(4);

        const CPU_placeholder = "< " + this.cpu_weight + " " + I18n.t( Keys.UnDelegatebwPage_Available );
        const Network_placeholder = "< " + this.net_weight + " " + I18n.t( Keys.UnDelegatebwPage_Available );

        const StakeCountIntl = I18n.t( Keys.UnDelegatebwPage_StakeCount );
        const StakeCountInfoIntl = I18n.t( Keys.UnDelegatebwPage_StakeCountInfo );
        const StakeQuantityIntl = I18n.t( Keys.UnDelegatebwPage_StakeQuantity );
        const CPUIntl = I18n.t( Keys.UnDelegatebwPage_CPU );
        const NetworkIntl = I18n.t( Keys.UnDelegatebwPage_Network );
        const ConfirmIntl = I18n.t( Keys.UnDelegatebwPage_Confirm );
        return (
            <SafeAreaView style={[ commonStyles.wrapper ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <KeyboardAwareScrollView>
                        <View style={[ styles.countBox]}>
                            <View style={[ styles.countItem, { borderBottomWidth: 0, } ]}>
                                <Text style={styles.countName}>{StakeCountIntl}</Text>
                                <Text style={styles.countValue}>
                                    {Stake} <Text style={styles.countValueUnit}>EOS</Text>
                                </Text>
                            </View>
                        </View>
                        <View style={styles.countInfoBox}>
                            <Text style={styles.countInfo}>{StakeCountInfoIntl}</Text>
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
                                            maxLength={11}
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
                                            maxLength={11}
                                            keyboardType="numeric"
                                            returnKeyType="done"
                                            onChangeText={( Network ) => this.setState( { Network } )}
                                            underlineColorAndroid={"transparent"}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                    <View style={styles.btnBox}>
                        <Text style={styles.btn} onPress={() => this.UnDelegatebwConfirmFn()}>{ConfirmIntl}</Text>
                    </View>
                </View>

                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this.doUnDelegatebwConfirmFn( password )
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}
                />

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
        marginTop: 25,
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
    countValueUnit: {
        fontSize: 14,
        color: "#0c0c0c",
    },
    countInfoBox: {
        position: "relative",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 5,
    },
    countInfo: {
        color: "#999",
        fontSize: 14,
        textAlign: "right",
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
        width: 160,
        height: 60,
        lineHeight: 60,
        color: "#222",
        textAlign: "right",
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

export default EOSUnDelegatebwPageView;
