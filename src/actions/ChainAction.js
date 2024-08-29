import chainActionTypes from "../reducers/chain/chainActionTypes";
import eosActionTypes from "../reducers/eos/eosActionTypes";
import { getStore } from "../setup";
import { getSideChainData , getEOSTokens, getEOSNetworks, getHistoryNetwork } from "../net/DiscoveryNet";
import { IS_DEBUG } from '../env';

export function getNetType() {
    let netType;
    const currentChain = getStore().getState().chainStore.currentChain;
    if (currentChain && currentChain.netType !== 'EOS') {
        netType = currentChain.netType;
    } else {
        netType = 'EOS';
    }
    return netType;
}

export function getSupportTokens() {
    const state = getStore().getState();
    let supportTokens;
    const currentChain = state.chainStore.currentChain;
    if (currentChain && currentChain.netType !== 'EOS') {
        supportTokens = state.chainStore.sideChainTokens.concat([]); // 返回一个新的数组对象，触发一些组件的 componentWillReceiveProps，比如token添加页
    } else {
        const customTokens = state.eosStore.customTokens;
        const initial_supportTokens = state.eosStore.supportTokens;
        const customTokensFilter = [];

        for (let i = 0; i < customTokens.length; i++) {
            let hasSupport = false;
            for (let j = 0; j < initial_supportTokens.length; j++) {
                if (customTokens[i].publisher === initial_supportTokens[j].publisher && customTokens[i].name === initial_supportTokens[j].name) {
                    hasSupport = true
                }
            }

            if (!hasSupport) {
                customTokensFilter.push(customTokens[i]);
            }
        }
        supportTokens = initial_supportTokens.concat(customTokensFilter);
    }
    return supportTokens
}

export function getSystemToken() {
    const currentChain = getStore().getState().chainStore.currentChain;
    if (currentChain && currentChain.netType !== 'EOS') {
        return {
            name: currentChain.systemTokenName,
            publisher: currentChain.systemTokenPublisher,
            precision: currentChain.systemTokenPercision
        }
    } else {
        return {
            name: 'EOS',
            publisher: 'eosio.token',
            precision: 4
        };
    }
}

export function getCurrentNetwork() {
    const store = getStore();
    let eosNetworks, currentNetwork;
    const netType = getNetType();
    if (netType !== 'EOS') {
        eosNetworks = store.getState().chainStore.sideChainNodes;
        currentNetwork = store.getState().chainStore.currentSideChainNode;
    } else {
        eosNetworks = store.getState().eosStore.eosNetworks;
        currentNetwork = store.getState().eosStore.currentNetwork;
    }

    let defaultValue = currentNetwork;

    // 当前选中为空，或者当前选中已经被排除出下发的列表，则重新计算节点
    const domainArray = [];
    for ( let i = 0; i < eosNetworks.length; i++ ) {
        domainArray.push(eosNetworks[i].domains[0])
    }
    if (defaultValue === null || (defaultValue && defaultValue.name !== 'CustomNode' && !domainArray.includes(defaultValue.domains[0]))) {
        for ( let index = 0; index < eosNetworks.length; index++ ) {
            if ( IS_DEBUG && !eosNetworks[ index ].is_mainnet ) {
                // 测试环境，选择第一个测试的网络
                defaultValue = eosNetworks[ index ];
                break;
            } else if ( !IS_DEBUG && eosNetworks[ index ].is_mainnet ) {
                // 正式环境，选择第一个正式的网络
                defaultValue = eosNetworks[ index ];
                break;
            }
        }
    }

    return defaultValue;
}

// 切换当前选中的链
export function changeCurrentChain (chain, callback) {
    return ( dispatch ) => {
        dispatch( {
            type: chainActionTypes.CHANGE_CURRENT_CHAIN,
            data: {
                chain: chain
            }
        } );
        callback && callback( null, null );
    };
}

// 更新网络设置页选项数据
export function updateChainData( callback ) {
    return ( dispatch ) => {
        getSideChainData(( err, resBody ) => {
            if (err) {
                callback && callback(err, null)
            } else {
                const resData = JSON.parse(resBody);
                dispatch( {
                    type: chainActionTypes.UPDATE_CHAIN_DATA,
                    data: {
                        chainData: resData
                    }
                } );
                callback && callback(null, resBody);
            }
        })
    };
}

// 切换当前节点，不同链统一action
export function changeCurrentNetwork (network, callback) {
    return ( dispatch ) => {
        const netType = getNetType();
        if (netType !== 'EOS') {
            dispatch( {
                type: chainActionTypes.CHANGE_CURRENT_SIDECHAIN_NODE,
                data: {
                    currentSideChainNode: network
                }
            } );
        } else {
            dispatch( {
                type: eosActionTypes.EOS_CURRENT_NETWORK_CHANGE,
                data: {
                    eosNetwork: network
                }
            } );
        }
        callback && callback( null, null );
    };
}

// 更新节点列表，不同链统一action
export function updateNetworks(callback) {
    return ( dispatch ) => {
        const netType = getNetType();
        getEOSNetworks({ netType: netType} , ( err, resBody ) => {
            if (err) {
                callback && callback(err, null)
            } else {
                const resData = JSON.parse(resBody);
                if (netType === 'EOS') {
                    dispatch( {
                        type: eosActionTypes.EOS_UPDATE_NETWORKS,
                        data: resData
                    } )
                } else {
                    dispatch( {
                        type: chainActionTypes.UPDATE_SIDECHAIN_NODES,
                        data: resData
                    } )
                }
                callback && callback( null, resData );
            }
        })
    };
}

// 更新历史交易记录的节点，不同链统一action
export function updateHistoryNetworks( callback ) {
    return ( dispatch ) => {
        const netType = getNetType();
        getHistoryNetwork({ net_type: netType },( err, resBody ) => {
            if (err) {
                callback && callback(err, null)
            } else {
                const resData = JSON.parse(resBody);
                dispatch( { type: eosActionTypes.EOS_UPDATE_HISTORYNETWORKS, data: resData } );
                callback && callback( null, resData );
            }
        })
    };
}

// 更新支持的币种列表，不同链统一action
export function updateSupportTokens( callback ) {
    return ( dispatch ) => {
        const netType = getNetType();
        getEOSTokens({ netType: netType }, ( err, resBody ) => {
            if (err) {
                callback && callback(err, null)
            } else {
                const resData = JSON.parse(resBody);
                if (netType === 'EOS') {
                    dispatch( {
                        type: eosActionTypes.EOS_UPDATE_SUPPORTTOKENS,
                        data: resData
                    } )
                } else {
                    dispatch( {
                        type: chainActionTypes.UPDATE_SIDECHAIN_TOKENS,
                        data: resData
                    } )
                }
                callback && callback( null, resData );
            }
        })
    };
}

// 隐藏在关于我们页面的按钮
export function updateChangeBtnState( data ) {
    return ( dispatch ) => {
        dispatch( {
            type: chainActionTypes.UPDATE_BTN_STATE,
            data: {
                showChangeBtn: data
            }
        } );
    };
}
