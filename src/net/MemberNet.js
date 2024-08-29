/**
 *
 * @param memberId
 * @param callback
 * ignore member Id
 */
import request from "superagent";
// import auth from "./auth/authRequest";
// import header from "./header/headerRequest";
import apiDomainParse from "./parse/apiDomainParse";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import { getBestServerHost } from "../reducers/meta/metaReducer";

// auth( request );
// header( request );
apiDomainParse( request );

export function netMemberMe( callback ) {
    request
        .post( '/member/me' )
        .query( {} )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netMemberSetName( name, callback ) {
    request
        .post( '/member/update-profile/username' )
        .query( { value: name } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netMemberBindEmail( email, callback ) {
    request
        .post( '/member/bind-email' )
        .query( { email: email } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        // .authRequest()
        // .headerRequest()
        .apiDomainParse()
        .end( callback );
}
