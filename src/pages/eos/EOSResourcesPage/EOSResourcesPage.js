import { connect } from "react-redux";
import EOSResourcesPageView from "./EOSResourcesPageView";
import { delegatebw, undelegatebw, getCurrencyBalance, getAccount, rentcpu, rentnet, rent } from "../../../actions/EOSAction";
import { getCurrentWallet } from "../../../actions/WalletAction";
import { getSystemToken, getNetType } from "../../../actions/ChainAction";


const mapStoreToProps = ( state, ownProps ) => {
    const { params } = ownProps.navigation.state;
    let account;
    if (params && params.primaryKey) {
        account = getCurrentWallet( state, params.primaryKey );
    } else {
        account = getCurrentWallet( state, state.walletStore.currentWalletPrimaryKey );
    }

    return {
        account: account,
        systemToken: getSystemToken().name,
        language: state.settingStore.language,
        rental: state.eosStore.rental, // 租金，即等价1EOS可以租赁多少等价EOS资源
        enable_rex: (
            state.settingStore.config &&
            state.settingStore.config['enable_rex'] || 0
        ),
        netType: getNetType(),
        oneyuanstake: state.settingStore.config.cpubaole
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onDispatchDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( delegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res );
        } ) )
    },
    onDispatchUnDelegateBwPost: ( account, data, password, callback ) => {
        dispatch( undelegatebw( account, data, password, ( err, res ) => {
            callback && callback( err, res )
        } ) )
    },
    updateAccountData: (account) => {
        dispatch(getCurrencyBalance(account,null));
        dispatch(getAccount(account, null));
    },

    // 租CPU
    rentcpu: (account, password, amount, callback) => {
        dispatch(rentcpu(account, password, amount, (err, res) => {
            callback && callback(err, res);
        }))
    },
    // 租NET
    rentnet: (account, password, amount, callback) => {
        dispatch(rentnet(account, password, amount, (err, res) => {
            callback && callback(err, res);
        }))
    },
    // 同时租用CPU与NET
    rent: (account, password, cpu, net, callback) => {
        dispatch(rent(account, password, cpu, net, (err, res) => {
            callback && callback(err, res);
        }))
    }
});

const EOSResourcesPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSResourcesPageView );

export default EOSResourcesPage;
