import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import thunk from "redux-thunk";
import { persistCombineReducers, persistStore, createTransform } from "redux-persist";
import { reducers } from "../reducers";
import storage from 'redux-persist/es/storage'
import { navMiddleware } from '../AppNavigator';

const { logger } = require( 'redux-logger' );

const middlewares = [];

// const a = middleware;

// configuring saga middleware
const sagaMiddleware = createSagaMiddleware();

middlewares.push( sagaMiddleware );
middlewares.push( thunk );
middlewares.push( navMiddleware );

/* global __DEV__  */
if ( __DEV__ ) {
    middlewares.push( logger );
}
const createStoreWithMiddleware = applyMiddleware( ...middlewares );

// 因为globalEOS上会包含有敏感信息，故在持久化前将其清空
// refs: https://github.com/rt2zz/redux-persist/issues/134
let blacklistTransform = createTransform(
    (inboundState, key) => {
        if (key !== 'eosStore' && key !== 'settingStore') {
            return inboundState
        } else if (key === 'eosStore') {
            return {
                ...inboundState,
                // 全局eosjs实例化对象
                globalEOS: undefined,
                // 临时记住的密码，不持久化到本地，退出App后消失
                tempPsw: undefined,
                // 对记住的密码进行加密的随机值
                surge: undefined
            }
        } else if (key === 'settingStore') {
            return {
                ...inboundState,
                isNumberUnlock: false,
                waitingURI: null,
                waitingComponent: null,
            }
        }
    }
)

export default function configureStore( onComplete ) {
    const config = {
        key: 'primary',
        storage,
        transforms: [blacklistTransform],
        // whitelist: ['userStore'],
    };

    let reducer = persistCombineReducers( config, reducers );

    const store = createStore(
        reducer,
        undefined,
        compose(
            createStoreWithMiddleware,
        )
    );

    persistStore( store, null, onComplete );

    // install saga run
    store.runSaga = sagaMiddleware.run;
    store.close = () => store.dispatch( END );

    return store;
}
