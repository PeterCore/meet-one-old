import { netMetaServerHosts } from "../net/MetaNet";
import metaActionTypes from "../reducers/meta/metaActionTypes";
import { getStore } from "../setup";

export function metaServerHosts( callback ) {
    return ( dispatch ) => {
        const store = getStore();

        const serverHostUrlData = store.getState().metaStore.serverHostUrlData;

        netMetaServerHosts( serverHostUrlData.version, ( err, resBody ) => {
            if ( !err ) {
                if ( resBody.data ) {
                    dispatch( {
                        'type': metaActionTypes.META_UPDATE_SERVER_HOST_DATA,
                        serverHostUrlData: resBody.data
                    } );
                }
            }
            callback && callback( err, resBody );
        } )
    };
}

