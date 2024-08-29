import userActionTypes from "./userActionTypes";

const initialState = {
        isLoggedIn: false,
        account:
            {
                "id": -1,
                "countryCode": null,
                "mobile": null,
                "username": null,
                "logo": null,
                "email": null,
                "emailVerified": false
            },

        httpRequestCookie: {}
        ,
        pushToken: null,

    }
;

export default function userReducer( state = initialState, action ) {
    switch ( action.type ) {
        case userActionTypes.PUSH_TOKEN_UPDATE: {
            return {
                ...state,
                pushToken: action.pushToken
            };
        }
        case userActionTypes.LOGIN: {
            return {
                ...state,
                isLoggedIn: true,
                account: action.account
            }
        }
        case userActionTypes.LOGOUT: {
            return {
                ...state,
                isLoggedIn: false,
                account: {
                    id: -1,
                    countryCode: null,
                    mobile: null,
                    username: null,
                    logo: null,
                    email: null,
                    emailVerified: false,
                    uuid: null,
                }
            }
        }
        case userActionTypes.ACCOUNT_UPDATE: {
            return {
                ...state,
                account: action.account
            }
        }
        case userActionTypes.BIND_EMAIL: {
            return {
                ...state,
                account: {
                    ...state.account,
                    email: action.email
                }
            }
        }
        case userActionTypes.SET_NAME: {
            return {
                ...state,
                account: {
                    ...state.account,
                    username: action.username
                }
            }
        }
        default:
            return state;
    }
}
