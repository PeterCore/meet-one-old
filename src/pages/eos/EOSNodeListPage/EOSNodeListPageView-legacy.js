import React, { Component } from "react";
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Icon from "react-native-vector-icons/Ionicons";
import NodeListSelectedResultComponent from "./components/NodeListSelectedResultComponent";
import OperationBottomComponent from "./components/OperationBottomComponent";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../../I18n";
import { defaultLogoUrl } from '../../../env';
import Util from "../../../util/Util";
import LoadingView from "../../../components/LoadingView";
import Keys from "../../../configs/Keys";

const developTeam = require( '../../../imgs/developTeamBackground.png' );

class EOSNodeListPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        let title = I18n.t( Keys.Producers_List_Title );
        return {
            title: title,
        };
    };


    constructor( props ) {
        super( props );
        this.state = {
            isOpenAccountSelect: false,
            selectedData: 0,
            isRequesting: true,
            allAsset: [],
            hasGetNodes: false
        };
    }

    componentDidMount() {
        let iVoterProducers = this.props.account.voter_info ? this.props.account.voter_info.producers : [];
        let allAsset = [].concat( this.props.allAsset );
        this.copyBpList( allAsset, iVoterProducers )


        this.props.getNodesIDInfo( this.props.account , () => {
            this.setState({
                isRequesting: false,
                hasGetNodes: true
            });
        });
    }

    componentWillReceiveProps( nextProps ) {
        // console.log('hi， new prosp', nextProps);
        let allAsset = [].concat( nextProps.allAsset );
        let iVoterProducers = (this.props.account && this.props.account.voter_info) ? this.props.account.voter_info.producers : [];
        this.copyBpList( allAsset, iVoterProducers );
    }

    onVote() {
        if (this.state.selectedData <= 0) {
            return;
        }

        let selectedNodes = []
        this.state.allAsset.map( ( bp ) => {
            if ( bp.voting ) {
                selectedNodes.push( bp )
            }
        } );

        this.props.navigation.navigate( "EOSVotePage", { selectedNodeList: selectedNodes } );
    }

    addNode( nodeItem, index ) {
        if (this.state.selectedData < 30 && this.state.hasGetNodes) {
            let allAsset = [].concat( this.state.allAsset );
            allAsset[ index ].voting = true;
            let selectedData = this.state.selectedData + 1;
            this.setState( {
                allAsset,
                selectedData
            } );
        }
    }

    removeNode( nodeItem, index ) {
        let allAsset = [].concat( this.state.allAsset );
        allAsset[ index ].voting = false;
        let selectedData = this.state.selectedData - 1;

        this.setState( {
            allAsset,
            selectedData
        } );
    }

    copyBpList( allAsset, iVoterProducers ) {
        allAsset.map( ( bp ) => {
            if ( iVoterProducers.indexOf( bp.owner ) !== -1 ) {
                bp.voting = true;
            } else {
                bp.voting = false;
            }
        } );

        this.setState( {
            allAsset,
            iVoterProducers
        } );
    }

    renderItem( { item, index } ) {
        return (
            <View key={index}
                  style={[ {
                      flex: 1,
                      backgroundColor: '#fafafa',
                      paddingLeft: 15,
                      paddingRight: 15,
                      paddingTop: 10,
                      paddingBottom: 10,
                      flexDirection: 'row',
                  } ]}>
                <View style={[ { flex: 2 } ]}>
                    <Image
                        source={{ uri: this.props.bpProducerDic[ item.owner ] ? this.props.bpProducerDic[ item.owner ].logo : defaultLogoUrl }}
                        style={{ width: 46, height: 46, borderRadius: 23, marginTop: 10 }}/>
                </View>
                <View style={[ { flex: 9 } ]}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text numberOfLines={1}
                              style={[
                                  styles.commonTextColorStyle,
                                  {
                                      fontWeight: 'bold',
                                      fontSize: 22,
                                      lineHeight: 35,
                                      fontFamily: 'PingFangSC-Semibold',
                                      color: '#323232',
                                  } ]}>
                            {this.props.bpProducerDic[ item.owner ] ? this.props.bpProducerDic[ item.owner ].organization_name : item.owner}

                        </Text>
                        <View style={[ { zIndex: -1 } ]}>
                            {
                                this.props.showLabel && this.props.contributors.indexOf( item.owner ) !== -1 &&
                                <ImageBackground source={developTeam}
                                                 style={{
                                                     marginTop: 5,
                                                     width: 120,
                                                     height: 18,
                                                     paddingLeft: 5,
                                                     paddingRight: 5,
                                                 }}>
                                    <Text
                                        style={{ textAlign: "center", lineHeight: 18, fontSize: 12, color: 'white' }}>
                                        {I18n.t( Keys.Global_Development_Team )}
                                    </Text>
                                </ImageBackground>
                            }
                        </View>
                    </View>
                    <Text numberOfLines={1}
                          style={[
                              styles.commonTextColorStyle,
                              {
                                  fontSize: 14,
                                  lineHeight: 22,
                                  fontFamily: 'PingFangSC-Semibold',
                                  color: '#323232',
                              } ]}>
                        {item.owner}
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text numberOfLines={1}
                              style={[
                                  styles.commonSubTextColorStyle,
                                  {
                                      fontSize: 14,
                                      lineHeight: 28,
                                      fontFamily: 'PingFangSC-Regular',
                                      color: '#999999',
                                      letterSpacing: 0,
                                  } ]
                              }>
                            {I18n.t( Keys.Global_Total_Votes_Percentage )} : {parseFloat( item.total_votes / this.props.totalVoteWeight * 100 ).toFixed( 2 ) + "%"}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                if ( item.voting ) {
                                    this.removeNode( item, index )
                                } else {
                                    this.addNode( item, index )
                                }
                            }}>
                            <Icon
                                style={[ {
                                    marginLeft: 10,
                                } ]}
                                name={item.voting ? 'ios-remove-circle-outline' : 'md-add-circle'}
                                size={33}
                                color={'#3c4144'}>
                            </Icon>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        );
    }

    render() {
        const viewHeight = 76;
        const separatorHeight = Util.getDpFromPx( 1 );

        const votedNode = [];
        this.state.allAsset.forEach((item,index) => {
            if ( item.voting ) {
                item.votingIndex = index;
                votedNode.push(item);
            }
        });

        return (
            <SafeAreaView style={styles.wrapper}>
                <View style={[ styles.wrapper, { backgroundColor: '#fafafa', } ]}>
                    <View style={styles.wrapper}>
                        <FlatList
                            data={this.state.allAsset}
                            keyExtractor={( item, index ) => {
                                return index + '';
                            }}
                            renderItem={( { item, index } ) => {
                                return this.renderItem( { item, index } );
                            }}
                            ItemSeparatorComponent={() => {
                                return <View style={[ {
                                    height: Util.getDpFromPx( 1 ),
                                    backgroundColor: '#e8e8e8',
                                    marginLeft: 15,
                                } ]}/>
                            }}
                            getItemLayout={( data, index ) => (
                                { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                            )}
                        />

                        <NodeListSelectedResultComponent
                            bpProducerDic={this.props.bpProducerDic}
                            totalData={ votedNode }
                            navigation={this.props.navigation}
                            isOpen={this.state.isOpenAccountSelect}
                            isSupportImport={true}
                            defaultAddress={''}
                            onResult={( item ) => {

                            }}
                            onImportWallet={() => {

                            }}
                            onClose={() => {
                                this.setState( {
                                    isOpenAccountSelect: false
                                } );
                            }}
                            onVote={() => {
                                this.onVote()
                            }}
                            onRemoveNode={( nodeItem, index ) => {
                                this.removeNode( nodeItem, index )
                            }}
                        />
                    </View>

                    <OperationBottomComponent
                        totalData={this.props.allAsset}
                        isOpenSelected={false}
                        onShowSelected={() => {
                            this.setState( {
                                isOpenAccountSelect: true
                            } );
                        }}
                        onVote={() => {
                            this.onVote()
                        }}
                    />
                </View>

                {
                    this.state.isRequesting ?
                    <LoadingView/>
                    :
                    null
                }

                {/* <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/> */}

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
    wrapper: {
        flex: 1
    },
    mgl_normal: {
        marginLeft: 15
    },
    justAlignCenter: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    commonTextColorStyle: {
        color: '#323232'
    },
    commonSubTextColorStyle: {
        color: '#999999'
    },
    commonIntervalStyle: {
        height: Util.getDpFromPx( 1 ),
        backgroundColor: '#e8e8e8'
    },
} );

export default EOSNodeListPageView;
