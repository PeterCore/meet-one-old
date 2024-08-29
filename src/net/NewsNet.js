import request from "superagent";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import apiDomainParse from "./parse/apiDomainParse";
import { getBestServerHost } from "../reducers/meta/metaReducer";
import constants from "../constants/constants";

apiDomainParse( request );

export function netPostList( source, pageNum, pageSize, callback ) {
    const query = {
        source: source,
        pageSize: pageSize,
        pageNum: pageNum,
        sortingField: 'publishedAt'
    };
    if ( source === constants.NEWS_WEI_CHAT ) {
        query[ 'isNotIncludeContentForWechat' ] = 1;
    }

    request
        .post( '/post/search' )
        .query(query)
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}


export function netPostGet( id, callback ) {
    request
        .post( '/post/get' )
        .query( { id: id } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}
