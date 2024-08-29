import React from "react";
import { RootNavigator } from "../../AppNavigator";
import { NavigationActions, StackActions } from "react-navigation";
import navActionTypes from "./navActionTypes";

export const initialNavState = RootNavigator.router.getStateForAction( NavigationActions.navigate( { routeName: "mainPage" } ) );
// export const initialNavState = RootNavigator.router.getStateForAction( NavigationActions.navigate( { routeName: "DebugPage" } ) );

export default function navReducer( state = initialNavState, action ) {
    let nextState;

    switch ( action.type ) {
        case navActionTypes.NAV_CLEAR_STACK:
            return {
                ...initialNavState,
            };
            break;
        case 'Navigation/BACK':
            const { type, routeName } = action;
            if ( state.routes && state.routes.length > 0 ) {
                const lastRoute = state.routes[ state.routes.length - 1 ];
                const previousRoute = state.routes.length >= 2 ? state.routes[ state.routes.length - 2 ] : null;

                if (
                    lastRoute.routeName === 'EOSMappingSubmitPage' ||
                    lastRoute.routeName === 'EOSMappingSuccessPage' ||
                    lastRoute.routeName === 'EOSMappingVerifyPage' ||
                    lastRoute.routeName === 'EOSAccountRegisterResultPage' ||
                    lastRoute.routeName === 'EOSTransferResultPage' ||
                    lastRoute.routeName === 'EOSGeneratorPage'
                ) {
                    nextState = RootNavigator.router.getStateForAction( StackActions.reset(
                        {
                            index: 0,
                            actions: [
                                NavigationActions.navigate( { routeName: 'mainPage' } ),
                            ]
                        }
                    ) );
                }
                else {
                    nextState = RootNavigator.router.getStateForAction( action, state );
                }
            }
            else {
                nextState = RootNavigator.router.getStateForAction( action, state );
            }
            break;
        case 'Navigation/NAVIGATE':
            nextState = RootNavigator.router.getStateForAction( action, state );
            break;
        default:
            nextState = RootNavigator.router.getStateForAction( action, state );
            break;
    }


    // Simply return the original `state` if `nextState` is null or undefined.
    return nextState || state;
}
