import React, { Component } from 'react';
import commonStyles from "../../styles/commonStyles";

import * as env from "../../env";
import ethers from "ethers";
import ImageWithPlaceHolder from "../../components/ImageWithPlaceHolder";
import CustomSwitch from "../../components/CustomSwitch";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import Util from "../../util/Util";
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTokenListSettingPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.token_list_title ),
        };
    };

    constructor( props ) {
        super( props );


        this.state = {}
    }


    componentWillMount() {
    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    renderItem( { item, index } ) {
        return (
            <TouchableOpacity
                onPress={() => {
                }}>
                <View style={[ {
                    flex: 1,
                    backgroundColor: 'white',
                    paddingLeft: 15,
                    paddingRight: 15,
                    paddingTop: 10,
                    paddingBottom: 10,
                    height: 64
                } ]}>
                    <View style={[ {}, ]}>
                        <View>
                            <View style={[ {
                                backgroundColor: 'white',
                                flexDirection: 'row'
                            }, commonStyles.justAlignCenter ]}>

                                <ImageWithPlaceHolder
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                    }}
                                    source={{ uri: item.icon }}
                                />

                                <View style={[ {
                                    marginLeft: 15,
                                    marginRight: 15,
                                } ]}>
                                    <Text style={[ {
                                        fontSize: 18,
                                    } ]}>
                                        {item.name}
                                    </Text>
                                    <Text style={[ {
                                        fontSize: 12,
                                    } ]}>
                                        {item.sub_name}
                                    </Text>
                                </View>

                                <View style={[ commonStyles.wrapper, {
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-end',
                                } ]}>
                                    {
                                        item.can_hide ?
                                            <CustomSwitch
                                                toggleAction={( value ) => {
                                                    if ( value ) {
                                                        this.props.onETHWalletSupportTokenAdd( this.props.account, item.name, ( error, reBody ) => {

                                                        } );
                                                    } else {
                                                        this.props.onETHWalletSupportTokenRemove( this.props.account, item.name, ( error, reBody ) => {

                                                        } );
                                                    }
                                                }}
                                                switchStatus={!!this.props.account.supportToken[ item.name ]}/>
                                            :
                                            null
                                    }
                                </View>


                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    render() {
        const viewHeight = 64;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ this.props.style, commonStyles.wrapper, commonStyles.commonBG, ]}>

                    <FlatList
                        data={env.ERC20Token}
                        keyExtractor={( item, index ) => {
                            return index;
                        }}
                        renderItem={( { item, index } ) => {
                            return this.renderItem( { item, index } );
                        }}
                        ItemSeparatorComponent={() => {
                            return <View style={[ commonStyles.commonIntervalStyle, {
                                height: separatorHeight,
                                marginLeft: 15,
                            } ]}/>
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create(
    {}
);

export default ETHTokenListSettingPageView;
