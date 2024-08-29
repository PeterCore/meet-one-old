// import userActionTypes from "../reducers/user/userActionTypes";
import {
    netAuthMobileGetToken,
    netChangePassword,
    netLogin,
    netLogout,
    netSetPassword,
    netVerifyToken,
} from "../net/AuthApiNet";

import { netMemberBindEmail, netMemberMe, netMemberSetName, } from "../net/MemberNet";
import userActionTypes from "../reducers/user/userActionTypes";


// countryCode: [string][m] country code, ("SG", "CN")
// mobile: [string][m] mobile number
// type: [int][m] 0 -> Sign Up, 1 -> Login
export function authMobileGetToken( query = {
                                        countryCode: null,
                                        mobile: null,
                                        type: null,
                                    },
                                    callback ) {
    return ( dispatch ) => {
        netAuthMobileGetToken( query, ( err, resBody ) => {
            callback( err, resBody );
        } );
    };
}

export function authVerifyToken( mobile, token, callback ) {
    return ( dispatch ) => {
        netVerifyToken( mobile, token, ( err, resBody ) => {
            callback( err, resBody );
        } );
    };
}

export function authSetPwd( pwd, callback ) {
    return ( dispatch ) => {
        netSetPassword( pwd, ( err, resBody ) => {
            callback( err, resBody );
        } );
    };
}

export function memberChangePwd( oldPwd, newPwd, callback ) {
    return ( dispatch ) => {
        netChangePassword( oldPwd, newPwd, ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.LOGOUT,
                } )
            }

            callback( err, resBody );
        } );
    };
}

export function authLogin( account, password, callback ) {
    return ( dispatch ) => {
        netLogin( account, password, ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.LOGIN,
                    account: {
                        mobile: resBody.data.mobile,
                        logo: resBody.data.logo,
                        username: resBody.data.username,
                        id: resBody.data.id,
                        email: resBody.data.email,
                        emailVerified: resBody.data.emailVerified,
                        countryCode: resBody.data.countryCode,
                        uuid: resBody.data.uuid,
                    }
                } )
            }

            callback( err, resBody );
        } )
    }
}


export function memberBindEmail( email, callback ) {
    return ( dispatch ) => {
        netMemberBindEmail( email, ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.BIND_EMAIL,
                    email: email
                } )
            }

            callback && callback( err, resBody );
        } )
    }
}

export function onRegisterSuccess( account ) {
    return {
        type: userActionTypes.LOGIN,
        account: account
    }
}


export function authLogout( callback ) {
    return ( dispatch ) => {
        netLogout( ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.LOGOUT,
                } )
            }

            callback( err, resBody )
        } )
    }
}

export function memberMe( callback ) {
    return ( dispatch ) => {
        netMemberMe( ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.ACCOUNT_UPDATE,
                    account: {
                        mobile: resBody.data.mobile,
                        logo: resBody.data.logo,
                        username: resBody.data.username,
                        id: resBody.data.id,
                        email: resBody.data.email,
                        emailVerified: resBody.data.emailVerified,
                        countryCode: resBody.data.countryCode,
                        uuid: resBody.data.uuid,
                    }
                } )
            }

            callback( err, resBody );
        } )
    }
}

export function memberSetName( name, callback ) {
    return ( dispatch ) => {
        netMemberSetName( name, ( err, resBody ) => {
            if ( !err ) {
                dispatch( {
                    type: userActionTypes.SET_NAME,
                    username: name,
                } )
            }
            callback( err, resBody );
        } )
    }
}