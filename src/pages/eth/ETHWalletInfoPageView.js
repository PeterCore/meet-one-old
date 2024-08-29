import React, { Component } from 'react';
import { InteractionManager, View, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import TouchableItemComponent from "../../components/TouchableItemComponent";
import PasswordInputComponent from "../../components/PasswordInputComponent";
import Toast from "react-native-root-toast";
import ethers from "ethers";
import Spinner from 'react-native-loading-spinner-overlay';
import ETHWalletBackupPrivateKeyPage from "./ETHWalletBackupPrivateKeyPage";
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";

const { HDNode, providers, utils, Wallet } = ethers;

class ETHWalletInfoPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.wallet_edit_title ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isPswdOpen: false,
            passwordAction: 1
        };
    }


    exportPrivateKey( password ) {
        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onExportETHWalletPrivateKey( this.props.account, password,
                    ( error, result ) => {
                        if ( error == null ) {
                            this.setState( {
                                isRequesting: false,
                            } );

                            this.props.navigation.navigate( 'ETHWalletBackupPrivateKeyPage', {
                                primaryKey: this.props.account.primaryKey,
                                privateKey: result.privateKey
                            } );

                        } else {
                            this.setState( {
                                isRequesting: false,
                            } );

                            Toast.show( error.message, { position: Toast.positions.CENTER } );
                        }
                    }
                );
            } );
        }, 50 )
    }

    exportKeystore( password ) {
        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onExportETHWalletKeystore( this.props.account, password,
                    ( error, result ) => {
                        if ( error == null ) {
                            this.setState( {
                                isRequesting: false,
                            } );

                            this.props.navigation.navigate( 'ETHWalletBackupKeystorePage', {
                                primaryKey: this.props.account.primaryKey,
                                keystore: result.jsonWallet,
                            } );
                        } else {
                            this.setState( {
                                isRequesting: false,
                            } );

                            Toast.show( error.message, { position: Toast.positions.CENTER } );
                        }
                    }
                );
            } );
        }, 50 )
    }

    deleteEthWallet( password ) {
        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onDeleteETHWallet( this.props.account, password,
                    ( error, result ) => {
                        if ( error == null ) {
                            this.setState( {
                                isRequesting: false,
                            } );

                            const { navigate, goBack, state } = this.props.navigation;
                            goBack();

                            Toast.show( I18n.t( Keys.success_to_delete_wallet ), { position: Toast.positions.CENTER } );
                        } else {
                            this.setState( {
                                isRequesting: false,
                            } );

                            Toast.show( error.message, { position: Toast.positions.CENTER } );
                        }
                    }
                );
            } );
        }, 50 )
    }


    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ {} ]}
                        title={I18n.t( Keys.address )}
                        content={utils.getAddress( this.props.account.jsonWallet.address )}
                        onPress={() => {
                            Clipboard.setString(utils.getAddress( this.props.account.jsonWallet.address));
                            Toast.show( I18n.t(Keys.copy_success), { position: Toast.positions.CENTER } );
                        }}
                        headerInterval={true}
                        footerInterval={true}
                        hideRightNav={true}
                    />

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ {} ]}
                        title={I18n.t( Keys.wallet_name )}
                        content={this.props.account.name}
                        onPress={() => {
                            this.props.navigation.navigate( 'ETHWalletNameEditPage', {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        }}
                        headerInterval={false}
                        footerInterval={true}
                    />

                    <TouchableItemComponent
                        containerStyle={[ { marginTop: 20 } ]}
                        style={[ {} ]}
                        title={I18n.t( Keys.wallet_change_password )}
                        onPress={() => {
                            this.props.navigation.navigate( 'WalletPasswordChangePage', {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        }}
                        headerInterval={true}
                        footerInterval={true}/>

                    {/* <TouchableItemComponent
                        containerStyle={[ { marginTop: 20 } ]}
                        style={[ { minHeight: this.props.account.mappingData !== null && this.props.account.mappingData !== undefined ? 64 : 44 } ]}
                        title={I18n.t( Keys.mapping_contract )}
                        content={this.props.account.mappingData !== null && this.props.account.mappingData !== undefined ? this.props.account.mappingData : '未映射'}
                        onPress={() => {

                        }}
                        headerInterval={true}
                        footerInterval={true}
                        hideRightNav={true}/> */}

                    <TouchableItemComponent
                        containerStyle={[ { marginTop: 20 } ]}
                        style={[ {} ]}
                        title={I18n.t( Keys.export_private_key )}
                        onPress={() => {
                            this.setState( {
                                isPswdOpen: true,
                                passwordAction: 1
                            } );
                        }}
                        headerInterval={true}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        style={[ {} ]}
                        title={I18n.t( Keys.export_keystore )}
                        onPress={() => {
                            this.setState( {
                                isPswdOpen: true,
                                passwordAction: 2
                            } );
                        }}
                        headerInterval={false}
                        footerInterval={true}/>


                    <View style={[commonStyles.commonIntervalStyle, { marginTop: 30 }]} />

                    <Button
                        containerStyle={[
                            commonStyles.buttonContainerStyle, {
                                height: 44,
                                backgroundColor: 'white',
                                borderRadius: 0
                            }
                        ]}
                        style={[ commonStyles.buttonContentStyle, { color: '#F65858' } ]}
                        styleDisabled={[ commonStyles.buttonDisabledStyle ]}
                        onPress={() => {
                            this.setState( {
                                isPswdOpen: true,
                                passwordAction: 3
                            } );
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.wallet_delete )}
                    </Button>

                    <View style={commonStyles.commonIntervalStyle} />

                    <PasswordInputComponent
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            if ( this.state.passwordAction === 1 ) {
                                this.exportPrivateKey( password );
                            } else if ( this.state.passwordAction === 2 ) {
                                this.exportKeystore( password );
                            } else if ( this.state.passwordAction === 3 ) {
                                this.deleteEthWallet( password )
                            }
                        }}
                        onClose={() => {
                            this.setState( {
                                isPswdOpen: false
                            } );
                        }}
                    />

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>

                </View>
            </SafeAreaView>
        );
    }
}

export default ETHWalletInfoPageView;
