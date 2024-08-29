import React, { Component } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Platform } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import Icon from "react-native-vector-icons/Ionicons";
import commonStyles from "../../../styles/commonStyles";
import Util from "../../../util/Util";
import { handleError } from "../../../net/parse/eosParse";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import LoadingView from "../../../components/LoadingView";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import Toast from "react-native-root-toast";
import { getStore } from "../../../setup";

class EOSNodeVoteComfirmPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.vote_confirm_title ),
            headerLeft:
                <Button
                    style={{
                        width: 44,
                        height: 44
                    }}
                    onPress={() => {
                        navigation.state.params.backWithParams()
                    }}
                >
                    <Image
                        source={ Platform.OS === 'ios' ? require( '../../../imgs/back-icon-ios.png' ) : require( '../../../imgs/back-icon-ios.png' ) }
                        style={[ { width: 44, height: 44 } ]}
                    />
                </Button>
        };
    };

    constructor( props ) {
        super( props );

        const selectedBPs = this.props.selectedNodes.map((item) => {
            return item.owner
        })

        this.state = {
            CPU: "",
            NET: "",
            selectedBPs: selectedBPs,

            isRequesting: false,
            isPswdOpen: false,
        };
    }

    _backWithParams() {
        this.props.navigation.navigate('EOSNodeListPage', {
            selectedBPs: this.state.selectedBPs
        })
    }

    componentWillMount() {
        this._backWithParams = this._backWithParams.bind( this );
        this.props.navigation.setParams( { backWithParams: this._backWithParams } );
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTvotecheck');
    }

    // 验证要抵押的CPU资源输入
    checkDelegateCPU() {
        const input_cpu = Number(this.state.CPU);
        const cpu_available = (this.props.account.currencyBalance + this.props.account.refundMoneyDetail.cpu).toFixed(4);
        if ( input_cpu < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( cpu_available < input_cpu ) {
            Toast.show( format( I18n.t( Keys.cpu_available_tip ), cpu_available ), { position: Toast.positions.CENTER } );
            return false;
        } else {
            return true;
        }
    };

    // 验证要抵押的NET数量输入
    checkDelegateNET() {
        const input_net = Number(this.state.NET);
        const net_available = (this.props.account.currencyBalance + this.props.account.refundMoneyDetail.net).toFixed(4);
        if ( input_net < 0 ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoNegative ), { position: Toast.positions.CENTER } );
            return false;
        } else if ( net_available < input_net ) {
            Toast.show( format( I18n.t( Keys.net_available_tip ), net_available ), { position: Toast.positions.CENTER } );
            return false;
        } else {
            return true;
        }
    };

    // 提交按钮点击
    submitBtnClick () {
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const total_resources = this.props.account.currencyBalance + this.props.account.refunds;

        if ( Number.isNaN(input_cpu) || Number.isNaN(input_net) ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_UseValidValue ), { position: Toast.positions.CENTER } );
            return;
        } else if ( (input_cpu + input_net) > total_resources ) {
            Toast.show( I18n.t( Keys.DelegatebwPage_NoEnoughBW ), { position: Toast.positions.CENTER } );
            return;
        } else if ( !this.checkDelegateCPU() || !this.checkDelegateNET() ) {
            return;
        }

        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.passwordComfirm(tempPsw);
        } else {
            this.setState( { isPswdOpen: true } );
        }
    };

    // 没有抵押直接投票
    directVote(password) {

        const voteData = JSON.parse(JSON.stringify(this.state.selectedBPs));
        voteData.sort();

        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onVoteProducers( this.props.account, voteData, password, (err, res) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( !err ) {
                    AnalyticsUtil.onEvent('CTvotesuccess');
                    this._backWithParams();
                    Toast.show( I18n.t( Keys.VotePage_vote_success ) + '!', { position: Toast.positions.CENTER } );
                } else {
                    handleError(err);
                }
            })
        });
    }
    // 抵押后投票
    delegateAndVote(password) {
        const accountName = this.props.account.accountName;
        const data = {
            from: accountName,
            receiver: accountName,
            stake_net_quantity: Number( this.state.NET ).toFixed(4) + " " + this.props.systemToken,
            stake_cpu_quantity: Number( this.state.CPU ).toFixed(4) + " " + this.props.systemToken,
            transfer: 0,
        };
        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onDispatchDelegateBwPost( this.props.account, data, password, ( err, res ) => {
                if ( !err ) {
                    this.directVote(password);
                } else {
                    this.setState( {
                        isRequesting: false,
                    } );
                    handleError(err);
                }
            } );
        });
    }
    // 密码回调
    passwordComfirm( password ) {
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);

        if (input_cpu === 0 && input_net === 0) {
            this.directVote(password);
        } else {
            this.delegateAndVote(password);
        }
    };

    renderSelected( {item, index} ) {
        return (
            <View style={{
                height: 65,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15,
                backgroundColor: '#ffffff'
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderWidth: Util.getDpFromPx( 1 ),
                        borderColor: '#ddd',
                        borderRadius: 25,
                        overflow: 'hidden',
                    }}>
                        <Image
                            source={{
                                uri: item.icon ? item.icon : "https://static.ethte.com/bpicon_default.png"
                            }}
                            style={[ { width: 36, height: 36 } ]}
                        />
                    </View>

                    <View>
                        <Text style={{
                            marginLeft: 15,
                            fontSize: 16,
                            color: '#323232'
                        }}>
                            { item.name ? item.name : item.owner }
                        </Text>

                        {
                            item.name ?
                            <Text style={{
                                marginLeft: 15,
                                fontSize: 14,
                                fontWeight: '300',
                                color: '#999999'
                            }}>
                                { item.owner }
                            </Text>
                            :
                            null
                        }
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        const votedArray = JSON.parse(JSON.stringify(this.state.selectedBPs));
                        const index = votedArray.indexOf(item.owner);

                        votedArray.splice(index, 1);
                        this.setState({
                            selectedBPs: votedArray
                        });
                    }}
                >
                    <Icon
                        style={[ {
                            marginLeft: 10,
                        } ]}
                        name={'ios-remove-circle-outline'}
                        size={26}
                        color={'#4a4a4a'}>
                    </Icon>
                </TouchableOpacity>
            </View>
        )
    }

    render() {

        const selectedBPs = this.state.selectedBPs;
        const selectedNodes = this.props.selectedNodes;

        const selectedListData = [];

        for (let i = 0; i < selectedNodes.length; i++) {
            if (selectedBPs.includes(selectedNodes[i].owner)) {
                selectedListData.push(selectedNodes[i]);
            }
        }

        const separatorHeight = Util.getDpFromPx( 1 );
        const account = this.props.account;

        const cpu_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.cpu_weight;
        const net_weight = account.self_delegated_bandwidth && account.self_delegated_bandwidth.net_weight;

        const stake_to_others = account.stake_to_others ? account.stake_to_others : 0;

        const total_weight = parseFloat(cpu_weight) + parseFloat(net_weight) + stake_to_others;

        // 动态计算两个的可抵押数
        const input_cpu = Number(this.state.CPU);
        const input_net = Number(this.state.NET);
        const refunding_cpu = account.refundMoneyDetail.cpu;
        const refunding_net = account.refundMoneyDetail.net;
        const eos_balance = account.currencyBalance;

        let delegate_CPU_placeholder,delegate_NET_placeholder;
        if (input_cpu <= refunding_cpu) {
            delegate_NET_placeholder = eos_balance + refunding_net;
        } else {
            const remain_balance = eos_balance - (input_cpu - refunding_cpu);
            if (remain_balance > 0) {
                delegate_NET_placeholder = remain_balance + refunding_net;
            } else {
                delegate_NET_placeholder = refunding_net;
            }
        }

        if (input_net <= refunding_net) {
            delegate_CPU_placeholder = eos_balance + refunding_cpu;
        } else {
            const remain_balance = eos_balance - (input_net - refunding_net);
            if (remain_balance > 0) {
                delegate_CPU_placeholder = remain_balance + refunding_cpu;
            } else {
                delegate_CPU_placeholder = refunding_cpu;
            }
        }

        // 可抵押的数量提示
        delegate_CPU_placeholder = delegate_CPU_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );
        delegate_NET_placeholder = delegate_NET_placeholder.toFixed( 4 ) + " " + I18n.t( Keys.DelegatebwPage_Available );

        // 总投出票数
        const totalVote = total_weight + input_cpu + input_net;

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <View style={{
                        marginHorizontal: 15,
                        marginTop: 10,
                        shadowColor: '#e8e8e8',
                        shadowOffset: {
                            width: 0,
                            height: 5
                        },
                        shadowRadius: 10,
                        shadowOpacity: 1
                    }}>
                        <View style={{
                            paddingHorizontal: 15,
                            backgroundColor: '#ffffff',
                            borderRadius: 5,
                            borderColor: '#e8e8e8',
                            borderWidth: Util.getDpFromPx( 1 ),
                            overflow: 'hidden'
                        }}>

                            <Text style={{
                                fontSize: 12,
                                color: '#999999',
                                marginTop: 15
                            }}>
                                {  I18n.t( Keys.vote_staked_eos ) }
                            </Text>

                            <View style={{
                                marginTop: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 16,
                                        color: '#323232'
                                    }}>CPU + NET +
                                    </Text>
                                    <Text style={{
                                        marginTop: 5,
                                        fontSize: 16,
                                        color: '#323232'
                                    }}>{I18n.t( Keys.stake_to_others )}
                                    </Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{
                                        fontFamily: 'DIN',
                                        fontSize: 17,
                                        fontWeight: '500',
                                        color: '#323232'
                                    }}>{ Util.numberStandard(total_weight, 4) }</Text>
                                    <Text style={[styles.eosSymbol, { marginTop: 4 }]}>{this.props.systemToken}</Text>
                                </View>
                            </View>

                            <Text style={{
                                fontSize: 12,
                                color: '#999999',
                                marginTop: 20
                            }}>
                                {  I18n.t( Keys.vote_add_resources ) }
                            </Text>

                            <View style={{
                                marginTop: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 16,
                                        color: '#323232'
                                    }}>+ CPU</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TextInput
                                        value={this.state.CPU}
                                        multiline={false}
                                        ref={(textinput) => { this.CPUInput = textinput }}
                                        style={styles.stakeInput}
                                        placeholder={'0'}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={(CPU) => {
                                            this.setState( { CPU } )
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                    <Text style={styles.eosSymbol}>{this.props.systemToken}</Text>
                                </View>
                            </View>

                            <View style={{
                                marginTop: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 16,
                                        color: '#323232'
                                    }}>+ NET</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TextInput
                                        value={this.state.NET}
                                        multiline={false}
                                        ref={(textinput) => { this.NETInput = textinput }}
                                        style={styles.stakeInput}
                                        placeholder={'0'}
                                        placeholderTextColor={"#b5b5b5"}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        onChangeText={( NET ) => {
                                            this.setState( { NET } )
                                        }}
                                        underlineColorAndroid={"transparent"}
                                    />
                                    <Text style={styles.eosSymbol}>{this.props.systemToken}</Text>
                                </View>
                            </View>

                            <View style={[commonStyles.commonIntervalStyle, { marginTop: 15 }]} />

                            <View style={{
                                height: 50,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 16,
                                        color: '#323232',
                                        fontWeight: '600'
                                    }}>{  I18n.t( Keys.vote_total ) }</Text>
                                </View>
                                <View style={{
                                    marginLeft: 15,
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                }}>
                                    <Text style={{
                                        flexShrink: 1,
                                        fontFamily: 'DIN',
                                        fontSize: 20,
                                        fontWeight: '500',
                                        color: '#323232'
                                    }}
                                    numberOfLines={1}
                                    >{ Util.numberStandard(totalVote, 4) }</Text>
                                    <Text style={[styles.eosSymbol, { marginTop: 5 }]}>{this.props.systemToken}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={{
                        fontSize: 12,
                        color: '#b5b5b5',
                        textAlign: 'center',
                        marginHorizontal: 15,
                        marginBottom: 15,
                        marginTop: 20
                    }}>
                        {  I18n.t( Keys.add_resource_tip ) }
                    </Text>

                    <FlatList
                        style={{
                            minHeight: 100
                        }}
                        data={selectedListData}
                        keyExtractor={( item, index ) => {
                            return index + '';
                        }}
                        renderItem={( { item, index } ) => {
                            return this.renderSelected( { item, index } );
                        }}
                        ListHeaderComponent={() => {
                            return (
                                <View>
                                    <View style={{
                                        height: 40,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: '#ffffff'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            color: '#999999',
                                            marginLeft: 15,
                                        }}>
                                            {  I18n.t( Keys.has_selected_node ) }
                                        </Text>

                                        <Text style={{
                                            fontSize: 14,
                                            color: '#999999',
                                            marginRight: 15
                                        }}>
                                            {selectedListData.length} / 30
                                        </Text>
                                    </View>
                                    <View style={[commonStyles.commonIntervalStyle]} />
                                </View>
                            )
                        }}

                        ItemSeparatorComponent={() => {
                            return <View style={[ {
                                height: Util.getDpFromPx( 1 ),
                                backgroundColor: '#e8e8e8',
                                marginLeft: 15,
                            } ]}/>
                        }}
                        getItemLayout={( data, index ) => (
                            { length: 65, offset: (65 + separatorHeight) * index, index }
                        )}
                    />

                    <TouchableOpacity onPress={() => {
                        this.submitBtnClick()
                    }}>
                        <View style={{
                            marginTop: 20,
                            marginBottom: 20,
                            marginHorizontal: 15,
                            height: 44,
                            backgroundColor: '#4a4a4a',
                            borderRadius: 2,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 17,
                                color: '#ffffff',
                            }}>
                                {  I18n.t( Keys.HomePage_Submit ) }
                            </Text>
                        </View>
                    </TouchableOpacity>


                    <PasswordInputComponent
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            this.passwordComfirm(password)
                        }}
                        onClose={() => {
                            this.setState( {
                                isPswdOpen: false
                            } );
                        }}
                    />
                </ScrollView>
                {
                    this.state.isRequesting ?
                    <LoadingView/>
                    :
                    null
                }
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
    InputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff'
    },
    stakeTitle: {
        fontSize: 16,
        color: '#323232'
    },
    stakeInput: {
        width: 140,
        height: 32,
        paddingVertical: 0,
        paddingHorizontal: 5,
        borderColor: '#e8e8e8',
        borderWidth: Util.getDpFromPx( 1 ),
        backgroundColor: '#fafafa',

        fontSize: 16,
        fontFamily: 'DIN',
        fontWeight: '500',
        color: '#323232',
        textAlign: 'right'
    },
    eosSymbol: {
        fontSize: 12,
        color: '#323232',
        marginLeft: 10
    }
} );

export default EOSNodeVoteComfirmPageView;
