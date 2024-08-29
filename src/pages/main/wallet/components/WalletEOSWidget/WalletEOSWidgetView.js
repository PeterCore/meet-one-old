import React, { Component } from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Clipboard,
    RefreshControl
} from 'react-native';
import Button from "react-native-button";
import commonStyles from "../../../../../styles/commonStyles";
import Toast from "react-native-root-toast";
import constStyles from "../../../../../styles/constStyles";
import WalletSelectComponent from "../../../../wallet/components/WalletSelectComponent";
import I18n from "../../../../../I18n";
import Keys from "../../../../../configs/Keys";
import Util from "../../../../../util/Util";
import IconSet from "../../../../../components/IconSet";
import Spinner from 'react-native-loading-spinner-overlay';
import LoadingView from "../../../../../components/LoadingView";
import PasswordInputComponent from "../../../../../components/PasswordInputComponent";
import { handleError } from '../../../../../net/parse/eosParse';
import {getInfo} from "../../../../../net/VersionNet";
import { getStore } from '../../../../../setup';
import AnalyticsUtil from '../../../../../util/AnalyticsUtil';
import TokenListComponent from './TokenListComponent';


const moment = require('moment-timezone');

class WalletEOSWidgetView extends Component {
    RefundingCountdown = ( refundsTime ) => {
        if (refundsTime === 0) {
            this.setState({
                cuntDownTime: '0d 00h'
            });
            return
        }
        // 赎回总时间（3天）
        const totalTime = 3 * 24 * 60 * 60 * 1000;
        // 现在时间
        let nowTime = new Date();
        // 赎回时间
        let CreatTime = new Date(moment.utc(refundsTime));

        CreatTime = CreatTime.getTime();
        // 倒计时时间 = 赎回总时间（三天） - （现在时间 - 赎回时间）
        let cuntDownTime = totalTime - (nowTime - CreatTime);
        // 判断赎回时间超时, 如果超时还没赎回的话，更新超时赎回状态, 用户可以选择手动赎回
        let cuntDownTimeOut = false;
        if (cuntDownTime < 0) {
            cuntDownTimeOut = true;
        }
        const minutes = Math.floor( cuntDownTime / (1000 * 60) % (60) );
        const hours = Math.floor( cuntDownTime / (1000 * 60 * 60) % 24 );
        const day = Math.floor( cuntDownTime / (1000 * 60 * 60 * 24) );
        let cuntDownTimeStr = "";
        if ( day == 0 && hours == 0 && minutes == 0 ) {
            cuntDownTimeStr = "";
        } else if ( day == 0 ) {
            cuntDownTimeStr = hours + "h " + minutes + "m";
        } else if ( day > 0 ) {
            cuntDownTimeStr = day + "d " + hours + "h";
        }
        this.setState( {
            cuntDownTime: cuntDownTimeStr,
            cuntDownTimeOut
        } );
    };

    constructor( props ) {
        super( props );

        this.state = {
            isOpenAccountSelect: false,
            hasvoted: false,
            cuntDownTime: "0d 00h",
            cuntDownTimeOut: false,
            isRequesting: false,
            isPswdOpen: false,
            refreshing: false
        }

        this._onRefresh = this._onRefresh.bind(this);
    }

    _onRefresh () {
        this.setState({
            refreshing: true
        })
        this.props.updateEOSAccountWithCallback(this.props.account, (error, result) => {
            this.setState({
                refreshing: false
            })
        });
    }

    componentWillMount() {}

    componentDidMount() {
        AnalyticsUtil.onEvent('WAmainpage');
        const {accountName, accountPublicKey: publicKey} = this.props.account;
        // 更新帐号信息
        this.props.updateEOSAccountWithCallback(this.props.account, null);
        this.props.onUpdateAccountToSecretData();
        // 打开EOS钱包上传当前Wallet信息
        getInfo({ accountName, publicKey });
    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.account.refundsTime ) {
            this.RefundingCountdown( nextProps.account.refundsTime );
        } else {
            this.RefundingCountdown(0);
        }
    }

    _refundbw(password) {
        this.setState({ isRequesting: true });
        this.props.onRefundbw(this.props.account, password, (err, result) => {
            this.setState({ isRequesting: false });
            if(!err) {
                Toast.show(I18n.t( Keys.transaction_success), { position: Toast.positions.CENTER } );
            } else {
                handleError(err);
            }
        });
    }
    // EOS Wallet jsx
    renderEOSWallet() {
        const { total_resources, self_delegated_bandwidth } = this.props.account;
        const ram_bytes = this.props.account.ram_quota;
        const { cpu_weight, net_weight } = self_delegated_bandwidth ? self_delegated_bandwidth : {
            cpu_weight: `0 ${this.props.systemToken}`,
            net_weight: `0 ${this.props.systemToken}`
        };

        const all_cpu_weight = total_resources && total_resources.cpu_weight || `0 ${this.props.systemToken}`;
        const all_net_weight = total_resources && total_resources.net_weight || `0 ${this.props.systemToken}`;
        const all_stake = Number( all_cpu_weight.split( ' ' )[ 0 ] ) + Number( all_net_weight.split( ' ' )[ 0 ] );

        const stake = Number( net_weight.split( ' ' )[ 0 ] ) + Number( cpu_weight.split( ' ' )[ 0 ] );

        const stake_to_others = this.props.account.stake_to_others ? this.props.account.stake_to_others : 0;

        const other_stake = all_stake - stake;

        const currencyBalance = Util.numberStandard(this.props.account.currencyBalance, 4);
        const refunds = this.props.account.refunds;
        // stake + refunds + currencyBalance = 总额度
        const TotalAsset = Util.numberStandard(stake + this.props.account.currencyBalance + refunds + stake_to_others, 4);
        const TotalAssetByUsd = Util.numberStandard((stake + this.props.account.currencyBalance + refunds + stake_to_others) * this.props.USD, 2);

        const hideAssets = this.props.hideAssets;

        return (
            <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)} />
                        }
                    >
                        <View style={[styles.contentAssetBox, styles.boxShadow, {marginTop: 10}]}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.props.navigation.navigate( 'EOSAccountInfoPage', {
                                        primaryKey: this.props.account.primaryKey,
                                    } );
                                    // Clipboard.setString(account_name);
                                    // Toast.show( I18n.t( Keys.copy_account_success ), { position: Toast.positions.CENTER } );
                                }}>
                                    <View style={styles.totalAssetBox}>
                                        <ImageBackground style={styles.totalAssetBgImg} source={require( "../../../../../imgs/wallet_img_background.png" )}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: 20
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.userTotalAssetTip}>{ I18n.t( Keys.VoteIndexPage_TotalAsset ) }</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        this.toggleAssetsShow();
                                                    }}>
                                                        <IconSet name={ hideAssets ? 'icon-backcopy1' : 'icon-backcopy' } style={{
                                                            fontSize: 16,
                                                            color: '#ffffff',
                                                            paddingHorizontal: 5,
                                                            opacity: 0.6
                                                        }} />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.6, marginRight: 15 }}>
                                                    <Text style={{ color: '#ffffff', }}>{ I18n.t( Keys.account_info_title ) }</Text>
                                                    <IconSet name="icon-arrow" style={{
                                                        fontSize: 12,
                                                        color: '#ffffff'
                                                    }} />
                                                </View>
                                            </View>
                                            <Text style={{ marginLeft: 25, marginTop: 10 }}>
                                                <Text style={[styles.userTotalAssetValue, styles.dinFont]}>{ hideAssets ? '****' : TotalAsset} </Text>
                                                {
                                                    hideAssets ?
                                                    null :
                                                    <Text style={[styles.userTotalAssetValueUnit, styles.dinFont]}>
                                                        {this.props.systemToken}
                                                    </Text>
                                                }
                                            </Text>
                                            {
                                                this.props.netType === 'EOS' ?
                                                <Text style={[styles.userTotalAssetByUsd, styles.dinFont]}>
                                                    { hideAssets ? '****' : '≈ $' + TotalAssetByUsd }
                                                </Text>
                                                :
                                                null
                                            }
                                        </ImageBackground>
                                    </View>
                            </TouchableOpacity>
                            <View style={styles.assetItemBox}>
                                {/* 赎回中 */}
                                {refunds == 0 ? null : (
                                    <TouchableOpacity
                                        activeOpacity={this.state.cuntDownTimeOut ? 0.6 : 1}
                                        onPress={() => {
                                            if (this.state.isRequesting) {
                                                return;
                                            } else if (!this.state.cuntDownTimeOut) {
                                                return;
                                            }
                                            const store = getStore();
                                            const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                                            if (tempPsw) {
                                                AnalyticsUtil.onEvent('WASNfree');
                                                this._refundbw(tempPsw);
                                            } else {
                                                this.setState({isPswdOpen: true});
                                            }
                                        }}
                                        style={styles.itemBox}>
                                        <View style={styles.itemRefundBox}>
                                            <View style={styles.itemTitleWrapper}>
                                                <Text style={styles.itemRefundName}>{ I18n.t( Keys.VoteIndexPage_Refunding ) }</Text>
                                                {this.state.cuntDownTimeOut ? (
                                                    <Text style={{marginTop: 3}}>
                                                        <Text style={styles.itemSubName}>{I18n.t(Keys.press_to_refund)}</Text>
                                                    </Text>
                                                ) : null}
                                            </View>
                                            {this.state.cuntDownTime && !this.state.cuntDownTimeOut ? (
                                                <Text style={{paddingLeft: 20}}>
                                                    <Text style={[styles.refundingTime]}>
                                                        <IconSet name="icon-time" style={[styles.refundingIcon]} />
                                                        {this.state.cuntDownTime}
                                                    </Text>
                                                </Text>
                                            ) : null}
                                        </View>
                                        <Text style={styles.itemValue}>
                                            { hideAssets ? '****' : Util.numberStandard(refunds, 4)}
                                            <IconSet name="icon-arrow" style={[styles.iconArrow, { opacity: 0 }]} />
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {/* 可用余额 */}
                                <TouchableOpacity
                                    onPress={() => {
                                        this.props.navigation.navigate( 'TransactionHistory' );
                                    }}
                                    style={styles.itemBox}>
                                    <Text style={styles.itemName}>{ I18n.t( Keys.VoteIndexPage_Balance ) }</Text>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={[styles.itemValue]}>
                                            {hideAssets ? '****' : currencyBalance}
                                        </Text>
                                        <IconSet name="icon-arrow" style={styles.iconArrow} />
                                    </View>
                                </TouchableOpacity>

                                {/* 已抵押资源 */}
                                <TouchableOpacity
                                    onPress={() => {
                                        // this.props.navigation.navigate( "EOSDelegatebwPage" );
                                        this.props.navigation.navigate( "EOSResourcesPage" );
                                    }}
                                    style={styles.itemBox}>
                                    <View style={[styles.itemTitleWrapper]}>
                                        <Text style={styles.itemName}>{I18n.t(Keys.delegated_balance)}</Text>
                                        <Text style={{marginTop: 3}}>
                                            <Text style={styles.itemSubName}>CPU + NET</Text>
                                        </Text>
                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        <View style={{
                                            alignItems: 'flex-end'
                                        }}>
                                            <Text style={[styles.itemValue]}>
                                                {/* stake = cpu_weight + net_weight */}
                                                {hideAssets ? '****' : Util.numberStandard(all_stake, 4)}
                                            </Text>

                                            { hideAssets || other_stake === 0 ? null :
                                                <Text style={styles.itemSubName}>
                                                    {I18n.t(Keys.eos_resources_from_others)} { Util.numberStandard(other_stake, 4) }
                                                </Text>
                                            }
                                        </View>
                                        <IconSet name="icon-arrow" style={styles.iconArrow} />
                                    </View>
                                </TouchableOpacity>

                                {/* 为他人抵押 */}
                                {
                                    stake_to_others > 0 ?
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.props.navigation.navigate( "EOSCustomDelegatePage", {
                                                unstake: true
                                            });
                                        }}
                                        style={styles.itemBox}>
                                        <View style={[styles.itemTitleWrapper]}>
                                            <Text style={styles.itemName}>{I18n.t(Keys.stake_to_others)}</Text>
                                            <Text style={{marginTop: 3}}>
                                                <Text style={styles.itemSubName}>CPU + NET</Text>
                                            </Text>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={[styles.itemValue]}>
                                                {hideAssets ? '****' : Util.numberStandard(stake_to_others, 4) }
                                            </Text>
                                            <IconSet name="icon-arrow" style={styles.iconArrow} />
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    null
                                }

                                {/* RAM */}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.props.netType === 'EOS') {
                                            this.props.navigation.navigate( "RAMExchangePage" );
                                        } else {
                                            this.props.navigation.navigate( "SideChainRamExchangePage" );
                                        }
                                    }}
                                    style={[ styles.itemBox, { borderBottomWidth: 0 } ]}>
                                    <View>
                                        <Text style={styles.itemName}>
                                            { I18n.t( Keys.VoteIndexPage_RAMBytes ) }
                                        </Text>
                                        <Text style={{marginTop: 3}}>
                                            <Text style={styles.itemSubName}>
                                                1 KB = {parseFloat(this.props.ramPrice).toFixed(4)} {this.props.systemToken}
                                            </Text>
                                        </Text>
                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        <View style={{
                                            alignItems: 'flex-end'
                                        }}>
                                            <Text style={[styles.itemValue]}>
                                                {hideAssets ? '****' : Util.numberStandard(ram_bytes / 1024)}
                                                { hideAssets ? null : <Text style={styles.itemValueUnit}> KB</Text> }
                                            </Text>

                                            { hideAssets ? null :
                                                <Text style={styles.itemSubName}>
                                                    ≈ { Util.numberStandard(ram_bytes / 1024 * parseFloat(this.props.ramPrice), 4) } {this.props.systemToken}
                                                </Text>
                                            }
                                        </View>
                                        <IconSet name="icon-arrow" style={styles.iconArrow} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[ styles.contentBox ]}>
                            <View style={styles.fuctionItemList}>
                                {/* 收款 */}
                                <TouchableOpacity style={[styles.fuctionItem, {}]}
                                    onPress={() => {
                                        this.props.navigation.navigate('EOSQRCodePage', {
                                            primaryKey: this.props.account.primaryKey
                                        });
                                    }}>
                                    <IconSet name="icon-collection" style={styles.fuctionTitleItemName} />
                                    <Text style={styles.fuctionItemName}>{I18n.t( Keys.main_page_menu_receive_money  )}</Text>
                                </TouchableOpacity>
                                <View style={styles.verticalLine}></View>
                                {/* 转账 */}
                                <TouchableOpacity style={[styles.fuctionItem, {}]}
                                    onPress={() => {
                                        if (this.props.recentAccount.length > 0){
                                            this.props.navigation.navigate( 'EOSTransferSelectPage');
                                        } else {
                                            this.props.navigation.navigate( 'EOSTransferPage');
                                        }
                                    }}>
                                    <IconSet name="icon-zhuanzhangcopy" style={styles.fuctionTitleItemName} />
                                    <Text style={styles.fuctionItemName}>{I18n.t( Keys.transfer )}</Text>
                                </TouchableOpacity>
                                <View style={styles.verticalLine}></View>
                                {/* 扫码 */}
                                <TouchableOpacity style={[styles.fuctionItem, {}]}
                                    onPress={() => {
                                        this.props.navigation.navigate( 'EOSQRScanPage' );
                                    }}>
                                    <IconSet name="icon-Artboard" style={styles.fuctionTitleItemName} />
                                    <Text style={styles.fuctionItemName}>{I18n.t( Keys.main_page_menu_scan  )}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {
                            this.renderTokenList()
                        }
                    </ScrollView>
                </View>
        );
    }

    // Token List jsx
    renderTokenList() {
        const {supportToken} = this.props.account;
        const supportTokenNames = supportToken && Object.keys(supportToken) || [];
        const hideAssets = this.props.hideAssets;
        return (
            <View>
                <View style={[ commonStyles.commonIntervalStyle, { marginBottom: 17 } ]} />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Text style={[styles.tokenTitle]}>Tokens</Text>

                    <TouchableOpacity onPress={() => {
                        AnalyticsUtil.onEvent('WAtokensearchbutton');
                        this.props.navigation.navigate( "EOSTokenSettingPage", {
                            primaryKey: this.props.account.primaryKey,
                            autoFocus: true
                        })
                    }}>
                        <View style={{
                            width: 90,
                            height: 32,
                            marginRight: 16,
                            borderRadius: 16,
                            backgroundColor: '#f5f5f5',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <IconSet name="icon-search" style={[{
                                marginRight: 5,
                                fontSize: 18,
                                color: '#323232'
                            }]} />
                            <Text style={{
                                fontSize: 14,
                                color: '#888888'
                            }}>{ I18n.t( Keys.tokens_search ) }</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {/* Token 列表 */}
                <View style={{
                        width: '100%',
                        paddingTop: 10
                    }} >

                    {this.props.supportTokens.map((item,index) => {
                        const { name, publisher } = item;
                        const publisher_token = `${publisher}_${name}`;
                        if (!(name && publisher && supportTokenNames.includes(publisher_token) && supportToken[publisher_token].isShow )) {
                            return null;
                        }

                        const price = this.props.tokenPrices[publisher_token] && this.props.tokenPrices[publisher_token].last;

                        return (
                            <TokenListComponent
                                token={item}
                                hideAssets={hideAssets}
                                price={price}
                                supportToken={supportToken}
                                netType={this.props.netType}
                                systemToken={this.props.systemToken}
                                navigation={this.props.navigation}
                                exchangeList={this.props.exchangeList}
                                oneStepTrade={this.props.oneStepTrade}
                            />
                        )
                    })}

                </View>
                <Button style={[{
                        color: constStyles.THEME_COLOR,
                        fontSize: 14,
                        paddingVertical: 15,
                        marginBottom: 10
                    }]}
                    title=''
                    onPress={() => {
                        AnalyticsUtil.onEvent('WAtokenaddbutton');
                        this.props.navigation.navigate( "EOSTokenSettingPage", {
                            primaryKey: this.props.account.primaryKey
                        })
                    }}>
                    {I18n.t(Keys.add_new_token)}
                </Button>
            </View>
        )
    }

    toggleAssetsShow() {
        this.props.onToggleAssetsShow(!this.props.hideAssets);
    }

    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        let walletName = '';

        for ( let index = 0; index < this.props.accounts.length; index++ ) {
            let value = '';
            value = this.props.accounts[ index ].accountName;
            if ( this.props.accounts[ index ].primaryKey === this.props.account.primaryKey ) {
                walletName = value;
            }
        }

        return (
            <View style={commonStyles.wrapper}>
                <View
                    style={[
                        {
                            flexDirection: 'row',
                            marginTop: 20 + (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0),
                            paddingHorizontal: 15,
                            paddingBottom: 15,
                            width: Dimensions.get( 'window' ).width,
                            justifyContent: 'space-between',
                            backgroundColor: '#FAFAFA',
                        }
                    ]}>
                    <TouchableHighlight
                        underlayColor='#ddd'
                        onPress={() => {
                            this.setState({
                                isOpenAccountSelect: true
                            });
                        }}
                        style={[
                            {
                                paddingHorizontal: 15,
                                height: 30,
                                backgroundColor: '#eee',
                                borderRadius: 100,
                            }]}>
                        <View style={[commonStyles.wrapper, {
                            paddingHorizontal: 0,
                            flexDirection: 'row', }]}>
                            <Text style={[{
                                color: '#323232',
                                fontSize: 17,
                                fontWeight: '600',
                                alignSelf: 'center',
                            }]}>
                                {walletName}
                            </Text>
                            <IconSet name="icon-arrow3" style={[{
                                fontSize: 10,
                                alignSelf: 'center',
                                marginLeft: 8,
                                lineHeight: 30
                            }]} />
                        </View>
                    </TouchableHighlight>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.navigate( 'TransactionHistory' );
                        }}
                        style={[commonStyles.justAlignCenter]}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Image
                                source={require('../../../../../imgs/nav_btn_transaction.png')}
                                style={[{ width: 22, height: 22 }]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {this.renderEOSWallet()}

                <WalletSelectComponent
                    navigation={this.props.navigation}
                    isOpen={this.state.isOpenAccountSelect}
                    isSupportImport={true}
                    isSupportEOS={true}
                    isSupportETH={false}
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
                            this.props.updateEOSAccountWithCallback( account, null )
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
                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                {/* 密码验证输入框 */}
                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this._refundbw( password )
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}/>
            </View>
        );
    }
}

const CELLHEIGHT = 60;

const styles = StyleSheet.create( {
    boxShadow: {
        shadowColor: '#e8e8e8',
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowRadius: 10,
        shadowOpacity: 0.7
    },
    contentAssetBox: {
        position: "relative",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 0,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    totalAssetBox: {
        position: "relative",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden'
    },
    totalAssetBgImg: {
        position: "relative",
        height: 135,
        width: Dimensions.get( "window" ).width - 30,
        backgroundColor: "#353535",
    },
    userTotalAssetTip: {
        marginLeft: 25,
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    userTotalAssetValue: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "500",
    },
    dinFont: {
        fontFamily: 'DIN',
    },
    userTotalAssetValueUnit: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
    },
    userTotalAssetByUsd: {
        marginLeft: 25,
        marginTop: 5,
        fontSize: 18,
        fontWeight: "500",
        color: "#fff",
        opacity: 0.6
    },
    assetItemBox: {
        position: "relative",
        paddingLeft: 15,
        paddingRight: 15,
    },
    itemBox: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: Util.getDpFromPx(1),
        borderBottomColor: "#eee",
        height: CELLHEIGHT,
    },
    itemTitleWrapper: {
        justifyContent: 'center',
        paddingVertical: 12
    },
    itemName: {
        color: "#323232",
        fontSize: 16
    },
    itemSubName: {
        fontSize: 12,
        color: '#888888'
    },
    itemValue: {
        fontFamily: 'DIN',
        fontSize: 18,
        color: "#4a4a4a",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    itemValueUnit: {
        fontSize: 14,
        color: "#323232",
    },
    itemRefundBox: {
        height: CELLHEIGHT,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    itemRefundName: {
        marginRight: 10,
        color: "#222",
        fontSize: 16,
    },
    refundingIcon: {
        fontSize: 14,
    },
    refundingTime: {
        fontSize: 14,
        color: "#555",
    },
    contentBox: {
        paddingHorizontal: 15,
    },
    tokenTitle: {
        marginLeft: 20,
        color: "#323232",
        fontSize: 18,
        fontWeight: "600",
    },
    fuctionItemList: {
        flexDirection:'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    fuctionItem: {
        flex: 1,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 25
    },
    fuctionTitleItemName: {
        color: "#323232",
        fontSize: 16,
        paddingRight: 10
    },
    fuctionItemName: {
        color: "#323232",
        fontSize: 16,
        lineHeight: 20,
    },
    // 竖直的分割线
    verticalLine: {
        flex: 0,
        width: Util.getDpFromPx(1),
        height: 30,
        backgroundColor: '#eee',
    },
    wrapper: {
        flex: 1
    },
    justAlignCenter: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconArrow: {
        fontSize: 14,
        color: '#cccccc',
        marginLeft: 2
    }
});

export default WalletEOSWidgetView;
