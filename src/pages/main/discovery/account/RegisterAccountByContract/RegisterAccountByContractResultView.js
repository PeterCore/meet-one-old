import React from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Clipboard, Image } from "react-native";
import Button from "react-native-button";
import Toast from "react-native-root-toast";
import commonStyles from "../../../../../styles/commonStyles";
import Keys from "../../../../../configs/Keys";
import I18n from "../../../../../I18n";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";

export default class RegisterAccountByContractView extends React.Component {
    static navigationOptions = (props) => {
        return {
            title: I18n.t( Keys.register_by_contract )
        }
    }

    constructor (props) {
        super(props);

        const {publicKey, name, cost} = props.navigation.state.params;
        this.state = {
            account: 'signupeoseos',
            cost: cost,
            memo: `${name}-${publicKey}`
        };
    }

    render() {
        return (
            <SafeAreaView style={[
                commonStyles.wrapper,
                commonStyles.commonBG
                ]}>
                <ScrollView>

                    <Text style={{
                        fontSize: 22,
                        color: '#323232',
                        textAlign: 'center',
                        marginTop: 30,
                        fontWeight: '400'
                    }}>{ I18n.t( Keys.withdraw_title ) }</Text>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginLeft: 15,
                        marginRight: 15
                    }}>
                        {/* <Image
                            source={require( '../../../../../imgs/all_icon_alarm.png' )}
                            style={[ {
                                marginTop: 10,
                                marginRight: 5,
                                width: 16,
                                height: 16,
                            } ]}
                        /> */}
                        <Text style={{
                            fontSize: 14,
                            color: '#999999',
                            textAlign: 'center',
                            marginTop: 20,
                            marginBottom: 25,
                            fontWeight: '400'
                        }}>{ I18n.t( Keys.withdraw_warn_tip ) }</Text>
                    </View>

                    <View style={[
                        styles.mgl,
                        styles.boxShadow
                    ]}>
                        <View style={styles.card}>
                            <View style={styles.label}>
                                <Text style={[
                                    styles.mgl,
                                    styles.labelText,
                                ]}>{ I18n.t( Keys.withdraw_account ) }</Text>
                                <TouchableOpacity
                                    onPress={()=>{
                                        Clipboard.setString(this.state.account);
                                        Toast.show( I18n.t(Keys.copy_success), { position: Toast.positions.CENTER } );
                                    }}>
                                    <Text style={[
                                        styles.mgl,
                                        styles.labelText,
                                        {
                                            color: '#1ace9a'
                                        }
                                    ]}>{ I18n.t( Keys.copy ) }</Text>
                                </TouchableOpacity>
                            </View>


                            <Text style={[
                                styles.mgl,
                                {
                                    fontFamily: 'Menlo',
                                    fontSize: 20,
                                    fontWeight: '400',
                                    marginTop: 10,
                                    marginBottom: 15
                                }
                            ]}>{this.state.account}</Text>


                            <View style={[ commonStyles.commonIntervalStyle, styles.mgl ]}/>

                            <View style={styles.label}>
                                <Text style={[
                                    styles.mgl,
                                    styles.labelText,
                                ]}>{ I18n.t( Keys.withdraw_amount ) }</Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 15,
                                marginTop: 5,
                                marginBottom: 15
                            }}>
                                <Text style={{
                                    fontFamily: 'DIN',
                                    fontSize: 24,
                                    fontWeight: '600',
                                    color: '#141414'
                                }}>{this.state.cost}</Text>
                                <Text style={{
                                    fontFamily: 'DIN',
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#141414',
                                    marginTop: 8,
                                    marginLeft: 5
                                }}>EOS</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={{
                        fontSize: 16,
                        color: '#323232',
                        textAlign: 'center',
                        marginTop: 24,
                        marginBottom: 5
                    }}>{ I18n.t( Keys.memo_tip_1 ) }</Text>
                    <Text style={{
                        fontSize: 14,
                        color: '#999999',
                        textAlign: 'center',
                        marginBottom: 24
                    }}>{ I18n.t( Keys.memo_tip_2 ) }</Text>

                    <View style={[
                        styles.mgl,
                        styles.boxShadow
                    ]}>
                        <View style={styles.card}>
                            <View style={styles.label}>
                                <Text style={[
                                    styles.mgl,
                                    styles.labelText,
                                ]}>{ I18n.t( Keys.eos_remark ) }</Text>
                                <TouchableOpacity
                                    onPress={()=>{
                                        Clipboard.setString(this.state.memo);
                                        Toast.show( I18n.t(Keys.copy_success), { position: Toast.positions.CENTER } );
                                    }}>
                                    <Text style={[
                                        styles.mgl,
                                        styles.labelText,
                                        {
                                            color: '#1ace9a'
                                        }
                                    ]}>{ I18n.t( Keys.copy ) }</Text>
                                </TouchableOpacity>
                            </View>

                            <Text
                                numberOfLines={10}
                                style={[
                                    styles.mgl,
                                    {
                                        fontFamily: 'Menlo',
                                        fontSize: 16,
                                        color: '#323232',
                                        lineHeight: 22,
                                        marginBottom: 15,
                                        marginTop: 10
                                    }
                                ]}>{this.state.memo}</Text>
                        </View>
                    </View>

                    <Text style={{
                        fontSize: 14,
                        lineHeight: 22,
                        color: '#999999',
                        marginTop: 20,
                        marginHorizontal: 15
                    }}>{ I18n.t( Keys.cost_tip_1 ) }</Text>
                    <Text style={{
                        fontSize: 14,
                        lineHeight: 22,
                        color: '#999999',
                        marginTop: 10,
                        marginHorizontal: 15
                    }}>{ I18n.t( Keys.cost_tip_2 ) }</Text>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerDisabledStyle,
                            {
                                height: 44,
                                marginTop: 30,
                                marginBottom: 30,
                                backgroundColor: '#4A4A4A'
                            },
                            styles.mgl
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        onPress={() => {
                            this.props.navigation.dispatch(
                                StackActions.reset(
                                    {
                                        index: 0,
                                        actions: [
                                            NavigationActions.navigate( { routeName: 'mainPage' } )
                                        ]
                                    }
                                )
                            );
                        }}
                        title={null}>
                        {I18n.t(Keys.confirm)}
                    </Button>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    mgl: {
        marginLeft: 15,
        marginRight: 15
    },
    boxShadow: {
        shadowColor: '#e8e8e8',
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowRadius: 5,
        shadowOpacity: 0.8
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 5
    },
    label: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    labelText: {
        fontSize: 16,
        color: '#999999',
        marginTop: 15
    },
    small_tips: {
        marginTop: 10,
        fontSize: 12,
        color: '#888888'
    },
});
