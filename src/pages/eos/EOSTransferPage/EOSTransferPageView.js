import React, { Component } from 'react';
import {
    InteractionManager,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    Image,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../../styles/commonStyles";
import Toast from "react-native-root-toast";
import PasswordInputComponent from "../../../components/PasswordInputComponent";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import TextUtil from "../../../util/TextUtil";
import Util from "../../../util/Util";
import EOSTransferConfirmComponent from "./EOSTransferConfirmComponent";
import EOSTokenChooseComponent from "./EOSTokenChooseComponent";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import format from "string-format";
import LoadingView from "../../../components/LoadingView";
import { handleError } from '../../../net/parse/eosParse';
import { getStore } from '../../../setup';
import AnalyticsUtil from "../../../util/AnalyticsUtil";


class EOSTransferPageView extends Component {
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

        this.state = {
            from: this.props.walletAccount.accountName,
            toAddress: this.props.toAddress,
            amount: '',
            remark: this.props.memo,

            currentToken: this.props.currentToken,

            errorMsg1: '',
            errorMsg1Type: 0,
            errorMsg2: '',

            isConfirmOpen: false,
            isPswdOpen: false,
            isRequesting: false,
            isTokenSelectOpen: false
        }
    }

    scanQR() {
        this.props.navigation.navigate( 'EOSQRScanPage', {
            callback: (path) => {
                const tempArray = path.split('?');
                const routeName = tempArray[0]; //协议名称
                const queryObj = Util.parseQueryString(path, false); // Query Params Obj
                this.setState({
                    toAddress: queryObj && queryObj.params && queryObj.params.to,
                    // TODO: 后续需要做的事情
                    // remark - memo
                    // amount - 金额
                    // currentToken.name - 当前token名称
                    // currentToken.publisher - 当前token发布者
                });
            }
        } );
    }

    componentDidMount() {
        if (this.state.toAddress !== '') {
            this.checkAccountName();
        }
    }

    checkAccountName () {
        if ( TextUtil.isEmpty( this.state.toAddress ) ) {
            this.setState({
                errorMsg1: I18n.t(Keys.please_input_receiver_account),
                errorMsg1Type: 0
            });
            return;
        }

        if ( !this.state.toAddress.match(/^[1-5a-z\.]{1,12}$/g)) {
            this.setState({
                errorMsg1: I18n.t( Keys.please_input_correct_account ),
                errorMsg1Type: 0
            });
            return;
        }

        if ( this.state.toAddress === this.state.from ) {
            this.setState({
                errorMsg1: I18n.t( Keys.cant_transferto_self ),
                errorMsg1Type: 0
            });
            return;
        }

        this.setState({
            errorMsg1: I18n.t(Keys.loading),
            errorMsg1Type: 0
        });

        // 向节点查询注册状态
        this.props.getAccountPost({}, {accountName: this.state.toAddress}, () => {
            // 未被注册,账号不存在
            this.setState({
                errorMsg1: I18n.t( Keys.account_not_exist ),
                errorMsg1Type: 0
            });
        }, () => {
            // 已被注册,查询是否是有合约的账号
            this.props.getAccountContract( this.state.toAddress, (err, res) => {
                // 没有部署过合约
                if (!res.abi) {
                    this.setState({
                        errorMsg1: '',
                        errorMsg1Type: 0
                    })
                } else {
                    this.setState({
                        errorMsg1: I18n.t( Keys.contract_account_warning ),
                        errorMsg1Type: 1
                    });
                }
            })
        })
    }

    _isNextButtonDisabled() {
        return TextUtil.isEmpty( this.state.toAddress ) ||
            TextUtil.isEmpty( this.state.amount) ||
            (this.state.errorMsg1Type === 0 && !TextUtil.isEmpty(this.state.errorMsg1)) ||
            !TextUtil.isEmpty(this.state.errorMsg2)
    }

    startTransaction() {
        this.setState( {
            isConfirmOpen: true
        } );
    }

    doTransaction( password ) {

        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onTransfer(
                    this.props.walletAccount,
                    {
                        from: this.state.from,
                        to: this.state.toAddress,
                        quantity: this.state.amount + ' ' + this.state.currentToken.name,
                        memo: this.state.remark,
                        tokenPublisher: this.state.currentToken.publisher
                    },
                    password,
                    ( error, resBody ) => {
                        this.setState( { isRequesting: false } );
                        if ( error ) {
                            handleError(error);
                        } else {
                            // 这里之是为了测试是否能够成功回调
                            // if (this.props.schemaCallback) {
                            //     this.props.schemaCallback(null, {
                            //         txhash: resBody.transaction_id
                            //     });
                            //     this.props.navigation.goBack();
                            //     return;
                            // }
                            this.props.navigation.navigate( 'EOSTransferResultPage', {
                                from: this.state.from,
                                to: this.state.toAddress,
                                quantity: this.state.amount + ' ' + this.state.currentToken.name,
                                memo: this.state.remark
                            } );

                        }
                    }
                );
            } )
        }, 50 );
    }

    render() {

        const { publisher, name, precision } = this.state.currentToken;

        const confirmTransferData = {
            toAddress: this.state.toAddress,
            fromAddress: this.state.from,
            amount: this.state.amount + ' ' + name,
            remark: this.state.remark
        };

        let balance;
        if (this.props.walletAccount.supportToken[`${publisher}_${name}`]) {
            balance = parseFloat(this.props.walletAccount.supportToken[`${publisher}_${name}`].balance).toFixed(precision);
        } else {
            balance = (0).toFixed(precision);
        }

        const tokenBalanceFloat = parseFloat( balance );

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG, commonStyles.pdt_normal ]}>
                    <KeyboardAwareScrollView>
                        {/* 接收者账号 */}
                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, {} ]}>
                            {
                                I18n.t( Keys.eos_receiver_wallet_address )
                            }
                        </Text>
                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                            <View style={[ { flexDirection: 'row' }, commonStyles.justAlignCenter ]}>
                                <TextInput
                                    style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.wrapper ]}
                                    underlineColorAndroid={'transparent'}
                                    onChangeText={( text ) => this.setState( { toAddress: text } )}
                                    placeholder={I18n.t( Keys.eos_receiver_address )}
                                    defaultValue={this.state.toAddress}
                                    autoCapitalize={'none'}
                                    maxLength={12}
                                    value={this.state.text}
                                    onBlur={() => {
                                        this.setState({
                                            errorMsg1: '',
                                            errorMsg1Type: 0
                                        }, () => {
                                            this.checkAccountName();
                                        });
                                    }}
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
                                            source={require( '../../../imgs/menu_icon_scan.png' )}
                                            style={[ { width: 22, height: 22 } ]}
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <Text style={[commonStyles.commonSubTextColorStyle, {
                            fontSize: 12,
                            marginLeft: 20,
                            marginRight: 20,
                            marginTop: 10,
                        }, this.state.errorMsg1 && this.state.errorMsg1.length ? {color: '#F65858'} : {}]}>{this.state.errorMsg1}</Text>

                        {/* 转账数量 */}
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
                                        this.setState( { isTokenSelectOpen: true } );
                                    }}
                                    style={[ { height: 44 } ]}>
                                    <View
                                        style={[ {
                                            flexDirection: 'row',
                                        }, commonStyles.wrapper, commonStyles.pdl_normal, commonStyles.pdr_normal, { height: 44 }, commonStyles.justAlignCenter ]}>
                                        <Text>{ name }</Text>
                                        <Image
                                            source={require( '../../../imgs/all_icon_arrow_selector.png' )}
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
                                        I18n.t( Keys.transaction_amount )
                                    }
                                    defaultValue={this.state.amount}
                                    keyboardType={'numeric'}
                                    onBlur={() => {
                                        if ( TextUtil.isEmpty( this.state.amount ) ) {
                                            this.setState({
                                                errorMsg2: I18n.t(Keys.please_input_amount)
                                            });
                                            return;
                                        }

                                        if ( Number(this.state.amount) ) {
                                            let amountFloat = parseFloat( this.state.amount );
                                            if ( amountFloat > tokenBalanceFloat ) {
                                                amountFloat = tokenBalanceFloat;
                                            }
                                            if (precision) {
                                                amountFloat = amountFloat.toFixed(precision)
                                            }

                                            if (amountFloat <= 0) {
                                                this.setState( {
                                                    amount: amountFloat + '',
                                                    errorMsg2: I18n.t(Keys.please_input_amount)
                                                } );
                                            } else {
                                                this.setState( {
                                                    amount: amountFloat + '',
                                                    errorMsg2: ''
                                                } );
                                            }
                                        } else {
                                            this.setState({
                                                errorMsg2: I18n.t(Keys.please_input_amount)
                                            });
                                            return;
                                        }
                                    }}
                                />
                            </View>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 12,
                                marginLeft: 20,
                                marginRight: 20,
                                marginTop: 10,
                                color: '#999999'
                            }}>
                                { format( I18n.t( Keys.transaction_amount_1 ), balance, name ) }
                            </Text>

                            <Text style={[commonStyles.commonSubTextColorStyle, {
                                fontSize: 12,
                                marginRight: 20,
                                marginTop: 10,
                            }, this.state.errorMsg2 && this.state.errorMsg2.length ? {color: '#F65858'} : {}]}>{this.state.errorMsg2}</Text>
                        </View>

                        {/* 备注信息 memo */}
                        <Text
                            style={[ commonStyles.pdl_normal, commonStyles.pdr_normal, commonStyles.commonSubTextColorStyle, { marginTop: 20 } ]}>
                            {I18n.t( Keys.eos_remark )}
                        </Text>
                        <View style={[ { backgroundColor: 'white', marginTop: 10 } ]}>
                            <View style={[ commonStyles.commonIntervalStyle, {}, ]}/>
                            <TextInput
                                style={[ commonStyles.commonInput, commonStyles.pdl_normal, commonStyles.pdr_normal ]}
                                underlineColorAndroid={'transparent'}
                                // 中文支持问题， issues
                                // https://github.com/facebook/react-native/issues/12599
                                // value={this.state.remark}
                                onChangeText={( text ) => this.setState( { remark: text } )}
                                // onChange={(evt) => this.setState({ remark: evt.nativeEvent.text })}
                                // onChangeText={(text) => setTimeout(() => {this.setState({ remark: text })})}
                                // onEndEditing={(evt) => this.setState({ remark: evt.nativeEvent.text })}
                                placeholder={I18n.t( Keys.eos_remark )}
                                defaultValue={this.state.remark}
                                autoCapitalize={'none'}/>
                            <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                        </View>

                        {
                            this.props.history ?
                            <Text style={{
                                paddingHorizontal: 20,
                                fontSize: 12,
                                color: '#ff4249',
                                marginTop: 10,
                                lineHeight: 20
                            }}>{ I18n.t( Keys.eos_recentTrans_memotip ) }</Text>
                            :
                            null
                        }

                        {/* 确定按钮 */}
                        <Button
                            containerStyle={[
                                commonStyles.buttonContainerDisabledStyle, {
                                    height: 44,
                                    marginTop: 60,
                                },
                                this._isNextButtonDisabled() ? { } : { backgroundColor: '#4A4A4A' },
                                commonStyles.mgr_normal, commonStyles.mgl_normal,
                            ]}
                            style={[ commonStyles.buttonContentStyle ]}
                            styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                            onPress={() => {

                                // 转账金额输入框的 blur 可能没有触发直接点击转账的情况
                                if ( TextUtil.isEmpty( this.state.amount ) ) {
                                    this.setState({
                                        errorMsg2: I18n.t(Keys.please_input_amount)
                                    });
                                    return;
                                }

                                if ( Number(this.state.amount) ) {
                                    let amountFloat = parseFloat( this.state.amount );
                                    if ( amountFloat > tokenBalanceFloat ) {
                                        amountFloat = tokenBalanceFloat;
                                    }
                                    if (precision) {
                                        amountFloat = amountFloat.toFixed(precision)
                                    }

                                    if (amountFloat <= 0) {
                                        this.setState( {
                                            amount: amountFloat + '',
                                            errorMsg2: I18n.t(Keys.please_input_amount)
                                        } );
                                    } else {
                                        this.setState( {
                                            amount: amountFloat + '',
                                            errorMsg2: ''
                                        }, () => {
                                            this.startTransaction()
                                        });
                                    }
                                } else {
                                    this.setState({
                                        errorMsg2: I18n.t(Keys.please_input_amount)
                                    });
                                    return;
                                }

                            }}
                            title={null}
                            disabled={this._isNextButtonDisabled()}>
                            {I18n.t( Keys.confirm_to_transfer )}
                        </Button>

                    </KeyboardAwareScrollView>

                    <EOSTokenChooseComponent
                        options={this.props.tokenSelectList}
                        defaultValue={this.state.currentToken}
                        isOpen={this.state.isTokenSelectOpen}
                        onResult={( item ) => {
                            this.setState( {
                                currentToken: item
                            });
                        }}
                        onClose={() => {
                            this.setState( {
                                isTokenSelectOpen: false
                            } );
                        }}
                    />

                    <EOSTransferConfirmComponent
                        isOpen={this.state.isConfirmOpen}
                        onConfirm={() => {
                            const store = getStore();
                            const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
                            if (tempPsw) {
                                AnalyticsUtil.onEvent('WASNfree');
                                this.doTransaction(tempPsw);
                            } else {
                                this.setState( { isPswdOpen: true } );
                            }
                        }}
                        onClose={() => {
                            AnalyticsUtil.onEvent('WAtransactiondialog');
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

                    {
                        this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                    }

                </View>
            </SafeAreaView>
        );
    }
}

export default EOSTransferPageView;
