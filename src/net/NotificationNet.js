import request from "superagent";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import apiDomainParse from "./parse/apiDomainParse";
import { getBestServerHost } from "../reducers/meta/metaReducer";

apiDomainParse( request );

export function netNotificationList( ownerId, pageNum, pageSize, callback ) {
    request
        .post( '/news/list' )
        .query( {
            pageSize: pageSize,
            pageNum: pageNum,
            ownerId: ownerId,
            // sortingField: 'publishedAt'
            // sortingOrder: 'desc'
        } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}
