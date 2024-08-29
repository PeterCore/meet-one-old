import React from "react";
import { Provider } from "react-redux";
import configureStore from "./store/configure-store";
import App from "./App";
import SplashScreen from "react-native-splash-screen";

const EventEmitter = require( 'events' );

const _eventEmitter = new EventEmitter();

let _provider;
let _store;

export function setup() {
    console.disableYellowBox = true;

    class Root extends React.Component {
        constructor() {
            super();
            // do stuff while splash screen is shown
            // After having done stuff (such as async tasks) hide the splash screen

            this.state = {
                isLoading: true,
                store: configureStore( () => {
                    this.setState( { isLoading: false } );
                } )
            };

            _store = this.state.store;
        }

        componentDidMount() {
            SplashScreen.hide();
        }

        render() {
            if ( this.state.isLoading ) {
                return null;
            }
            return (
                <Provider store={this.state.store}>
                    <App/>
                </Provider>
            );
        }
    }

    return Root;
}

export function getProvider() {
    return _provider;
}

export function getStore() {
    return _store;
}


export function getEventEmitter() {
    return _eventEmitter;
}

global.LOG = ( ...args ) => {
    console.log( '/------------------------------\\' );
    console.log( ...args );
    console.log( '\\------------------------------/' );
    return args[ args.length - 1 ];
};
