/**
 *
 * @param memberId
 * @param callback
 * ignore member Id
 */
import request from "superagent";
import ethApiParse from "./parse/ethApiParse";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import ETHWalletUtil from "../util/ETHWalletUtil";

ethApiParse( request );

export function netGetEtherBalance( address, callback ) {
    request
        .post( '/api' )
        .query( {
            module: 'account',
            action: 'balance',
            address: address,
            tag: 'latest',
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( callback );
}

export function netGetEtherBalanceMulti( addresses, callback ) {
    let addressesStr = '';

    for ( let index = 0; index < addresses.length; index++ ) {
        addressesStr += addresses[ index ];

        if ( index < addresses.length - 1 ) {
            addressesStr += ','
        }
    }

    request
        .post( '/api' )
        .query( {
            module: 'account',
            action: 'balancemulti',
            address: addressesStr,
            tag: 'latest',
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( callback );
}

export function netGetEtherERCTokenBalance( contractAddress, address, callback ) {
    request
        .post( '/api' )
        .query( {
            module: 'account',
            action: 'tokenbalance',
            contractaddress: contractAddress,
            address: address,
            tag: 'latest',
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( callback );
}

export function netGetEtherContractABI( contractAddress, callback ) {
    request
        .post( '/api' )
        .query( {
            module: 'contract',
            action: 'getabi',
            address: contractAddress,
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( callback );
}

export function netGetEtherTransactions( address, callback ) {
    request
        .post( '/api' )
        .query( {
            module: 'account',
            action: 'txlist',
            address: address,
            startblock: 0,
            endblock: 'latest',
            sort: 'desc',
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( callback );
}

export function netGetETHEventLogs( contractAddress, address, fromBlock, toBlock, topic0, callback ) {
    request
        .post( '/api' )
        .query( {
            module: 'logs',
            action: 'getLogs',
            address: contractAddress,
            fromBlock: fromBlock,
            toBlock: toBlock,
            topic0: topic0,
            topic1: ETHWalletUtil.optHexStringWith64Len( address ),
            topic0_1_opr: 'and',
            apikey: env.eth_api_token
        } )
        .use( superagent_prefix( env.eth_api ) )
        .use( logger )
        .ethApiParse()
        .end( ( err, res ) => {
            if ( !res || !res.result ) {
                callback && callback( err, res );
                return;
            }
            request
                .post( '/api' )
                .query( {
                    module: 'logs',
                    action: 'getLogs',
                    address: contractAddress,
                    fromBlock: fromBlock,
                    toBlock: toBlock,
                    topic0: topic0,
                    topic2: ETHWalletUtil.optHexStringWith64Len( address ),
                    topic0_2_opr: 'and',
                    apikey: env.eth_api_token
                } )
                .use( superagent_prefix( env.eth_api ) )
                .use( logger )
                .ethApiParse()
                .end( ( err1, res1 ) => {
                    if ( !err1 ) {
                        for ( let index = 0; index < res1.result.length; index++ ) {
                            res.result.push( res1.result[ index ] );
                        }
                    }

                    res.result.sort( function ( a, b ) {
                        let timeStampA = parseInt( a.timeStamp.replace( /^#/, '' ), 16 );
                        let timeStampB = parseInt( b.timeStamp.replace( /^#/, '' ), 16 );

                        return timeStampA - timeStampB
                    } );

                    if ( res.result.length > 0 ) {
                        err = null;
                    }

                    callback && callback( err, res );
                } );
        } );
}

// https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic2=0x000000000000000000000000a14d93014eB1c2652B7cDDBa29549425D66A6EC8&topic0_2_opr=and
//     https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic2=0x000000000000000000000000a14d93014eB1c2652B7cDDBa29549425D66A6EC8&topic0_2_opr=and


// https://api.etherscan.io/api?module=contract&action=getabi&address=0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0&apikey=YourApiKeyToken


// https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xd780ae2bf04cd96e577d3d014762f831d97129d0&address=0xa14d93014eB1c2652B7cDDBa29549425D66A6EC8&tag=latest&apikey=YourApiKeyToken

// https://api.etherscan.io/api?module=account&action=balancemulti&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a,0x63a9975ba31b0b9626b34300f7f627147df1f526,0x198ef1ec325a96cc354c7266a038be8b5c558f67&tag=latest&apikey=YourApiKeyToken
