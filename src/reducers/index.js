import userReducer from "./user/userReducer";
import metaReducer from "./meta/metaReducer";
import settingReducer from "./setting/settingReducer";
import ethReducer from "./eth/ethReducer";
import navReducer from "./nav/navReducer";
import eosReducer from "./eos/eosReducer";
import walletReducer from "./wallet/walletReducer";
import chainReducer from "./chain/chainReducer";


export const reducers = {
    nav: navReducer,
    userStore: userReducer,
    metaStore: metaReducer,
    settingStore: settingReducer,
    ethStore: ethReducer,
    eosStore: eosReducer,
    walletStore: walletReducer,
    chainStore: chainReducer
};
