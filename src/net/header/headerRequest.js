import { getStore } from "../../setup";
import userActionTypes from "../../reducers/user/userActionTypes";
import * as env from "../../env";
import { Platform } from 'react-native';
import { getNetType } from "../../actions/ChainAction";
import { getCurrentWalletSimple } from "../../actions/WalletAction";


export default function ( superagent ) {
    const Request = superagent.Request;
    Request.prototype.headerRequest = headerRequest;
    return superagent;
};

function headerRequest() {
    const store = getStore();
    const DeviceInfo = require('react-native-device-info');

    if ( store.getState().settingStore.displayCurrency ) {
        this.set( 'view-currency', store.getState().settingStore.displayCurrency.code );
    }

    if ( store.getState().settingStore.language ) {
        this.set( 'accept-language', store.getState().settingStore.language );
    }

    if ( DeviceInfo.getDeviceId() ) {
        this.set( 'deviceId', DeviceInfo.getDeviceId() );
    }

    if ( DeviceInfo.getDeviceName() ) {
        this.set( 'deviceName', encodeURI(DeviceInfo.getDeviceName()) );
    }

    if ( DeviceInfo.getModel() ) {
        this.set( 'deviceModel', DeviceInfo.getModel() );
    }

    if ( DeviceInfo.getSystemName() ) {
        this.set( 'systemName', DeviceInfo.getSystemName() );
    }

    if ( DeviceInfo.getSystemVersion() ) {
        this.set( 'systemVersion', DeviceInfo.getSystemVersion() );
    }

    if ( DeviceInfo.getUserAgent() ) {
        this.set( 'deviceUserAgent', encodeURI(DeviceInfo.getUserAgent() + "; MEET.ONE") );
    }

    if ( DeviceInfo.getUniqueID() ) {
        this.set( 'uniqueID', DeviceInfo.getUniqueID() );
    }

    if ( DeviceInfo.getVersion() ) {
        this.set( 'version', DeviceInfo.getVersion() );
    }

    if ( env.IS_STORE ) {
        this.set( 'store', Platform.OS === 'ios' ? 'App Store' : 'Google Play' );
    } else if (Platform.OS === 'ios') {
        this.set( 'store', 'pgyer' );
    }

    if ( env.IS_INTL ) {
        this.set( 'intl', true );
    }

    const account = getCurrentWalletSimple();
    if (account && account.accountName) {
        this.set( 'eosAccount', account.accountName );
    }

    // header 增加当前链类型
    if ( getNetType() ) {
        this.set('netType', getNetType());
    }

    //前两位 表示appid,第三位 表示平台 ios = 2,跟着4位渠道号，接着5个保留位 例如 012000000000
    var clientID = env.IS_INTL ? '03' : '01';
    if (Platform.OS === 'android') {
        clientID += '1'
    } else if (Platform.OS === 'ios') {
        clientID += '2'
    } else {
        clientID += '3'
    }
    clientID += env.channel_id;
    clientID += env.remain_id;
    this.set( 'clientID', clientID );

    if ( DeviceInfo.isEmulator() ) {
        this.set( 'isEmulator', DeviceInfo.isEmulator() );
    }

    if ( DeviceInfo.getCarrier() ) {
        this.set( 'carrier', encodeURI(DeviceInfo.getCarrier()) );
    }

    if ( store.getState().userStore.httpRequestCookie !== null ) {
        const { session, remember_me } = store.getState().userStore.httpRequestCookie;

        let cookie = '';
        if ( session && session.length > 0 ) {
            cookie += ('SESSION=' + session)
        }

        if ( cookie.length > 0 && remember_me && remember_me.length > 0 ) {
            cookie += '; '
        }

        if ( remember_me && remember_me.length > 0 ) {
            cookie += ('remember-me=' + remember_me)
        }

        this.set( 'Cookie', cookie );
    }

    const self = this;
    const oldEnd = this.end;

    this.end = function ( fn ) {
        function recordCookie() {
            return oldEnd.call( self, function ( err, res ) {
                if ( res && res.header ) {
                    const cookie = res.header[ 'set-cookie' ];
                    if ( cookie ) {
                        const store = getStore();

                        const { session, remember_me } = store.getState().userStore.httpRequestCookie;

                        let newSession = session;
                        let newRememberMe = remember_me;

                        const cookieArray = res.header[ 'set-cookie' ].split( '; ' );
                        for ( let index = 0; index < cookieArray.length; index++ ) {
                            if ( cookieArray[ index ].indexOf( 'SESSION=' ) === 0 ) {
                                newSession = cookieArray[ index ].substring( 'SESSION='.length );
                            }

                            if ( cookieArray[ index ].indexOf( 'remember-me=' ) === 0 ) {
                                newRememberMe = cookieArray[ index ].substring( 'remember-me='.length );
                            }
                        }

                        if ( newSession !== session || newRememberMe !== remember_me ) {
                            store.dispatch( ( dispatch ) => {
                                dispatch( {
                                    'type': userActionTypes.UPDATE_REQUEST_COOKIE,
                                    cookie: {
                                        session: newSession,
                                        remember_me: newRememberMe
                                    }
                                } );
                            } );
                        }
                    }
                }

                return fn && fn( err, res );
            } );
        }

        return recordCookie();
    };

    return this;
}
