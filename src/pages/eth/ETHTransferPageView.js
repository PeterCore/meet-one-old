import React, { Component } from 'react';
import {
    Image,
    InteractionManager,
    Slider,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import QRScanPage from "../QRScanPage";
import Toast from "react-native-root-toast";
import ERC20TokenMap from "../../../data/ERC20TokenMap";
import PasswordInputComponent from "../../components/PasswordInputComponent";
import constStyles from "../../styles/constStyles";
import ethers from "ethers";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import * as env from "../../env";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import TextUtil from "../../util/TextUtil";
import ETHTransferConfirmComponent from "./components/ETHTransferConfirmComponent";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import format from "string-format";
import LoadingView from "../../components/LoadingView";
import TokenSelectComponent from "./components/TokenSelectComponent";
import DEBUG_DATA from "../../DEBUG_DATA";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHTransferPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.transfer_title ),
        };
    };

    constructor( props ) {
        super( props );

        const gasLimit = this.props.transferGasLimit[ props.token ] ? utils.bigNumberify( this.props.transferGasLimit[ props.token ] ).mul( utils.bigNumberify( 4 ) ) : null;
        const estimateGasLimit = this.props.transferGasLimit[ props.token ] ? utils.bigNumberify( this.props.transferGasLimit[ props.token ] ) : null;

        this.state = {
            token: props.token,
            toAddress: props.toAddress,
            amount: env.IS_DEBUG ? DEBUG_DATA.amount : '',
            remark: env.IS_DEBUG ? DEBUG_DATA.remark : '',

            isConfirmOpen: false,
            isPswdOpen: false,
            isRequesting: false,

            gasPrice: utils.bigNumberify( this.props.blockData.gasPrice ),
            estimateGasLimit: estimateGasLimit,
            gasLimit: gasLimit,

            isNetworkSelectOpen: false
        }
    }

    componentWillMount() {
        if ( !this.state.estimateGasLimit ) {
            this.refreshGasLimit( this.state.token );
        }
    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }


    refreshGasLimit( token ) {
        this.setState( {
            isRequesting: true,
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onEstimateGas( token, ( error, resBody ) => {
                if ( error ) {
                    this.setState( {
                        isRequesting: false,
                    } );
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                } else {
                    this.setState( {
                        isRequesting: false,
                        estimateGasLimit: utils.bigNumberify( resBody.gasLimit ),
                        gasLimit: utils.bigNumberify( resBody.gasLimit ).mul( utils.bigNumberify( 4 ) ),
                    } );
                }
            } )
        } );
    }


    scanQR() {
        this.props.navigation.navigate( 'QRScanPage', {
            callback: ( result ) => {
                this.setState( {
                    toAddress: result
                } );
            }
        } );
    }


    startTransaction() {
        if ( TextUtil.isEmpty( this.state.toAddress ) ) {
            Toast.show( I18n.t( Keys.please_input_receiver_address ), { position: Toast.positions.CENTER } );
            return;
        }

        if ( TextUtil.isEmpty( this.state.amount ) ) {
            Toast.show( I18n.t( Keys.please_input_amount ), { position: Toast.positions.CENTER } );
            return;
        }

        this.setState( {
            isConfirmOpen: true
        } );

    }

    doTransaction( password ) {
        const tokenInfo = ERC20TokenMap[ this.state.token ];

        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onTransfer(
                    this.state.token,
                    this.props.account,
                    this.state.gasLimit,
                    this.state.gasPrice,
                    this.state.toAddress,
                    this.state.token === 'ETH' ? utils.parseEther( this.state.amount ) : utils.parseUnits( this.state.amount, tokenInfo.decimals ),
                    this.state.remark,
                    password,
                    ( error, resBody ) => {
                        this.setState( { isRequesting: false } );
                        if ( error ) {
                            Toast.show( error.message, { position: Toast.positions.CENTER } );
                        } else {
                            this.props.navigation.navigate( 'ETHTransferProgressPage', {
                                primaryKey: this.props.account.primaryKey,
                                transactionHash: resBody.hash,
                                toAddress: this.state.toAddress
                            } );
                        }
                    } );
            } )
        }, 50 );
    }

    render() {

        let items = Object.keys( this.props.account.supportToken );

        items.sort( function ( a, b ) {
            return ERC20TokenMap[ a ].index - ERC20TokenMap[ b ].index
        } );
        let defaultIndex = 0;
        let defaultValue = items[ 0 ];

        for ( let index = 0; index < items.length; index++ ) {
            if ( items[ index ] === this.state.token ) {
                defaultIndex = index;
                defaultValue = items[ index ];
                break;
            }
        }

        const { params } = this.props.navigation.state;

        var maxCostWei = (this.state.gasPrice && this.state.gasLimit) ? this.state.gasPrice.mul( this.state.gasLimit ) : 0;

        const confirmTransferData = {
            toAddress: this.state.toAddress,
            fromAddress: this.props.account.jsonWallet.address,
            amount: this.state.amount,
            miner_fee: ETHWalletUtil.formatDisplayETHBalance( maxCostWei ) + ' ether',
            remark: this.state.remark
        };

        const options = {
            commify: true,
        };

        const balanceShow = defaultValue === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( this.props.account.supportToken[ defaultValue ], options ) :
            ETHWalletUtil.formatDisplayTokenBalance( this.props.account.supportToken[ defaultValue ], ERC20TokenMap[ defaultValue ].decimals, options );

        const balance = defaultValue === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( this.props.account.supportToken[ defaultValue ] ) :
            ETHWalletUtil.formatDisplayTokenBalance( this.props.account.supportToken[ defaultValue ], ERC20TokenMap[ defaultValue ].decimals );

        const tokenBalanceFloat = parseFloat( balance );


        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.pdt_normal ]}>
                    <KeyboardAwareScrollView>
                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, {} ]}>
                            {
                                I18n.t( Keys.receiver_wallet_address )
                            }
                        </Text>
                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                            <View style={[ { flexDirection: 'row' }, commonStyles.justAlignCenter ]}>
                                <TextInput
                                    style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.wrapper, {
                                        height: 56,
                                        paddingTop: 10
                                    } ]}
                                    underlineColorAndroid={'transparent'}
                                    onChangeText={( text ) => this.setState( { toAddress: text } )}
                                    placeholder={I18n.t( Keys.receiver_address )}
                                    defaultValue={this.state.toAddress}
                                    multiline={true}
                                />
                                <TouchableHighlight
                                    underlayColor='#ddd'
                                    onPress={() => {
                                        this.scanQR();
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
                                            source={require( '../../imgs/menu_icon_scan.png' )}
                                            style={[ { width: 22, height: 22 } ]}
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, { marginTop: 20 } ]}>
                            {
                                I18n.t( Keys.transaction_amount )
                            }
                        </Text>
                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                            <View
                                style={[ {
                                    flexDirection: 'row',
                                }, commonStyles.pdr_normal, commonStyles.justAlignCenter ]}>


                                <TouchableHighlight
                                    underlayColor='#ddd'
                                    onPress={() => {
                                        this.setState( { isNetworkSelectOpen: true } );
                                    }}
                                    style={[ { height: 44 } ]}>
                                    <View
                                        style={[ {
                                            flexDirection: 'row',
                                        }, commonStyles.wrapper, commonStyles.pdl_normal, commonStyles.pdr_normal, { height: 44 }, commonStyles.justAlignCenter ]}>
                                        <Text>
                                            {
                                                defaultValue
                                            }
                                        </Text>
                                        <Image
                                            source={require( '../../imgs/all_icon_arrow_selector.png' )}
                                            style={[ {
                                                width: 8,
                                                height: 4,
                                                marginLeft: 10
                                            } ]}
                                        />
                                    </View>
                                </TouchableHighlight>

                                <View style={[ commonStyles.commonIntervalStyle, { width: 1, height: 24 }, ]}/>

                                <TextInput
                                    style={[ commonStyles.commonInput, commonStyles.wrapper, { paddingLeft: 15 } ]}
                                    underlineColorAndroid={'transparent'}
                                    onChangeText={( text ) => this.setState( { amount: text } )}
                                    placeholder={
                                        format( I18n.t( Keys.transaction_amount_1 ), balanceShow, defaultValue )
                                    }
                                    defaultValue={this.state.amount}
                                    keyboardType={'numeric'}
                                    onBlur={() => {
                                        if ( TextUtil.isEmpty( this.state.amount ) ) {
                                            return;
                                        }

                                        const amountFloat = parseFloat( this.state.amount );

                                        if ( amountFloat > tokenBalanceFloat ) {
                                            this.setState( {
                                                amount: tokenBalanceFloat + ''
                                            } );
                                        }
                                    }}
                                />


                            </View>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, { marginTop: 20 } ]}>
                            GAS Limit:
                        </Text>

                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                            <View style={[ {}, commonStyles.pdl_normal, commonStyles.pdr_normal, {
                                marginTop: 10,
                                marginBottom: 10
                            } ]}>
                                <Slider
                                    {...this.props}
                                    minimumValue={this.state.estimateGasLimit ? this.state.estimateGasLimit.toNumber() : 0}
                                    maximumValue={this.state.estimateGasLimit ? this.state.estimateGasLimit.mul( utils.bigNumberify( 100 ) ).toNumber() : 0}
                                    value={this.state.gasLimit ? this.state.gasLimit.toNumber() : 0}
                                    minimumTrackTintColor={constStyles.THEME_COLOR}
                                    onValueChange={( value ) => {
                                        this.state.gasLimit = utils.bigNumberify( parseInt( value ) )
                                        this.setState( {
                                            gasLimit: this.state.gasLimit
                                        } );
                                    }}/>

                                <View style={[ {
                                    flexDirection: 'row',
                                } ]}>
                                    <Text style={[ { fontSize: 14, color: '#B5B5B5' } ]}>慢</Text>
                                    <Text style={[ {
                                        fontSize: 14,
                                        color: '#B5B5B5',
                                        textAlign: 'center'
                                    }, commonStyles.wrapper ]}>
                                        {ETHWalletUtil.formatDisplayETHBalance( maxCostWei ) + ' ether'}
                                    </Text>
                                    <Text style={[ { fontSize: 14, color: '#B5B5B5' } ]}>快</Text>
                                </View>
                            </View>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, { marginTop: 20 } ]}>
                            {I18n.t( Keys.remark )}
                        </Text>
                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {}, ]}/>
                            <TextInput
                                style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal, ]}
                                underlineColorAndroid={'transparent'}
                                onChangeText={( text ) => this.setState( { remark: text } )}
                                placeholder={I18n.t( Keys.remark )}
                                defaultValue={this.state.remark}
                            />
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerStyle, {
                                    height: 44,
                                    marginTop: 30,
                                },
                                commonStyles.mgr_normal, commonStyles.mgl_normal,
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {
                                this.startTransaction()
                            }}
                            title={null}
                            disabled={false}>
                            {I18n.t( Keys.confirm_to_transfer )}
                        </Button>

                    </KeyboardAwareScrollView>
                    <ETHTransferConfirmComponent
                        isOpen={this.state.isConfirmOpen}
                        onConfirm={() => {
                            this.setState( {
                                isPswdOpen: true
                            } );
                        }}
                        onClose={() => {
                            this.setState( {
                                isConfirmOpen: false
                            } );
                        }}
                        data={confirmTransferData}
                    />


                    <PasswordInputComponent
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            this.doTransaction( password );
                        }}
                        onClose={() => {
                            this.setState( {
                                isPswdOpen: false
                            } );
                        }}
                    />

                    <TokenSelectComponent
                        options={items}
                        defaultIndex={defaultIndex}
                        defaultValue={defaultValue}
                        isOpen={this.state.isNetworkSelectOpen}
                        onResult={( token ) => {
                            const gasLimit = this.props.transferGasLimit[ token ] ? utils.bigNumberify( this.props.transferGasLimit[ token ] ) : null;

                            this.setState( {
                                token: token,
                                estimateGasLimit: gasLimit,
                                gasLimit: gasLimit ? gasLimit.mul( utils.bigNumberify( 4 ) ) : null,
                            } );

                            if ( !gasLimit ) {
                                this.refreshGasLimit( token );
                            }
                        }}
                        onClose={() => {
                            this.setState( {
                                isNetworkSelectOpen: false
                            } );
                        }}
                    />

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        );
    }
}

export default ETHTransferPageView;