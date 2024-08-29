import request from "superagent";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import apiDomainParse from "./parse/apiDomainParse";
import { getBestServerHost } from "../reducers/meta/metaReducer";

apiDomainParse( request );

export function netAuthMobileGetToken( query, callback ) {
    request
        .post( '/auth/mobile/get-token' )
        .query( query )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netVerifyToken( mobile, token, callback ) {
    request
        .post( '/auth/mobile/verify-token' )
        .query( {
            mobile: mobile,
            token: token
        } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netSetPassword( password, callback ) {
    request
        .post( '/member/change-password' )
        .query( {
            oldPassword: "",
            newPassword: password
        } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netChangePassword( oldPwd, newPwd, callback ) {
    request
        .post( '/member/change-password' )
        .query( {
            oldPassword: oldPwd,
            newPassword: newPwd
        } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netLogin( account, password, callback ) {
    request
        .post( '/auth/login' )
        .query( {
            account: account,
            password: password
        } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}

export function netLogout( callback ) {
    request
        .post( '/auth/logout' )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .apiDomainParse()
        .end( callback );
}
