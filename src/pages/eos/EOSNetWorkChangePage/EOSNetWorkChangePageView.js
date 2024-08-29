import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Toast from "react-native-root-toast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import lodash from 'lodash';

import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import request from "superagent";

import * as env from "../../../env";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

class EOSNetWorkChangePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_node_selection )
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            choosedNet: {},
            isRequesting: false,
            customNode: ''
        };
    }

    componentWillMount() {
        this.props.updateNetworks();
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WAnodechange');
    }

    changeNetwork () {
        this.setState( {
            isRequesting: true
        } );

        this.props.ChangeCurrentNetwork( this.state.choosedNet,
            ( error, result ) => {
                this.setState( {
                    isRequesting: false,
                } );
                if ( error == null ) {
                    Toast.show( I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } );
                    this.props.updateEOS();
                } else {
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                }
            }
        );
    }

    getCustomNodeChainId () {
        this.setState( {
            isRequesting: true
        } );
        let customNode = this.state.customNode;
        let getInfoUrl;
        if (!customNode.match('http')) {
            customNode = 'http://' + customNode;
        }

        if (customNode.match(/\/$/g)) {
            customNode = customNode.replace(/\/+$/g,'')
        }
        getInfoUrl = customNode + '/v1/chain/get_info';

        console.log(getInfoUrl)

        fetch( getInfoUrl )
            .then( ( response ) => response.json() )
            .then( ( res ) => {
                console.log(res)
                this.setState({
                    choosedNet: {
                        chain_id: res.chain_id,
                        domains: [customNode],
                        is_mainnet: true,
                        name: 'CustomNode'
                    }
                }, () => {
                    this.changeNetwork()
                })
            } )
            .catch( err => {
                this.setState( {
                    isRequesting: false
                } );
                Toast.show( I18n.t( Keys.eos_get_chainid_error ) , { position: Toast.positions.CENTER } );
            } )
    }

    render() {
        const eosNetworks = this.props.eosNetworks;
        const currentNetwork = this.props.currentNetwork;

        let allNetworks = [];
        // 正式包去掉测试节点
        eosNetworks.forEach(item => {
            if (!env.IS_DEBUG) {
                if (item.is_mainnet) {
                    allNetworks.push(item)
                }
            } else {
                allNetworks.push(item);
            }
        });

        let customNodeUrl = '';
        if (currentNetwork.name === 'CustomNode') {
            customNodeUrl = currentNetwork.domains[0];
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <KeyboardAwareScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <Text style={{
                        marginLeft: 15,
                        marginBottom: 10,
                        fontSize: 14,
                        color: '#999999',
                    }}>
                        { I18n.t( Keys.eos_node_selectlabel ) }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15,
                        height: 32,
                        backgroundColor: '#ffffff'
                    }}>
                        <Text style={{
                            color: '#999999',
                            fontSize: 12,
                        }}>{ I18n.t( Keys.eos_node_location ) }</Text>
                        <Text style={{
                            color: '#999999',
                            fontSize: 12,
                        }}>{ I18n.t( Keys.eos_node_speed ) }</Text>
                    </View>
                    {
                        allNetworks.map((network, index) => {
                            let isCurrent = false, isLast = false;
                            if (index === allNetworks.length - 1) {
                                isLast = true;
                            }
                            if (lodash.isEqual(currentNetwork, network)) {
                                isCurrent = true;
                            }

                            return (
                                <NodeListComponent
                                    network={network}
                                    isCurrent={isCurrent}
                                    isLast={isLast}
                                    onClick={() => {
                                        this.setState( {
                                            choosedNet: network
                                        }, () => {
                                            this.changeNetwork()
                                        });
                                    }}
                                />
                            )
                        })
                    }
                    <Text style={{
                        fontSize: 12,
                        color: '#b5b5b5',
                        marginLeft: 15,
                        marginTop: 10,
                        marginBottom: 30
                    }}>
                        { I18n.t( Keys.eos_node_speed_tip ) }
                    </Text>

                    <Text style={{
                        marginLeft: 15,
                        marginBottom: 10,
                        fontSize: 14,
                        color: '#999999',
                    }}>
                        { I18n.t( Keys.eos_node_customlabel ) }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    <View style={{
                        flexDirection: 'row',
                        height: 44,
                        alignItems: 'center',
                        paddingHorizontal: 15,
                        backgroundColor: '#ffffff'
                    }}>
                        <Text style={{
                            width: 70,
                            fontSize: 16,
                            color: '#999999',
                            marginRight: 15
                        }}>{ I18n.t( Keys.eos_node_server_url ) }</Text>

                        <TextInput
                            style={{
                                flex: 1,
                                height: 44,
                                fontSize: 16,
                                color: '#323232'
                            }}
                            underlineColorAndroid={'transparent'}
                            placeholder={ I18n.t( Keys.eos_node_server_placeholder ) }
                            defaultValue={customNodeUrl}
                            autoCapitalize={'none'}
                            onChangeText={(text) => {
                                this.setState({
                                    customNode: text
                                })
                            }}
                        />

                        {
                            customNodeUrl === '' ?
                            null
                            :
                            <View style={{
                                width: 16,
                                height: 16,
                                marginLeft: 10
                            }}>
                                <Image
                                    source={require( '../../../imgs/all_icon_selected.png' )}
                                    style={[ { width: 16, height: 16, } ]}
                                />
                            </View>
                        }
                    </View>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                    <TouchableOpacity onPress={() => {
                        if (this.state.customNode === '') {
                            return;
                        }
                        this.getCustomNodeChainId();
                    }}>
                        <View style={{
                            height: 44,
                            backgroundColor: '#ffffff',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 16,
                                color: '#1ace9a'
                            }}>{ I18n.t( Keys.eos_node_server_save ) }</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[ commonStyles.commonIntervalStyle, { marginBottom: 40 } ]}/>

                    {
                        this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}

class NodeListComponent extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            pinging: true,
            pingms: '',
            error: false
        }
    }

    componentWillMount() {
        this.nodePing();
    }

    nodePing () {
        const nodeUrl = this.props.network.domains[0] + '/v1/chain/get_info';
        const startTimestamp = new Date().toISOString();
        const start = new Date().getTime();

        console.log( "xxx PING NODE xxx startTimestamp = " + startTimestamp + "; url = " + nodeUrl );
        request
        .get( nodeUrl )
        .timeout({
            deadline: 60000, // 1 minute timeout
        })
        .then(res => {
            /* responded in time */
            const endTimestamp = new Date().toISOString();
            const now = new Date().getTime();

            const elapsed = now - start;

            console.log( "xxx PING NODE xxx endTimestamp = " + startTimestamp + "; url = " + nodeUrl + "; elapsed = " + (elapsed + ' ms') );

            this.setState({
                pinging: false,
                pingms: elapsed + ' ms'
            })
        }, err => {
            if (err.timeout) {
                this.setState({
                    pinging: false,
                    error: true,
                    pingms: I18n.t( Keys.eos_node_ping_timeout )
                })
            } else {
                this.setState({
                    pinging: false,
                    error: true,
                    pingms: I18n.t( Keys.eos_node_ping_neterror )
                })
            }
        });
    }

    render() {

        return (

            <TouchableOpacity
                onPress={() => {
                    this.props.onClick()
                }}
            >
                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                    height: 44
                }}>

                    <View style={{
                        marginLeft: 15,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#323232'
                        }}>
                            { this.props.network.name }
                        </Text>

                        <View style={{
                            width: 16,
                            height: 16,
                            marginLeft: 10
                        }}>
                            {
                                this.props.isCurrent ?
                                <Image
                                    source={require( '../../../imgs/all_icon_selected.png' )}
                                    style={[ { width: 16, height: 16, } ]}
                                />
                                :
                                null
                            }
                        </View>
                    </View>

                    <View style={{
                        marginRight: 15
                    }}>
                        {
                            this.state.pinging ?
                            <ActivityIndicator style={{ width: 40, height: 40 }}/>
                            :
                            <Text style={{
                                fontSize: 16,
                                color: this.state.error ? '#f65858' : '#999999'
                            }}>
                                {this.state.pingms}
                            </Text>
                        }
                    </View>

                </View>

                {
                    this.props.isLast ?
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    :
                    null
                }
            </TouchableOpacity>
        );
    }
}

export default EOSNetWorkChangePageView;
