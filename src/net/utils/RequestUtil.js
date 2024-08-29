import { getStore } from "../../setup";
import { netPing } from "../MetaNet";
import metaActionTypes from "../../reducers/meta/metaActionTypes";

export function executeMultiRequest( requests, callback ) {
    let currentIndex = 0;

    doExecuteMultiRequest( requests, currentIndex, callback );
}

function doExecuteMultiRequest( requests, currentIndex, callback ) {
    if ( currentIndex >= requests.length ) {
        return;
    }

    requests[ currentIndex ]
        .end( ( err, resBody, request ) => {
            callback && callback( err, resBody, request );

            if ( !err ) {
                doExecuteMultiRequest( requests, currentIndex + 1, callback );
            }
        } );
}

function doExecuteRequest( request, callback ) {
    const startTimestamp = new Date().toISOString();
    const start = new Date().getTime();

    console.log( "xxxxxxxxx doGetBestServerHost xxxxxxxxxx startTimestamp = " + startTimestamp + "; url = " + request.url );

    request
        .end( ( err, resBody ) => {
            const endTimestamp = new Date().toISOString();
            const now = new Date().getTime();

            let elapsed = now - start;

            console.log( "xxxxxxxxx doGetBestServerHost xxxxxxxxxx endTimestamp = " + startTimestamp + "; url = " + request.url + "; elapsed = " + (elapsed + 'ms') );

            callback && callback( err, resBody, request );
        } );
}

export function doGetBestServerHost() {
    return ( dispatch ) => {
        const store = getStore();

        const serverHostUrlData = store.getState().metaStore.serverHostUrlData;

        const requestArray = [];
        const requestMap = {};
        let isSucceed = false;

        for ( let index = 0; index < serverHostUrlData.serverHosts.length; index++ ) {
            const request = netPing( serverHostUrlData.serverHosts[ index ].ping );
            requestArray.push( request );
            requestMap[ request.url ] = serverHostUrlData.serverHosts[ index ].host;
        }

        for ( let index = 0; index < requestArray.length; index++ ) {
            doExecuteRequest( requestArray[ index ], ( err, resBody, request ) => {
                if ( !isSucceed ) {
                    if ( !err ) {
                        isSucceed = true;
                        const bestServerHostUrl = requestMap[ request.url ];


                        dispatch( {
                            'type': metaActionTypes.META_UPDATE_BEST_SERVER_HOST,
                            bestServerHostUrl: bestServerHostUrl
                        } );

                    }
                }
            } )
        }
    };
}
