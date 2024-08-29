import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Toast from "react-native-root-toast";

import LoadingView from "../../../components/LoadingView";
import commonStyles from "../../../styles/commonStyles";
import { getEOSNetworks } from "../../../net/DiscoveryNet";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

class EOSChainChangePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.net_type_selection )
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            choosedChain: {},
            isRequesting: false,
        };
    }

    componentWillMount() {
        this.props.updateChainData();
    }

    changeCurrentChain () {
        this.setState( {
            isRequesting: true
        } );

        const choosedChain = this.state.choosedChain;
        const netType = choosedChain.netType

        var data = {
            netType: netType
        }
        getEOSNetworks(data, ( err, resBody ) => {
            if (err) {
                Toast.show( I18n.t( Keys.HomePage_SomethingWrong ), { position: Toast.positions.CENTER } );
            } else {
                const resData = JSON.parse(resBody);
                this.props.updateNetworkByData ( netType, resData, () => {
                    this.setState( {
                        isRequesting: false,
                    } );

                    this.props.ChangeCurrentChain( choosedChain, () => {
                        Toast.show( I18n.t( Keys.modify_success ), { position: Toast.positions.CENTER } );
                        this.props.changeCurrentNetwork(null);
                        this.props.updateSupportTokens();
                        this.props.updateHistoryNetworks();
                        this.props.updateEOS();
                        this.props.reCalculateCurrentWallet();
                    });
                })
            }
        })
    }

    render() {
        const chainData = this.props.chainData;
        let currentChain = this.props.currentChain;

        if (currentChain === null) {
            for ( let index = 0; index < chainData.length; index++ ) {
                if ( chainData[ index ].netType === 'EOS' ) {
                    currentChain = chainData[ index ];
                    break;
                }
            }
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <Text style={{
                        marginLeft: 15,
                        marginBottom: 10,
                        fontSize: 14,
                        color: '#999999',
                    }}>
                        { I18n.t( Keys.net_type_selection ) }
                    </Text>
                    <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    {
                        chainData.map((chain, index) => {
                            let isCurrent = false, isLast = false;
                            if (index === chainData.length - 1) {
                                isLast = true;
                            }
                            if (currentChain.id === chain.id) {
                                isCurrent = true;
                            }

                            return (
                                <ListComponent
                                    chain={chain}
                                    isCurrent={isCurrent}
                                    isLast={isLast}
                                    onClick={() => {
                                        this.setState( {
                                            choosedChain: chain
                                        }, () => {
                                            this.changeCurrentChain()
                                        });
                                    }}
                                />
                            )
                        })
                    }
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

class ListComponent extends Component {
    constructor( props ) {
        super( props );
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
                    <Text style={{
                        marginLeft: 15,
                        fontSize: 16,
                        color: '#323232'
                    }}>
                        { this.props.chain.name }
                    </Text>

                    <View style={{
                        width: 16,
                        height: 16,
                        marginRight: 15
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

export default EOSChainChangePageView;
