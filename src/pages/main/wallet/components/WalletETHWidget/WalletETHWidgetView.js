import React, { Component } from 'react';
import { Dimensions, Image, ListView, Platform, Text, TouchableHighlight, TouchableOpacity, View, RefreshControl } from 'react-native';
import commonStyles from "../../../../../styles/commonStyles";
import Toast from "react-native-root-toast";
import ERC20TokenMap from "../../../../../../data/ERC20TokenMap";
import constStyles from "../../../../../styles/constStyles";
import MainMenuComponent from "../MainMenuComponent";
import ethers from "ethers";
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import WalletSelectComponent from "../../../../wallet/components/WalletSelectComponent";
import Button from "react-native-button";
import ImageWithPlaceHolder from "../../../../../components/ImageWithPlaceHolder";
import I18n from "../../../../../I18n";
import Keys from "../../../../../configs/Keys";
import Util from "../../../../../util/Util";
import ETHWalletUtil from "../../../../../util/ETHWalletUtil";

const { HDNode, providers, utils, Wallet } = ethers;

class WalletETHWidgetView extends Component {
    constructor( props ) {
        super( props );

        const ds = new ListView.DataSource( { rowHasChanged: ( r1, r2 ) => r1 !== r2 } );

        const items = Object.keys( props.account.supportToken );
        items.sort( function ( a, b ) {
            return ERC20TokenMap[ a ].index - ERC20TokenMap[ b ].index
        } );

        this.state = {
            menuOpen: false,
            isOpenAccountSelect: false,
            ds: ds,
            items: items,
            dataSource: ds.cloneWithRows( items ),
            refreshing: false
        }
        this._onRefresh = this._onRefresh.bind(this);
    }

    _onRefresh () {
        this.setState({
            refreshing: true
        })
        this.props.updateETHAccount( (error, result) => {
            this.setState({
                refreshing: false
            })
        });
    }

    componentWillMount() {
        this.props.updateETHData();
    }

    componentWillReceiveProps( nextProps ) {
        const items = Object.keys( nextProps.account.supportToken );
        items.sort( function ( a, b ) {
            return ERC20TokenMap[ a ].index - ERC20TokenMap[ b ].index
        } );

        this.setState( {
            items: items,
            dataSource: this.state.ds.cloneWithRows( items ),
        } );
    }

    showQRCode() {
        this.props.navigation.navigate( 'ETHQRCodePage',
            {
                primaryKey: this.props.account.primaryKey,
            }
        );
    }

    eosMapping() {
        this.props.navigation.navigate( 'EOSMappingTipPage' );
    }

    isMappinged() {
        return this.props.account.mappingData !== null && this.props.account.mappingData !== undefined;
        // return false;
    }

    renderHeaderForScrollComponent() {
        let walletName = '';

        for ( let index = 0; index < this.props.accounts.length; index++ ) {
            let value = '';
            if ( this.props.accounts[ index ].walletType === 'ETH' ) {
                value = this.props.accounts[ index ].name;
            } else {
                value = this.props.accounts[ index ].accountName;
            }

            if ( this.props.accounts[ index ].primaryKey === this.props.account.primaryKey ) {
                walletName = value;
            }
        }

        return (
            <View
                style={[ commonStyles.wrapper, commonStyles.pdl_normal, commonStyles.pdr_normal, {
                    paddingTop: Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0,
                    width: Dimensions.get( 'window' ).width
                } ]}>
                <View style={[ this.props.style, { paddingBottom: 10 } ]}>
                    <View style={[ { height: 44 } ]}>

                    </View>
                    <View style={[ { height: 45 } ]}>
                        <Text style={[ { fontSize: 32 } ]}>
                            {I18n.t( Keys.assets )}
                        </Text>

                    </View>
                </View>

                <View style={[ { flexDirection: 'row' } ]}>
                    <TouchableHighlight
                        underlayColor='#ddd'
                        onPress={() => {
                            this.setState( {
                                isOpenAccountSelect: true
                            } );
                        }}
                        style={[ { height: 28, borderRadius: 14, } ]}>
                        <View style={[ { flexDirection: 'row' }, {
                            backgroundColor: '#f5f5f5',
                            paddingLeft: 20,
                            paddingRight: 20,
                            borderRadius: 14,
                            height: 28,
                        }, commonStyles.justAlignCenter ]}>

                            <Text
                                style={[ { fontSize: 14 } ]}
                            >
                                {walletName}
                            </Text>

                            <Image
                                source={require( '../../../../../imgs/all_icon_arrow_selector.png' )}
                                style={[ {
                                    width: 8,
                                    height: 4,
                                    marginLeft: 10
                                } ]}
                            />

                        </View>
                    </TouchableHighlight>
                    <View style={[ commonStyles.wrapper ]}/>
                </View>
            </View>
        );
    }

    renderHeader() {
        let walletName = '';

        for ( let index = 0; index < this.props.accounts.length; index++ ) {
            let value = '';
            if ( this.props.accounts[ index ].walletType === 'ETH' ) {
                value = this.props.accounts[ index ].name;
            } else {
                value = this.props.accounts[ index ].accountName;
            }

            if ( this.props.accounts[ index ].primaryKey === this.props.account.primaryKey ) {
                walletName = value;
            }
        }

        let worthValueTotalFloat = 0;
        for ( let index = 0; index < this.state.items.length; index++ ) {
            let price = '0'
            if ( this.props.exchangeRates[ this.state.items[ index ] ] ) {
                price = this.props.exchangeRates[ this.state.items[ index ] ].price_cny;
            }

            const balance = this.state.items[ index ] === 'ETH' ?
                ETHWalletUtil.formatDisplayETHBalance( this.props.account.supportToken[ this.state.items[ index ] ] ) :
                ETHWalletUtil.formatDisplayTokenBalance( this.props.account.supportToken[ this.state.items[ index ] ], ERC20TokenMap[ this.state.items[ index ] ].decimals );

            const priceFloat = parseFloat( price );
            const tokenBalanceFloat = parseFloat( balance );
            const worthValueFloat = priceFloat * tokenBalanceFloat;

            worthValueTotalFloat += worthValueFloat;
        }

        const options = {
            commify: true,
        };

        const displayMoneyValue = ETHWalletUtil.formatDisplayMoneyValue( worthValueTotalFloat, options );

        return (
            <View
                style={[ commonStyles.mgl_normal, commonStyles.mgr_normal, {} ]}>

                <View style={[ { marginTop: 10, paddingBottom: 10 } ]}>
                    <Image
                        source={require( '../../../../../imgs/wallet_img_walletbg.png' )}
                        style={[ {
                            width: Dimensions.get( 'window' ).width - 40,
                            height: (Dimensions.get( 'window' ).width - 40) / 335 * (555 / 3),
                        } ]}
                    />
                    <TouchableHighlight
                        underlayColor='#ddd'
                        onPress={() => {
                            this.showQRCode();
                        }}
                        style={[ { position: 'absolute' } ]}>
                        <View style={[ {
                            width: Dimensions.get( 'window' ).width - 40,
                            height: (Dimensions.get( 'window' ).width - 40) / 335 * 160,
                            paddingTop: 20,
                            paddingRight: 20,
                            paddingBottom: 20,
                            paddingLeft: 20,
                        } ]}>
                            <View style={[ {}, commonStyles.wrapper ]}>
                                <View style={[ { flexDirection: 'row' } ]}>
                                    <Text
                                        style={[ {
                                            fontSize: 18,
                                            color: '#FFFFFF',
                                            width: 135,
                                            fontWeight: 'bold'
                                        } ]}
                                        numberOfLines={1}
                                        ellipsizeMode={'middle'}

                                    >{utils.getAddress( this.props.account.jsonWallet.address )}</Text>
                                    <Image
                                        source={require( '../../../../../imgs/wallet_icon_qrcode.png' )}
                                        style={[ {
                                            width: 14,
                                            height: 14,
                                            marginLeft: 3,
                                            marginTop: 5
                                        } ]}
                                    />

                                    <View style={[ commonStyles.wrapper, {} ]}/>
                                    {
                                        this.isMappinged() ?
                                            <Text
                                                style={[ {
                                                    fontSize: 14,
                                                    color: '#FFFFFF',
                                                } ]}
                                                numberOfLines={1}
                                            >
                                                {I18n.t( Keys.mapping_success )}
                                            </Text>
                                            :
                                            null
                                    }
                                </View>

                                <View style={[ {}, commonStyles.wrapper ]}>
                                </View>

                                <View>
                                    <View style={[ {} ]}>
                                        <Text
                                            style={[ {
                                                fontSize: 14,
                                                color: '#FFFFFF',

                                            } ]}
                                            numberOfLines={1}
                                        >{I18n.t( Keys.total_balance )}</Text>

                                        <Text
                                            style={[ {
                                                fontSize: 30,
                                                color: '#FFFFFF',
                                                fontWeight: 'bold'
                                            } ]}
                                            numberOfLines={1}
                                        >{'≈ ' + displayMoneyValue}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>

                {/* 首页暂时去掉未映射提示，逻辑还没删除，以后把多余的请求也给删掉
                    !this.isMappinged() ?
                        <View style={[ { height: EOS_MAPPING_TIP_HEIGHT } ]}>
                            <TouchableHighlight
                                onPress={() => {
                                    this.eosMapping();
                                }}
                                style={[ {} ]}>
                                <View style={[ {
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    flexDirection: 'row',
                                    backgroundColor: 'white',
                                } ]}>
                                    <Image
                                        source={require( '../../../../../imgs/all_icon_alarm.png' )}
                                        style={[ {
                                            width: 16,
                                            height: 16,
                                        } ]}
                                    />

                                    <Text
                                        style={[ {
                                            fontSize: 14,
                                            color: '#323232',
                                            marginLeft: 10
                                        }, commonStyles.wrapper ]}
                                        numberOfLines={1}
                                    >{I18n.t( Keys.eos_not_mapping_tip )}</Text>

                                    <Text
                                        style={[ {
                                            fontSize: 14,
                                            color: '#B5B5B5',
                                        } ]}
                                        numberOfLines={1}
                                    >{I18n.t( Keys.mapping_now )}</Text>


                                </View>
                            </TouchableHighlight>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>
                        :
                        null
                */}


            </View>
        );
    }


    renderBottom() {
        return (
            <View style={[ { marginLeft: 30, marginRight: 30, } ]}>
                {
                    this.isMappinged() ?
                        <View style={[ commonStyles.commonIntervalStyle ]}/>
                        :
                        null
                }
                <Button
                    style={[ {
                        color: constStyles.THEME_COLOR,
                        fontSize: 12,
                        marginTop: 20,
                        marginBottom: 15
                    } ]}
                    title=''
                    onPress={() => {
                        if ( this.props.account ) {
                            this.props.navigation.navigate( 'ETHTokenListSettingPage',
                                {
                                    primaryKey: this.props.account.primaryKey,
                                }
                            );
                        }
                    }}
                >
                    {I18n.t( Keys.add_new_token )}
                </Button>
            </View>
        );
    }


    renderItem( { item } ) {
        const viewHeight = 80;
        const separatorHeight = Util.getDpFromPx( 1 );

        let price = '0'
        if ( this.props.exchangeRates[ item ] ) {
            price = this.props.exchangeRates[ item ].price_cny;
        }

        const options = {
            commify: true,
        };

        const balanceShow = item === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( this.props.account.supportToken[ item ], options ) :
            ETHWalletUtil.formatDisplayTokenBalance( this.props.account.supportToken[ item ], ERC20TokenMap[ item ].decimals, options );

        const balance = item === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( this.props.account.supportToken[ item ] ) :
            ETHWalletUtil.formatDisplayTokenBalance( this.props.account.supportToken[ item ], ERC20TokenMap[ item ].decimals );

        const priceFloat = parseFloat( price );
        const tokenBalanceFloat = parseFloat( balance );
        const worthValueFloat = priceFloat * tokenBalanceFloat;

        const displayMoneyValue = ETHWalletUtil.formatDisplayMoneyValue( worthValueFloat, options );

        return (
            <View>
                <TouchableOpacity
                    onPress={() => {

                        this.props.navigation.navigate( 'ETHTokenDetailPage',
                            {
                                token: item,
                                primaryKey: this.props.account.primaryKey,
                            }
                        );
                    }}>
                    <View style={[ {
                        flex: 1,
                        backgroundColor: 'white',
                        marginLeft: 30,
                        marginRight: 30,
                        paddingTop: 20,
                        paddingBottom: 20,
                    } ]}>
                        <View style={[ {}, ]}>
                            <View>
                                <View style={{ backgroundColor: 'white', flexDirection: 'row' }}>
                                    <ImageWithPlaceHolder
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 25,
                                        }}
                                        source={{ uri: ERC20TokenMap[ item ].icon }}
                                    />

                                    <Text style={[ {
                                        fontSize: 18,
                                        marginLeft: 15,
                                        marginTop: 12,
                                        marginRight: 15,
                                    } ]}>
                                        {item}
                                    </Text>

                                    <View style={[ commonStyles.wrapper, {
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    } ]}>
                                        <Text style={[ {
                                            fontSize: 22,
                                        } ]}
                                              numberOfLines={1}>
                                            {
                                                balanceShow
                                            }
                                        </Text>

                                        <Text style={[ {
                                            fontSize: 14,
                                            color: '#888888'
                                        } ]}
                                              numberOfLines={1}
                                        >
                                            {'≈ ' + displayMoneyValue}
                                        </Text>
                                    </View>


                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={[ commonStyles.commonIntervalStyle, {
                    height: separatorHeight,
                    marginLeft: 30,
                    marginRight: 30
                } ]}/>
            </View>
        );
    }

    render() {
        if ( !this.props.account || this.props.account.walletType !== 'ETH' ) {
            return <View/>
        }

        const {
            onScroll = () => {
            }
        } = this.props;

        let walletName = '';

        for ( let index = 0; index < this.props.accounts.length; index++ ) {
            let value = '';
            if ( this.props.accounts[ index ].walletType === 'ETH' ) {
                value = this.props.accounts[ index ].name;
            } else {
                value = this.props.accounts[ index ].accountName;
            }

            if ( this.props.accounts[ index ].primaryKey === this.props.account.primaryKey ) {
                walletName = value;
            }
        }

        // ETHWalletUtil.formatBalance( this.props.balance )
        return (
            <View style={commonStyles.wrapper}>

                <ListView
                    ref="ListView"
                    dataSource={this.state.dataSource}
                    renderRow={( rowData ) => {
                        return this.renderItem( { item: rowData } );
                    }}
                    renderScrollComponent={props => (
                        <ParallaxScrollView
                            onScroll={onScroll}

                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}
                                />
                            }

                            headerBackgroundColor="white"
                            fadeOutForeground={false}
                            stickyHeaderHeight={STICKY_HEADER_HEIGHT}
                            parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
                            backgroundSpeed={10}

                            renderBackground={() => (
                                <View
                                    key="background"
                                    style={[ {
                                        width: window.width,
                                        height: PARALLAX_HEADER_HEIGHT,
                                        backgroundColor: 'white',
                                    } ]}>
                                </View>
                            )}

                            renderForeground={() => (
                                <View key="parallax-header" style={[ {
                                    alignItems: 'center',
                                    flex: 1,
                                    flexDirection: 'column',
                                } ]}>
                                    {this.renderHeaderForScrollComponent()}
                                </View>
                            )}

                            renderStickyHeader={() => (
                                <View key="sticky-header"
                                      style={[ {
                                          height: STICKY_HEADER_HEIGHT,
                                          width: window.width,
                                          justifyContent: 'flex-end', backgroundColor: 'white',
                                      } ]}>
                                    <TouchableHighlight
                                        onPress={() => {
                                            this.setState( {
                                                isOpenAccountSelect: true
                                            } );
                                        }}
                                        style={[
                                            commonStyles.wrapper,
                                            {
                                                marginTop: (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0),
                                                width: window.width - 100
                                            },
                                        ]}>
                                        <View style={[ commonStyles.wrapper, {
                                            backgroundColor: 'white',
                                            flexDirection: 'row',
                                        } ]}>
                                            <Text style={[ {
                                                color: 'black',
                                                fontSize: 20,
                                                marginLeft: 15,
                                                marginTop: 12
                                            } ]}>{walletName}</Text>
                                            <Image
                                                source={require( '../../../../../imgs/all_icon_arrow_selector.png' )}
                                                style={[ {
                                                    width: 8,
                                                    height: 4,
                                                    marginLeft: 10,
                                                    marginTop: 24
                                                } ]}
                                            />
                                        </View>
                                    </TouchableHighlight>

                                    <View style={[ commonStyles.commonIntervalStyle, {
                                        height: 1,
                                    } ]}/>
                                </View>
                            )}

                            renderFixedHeader={() => (
                                <View key="fixed-header" style={[ {
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 10,
                                } ]}>
                                    <View style={[ {
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end'
                                    }, ]}>

                                        {/* <TouchableHighlight
                                            underlayColor='#ddd'
                                            onPress={() => {
                                                if ( this.props.isLoggedIn ) {
                                                    this.props.navigation.navigate( 'NotificationPage' );
                                                } else {
                                                    this.props.navigation.navigate( 'AccountLoginPage' );
                                                }
                                            }}
                                            style={[ { height: 44, width: 44 } ]}>
                                            <View style={[
                                                commonStyles.wrapper,
                                                commonStyles.justAlignCenter,
                                                {
                                                    alignItems: 'center', height: 44, width: 44
                                                }
                                            ]}>
                                                <Image
                                                    source={require( '../../../../../imgs/nav_btn_mail.png' )}
                                                    style={[ { width: 22, height: 22 } ]}
                                                />
                                            </View>
                                        </TouchableHighlight> */}

                                        <TouchableHighlight
                                            underlayColor='#ddd'
                                            onPress={() => {
                                                this.setState( {
                                                    menuOpen: true
                                                } );
                                            }}
                                            style={[ { height: 44, width: 44 } ]}>
                                            <View style={[
                                                commonStyles.wrapper,
                                                commonStyles.justAlignCenter,
                                                {
                                                    height: 44, width: 44
                                                }
                                            ]}>
                                                <Image
                                                    source={require( '../../../../../imgs/nav_btn_more.png' )}
                                                    style={[ { width: 22, height: 22 } ]}
                                                />
                                            </View>
                                        </TouchableHighlight>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                    renderHeader={() => {
                        return (
                            this.renderHeader()
                        )
                    }}
                    renderFooter={() => {
                        return (
                            this.renderBottom()
                        )
                    }}
                />

                <MainMenuComponent
                    menuOpen={this.state.menuOpen}
                    menuData={[
                        {
                            title: I18n.t( Keys.main_page_menu_scan ),
                            image: require( '../../../../../imgs/menu_icon_scan.png' ),
                            index: 0
                        },
                        {
                            title: I18n.t( Keys.main_page_menu_transfer ),
                            image: require( '../../../../../imgs/menu_icon_transfer.png' ),
                            index: 1
                        },
                        {
                            title: I18n.t( Keys.main_page_menu_receive_money ),
                            image: require( '../../../../../imgs/menu_icon_collection.png' ),
                            index: 2
                        },
                        {
                            title: I18n.t( Keys.main_page_menu_transaction_history ),
                            image: require( '../../../../../imgs/menu_icon_history.png' ),
                            index: 3
                        },
                    ]}
                    onSelectMenu={( menu ) => {
                        if ( menu.index === 0 ) {
                            this.props.navigation.navigate( 'QRScanPage' );
                        } else if ( menu.index === 1 ) {
                            this.props.navigation.navigate( 'ETHTransferPage',
                                {
                                    primaryKey: this.props.account.jsonWallet.primaryKey,
                                    token: 'ETH'
                                }
                            );
                        } else if ( menu.index === 2 ) {
                            this.props.navigation.navigate( 'ETHQRCodePage', {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        } else if ( menu.index === 3 ) {
                            this.props.navigation.navigate( 'TransactionHistory' );
                        }
                    }}
                    onClose={() => {
                        this.setState( {
                            menuOpen: false
                        } );
                    }}
                />

                <WalletSelectComponent
                    navigation={this.props.navigation}
                    isOpen={this.state.isOpenAccountSelect}
                    isSupportImport={true}
                    isSupportEOS={true}
                    isSupportETH={true}
                    defaultPrimaryKey={this.props.account.primaryKey}
                    onResult={( item ) => {
                        let account;
                        for ( let index = 0; index < this.props.accounts.length; index++ ) {
                            if ( item.primaryKey === this.props.accounts[ index ].primaryKey ) {
                                account = this.props.accounts[ index ];
                            }
                        }

                        this.props.onSetDefaultWallet( account, ( error, result ) => {
                            if ( error ) {
                                Toast.show( error.message, { position: Toast.positions.CENTER } )
                            }
                        } );
                    }}
                    onImportWallet={( walletType ) => {
                        if ( walletType === 'ETH' ) {
                            this.props.navigation.navigate( 'ETHImportPage' );
                        } else {
                            this.props.navigation.navigate( 'EOSWalletImportPage' );
                        }
                    }}
                    onClose={() => {
                        this.setState( {
                            isOpenAccountSelect: false
                        } );
                    }}
                />

            </View>
        );
    }
}

const window = Dimensions.get( 'window' );

const PARALLAX_HEADER_HEIGHT = (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0) + 144;
const STICKY_HEADER_HEIGHT = 44 + (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0);
const EOS_MAPPING_TIP_HEIGHT = 54;

export default WalletETHWidgetView;
