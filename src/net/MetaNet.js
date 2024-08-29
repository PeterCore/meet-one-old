import request from "superagent";
import auth from "./auth/authRequest";
import header from "./header/headerRequest";
import apiDomainParse from "./parse/apiDomainParse";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import { getBestServerHost } from "../reducers/meta/metaReducer";

auth( request );
header( request );
apiDomainParse( request );

export function netMetaGetCategory( parentId, callback ) {
    request
        .post( '/meta/category' )
        .query( { parentId: parentId } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}


export function netMetaShopBrand( callback ) {
    request
        .post( '/meta/shop-brand' )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netGoodsSwitchList( callback ) {
    request
        .post( '/shop/goods/list-switch' )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netMetaGetCategoryDetail( cid, callback ) {
    request
        .post( '/meta/category/' + cid )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netMetaGetAllAreas( callback ) {
    request
        .post( '/meta/area-v2?parentCode=_all_' )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netMetaGetApplicationTip( callback ) {
    request
        .post( '/meta/application-tip' )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netMetaPayData( version, callback ) {
    request
        .post( '/meta/pay-data' )
        .query( { version: version } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netMetaServerHosts( version, callback ) {
    request
        .post( '/meta/server-hosts' )
        .query( { version: version } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}

export function netPing( host ) {
    return request
        .get( host )
        .use( logger );
}

