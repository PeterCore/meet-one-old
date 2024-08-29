import React, { Component } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../styles/commonStyles";

import ETHTransactionListPage from "../eth/ETHTransactionListPage";
import EOSTransactionListPage from "../eos/EOSTransactionListPage/EOSTransactionListPage";
import WalletSelectComponent from "./components/WalletSelectComponent";

import I18n from "../../I18n";
import Keys from "../../configs/Keys";

class TransactionHistoryView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.transaction_list_title ),
            headerRight: (
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.state.params.selectWallet()
                    }}
                >
                    {I18n.t( Keys.select )}
                </Button>
            ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            account: props.account,
            isOpenAccountSelect: false,
        }
    }

    componentWillMount() {
        this.selectWallet = this.selectWallet.bind( this );
        this.props.navigation.setParams( { selectWallet: this.selectWallet } );
    }

    selectWallet() {
        this.setState( {
            isOpenAccountSelect: true
        } );
    }

    render() {

        return (
            <SafeAreaView style={[commonStyles.wrapper, commonStyles.commonBG]}>
                {
                    this.state.account && this.state.account.walletType === 'ETH' ?
                        <ETHTransactionListPage navigation={this.props.navigation} account={this.state.account} />
                        :
                        <EOSTransactionListPage navigation={this.props.navigation} account={this.state.account} />
                }

                <WalletSelectComponent
                    navigation={this.props.navigation}
                    isOpen={this.state.isOpenAccountSelect}
                    isSupportImport={false}
                    isSupportEOS={true}
                    isSupportETH={false}
                    defaultPrimaryKey={this.state.account ? this.state.account.primaryKey : 0}
                    onResult={( item ) => {
                        let account;
                        for ( let index = 0; index < this.props.accounts.length; index++ ) {
                            if ( item.primaryKey === this.props.accounts[ index ].primaryKey ) {
                                account = this.props.accounts[ index ];
                            }
                        }
                        this.setState( {
                            account: account
                        } );
                    }}
                    onImportWallet={() => { }}
                    onClose={() => {
                        this.setState( {
                            isOpenAccountSelect: false
                        } );
                    }}
                />

            </SafeAreaView>
        );
    }
}

export default TransactionHistoryView;
