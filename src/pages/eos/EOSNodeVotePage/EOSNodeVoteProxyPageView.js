import React, { Component } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../../styles/commonStyles";
import Util from "../../../util/Util";
import { getVoteProxyList } from "../../../net/DiscoveryNet";
import { handleError } from "../../../net/parse/eosParse";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import CustomSwitch from "../../../components/CustomSwitch";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import LoadingView from "../../../components/LoadingView";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Toast from "react-native-root-toast";
import { getStore } from "../../../setup";

class EOSNodeVoteProxyPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.node_list_topright_text ),
        };
    };

    constructor( props ) {
        super( props );

        const isProxy = this.props.account.voter_info.proxy !== "";

        this.state = {
            isPswdOpen: false,
            isProxy: isProxy,
            selectedProxy: '',
            proxyList: []
        };
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTvote8proxy');

        // 请求代理列表
        getVoteProxyList((err, res) => {
            // 断网或者弱网情况下，返回非JSON，解析会异常
            try {
                const resData = JSON.parse(res);
                if (resData.code === 0) {
                    this.setState({
                        proxyList: resData.data
                    })
                }
            } catch (error) {
                Toast.show(I18n.t(Keys.request_failed), { position: Toast.positions.CENTER } );
            }
        });
    }

    // 投票
    proxyVote(password) {
        this.setState( {
            isRequesting: true,
        }, () => {
            this.props.onVoteProxy( this.props.account, this.state.selectedProxy, password, (err, res) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( !err ) {
                    Toast.show( I18n.t( Keys.VotePage_vote_success ) + '!', { position: Toast.positions.CENTER } );
                } else {
                    handleError(err);
                }
            })
        });
    }

    render() {

        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <Text style={{
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 10,
                        marginBottom: 30,
                        fontSize: 14,
                        lineHeight: 20,
                        color: '#999999'
                    }}>
                        { I18n.t( Keys.vote_proxy_tip ) }
                    </Text>

                    <View style={[ commonStyles.commonIntervalStyle ]}/>
                    <TouchableOpacity
                        onPress={() => {
                            const store = getStore();
                            const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                            if (tempPsw) {
                                AnalyticsUtil.onEvent('WASNfree');
                                this.setState({selectedProxy: ''}, () => {
                                    this.proxyVote(tempPsw);
                                });
                            } else {
                                this.setState({ selectedProxy: '', isPswdOpen: true })
                            }
                        }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: 64,
                            backgroundColor: '#ffffff',
                        }}>
                            <View style={{
                                marginLeft: 15
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#323232'
                                }}>{ I18n.t( Keys.no_proxy ) }</Text>
                            </View>
                            {
                                this.props.account.voter_info.proxy === "" ?
                                <View style={{
                                    width: 22,
                                    height: 22,
                                    marginRight: 15
                                }}>
                                    <Image
                                        source={require( '../../../imgs/all_icon_selected.png' )}
                                        style={[ { width: 22, height: 22, } ]}
                                    />
                                </View>
                                :
                                null
                            }
                        </View>
                    </TouchableOpacity>
                    <View style={[ commonStyles.commonIntervalStyle ]}/>

                    {
                        this.state.proxyList.map((item, index) => {
                            return (
                                <ProxyListComponent
                                    onPress={() => {
                                        const store = getStore();
                                        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                                        if (tempPsw) {
                                            AnalyticsUtil.onEvent('WASNfree');
                                            this.setState({selectedProxy: item.account}, () => {
                                                this.proxyVote(tempPsw);
                                            });
                                        } else {
                                            this.setState({ selectedProxy: item.account, isPswdOpen: true })
                                        }
                                    }}
                                    getAccountInfo={this.props.getAccountInfo}
                                    item={item}
                                    selected={this.props.account.voter_info.proxy === item.account}
                                 />
                            )
                        })
                    }

                    <PasswordInputComponent
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            this.proxyVote(password);
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

class ProxyListComponent extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            voteWeight: ''
        }
    }

    componentDidMount() {
        // 请求代理权重信息
        const account = this.props.item.account;
        this.props.getAccountInfo(account, (err, res) => {
            if (!err) {

                let voteWeight = res.voter_info.last_vote_weight;

                voteWeight =  voteWeight / Math.pow(2, ((new Date()).getTime() - 946684800000)/1000/(86400*7*52) ) / 10000

                this.setState({
                    voteWeight: Util.numberStandard(voteWeight, 0)
                })
            }
        })
    }

    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    // height: 64,
                    paddingVertical: 10,
                    backgroundColor: '#ffffff',
                }}>
                    <View style={{
                        marginLeft: 15
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#323232'
                        }}>{this.props.item.name}</Text>

                        <View style={{
                            marginTop: 5,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                marginRight: 10,
                                fontSize: 14,
                                color: '#999999'
                            }}>{this.props.item.account}</Text>

                            {/* <View style={{
                                width: 1,
                                height: 10,
                                backgroundColor: '#999999'
                            }}/> */}
                        </View>

                        <Text style={{
                            // marginLeft: 10,
                            marginTop: 5,
                            fontSize: 14,
                            color: '#999999'
                        }}>{I18n.t( Keys.vote_proxy_weigth )} {this.state.voteWeight} EOS</Text>
                    </View>
                    {
                        this.props.selected ?
                        <View style={{
                            width: 22,
                            height: 22,
                            marginRight: 15
                        }}>
                            <Image
                                source={require( '../../../imgs/all_icon_selected.png' )}
                                style={[ { width: 22, height: 22, } ]}
                            />
                        </View>
                        :
                        null
                    }
                </View>
                <View style={[ commonStyles.commonIntervalStyle ]}/>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create( {
} );

export default EOSNodeVoteProxyPageView;
