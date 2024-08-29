import React, { Component } from 'react';
import { InteractionManager, View, Clipboard } from 'react-native';
import commonStyles from "../../styles/commonStyles";
import Button from "react-native-button";
import TouchableItemComponent from "../../components/TouchableItemComponent";
import PasswordInputComponent from "../../components/PasswordInputComponent";
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from "../../I18n";
import Keys from "../../configs/Keys";
import LoadingView from "../../components/LoadingView";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import AnalyticsUtil from "../../util/AnalyticsUtil";

// import EOSNetworkChooseComponent from "./EOSWalletImportPage/components/EOSNetworkChooseComponent";
import * as env from "../../env";

class EOSWalletInfoPageView extends Component {
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
            passwordAction: 1,
            isNetworkSelectOpen: false,
            choosedNet: {}
        };
    }


    exportPrivateKey( password ) {
        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onExportEOSWalletPrivateKey( this.props.account, password,
                    ( error, result ) => {
                        if ( error == null ) {
                            this.setState( {
                                isRequesting: false,
                            } );
                            this.props.navigation.navigate( 'EOSWalletBackupPrivateKeyPage', {
                                primaryKey: this.props.account.primaryKey,
                                privateKey: result.accountPrivateKey

                            });

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

    deleteWallet( password ) {
        this.setState( {
            isRequesting: true
        } );

        setTimeout( () => {
            InteractionManager.runAfterInteractions( () => {
                this.props.onDeleteEOSWallet( this.props.account, password,
                    ( error, result ) => {
                        if ( error == null ) {
                            this.setState( {
                                isRequesting: false,
                            } );

                            AnalyticsUtil.onEvent('WAwalletdelete');

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
                        containerStyle={[ { marginTop: 10 } ]}
                        style={[ {} ]}
                        title={ I18n.t( Keys.account_info_auth_manage ) }
                        onPress={() => {
                            this.props.navigation.navigate( 'EOSAuthManagePage', {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        }}
                        headerInterval={true}
                        footerInterval={true}/>

                    <TouchableItemComponent
                        containerStyle={[ { marginTop: 10 } ]}
                        style={[ {} ]}
                        title={I18n.t( Keys.export_private_key )}
                        onPress={() => {
                            this.setState( {
                                isPswdOpen: true,
                                passwordAction: 1
                            } );
                        }}
                        headerInterval={true}
                        footerInterval={true}
                        footerIntervalStyle={{ marginLeft: 15 }}/>

                    <TouchableItemComponent
                        containerStyle={{}}
                        style={[ {} ]}
                        title={I18n.t( Keys.wallet_change_password )}
                        onPress={() => {
                            this.props.navigation.navigate( 'WalletPasswordChangePage', {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        }}
                        headerInterval={false}
                        footerInterval={true}/>

                    <View style={[commonStyles.commonIntervalStyle, { marginTop: 20 }]} />
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
                                passwordAction: 2
                            } );
                        }}
                        title={null}
                        disabled={false}>
                        {I18n.t( Keys.wallet_delete )}
                    </Button>
                    <View style={commonStyles.commonIntervalStyle} />

                    <PasswordInputComponent
                        showRememberOptions={false}
                        isOpen={this.state.isPswdOpen}
                        onResult={( password ) => {
                            if ( this.state.passwordAction === 1 ) {
                                this.exportPrivateKey( password );
                            } else if ( this.state.passwordAction === 2 ) {
                                this.deleteWallet( password );
                            } else if ( this.state.passwordAction === 3 ) {
                                this.changeNetwork( password );
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

export default EOSWalletInfoPageView;
