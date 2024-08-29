import header from "./header/headerRequest";
import apiDomainParse from "./parse/apiDomainParse";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import request from "superagent";
import * as env from "../env";
import { getBestServerHost } from "../reducers/meta/metaReducer";

header( request );
apiDomainParse( request );

export function netAuthLogin( account, password, callback ) {
    request
        .post( '/auth/login' )
        .query( { account: account, password: password } )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .headerRequest()
        .apiDomainParse()
        .end( callback );
}
