import React from "react";
import {
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import commonStyles from "../../../styles/commonStyles";
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import ethers from 'ethers';
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import ETHWalletUtil from "../../../util/ETHWalletUtil";
import ERC20TokenMap from "../../../../data/ERC20TokenMap";
import Util from "../../../util/Util";
import { getAllWallet } from "../../../actions/WalletAction";

import { getNetType } from "../../../actions/ChainAction";

const slideAnimation = new SlideAnimation( { slideFrom: 'bottom' } );

const { HDNode, providers, utils, Wallet } = ethers;

class WalletSelectComponent extends React.Component {
    static propTypes = {
        defaultPrimaryKey: PropTypes.number,
        isOpen: PropTypes.bool.isRequired,
        isSupportImport: PropTypes.bool.isRequired,
        isSupportEOS: PropTypes.bool.isRequired,
        isSupportETH: PropTypes.bool.isRequired,
        onResult: PropTypes.func.isRequired,
        onImportWallet: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen
        };

        this._onBack = this.onBack.bind( this );
    }

    componentWillMount() {
        BackHandler.addEventListener( 'hardwareBackPress', this._onBack );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener( 'hardwareBackPress', this._onBack );
    }

    componentWillReceiveProps( nextProps ) {
        if (
            nextProps.isOpen !== this.state.isOpen
        ) {
            this.setState( {
                isOpen: nextProps.isOpen
            } );
        }
    }

    onBack() {
        if ( this.state.isOpen ) {
            this.closeModal();

            return true;
        }
        return false;
    }

    closeModal() {
        if ( this.props.onClose ) {
            this.props.onClose();
        }

        this.setState(
            {
                isOpen: false,
            }
        );
    }


    renderItem( { item, index } ) {
        if ( item.walletType === 'ETH' ) {
            return this.renderETHItem( item, index );
        } else {
            return this.renderEOSItem( item, index );
        }
    }

    renderEOSItem( item, index ) {
        return (
            <TouchableOpacity
                onPress={() => {
                    if ( this.props.onResult ) {
                        this.props.onResult( item )
                    }
                    this.closeModal();
                }}>

                <View style={[ {
                    height: 64,
                    backgroundColor: 'white',
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 12,
                        flexDirection: 'row'
                    }, ]}>
                        <View style={[ , commonStyles.wrapper ]}>
                            <View style={[ { flexDirection: 'row', marginTop: 0 } ]}>
                                <Text style={[ {
                                    fontSize: 16,
                                }, commonStyles.commonTextColorStyle
                                ]}>
                                    {item.accountName}
                                </Text>
                            </View>

                            <Text
                                style={[ {
                                    fontSize: 12,
                                    width: 80,
                                    marginTop: 4,
                                }, commonStyles.commonSubTextColorStyle ]}
                                numberOfLines={1}
                                ellipsizeMode={'middle'}
                            >
                                {item.accountPublicKey}
                            </Text>
                        </View>

                        {
                            item.primaryKey === this.props.defaultPrimaryKey ?
                                <Image
                                    source={require( '../../../imgs/all_icon_selected.png' )}
                                    style={[ { width: 16, height: 16, marginTop: 9 } ]}
                                />
                                :
                                null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    renderETHItem( item, index ) {

        const options = {
            commify: true,
        };

        const balanceShow = item === 'ETH' ?
            ETHWalletUtil.formatDisplayETHBalance( item.supportToken[ 'ETH' ], options ) :
            ETHWalletUtil.formatDisplayTokenBalance( item.supportToken[ 'ETH' ], ERC20TokenMap[ 'ETH' ].decimals, options );


        return (
            <TouchableOpacity
                onPress={() => {
                    if ( this.props.onResult ) {
                        this.props.onResult( item )
                    }
                    this.closeModal();
                }}>
                <View style={[ {
                    height: 64,
                    backgroundColor: 'white',
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 12,
                        flexDirection: 'row'
                    }, ]}>
                        <View style={[ , commonStyles.wrapper ]}>
                            <View style={[ { flexDirection: 'row', marginTop: 0 } ]}>
                                <Text style={[ {
                                    fontSize: 16,
                                }, commonStyles.commonTextColorStyle
                                ]}>
                                    {item.name}
                                </Text>
                                <Text style={[ {
                                    fontSize: 12,
                                    marginTop: 4,
                                    marginLeft: 10,
                                }, commonStyles.commonSubTextColorStyle ]}>
                                    {balanceShow}
                                </Text>
                            </View>

                            <Text
                                style={[ {
                                    fontSize: 12,
                                    width: 80,
                                    marginTop: 4,
                                }, commonStyles.commonSubTextColorStyle ]}
                                numberOfLines={1}
                                ellipsizeMode={'middle'}
                            >
                                {utils.getAddress( item.jsonWallet.address )}
                            </Text>
                        </View>

                        {
                            item.primaryKey === this.props.defaultPrimaryKey ?
                                <Image
                                    source={require( '../../../imgs/all_icon_selected.png' )}
                                    style={[ { width: 16, height: 16, marginTop: 9 } ]}
                                />
                                :
                                null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    render() {
        const viewHeight = 64;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <PopupDialog
                    onDismissed={() => {
                        this.closeModal();
                    }}
                    width={Dimensions.get( 'window' ).width}
                    height={Dimensions.get( "window" ).height / 5 * 2}
                    show={this.state.isOpen}
                    dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0}}
                >
                    <View style={[ {
                        backgroundColor: 'white',
                    } ]}>
                        <View style={[ commonStyles.mgl_normal, {
                            flexDirection: 'row',
                            height: 44
                        } ]}>
                            <Text style={[ {
                                fontSize: 16,
                                marginTop: 14
                            }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{I18n.t( Keys.choose_wallet )}</Text>
                            <TouchableHighlight
                                underlayColor='#ddd'
                                onPress={() => {
                                    this.closeModal()
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
                                        source={require( '../../../imgs/all_btn_close_modal.png' )}
                                        style={[ { width: 14, height: 14 } ]}
                                    />
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <FlatList
                            data={
                                this.props.isSupportEOS ?
                                (this.props.isSupportETH ? this.props.allAccounts : this.props.eos_accounts) :
                                (this.props.isSupportETH ? this.props.eth_accounts : null)
                            }
                            keyExtractor={( item, index ) => {
                                return index;
                            }}
                            renderItem={( { item, index } ) => {
                                return this.renderItem( { item, index } );
                            }}
                            ItemSeparatorComponent={() => {
                                return (
                                    <View style={[ commonStyles.commonIntervalStyle, {
                                        height: separatorHeight,
                                        marginLeft: 15,
                                    } ]}/>
                                )
                            }}
                            getItemLayout={( data, index ) => (
                                { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                            )}
                            ListFooterComponent={() => {
                                if ( this.props.isSupportImport ) {
                                    return (
                                        <View>
                                            <View
                                                style={[ commonStyles.commonIntervalStyle, {
                                                    height: separatorHeight,
                                                    marginLeft: 15
                                                }]}/>

                                            {
                                                // 是否支持ETH钱包
                                                this.props.isSupportETH ?
                                                /*
                                                <View>
                                                    <TouchableItemComponent
                                                        style={[ { minHeight: 64, height: 64 } ]}
                                                        title={I18n.t( Keys.import_eth_wallet )}
                                                        onPress={() => {
                                                            if ( this.props.onImportWallet ) {
                                                                this.props.onImportWallet( 'ETH' );
                                                            }

                                                            this.closeModal();
                                                        }}
                                                        headerInterval={false}
                                                        footerInterval={false}/>

                                                    <View style={[ commonStyles.commonIntervalStyle, {
                                                        height: separatorHeight,
                                                        marginLeft: 15
                                                    } ]}/>
                                                </View>
                                                */
                                                null
                                                : null
                                            }

                                            {
                                                // 是否支持EOS钱包
                                                this.props.isSupportEOS ?
                                                    <View style={{paddingBottom: 64}}>
                                                        <View style={[ commonStyles.commonIntervalStyle, {
                                                            height: separatorHeight,
                                                            marginLeft: 15
                                                        } ]}/>
                                                        <TouchableItemComponent
                                                            style={[ { minHeight: 64, height: 64 } ]}
                                                            title={I18n.t( Keys.import_eos_wallet )}
                                                            onPress={() => {
                                                                if ( this.props.onImportWallet ) {
                                                                    this.props.onImportWallet( 'EOS' );
                                                                }
                                                                this.closeModal();
                                                            }}
                                                            headerInterval={false}
                                                            footerInterval={false}/>

                                                        <View style={[ commonStyles.commonIntervalStyle, {
                                                            height: separatorHeight,
                                                            marginLeft: 15
                                                        } ]}/>
                                                    </View>
                                                    :
                                                    null
                                            }
                                        </View>
                                    )
                                } else {
                                    return <View style={{minHeight: 64, height: 64}}/>;
                                }
                            }}
                        />

                    </View>

                </PopupDialog>

            </Modal>
        );
    }
}

const mapStoreToProps = ( state, ownProps ) => {
    const netType = getNetType();
    const accounts = state.eosStore.accounts.slice();
    const currentNetAccount = [];

    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].walletType === netType) {
            currentNetAccount.push(accounts[i]);
        }
    }

    return {
        eth_accounts: state.ethStore.accounts,
        eos_accounts: currentNetAccount,
        allAccounts: getAllWallet( state )
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
});

export default connect( mapStoreToProps, mapDispatchToProps )( WalletSelectComponent );
