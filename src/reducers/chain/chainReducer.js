import chainData from "../../../data/chainData.json";
import chainActionTypes from "./chainActionTypes";
import { getStore } from "../../setup";

const initialState = {
    showChangeBtn: false,
    currentChain: null,
    chainData: chainData,
    sideChainNodes: [
        {
            "name": "MeetOne TaiWan",
            "chain_id": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
            "domains": ["https://mainnet.meet.one"],
            "is_mainnet": true
        },
        {
            "name": "MeetOne MainNet",
            "chain_id": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
            "domains": ["https://mainnet.meet.one"],
            "is_mainnet": false
        }
    ],
    currentSideChainNode: null,
    sideChainTokens: [
        {
            "id": 1,
            "icon": "https://static.ethte.com/MeetPC/2018_08_07/2753/meetonetoken.png",
            "name": "MEETONE",
            "sub_name": "MEET.ONE",
            "publisher": "eosio.token",
            "precision": 4,
            "can_hide": 0
        }
    ]
};

export default function chainReducer( state = initialState, action ) {
    switch ( action.type ) {
        case chainActionTypes.UPDATE_BTN_STATE:
            return {
                ...state,
                showChangeBtn: action.data.showChangeBtn,
            };
        case chainActionTypes.CHANGE_CURRENT_CHAIN:
            return {
                ...state,
                currentChain: action.data.chain,
            };
        case chainActionTypes.UPDATE_CHAIN_DATA:
            return {
                ...state,
                chainData: action.data.chainData,
            };
        case chainActionTypes.UPDATE_SIDECHAIN_NODES:
            return {
                ...state,
                sideChainNodes: action.data,
            };
        case chainActionTypes.CHANGE_CURRENT_SIDECHAIN_NODE:
            return {
                ...state,
                currentSideChainNode: action.data.currentSideChainNode,
            };
        case chainActionTypes.UPDATE_SIDECHAIN_TOKENS:
            return {
                ...state,
                sideChainTokens: action.data
            }
        default:
            return state;
    }
}

