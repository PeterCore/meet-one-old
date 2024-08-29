import React, { Component } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { NavigationActions, SafeAreaView } from "react-navigation";
import Toast from "react-native-root-toast";
import IconSet from "../../../../components/IconSet";
import Keys from "../../../../configs/Keys";
import I18n from "../../../../I18n";

import commonStyles from "../../../../styles/commonStyles";

const LoadingCheck = ({loading}) => {
    if (loading){
        return (
            <ActivityIndicator style={styles.loadingIcon} />
        )
    } else {
        return (
            <IconSet name="icon-check" style={styles.checkIcon} />
        )
    }
}

const SuccessCheck = ({status, errorMsg}) => {
    switch (status) {
        case 'success':
            return <Text style={styles.successText}>{I18n.t( Keys.register_account_successfully )}</Text>
        case 'fail':
            return <Text style={styles.failText}>{errorMsg}</Text>
        default:
            return <ActivityIndicator style={styles.loadingIcon} />
    }
}

class AccountList extends Component {

    constructor( props ) {
        super( props );
        this.state = {
            status: 'loading',
            errorMsg: ''
        };
    }

    componentDidMount() {
        const account = this.props.walletAccount;
        const data = {
            name: this.props.name,
            rambytes: this.props.rambytes,
            stake_net_quantity: this.props.stake_net_quantity,
            stake_cpu_quantity: this.props.stake_cpu_quantity,
        }
        const accountPrivateKey = this.props.accountPrivateKey;
        this.props.createNewAccountPost( account, accountPrivateKey, data, ( err, result ) => {
            if ( !err ) {
                this.setState({
                    status: 'success'
                })
                this.props.onSucceed();
            } else {
                let errorMsg = '';
                try {
                    const error = JSON.parse(err).error;
                    switch(error.code){
                        case 3050000:
                            errorMsg = I18n.t( Keys.error_3050000 );
                            break;
                        case 3050003:
                            errorMsg = I18n.t( Keys.error_3050003 );
                            break;
                        case 3080001:
                            errorMsg = I18n.t( Keys.error_3050001 );
                            break;
                        default:
                            errorMsg = I18n.t( Keys.register_account_error );
                    }
                } catch (error) {
                    errorMsg = I18n.t( Keys.error );
                }
                this.setState({
                    status: 'fail',
                    errorMsg
                })
            }
            this.props.onCompleted();
        } );
    }

    render () {
        return (
            <View style={this.props.style}>
                <Text style={styles.accountText}>{this.props.name}</Text>
                <SuccessCheck status={this.state.status} errorMsg={this.state.errorMsg} />
            </View>
        )
    }
}

class EOSAccountRegisterResultPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: ''
        };
    };

    constructor( props ) {
        super( props );
        const { accountList, accountPrivateKey } = props.navigation.state.params;
        this.state = {
            accountList,
            successCount: 0,
            completeCount: 0,
            accountPrivateKey
        }
        this.onSucceed = this.onSucceed.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
    }

    onSucceed () {
        this.setState(previousState => {
            return { successCount: previousState.successCount + 1 }
        })
    }

    onCompleted () {
        this.setState(previousState => {
            return { completeCount: previousState.completeCount + 1 }
        })
    }

    componentDidMount() { }

    render () {
        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <ScrollView>
                    <View style={styles.paddingBoth}>
                        {/* 顶部 */}
                        <View>
                            <Text style={styles.title}>{I18n.t( Keys.register_account )}</Text>

                            {/* 链接主网 */}
                            <View style={[styles.horizontal, styles.stepContainer]}>
                                <LoadingCheck loading={false} />
                                <Text style={styles.stepTitle}>{I18n.t( Keys.link_to_mainnet )}</Text>
                            </View>

                            {/* 注册账号 */}
                            <View style={[styles.horizontal, styles.stepContainer]}>
                                <LoadingCheck loading={this.state.accountList.length !== this.state.completeCount} />
                                <Text style={styles.stepTitle}>{I18n.t( Keys.register_account_title )}</Text>
                            </View>
                            {/* 账号列表 */}
                            <View style={styles.stepDetail}>
                                {
                                    this.state.accountList.map((account, index, arr)=> (
                                        <AccountList key={index}
                                            style = {[
                                                styles.horizontal,
                                                styles.accountList,
                                                (index == arr.length - 1) ? {borderBottomWidth: 0} : {}
                                            ]}
                                            name = {account.name}
                                            rambytes = {account.rambytes}
                                            stake_net_quantity = {account.stake_net_quantity}
                                            stake_cpu_quantity = {account.stake_cpu_quantity}
                                            walletAccount = {this.props.walletAccount}
                                            createNewAccountPost = {this.props.createNewAccountPost}
                                            onSucceed = {this.onSucceed}
                                            onCompleted = {this.onCompleted}
                                            // addToWallet = {this.addToWallet}
                                            accountPrivateKey = {this.state.accountPrivateKey}
                                            />
                                    ))
                                }
                            </View>

                            {/* 注册完成 */}
                            <View style={[styles.horizontal, styles.stepContainer, (this.state.accountList.length !== this.state.completeCount) ? { opacity: 0 } : { opacity: 1 } ]}>
                                <LoadingCheck loading={this.state.accountList.length !== this.state.completeCount} />
                                <Text style={styles.stepTitle}>{I18n.t( Keys.registration_complete )}</Text>
                            </View>
                            {/* 完成信息 */}
                            <View style={[ styles.stepDetail, (this.state.accountList.length !== this.state.completeCount) ? { opacity: 0 } : { opacity: 1 } ]}>
                                <Text style={styles.resultText}>{I18n.t( Keys.registration_complete_1 )} {this.state.successCount} {I18n.t( Keys.registration_complete_2 )}{'\n'}
                                    {/* 共消费 RAM { Util.numberStandard(this.state.costedRAM) } byte */}
                                </Text>
                            </View>
                        </View>

                        {/* 底部完成按钮 */}
                        <View style={{ marginTop: 50, marginBottom: 20, alignItems: 'center'}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (this.state.accountList.length === this.state.completeCount) {
                                        this.props.navigation.dispatch(NavigationActions.back());
                                    } else {
                                        Toast.show(I18n.t( Keys.waiting_for_registrations ), { position: Toast.positions.CENTER } );
                                    }
                                }}>
                                <View style={styles.btn}>
                                    <Text style={styles.btnText}>{I18n.t( Keys.finish_operation )}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
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
    loadingIcon: {
        width: 24,
        marginRight: 10
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
    accountList: {
        borderBottomColor: '#E8E8E8',
        borderBottomWidth: 1,
        justifyContent: 'space-between'
    },
    accountText: {
        fontSize: 16,
        lineHeight: 44,
        fontWeight: '400',
    },
    successText: {
        lineHeight: 44,
        color: '#1ACE9A'
    },
    failText: {
        lineHeight: 44,
        color: '#F65858'
    },
    resultText: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22
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

export default EOSAccountRegisterResultPageView;
