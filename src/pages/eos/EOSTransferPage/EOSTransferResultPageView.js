import React, { Component } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { NavigationActions, SafeAreaView } from "react-navigation";
import IconSet from "../../../components/IconSet";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import commonStyles from "../../../styles/commonStyles";

class EOSTransferResultPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.eos_transfer_result_title )
        };
    };

    constructor( props ) {
        super( props );
    }

    componentDidMount() {

    }

    render () {
        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView>
                    <View style={[styles.paddingBoth]}>
                        <View style={[styles.horizontal, styles.stepContainer]}>
                            <IconSet name="icon-check" style={styles.checkIcon} />
                            <Text style={styles.stepTitle}>{ I18n.t( Keys.eos_transfer_result_commitTrans )}</Text>
                        </View>

                        <View style={styles.stepDetail}>
                            <Text style={styles.infoTitle}>{ I18n.t( Keys.eos_receiver_address )}</Text>
                            <Text style={styles.infoText}>{this.props.navigation.state.params.to}</Text>
                            <Text style={styles.infoTitle}>{ I18n.t( Keys.eos_sender_address )}</Text>
                            <Text style={styles.infoText}>{this.props.navigation.state.params.from}</Text>
                            <Text style={styles.infoTitle}>{ I18n.t( Keys.transaction_amount )}</Text>
                            <Text style={styles.ammoutText}>{this.props.navigation.state.params.quantity}</Text>
                        </View>

                        <View style={[styles.horizontal, styles.stepContainer ]}>
                            <IconSet name="icon-check" style={styles.checkIcon} />
                            <Text style={styles.stepTitle}>{ I18n.t( Keys.eos_transfer_result_success )}</Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 50, marginBottom: 20, alignSelf: 'center' }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                this.props.navigation.dispatch( NavigationActions.back() );
                            }}>
                            <View style={styles.btn}>
                                <Text style={styles.btnText}>{ I18n.t( Keys.complete )}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    horizontal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paddingBoth: {
        paddingHorizontal: 20
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#323232',
        marginVertical: 10,
    },
    stepContainer: {
        marginTop: 30
    },
    checkIcon: {
        width: 24,
        marginRight: 10,
        fontSize: 24,
        color: '#1ACE9A'
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#323232'
    },
    stepDetail: {
        marginLeft: 34,
        marginRight: 10,
        marginTop: 15
    },
    infoTitle: {
        fontSize: 14,
        marginTop: 15,
        color: '#888888'
    },
    infoText: {
        fontSize: 16,
        marginTop: 5,
        color: '#323232'
    },
    ammoutText: {
        fontSize: 22,
        fontWeight: '500',
        marginTop: 5,
        color: '#323232'
    },
    btn: {
        flexDirection: 'row',
        width: 335,
        height: 50,
        alignItems: 'center',
        backgroundColor: '#4A4A4A'
    },
    btnText: {
        flexGrow: 1,
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center'
    }
});

export default EOSTransferResultPageView;
