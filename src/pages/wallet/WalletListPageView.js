import React, { Component } from 'react';
import commonStyles from "../../styles/commonStyles";
import ethers from "ethers";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import Toast from "react-native-root-toast";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Clipboard
} from 'react-native';

import Util from "../../util/Util";
import AnalyticsUtil from "../../util/AnalyticsUtil";
import TouchableItemComponent from "../../components/TouchableItemComponent";

const { HDNode, providers, utils, Wallet } = ethers;

class WalletListPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.wallet_manager_title ),
        };
    };

    constructor( props ) {
        super( props );
    }


    componentWillMount() {
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WAwalletlist');
    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    jumpToCreateWallet( walletType ) {
        if ( walletType === 'ETH' ) {
            this.props.navigation.navigate( 'ETHCreateWalletPage',
                {
                    callback: () => {
                        this.props.navigation.dispatch(
                            StackActions.reset(
                                {
                                    index: 1,
                                    actions: [
                                        NavigationActions.navigate( { routeName: 'mainPage' } ),
                                        NavigationActions.navigate( { routeName: 'WalletListPage' } ),
                                    ]
                                }
                            )
                        );
                    }
                } );
        } else {
            this.props.navigation.navigate( 'EOSWalletImportPage',
                {
                    callback: () => {
                        this.props.navigation.dispatch(
                            StackActions.reset(
                                {
                                    index: 1,
                                    actions: [
                                        NavigationActions.navigate( { routeName: 'mainPage' } ),
                                        NavigationActions.navigate( { routeName: 'WalletListPage' } ),
                                    ]
                                }
                            )
                        );
                    }
                } );
        }
    }


    renderItem( { item, index } ) {
        if ( item.walletType === 'ETH' ) {
            return this.renderETHItem( item, index );
        } else {
            return this.renderEOSItem( item, index );
        }
    }

    renderETHItem( item, index ) {

        const options = {
            commify: true,
        };

        const balanceShow = ETHWalletUtil.formatDisplayETHBalance( '' + item.supportToken[ 'ETH' ], options );
        const isMapping = item.mappingData !== null && item.mappingData !== undefined;
        return (
            <View style={[ {
                flex: 1,
                marginLeft: 15,
                marginRight: 15,
                backgroundColor: 'white',
                paddingLeft: 15,
                paddingRight: 15,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#E8E8E8'
            } ]}>
                <Text style={[ {
                    fontSize: 18,
                    marginTop: 15
                }, commonStyles.commonTextColorStyle ]}>
                    {'ETH Wallet'}
                </Text>

                <TouchableOpacity
                    onPress={()=>{
                        Clipboard.setString( utils.getAddress( item.jsonWallet.address ) );
                        Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                    }}>
                    <Text style={[ {
                        fontSize: 18,
                        marginTop: 5,
                        marginBottom: 10
                    }, commonStyles.commonSubTextColorStyle, commonStyles.monospace ]}>
                        {utils.getAddress( item.jsonWallet.address )}
                    </Text>
                </TouchableOpacity>

                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                <TouchableItemComponent
                    onPress={()=>{
                        this.props.navigation.navigate( "ETHWalletInfoPage", {
                            primaryKey: item.primaryKey
                        } );
                    }}
                    title={item.name}
                    content={balanceShow + ' ETH'}
                    headerInterval={false}
                    footerInterval={false}
                    containerStyle={{ }}
                    style={{
                        minHeight: 44,
                        height: 44,
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0
                    }}
                    titleStyle={{}}
                    contentStyle={{
                        fontSize: 16,
                        color: '#999999'
                    }}
                    leftElement={null}
                    children={null}
                    hideRightNav={false}
                />

            </View>
        );
    }

    renderEOSItem( item, index ) {
        return (
            <View style={[ {
                flex: 1,
                marginLeft: 15,
                marginRight: 15,
                backgroundColor: 'white',
                paddingLeft: 15,
                paddingRight: 15,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#E8E8E8'
            } ]}>

                <Text style={[ {
                    fontSize: 18,
                    marginTop: 15
                }, commonStyles.commonTextColorStyle ]}>
                    {`${this.props.netType} Wallet`}
                </Text>

                <TouchableOpacity
                    onPress={()=>{
                        Clipboard.setString( item.accountPublicKey );
                        Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                    }}>
                    <Text style={[ {
                        fontSize: 18,
                        marginTop: 5,
                        marginBottom: 10
                    }, commonStyles.commonSubTextColorStyle, commonStyles.monospace ]}>
                        {item.accountPublicKey}
                    </Text>
                </TouchableOpacity>

                <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                <TouchableItemComponent
                    onPress={()=>{
                        this.props.navigation.navigate( "EOSAccountInfoPage", {
                            primaryKey: item.primaryKey
                        } );
                    }}
                    title={item.accountName}
                    content={
                        Util.numberStandard(item.currencyBalance, 4) + ' ' + this.props.systemToken
                    }
                    headerInterval={false}
                    footerInterval={false}
                    containerStyle={{ }}
                    style={{
                        minHeight: 44,
                        height: 44,
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0
                    }}
                    titleStyle={{}}
                    contentStyle={{
                        fontSize: 16,
                        color: '#999999'
                    }}
                    leftElement={null}
                    children={null}
                    hideRightNav={false}
                />

            </View>
        );
    }

    render() {
        const viewHeight = 138;
        const separatorHeight = 15;

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>

                    <FlatList
                        data={this.props.accounts}
                        keyExtractor={( item, index ) => {
                            return index;
                        }}
                        renderItem={( { item, index } ) => {
                            return this.renderItem( { item, index } );
                        }}
                        ItemSeparatorComponent={() => {
                            return (
                                <View style={[ commonStyles.commonIntervalStyle, commonStyles.commonBG, {
                                    height: separatorHeight,
                                } ]}/>
                            )
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                        ListHeaderComponent={() => {
                            return (
                                <View style={[ commonStyles.commonIntervalStyle, commonStyles.commonBG, {
                                    height: separatorHeight,
                                    marginLeft: 15,
                                } ]}/>
                            )
                        }}
                        ListFooterComponent={() => {
                            return (
                                <View>
                                    {/* <TouchableHighlight
                                        underlayColor='#f7f7f7'
                                        onPress={() => {
                                            this.jumpToCreateWallet( 'ETH' )
                                        }}
                                        style={[ {
                                            marginLeft: 15,
                                            marginRight: 15,
                                            marginBottom: 20,
                                            marginTop: 20
                                        } ]}>
                                        <View
                                            style={[ {
                                                height: 64,
                                                borderRadius: 5,
                                                borderStyle: 'dashed', borderWidth: 1, borderColor: '#b5b5b5'
                                            }, commonStyles.justAlignCenter ]}>
                                            <View
                                                style={[ { flexDirection: 'row' }, commonStyles.justAlignCenter ]}>
                                                <Image
                                                    source={require( '../../imgs/nav_btn_more.png' )}
                                                    style={[ { width: 16, height: 16 } ]}
                                                />

                                                <Text style={[ {
                                                    fontSize: 16, marginLeft: 10
                                                }, commonStyles.commonSubTextColorStyle ]}
                                                      numberOfLines={1}>{I18n.t( Keys.add_new_wallet )}</Text>
                                            </View>

                                        </View>
                                    </TouchableHighlight> */}

                                    <TouchableHighlight
                                        underlayColor='#f7f7f7'
                                        onPress={() => {
                                            this.jumpToCreateWallet( 'EOS' )
                                        }}
                                        style={[ {
                                            marginLeft: 15,
                                            marginRight: 15,
                                            marginTop: 20,
                                            marginBottom: 20,
                                        } ]}>
                                        <View
                                            style={[ {
                                                height: 64,
                                                borderRadius: 5,
                                                borderStyle: 'dashed', borderWidth: 1, borderColor: '#b5b5b5'
                                            }, commonStyles.justAlignCenter ]}>
                                            <View
                                                style={[ { flexDirection: 'row' }, commonStyles.justAlignCenter ]}>
                                                <Image
                                                    source={require( '../../imgs/nav_btn_more.png' )}
                                                    style={[ { width: 16, height: 16 } ]}
                                                />

                                                <Text style={[ {
                                                    fontSize: 16, marginLeft: 10
                                                }, commonStyles.commonSubTextColorStyle ]}
                                                      numberOfLines={1}>{I18n.t( Keys.import_eos_wallet )}</Text>
                                            </View>

                                        </View>
                                    </TouchableHighlight>
                                </View>

                            )
                        }}
                    />

                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create(
    {}
);

export default WalletListPageView;
