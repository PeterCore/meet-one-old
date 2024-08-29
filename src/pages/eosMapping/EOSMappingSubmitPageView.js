import React, { Component } from 'react';
import { InteractionManager, Slider, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";
import constStyles from "../../styles/constStyles";
import TouchableItemComponent from "../../components/TouchableItemComponent";
import WalletSelectComponent from "../wallet/components/WalletSelectComponent";
import ethers from "ethers";
import PasswordInputComponent from "../../components/PasswordInputComponent";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import ETHWalletUtil from "../../util/ETHWalletUtil";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;

class EOSMappingSubmitPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.eos_mapping_submit_title ),
        };
    };


    constructor( props ) {
        super( props );
        const { navigate, goBack, state } = props.navigation;
        const { params } = state;

        let account;
        for ( let index = 0; index < this.props.accounts.length; index++ ) {
            if ( params.address === utils.getAddress( this.props.accounts[ index ].jsonWallet.address ) ) {
                account = this.props.accounts[ index ];
            }
        }

        const token = 'EOSMapping';

        this.state = {
            token: token,
            account: account,
            isPswdOpen: false,

            gasPrice: utils.bigNumberify( this.props.blockData.gasPrice ),
            estimateGasLimit: this.props.transferGasLimit[ token ] ? utils.bigNumberify( this.props.transferGasLimit[ token ] ) : null,
            gasLimit: this.props.transferGasLimit[ token ] ? utils.bigNumberify( this.props.transferGasLimit[ token ] ).mul( utils.bigNumberify( 4 ) ) : null,

            isRequesting: false,
            isOpenAccountSelect: false
        }
    }

    componentWillMount() {
        if ( !this.state.estimateGasLimit ) {
            this.refreshGasLimit( this.state.token );
        }
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


    submit() {
        this.setState( {
            isPswdOpen: true
        } );
    }

    doEOSMapping( password ) {
        this.setState( {
            isRequesting: true
        } );

        InteractionManager.runAfterInteractions( () => {
            this.props.onDoEOSMapping(
                this.state.account,
                this.state.gasLimit,
                this.state.gasPrice,
                password,
                this.props.eosWallet.publicKey,
                ( error, resBody ) => {
                    this.setState( { isRequesting: false } );
                    if ( error ) {
                        Toast.show( error.message, { position: Toast.positions.CENTER } );
                    } else {
                        this.props.navigation.navigate( 'EOSMappingSuccessPage',
                            {
                                primaryKey: this.state.account.primaryKey,
                                eosWallet: this.props.eosWallet,
                                transactionHash: resBody.hash,
                            }
                        );
                    }
                } );
        } );
    }

    render() {
        const maxCostWei = (this.state.gasPrice && this.state.gasLimit) ? this.state.gasPrice.mul( this.state.gasLimit ) : 0;

        const options = {
            commify: true,
        };

        const balanceShow = ETHWalletUtil.formatDisplayETHBalance( this.state.account.supportToken[ 'ETH' ], options );

        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.paddingCommon, commonStyles.commonBG ]}>
                    <Text style={[ { fontSize: 14 }, commonStyles.commonSubTextColorStyle ]}>
                        {
                            I18n.t( Keys.eos_public_key_1 )
                        }
                    </Text>
                    <Text style={[ {
                        fontSize: 18,
                        marginTop: 13
                    }, commonStyles.commonTextColorStyle ]}>{this.props.eosWallet.publicKey}</Text>

                    <View style={[ commonStyles.commonIntervalStyle, {
                        marginRight: -15,
                        marginTop: 8
                    } ]}/>

                    <Text style={[ { fontSize: 13, marginTop: 20 }, commonStyles.commonSubTextColorStyle ]}>
                        {
                            I18n.t( Keys.eth_wallet )
                        }
                    </Text>


                    <TouchableItemComponent
                        containerStyle={[ { marginRight: -15, marginLeft: -15, } ]}
                        style={[ { minHeight: 64, height: 64 } ]}
                        title={null}
                        leftElement={
                            <View style={[ {} ]}>
                                <Text
                                    style={[ {
                                        fontSize: 18,
                                        width: 196
                                    }, commonStyles.commonTextColorStyle ]}
                                    numberOfLines={1}
                                    ellipsizeMode={'middle'}
                                >{utils.getAddress( this.state.account.jsonWallet.address )}</Text>
                                <Text style={[ {
                                    fontSize: 14,
                                }, commonStyles.commonSubTextColorStyle ]}>{balanceShow + ' ETH'}</Text>
                            </View>
                        }
                        onPress={() => {
                            this.setState( {
                                isOpenAccountSelect: true
                            } );
                        }}
                        headerInterval={false}
                        footerInterval={true}/>


                    <Text style={[ { fontSize: 14, marginTop: 20 }, commonStyles.commonSubTextColorStyle ]}>
                        GAS Limit
                    </Text>

                    <View style={[ { backgroundColor: 'white', marginRight: -15, marginLeft: -15, } ]}>
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
                                    this.state.gasLimit = utils.bigNumberify( parseInt( value ) );
                                    this.setState( {
                                        gasLimit: this.state.gasLimit
                                    } );
                                }}/>

                            <View style={[ {
                                flexDirection: 'row',
                            } ]}>
                                <Text style={[ { fontSize: 14, color: '#B5B5B5' } ]}>
                                    {I18n.t( Keys.slow )}
                                </Text>
                                <Text style={[ {
                                    fontSize: 14,
                                    color: '#B5B5B5',
                                    textAlign: 'center'
                                }, commonStyles.wrapper ]}>
                                    {ETHWalletUtil.formatDisplayETHBalance( maxCostWei ) + ' ether'}
                                </Text>
                                <Text style={[ { fontSize: 14, color: '#B5B5B5' } ]}>
                                    {I18n.t( Keys.quickly )}
                                </Text>
                            </View>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>
                    </View>

                    <View style={[ commonStyles.wrapper ]}>
                    </View>

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                marginTop: 30
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.submit()
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.eos_mapping_submit_contract )}
                    </Button>

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                    <PasswordInputComponent
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            this.doEOSMapping( password );
                        }}
                        onClose={() => {
                            this.setState( {
                                isPswdOpen: false
                            } );
                        }}
                    />

                    <WalletSelectComponent
                        navigation={this.props.navigation}
                        isOpen={this.state.isOpenAccountSelect}
                        isSupportImport={true}
                        isSupportEOS={false}
                        isSupportETH={true}
                        defaultPrimaryKey={this.state.account.primaryKey}
                        onResult={( item ) => {
                            let account;
                            for ( let index = 0; index < this.props.accounts.length; index++ ) {
                                if ( utils.getAddress( item.jsonWallet.address ) === utils.getAddress( this.props.accounts[ index ].jsonWallet.address ) ) {
                                    account = this.props.accounts[ index ];
                                }
                            }

                            this.setState( {
                                account: account
                            } );
                        }}
                        onImportWallet={( walletType ) => {
                            if ( walletType === 'ETH' ) {
                                this.props.navigation.navigate( 'ETHImportPage',
                                    {
                                        callback: ( account ) => {
                                            const { navigate, goBack, state } = this.props.navigation;

                                            goBack();

                                            this.setState( {
                                                account: account
                                            } );
                                        }
                                    } );
                            } else {
                            }
                        }}
                        onClose={() => {
                            this.setState( {
                                isOpenAccountSelect: false
                            } );
                        }}
                    />
                </View>
            </SafeAreaView>
        );
    }

}

export default EOSMappingSubmitPageView;
