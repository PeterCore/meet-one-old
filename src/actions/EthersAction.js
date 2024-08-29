import React from 'react';
import hdPathTypeConfig from '../../data/hdPathType';
import ethActionTypes from "../reducers/eth/ethActionTypes";
import ethers from 'ethers';
import { getStore } from "../setup";
import * as env from "../env";
import {
    netGetEtherBalance,
    netGetEtherBalanceMulti,
    netGetEtherContractABI,
    netGetEtherERCTokenBalance,
    netGetEtherTransactions,
    netGetETHEventLogs
} from "../net/ETHApiNet";
import { netGetExchangeRates } from "../net/3thNet";
import ERC20TokenMap from "../../data/ERC20TokenMap";
import I18n from "../I18n";
import Keys from "../configs/Keys";
const CryptoJS = require( "crypto-js" );
const { HDNode, providers, utils, Wallet } = ethers;
const PROVIDER = providers.getDefaultProvider( env.ethers_network );
const { PrivateKey } = require( 'eosjs-ecc' );
const defaultHDPath = hdPathTypeConfig.hdPath[ 1 ].value;

export function estimateGas( token, callback ) {
    if ( token === 'ETH' ) {
        return estimateETHTransferGas( callback );
    } else if ( token === 'EOSMapping' ) {
        return estimateEOSMappingGasestimateEOSMappingGas( callback );
    } else {
        return estimateTokenTransferGas( token, callback );
    }
}

function estimateEOSMappingGasestimateEOSMappingGas( callback ) {
    return ( dispatch ) => {
        const store = getStore();

        const accounts = store.getState().ethStore.accounts.slice();

        if ( accounts.length <= 0 ) {
            callback && callback( new Error( "没有钱包，没法计算 gas Limit" ) );
            return;
        }

        netGetEtherContractABI( env.eos_mapping_contract_address, ( err, resBody ) => {
            if ( err ) {
                callback && callback( err, null );
                return;
            }

            const store = getStore();

            const accounts = store.getState().ethStore.accounts.slice();

            if ( accounts.length <= 0 ) {
                callback && callback( new Error( "没有钱包，没法计算 gas Limit" ) );
                return;
            }

            const wallet = new ethers.Wallet( accounts[ 0 ].privateKey );
            wallet.provider = PROVIDER;

            const contract = new ethers.Contract( env.eos_mapping_contract_address, resBody.result, wallet );

            contract.estimate.register( "EOS87CGmUdBeoAhqEXuEY5qygL8Z8Th6VbFyfFLhWEo1W25EQeVN8" )
                .then( function ( gasEstimate ) {
                    dispatch( {
                        'type': ethActionTypes.ETH_UPDATE_TRANSFER_GAS_LIMIT,
                        token: 'EOSMapping',
                        gasLimit: gasEstimate.toString()
                    } );

                    callback && callback(
                        null,
                        {
                            token: 'EOSMapping',
                            gasLimit: gasEstimate.toString()
                        }
                    )
                } )
                .catch( error => {
                    callback && callback( error, null )
                } );
        } );
    };
}


function estimateETHTransferGas( callback ) {
    return ( dispatch ) => {
        const store = getStore();

        const accounts = store.getState().ethStore.accounts.slice();

        if ( accounts.length <= 0 ) {
            callback && callback( new Error( "没有钱包，没法计算 gas Limit" ) );
            return;
        }

        const wallet = new ethers.Wallet( accounts[ 0 ].privateKey );

        wallet.provider = PROVIDER;

        var transaction = {
            to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
            value: utils.parseEther( "0.1" )
        };

        const signedTransaction = wallet.sign( transaction );

        wallet.estimateGas( signedTransaction )
            .then( function ( gasEstimate ) {
                transaction.gasLimit = gasEstimate;

                dispatch( {
                    'type': ethActionTypes.ETH_UPDATE_TRANSFER_GAS_LIMIT,
                    token: 'ETH',
                    gasLimit: gasEstimate.toString()
                } );

                callback && callback( null,
                    {
                        token: 'ETH',
                        gasLimit: gasEstimate.toString()
                    } )
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


function estimateTokenTransferGas( token, callback ) {
    return ( dispatch ) => {
        const store = getStore();

        const accounts = store.getState().ethStore.accounts.slice();

        if ( accounts.length <= 0 ) {
            callback && callback( new Error( "没有钱包，没法计算 gas Limit" ) );
            return;
        }

        const tokenInfo = ERC20TokenMap[ token ];
        netGetEtherContractABI( tokenInfo.contract, ( err, resBody ) => {
            if ( err ) {
                callback && callback( err, null );
                return;
            }

            const store = getStore();

            const accounts = store.getState().ethStore.accounts.slice();

            if ( accounts.length <= 0 ) {
                callback && callback( new Error( "没有钱包，没法计算 gas Limit" ) );
                return;
            }

            const wallet = new ethers.Wallet( accounts[ 0 ].privateKey );
            wallet.provider = PROVIDER;

            const contract = new ethers.Contract( tokenInfo.contract, resBody.result, wallet );

            contract.estimate.transfer( "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290", utils.bigNumberify( 10 ) )
                .then( function ( gasEstimate ) {
                    dispatch( {
                        'type': ethActionTypes.ETH_UPDATE_TRANSFER_GAS_LIMIT,
                        token: token,
                        gasLimit: gasEstimate.toString()
                    } );

                    callback && callback(
                        null,
                        {
                            token: token,
                            gasLimit: gasEstimate.toString()
                        }
                    )
                } )
                .catch( error => {
                    callback && callback( error, null )
                } );
        } );
    };
}


export function getCurrentBlockData( callback ) {
    return ( dispatch ) => {
        PROVIDER.getBlockNumber()
            .then( function ( blockNumber ) {

                PROVIDER.getGasPrice()
                    .then( function ( gasPrice ) {
                        // gasPrice is a BigNumber; convert it to a decimal string

                        dispatch( {
                            'type': ethActionTypes.ETH_CURRENT_BLOCK_DATA,
                            blockData: {
                                blockNumber: blockNumber,
                                gasPrice: gasPrice.toString()
                            }
                        } );


                        callback && callback( null, {
                            blockNumber: blockNumber,
                            gasPrice: gasPrice
                        } );
                    } )
                    .catch( error => {
                        callback && callback( error, null )
                    } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


export function doEOSMapping( account, gasLimit, gasPrice, password, publicKey, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                wallet.provider = PROVIDER;

                netGetEtherContractABI( env.eos_mapping_contract_address, ( err, resBody ) => {
                    if ( err ) {
                        callback && callback( err, null );
                        return;
                    }

                    wallet.provider = PROVIDER;

                    const contract = new ethers.Contract( env.eos_mapping_contract_address, resBody.result, wallet );

                    const overrideOptions = {
                        gasLimit: gasLimit,
                        gasPrice: gasPrice,
                    };

                    contract.register( publicKey, overrideOptions )
                        .then( function ( transaction ) {
                            callback && callback( null, transaction )
                        } )
                        .catch( error => {
                            callback && callback( error, null )
                        } );
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


export function changeETHWalletPassword( account, oldPassword, newPassword, passwordHint, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, oldPassword )
            .then( function ( wallet ) {
                wallet.provider = PROVIDER;

                wallet.encrypt( newPassword, ( percent ) => {
                } )
                    .then( function ( json ) {
                        const account = {
                            jsonWallet: JSON.parse( json ),
                            pswdTip: passwordHint,
                        };

                        dispatch( {
                            'type': ethActionTypes.ETH_ACCOUNT_PASSWORD_CHANGE,
                            account: account
                        } );

                        callback && callback( null, {
                            account: account,
                        } );
                    } )
                    .catch( error => {
                        callback && callback( error, null )
                    } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


export function exportETHWalletPrivateKey( account, password, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                callback && callback( null, {
                    privateKey: wallet.privateKey,
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


export function exportETHWalletKeystore( account, password, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                callback && callback( null, {
                    jsonWallet: jsonWallet,
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}

export function deleteETHWallet( account, password, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                dispatch( {
                    'type': ethActionTypes.ETH_ACCOUNT_REMOVE,
                    account: account
                } );

                callback && callback( null, null );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


export function transfer( token, account, gasLimit, gasPrice, toAddress, amount, data, password, callback ) {
    if ( token === 'ETH' ) {
        return sendETHTransaction( account, gasLimit, gasPrice, toAddress, amount, data, password, callback );
    } else {
        return sendTokenTransaction( token, account, gasLimit, gasPrice, toAddress, amount, data, password, callback );
    }
}


function sendTokenTransaction( token, account, gasLimit, gasPrice, toAddress, amount, data, password, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                wallet.provider = PROVIDER;

                const tokenInfo = ERC20TokenMap[ token ];
                netGetEtherContractABI( tokenInfo.contract, ( err, resBody ) => {
                    if ( err ) {
                        callback && callback( err, null );
                        return;
                    }

                    const contract = new ethers.Contract( tokenInfo.contract, resBody.result, wallet );

                    const overrideOptions = {
                        gasLimit: gasLimit,
                        gasPrice: gasPrice,
                    };

                    contract.transfer( toAddress, amount, overrideOptions )
                        .then( function ( transaction ) {
                            callback && callback( null, transaction )
                        } )
                        .catch( error => {
                            callback && callback( error, null )
                        } );
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}

function sendETHTransaction( account, gasLimit, gasPrice, toAddress, amount, data, password, callback ) {
    return ( dispatch ) => {
        const jsonWallet = JSON.stringify( account.jsonWallet );
        Wallet.fromEncryptedWallet( jsonWallet, password )
            .then( function ( wallet ) {
                wallet.provider = PROVIDER;

                // These will query the network for appropriate values
                let options = {
                    gasLimit: gasLimit,
                    gasPrice: gasPrice,
                    data: data
                };

                wallet.send( toAddress, amount, options )
                    .then( function ( transaction ) {
                        callback && callback( null, transaction )
                    } )
                    .catch( error => {
                        callback && callback( error, null )
                    } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}

export function getTransactionCount( account, callback ) {
    return ( dispatch ) => {
        const wallet = new ethers.Wallet( account.privateKey );
        wallet.provider = PROVIDER;

        wallet.getTransactionCount()
            .then( function ( transactionCount ) {
                callback && callback( null, {
                    transactionCount: transactionCount
                } )
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}

export function getTransaction( transactionHash, callback ) {
    return ( dispatch ) => {
        PROVIDER.getTransaction( transactionHash )
            .then( function ( transaction ) {
                PROVIDER.getTransactionReceipt( transactionHash )
                    .then( function ( transactionReceipt ) {
                        callback && callback( null, {
                            transaction: transaction,
                            transactionReceipt: transactionReceipt
                        } )
                    } )
                    .catch( error => {
                        callback && callback( error, null )
                    } );

            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}


function generateMnemonics() {
    return HDNode.entropyToMnemonic( utils.randomBytes( 16 ) ).split( ' ' );
}

function isHasSameAddressWallet( address ) {
    const store = getStore();

    const accounts = store.getState().ethStore.accounts.slice();

    for ( let index = 0; index < accounts.length; index++ ) {
        if ( utils.getAddress( accounts[ index ].jsonWallet.address ) === address ) {
            return true;
        }
    }

    return false;
}

export function createEtherAccount( name, password, pswdTip, hdPathString, callback, percentCallback ) {
    const mnemonics = generateMnemonics();

    let seedPhrase = "";
    for ( let index = 0; index < mnemonics.length; index++ ) {
        seedPhrase += mnemonics[ index ];

        if ( index < mnemonics.length - 1 ) {
            seedPhrase += ' ';
        }
    }

    return importEtherAccountBySeedPhrase( name, password, pswdTip, hdPathString, seedPhrase, callback, percentCallback );
}

export function importEtherAccountBySeedPhrase( name, password, pswdTip, hdPathString, seedPhrase, callback, percentCallback ) {
    return ( dispatch ) => {
        let wallet = Wallet.fromMnemonic( seedPhrase );
        if ( isHasSameAddressWallet( utils.getAddress( wallet.address ) ) ) {
            callback && callback( Error( I18n.t( Keys.wallet_already_exist ) ), null );
            return;
        }
        wallet.encrypt( password, ( percent ) => {
            percentCallback && percentCallback( percent );
        } )
            .then( function ( json ) {
                const account = {
                    name: name.trim(),
                    jsonWallet: JSON.parse( json ),
                    pswdTip: pswdTip,
                    privateKey: wallet.privateKey
                };

                dispatch( {
                    'type': ethActionTypes.ETH_ACCOUNT_ADD,
                    account: account
                } );


                callback && callback( null, {
                    account: account,
                    seedPhrase: seedPhrase,
                    hdPathString: hdPathString
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );

    };
}

function isHexString( value, length ) {
    if ( typeof(value) !== 'string' || !value.match( /^0x[0-9A-Fa-f]*$/ ) ) {
        return false
    }
    if ( length && value.length !== 2 + 2 * length ) {
        return false;
    }
    return true;
}


export function importEtherAccountByPrivateKey( name, password, pswdTip, privateKey, callback ) {
    return ( dispatch ) => {
        try {
            if ( !((privateKey.indexOf( '0X' ) === 0 || privateKey.indexOf( '0x' ) === 0)) ) {
                privateKey = '0x' + privateKey;
            } else {
                privateKey = privateKey.toLowerCase();
            }

            if ( !isHexString( privateKey ) ) {
                callback && callback( Error( I18n.t( Keys.invalid_eth_wallet_private_key ) ), null );
                return;
            }

            const privateKeyHexString = utils.hexlify( privateKey );
            const wallet = new Wallet( privateKeyHexString );

            if ( isHasSameAddressWallet( utils.getAddress( wallet.address ) ) ) {
                callback && callback( Error( I18n.t( Keys.wallet_already_exist ) ), null );
                return;
            }

            wallet.encrypt( password, ( percent ) => {
            } )
                .then( function ( json ) {
                    const account = {
                        name: name.trim(),
                        jsonWallet: JSON.parse( json ),
                        pswdTip: pswdTip,
                        privateKey: wallet.privateKey
                    };

                    dispatch( {
                        'type': ethActionTypes.ETH_ACCOUNT_ADD,
                        account: account
                    } );

                    callback && callback( null, {
                        account: account,
                    } );
                } )
                .catch( error => {
                    callback && callback( error, null )
                } );
        } catch ( err ) {
            callback && callback( err, null )
        }
    };
}

export function importEtherAccountByKeystore( name, password, keystore, callback ) {
    return ( dispatch ) => {
        Wallet.fromEncryptedWallet( keystore, password )
            .then( function ( wallet ) {
                if ( isHasSameAddressWallet( utils.getAddress( wallet.address ) ) ) {
                    callback && callback( Error( I18n.t( Keys.wallet_already_exist ) ), null );
                    return;
                }

                const account = {
                    name: name.trim(),
                    jsonWallet: JSON.parse( keystore ),
                    pswdTip: '',
                    privateKey: wallet.privateKey
                };

                dispatch( {
                    'type': ethActionTypes.ETH_ACCOUNT_ADD,
                    account: account
                } );

                callback && callback( null, {
                    account: account,
                } );
            } )
            .catch( error => {
                callback && callback( error, null )
            } );
    };
}

export function updateAccountName( jsonWallet, name, callback ) {
    return ( dispatch ) => {
        const account = {
            name: name.trim(),
            jsonWallet: jsonWallet,
        };

        dispatch( {
            'type': ethActionTypes.ETH_ACCOUNT_UPDATE_NAME,
            account: account
        } );

        callback && callback( null, {
            account: account,
        } );
    };
}


export function updateAccountBalance( account, callback ) {
    return ( dispatch ) => {
        const accounts = [];
        accounts.push( account );

        getBalanceAsync( accounts, ( error, balanceMap ) => {
            if ( error ) {
                callback && callback( error, null );
            } else {
                dispatch( {
                    'type': ethActionTypes.ETH_ACCOUNT_UPDATE_BALANCE,
                    balanceMap: balanceMap
                } );

                callback && callback( null, balanceMap[ utils.getAddress( account.jsonWallet.address ) ] );
            }
        } );
    };
}

export function updateAllAccountBalance( callback ) {
    return ( dispatch ) => {
        const store = getStore();
        const accounts = store.getState().ethStore.accounts.slice();

        getBalanceAsync( accounts, ( error, balanceMap ) => {
            dispatch( {
                'type': ethActionTypes.ETH_ACCOUNT_UPDATE_BALANCE,
                balanceMap: balanceMap
            } );

            callback && callback( null, balanceMap );
        } );
    };
}

function getBalanceAsync( accounts, callback ) {
    const balanceMap = {};

    if ( accounts.length <= 0 ) {
        callback && callback( null, balanceMap );
        return;
    }

    const addresses = [];
    for ( let index = 0; index < accounts.length; index++ ) {
        addresses.push( utils.getAddress( accounts[ index ].jsonWallet.address ) );
    }

    netGetEtherBalanceMulti( addresses, ( err, resBody ) => {
        if ( err != null ) {
            callback && callback( err, null );
        } else {
            for ( let index = 0; index < resBody.result.length; index++ ) {
                balanceMap[ utils.getAddress( resBody.result[ index ].account ) ] = { 'ETH': resBody.result[ index ].balance };
            }

            let currentIndex = 0;
            for ( let index = 0; index < accounts.length; index++ ) {
                const account = accounts[ index ];
                const address = utils.getAddress( account.jsonWallet.address );

                getTokenAsync( account, ( error1, tokenBalanceMap ) => {
                    if ( !error1 ) {
                        const tokenKeys = Object.keys( tokenBalanceMap );

                        for ( let index1 = 0; index1 < tokenKeys.length; index1++ ) {
                            balanceMap[ address ][ tokenKeys[ index1 ] ] = tokenBalanceMap[ tokenKeys[ index1 ] ];
                        }
                    }

                    currentIndex++;

                    if ( currentIndex >= accounts.length ) {
                        callback && callback( null, balanceMap );
                    }
                } )
            }
        }
    } );
}


function getTokenAsync( account, callback ) {
    const tokenBalanceMap = {};
    let address = utils.getAddress( account.jsonWallet.address );

    if ( !account.supportToken ) {
        callback && callback( null, tokenBalanceMap );
        return;
    }

    const tokenKeys = Object.keys( account.supportToken );

    let currentIndex = 0;
    for ( let index = 0; index < tokenKeys.length; index++ ) {
        const name = tokenKeys[ index ];
        if ( tokenKeys[ index ] === 'ETH' ) {
            currentIndex++;

            if ( currentIndex >= tokenKeys.length ) {
                callback && callback( null, tokenBalanceMap );
            }
        }
        else {
            const contractAddress = ERC20TokenMap[ tokenKeys[ index ] ].contract;
            netGetEtherERCTokenBalance( contractAddress, address, ( err, resBody ) => {
                if ( err != null ) {
                } else {
                    tokenBalanceMap[ name ] = resBody.result;
                }
                currentIndex++;

                if ( currentIndex >= tokenKeys.length ) {
                    callback && callback( null, tokenBalanceMap );
                }
            } );
        }
    }
}


export function ethWalletSupportTokenAdd( account, tokenName, callback ) {
    return ( dispatch ) => {
        dispatch( {
            'type': ethActionTypes.ETH_ACCOUNT_SUPPORT_TOKEN_ADD,
            account: account,
            tokenName: tokenName
        } );

        callback && callback( null, null );
    };
}

export function ethWalletSupportTokenRemove( account, tokenName, callback ) {
    return ( dispatch ) => {
        dispatch( {
            'type': ethActionTypes.ETH_ACCOUNT_SUPPORT_TOKEN_REMOVE,
            account: account,
            tokenName: tokenName
        } );

        callback && callback( null, null );
    };
}


export function getExchangeRates( callback ) {
    return ( dispatch ) => {
        netGetExchangeRates( ( err, res ) => {
            if ( !err ) {
                const exchangeRates = {};

                for ( let index = 0; index < res.body.length; index++ ) {
                    exchangeRates[ res.body[ index ].symbol ] = res.body[ index ];
                }

                dispatch( {
                    'type': ethActionTypes.ETH_UPDATE_EXCHANGE_RATE,
                    exchangeRates: exchangeRates
                } );
            }

            callback && callback( err, res );
        } );
    };
}

export function getEtherBalance( address, callback ) {
    return ( dispatch ) => {
        // address = "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a";

        netGetEtherBalance( address, ( err, resBody ) => {
            callback && callback( err, resBody );
        } );
    };
}

export function getEtherBalanceMulti( addresses, callback ) {
    return ( dispatch ) => {
        netGetEtherBalanceMulti( addresses, ( err, resBody ) => {
            callback && callback( err, resBody );
        } );
    };
}

export function getEtherERCTokenBalance( contractAddress, addresses, callback ) {
    return ( dispatch ) => {
        netGetEtherERCTokenBalance( contractAddress, addresses, ( err, resBody ) => {
            callback && callback( err, resBody );
        } );
    };
}

export function getTokenTransactionHistory( account, contractAddress, callback ) {
    return ( dispatch ) => {
        const topic0 = utils.keccak256( utils.toUtf8Bytes( "Transfer(address,address,uint256)" ) );

        netGetETHEventLogs( contractAddress, utils.getAddress( account.jsonWallet.address ), 0, 'latest', topic0, ( err, resBody ) => {
            if ( !err ) {
                resBody.result.sort( function ( a, b ) {
                    const timestampA = utils.bigNumberify( a.timeStamp ).toNumber();
                    const timestampB = utils.bigNumberify( b.timeStamp ).toNumber();

                    return timestampB - timestampA
                } );
            }

            callback && callback( err, resBody );
        } );
    };
}

export function getEtherTransactions( account, callback ) {
    return ( dispatch ) => {
        netGetEtherTransactions( utils.getAddress( account.jsonWallet.address ), ( err, resBody ) => {
            callback && callback( err, resBody );
        } );
    };
}

export function updateEOSMappingStatus( callback ) {
    return ( dispatch ) => {
        const store = getStore();

        netGetEtherContractABI( env.eos_mapping_contract_address, ( err, resBody ) => {
            if ( err ) {
                callback && callback( err, null );
                return;
            }

            const mappingDataMap = {};

            var contract = new ethers.Contract( env.eos_mapping_contract_address, resBody.result, PROVIDER );

            let currentIndex = 0;
            const accounts = store.getState().ethStore.accounts.slice();

            for ( let index = 0; index < accounts.length; index++ ) {
                contract.keys( utils.getAddress( accounts[ index ].jsonWallet.address ) )
                    .then( function ( result ) {
                        mappingDataMap[ utils.getAddress( accounts[ index ].jsonWallet.address ) ] = result;

                        currentIndex++;

                        if ( currentIndex >= accounts.length ) {

                            dispatch( {
                                'type': ethActionTypes.ETH_UPDATE_EOS_MAPPING_STATUS,
                                mappingDataMap: mappingDataMap
                            } );

                            callback && callback( null, mappingDataMap );
                        }
                    } )
                    .catch( error => {
                        currentIndex++;

                        if ( currentIndex >= accounts.length ) {
                            dispatch( {
                                'type': ethActionTypes.ETH_UPDATE_EOS_MAPPING_STATUS,
                                mappingDataMap: mappingDataMap
                            } );

                            callback && callback( null, mappingDataMap );
                        }
                    } );
            }
        } );
    };
}


export function generateEOSWallet( callback ) {
    return ( dispatch ) => {
        // Create a new random private key
        PrivateKey.randomKey()
            .then( ( privateKey ) => {
                let privateWif = privateKey.toWif();
                let publicKey = PrivateKey.fromWif( privateWif ).toPublic().toString()

                callback && callback( null, { privateKey: privateWif, publicKey: publicKey } );
            } )
            .catch( error => {
                callback && callback( error, null );
            } );

    };
}

export function updateETHAccountWithCallback ( callback) {
    return (dispatch) => {
        dispatch( updateAllAccountBalance( ( err, res ) => {
            if ( !err ) {
                dispatch( getExchangeRates( ( err, res ) => {
                    if ( !err ) {
                        dispatch( getCurrentBlockData( ( err, res ) => {
                            if ( !err ) {
                                dispatch( updateEOSMappingStatus( ( err, res ) => {
                                    callback && callback( err, res );
                                } ) );
                            } else {
                                callback && callback( err, null )
                            }
                        } ) );
                    } else {
                        callback && callback( err, null )
                    }
                } ) );
            } else {
                callback && callback( err, null )
            }
        } ) );
    }
};

export function updateAccountToSecretData( account ) {
    if ( account.privateKey && account.privateKey.length > 0 && account.password && account.password.length > 0 ) {
        account.privateKeyData = CryptoJS.AES.encrypt( JSON.stringify( {
            privateKey: account.privateKey,
            isEncrypted: true
        } ), account.password ).toString();

        delete account.privateKey;
        delete account.password;
    }

    return account;
}

export function setPrivateKey( account, privateKey, password ) {
    account.privateKeyData = CryptoJS.AES.encrypt( JSON.stringify( {
        privateKey: privateKey,
        isEncrypted: true
    } ), password ).toString();

    return account;
}

export function getPrivateKey( account, password ) {
    const bytes = CryptoJS.AES.decrypt( account.privateKeyData, password );

    let decryptedData;
    try {
        decryptedData = JSON.parse( bytes.toString(CryptoJS.enc.Utf8) );
    } catch (error) {
        throw "Password is not correct";
    }

    if ( decryptedData && decryptedData.isEncrypted ) {
        return decryptedData.privateKey;
    } else {
        throw "Password is not correct";
    }
}
