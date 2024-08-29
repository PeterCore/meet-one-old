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


export function netFileUpload( type, ownerId, path, fileData, otherInfo, callback ) {
    const photo = {
        uri: path,
        type: 'image/jpeg',
        name: path.substr( path.lastIndexOf( "/" ) + 1 ),
    };

    let currentRequest = request
        .post( '/file/upload' )
        .type( 'multipart/form-data' )
        .field( 'type', type )
        .field( 'ownerId', ownerId );

    if ( fileData && fileData.length >= 0 ) {
        currentRequest = currentRequest.field( 'fileData', fileData );
    }

    if ( otherInfo && otherInfo.length >= 0 ) {
        currentRequest = currentRequest.field( 'otherInfo', otherInfo );
    }

    currentRequest.attach( 'file', photo )
        .use( superagent_prefix( getBestServerHost() ) )
        .use( logger )
        .authRequest()
        .headerRequest()
        .apiDomainParse()
        .end( callback );

}

