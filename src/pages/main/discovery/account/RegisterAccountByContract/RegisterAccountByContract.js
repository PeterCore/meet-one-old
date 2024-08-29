import RegisterAccountByContractView from "./RegisterAccountByContractView";
import { connect } from "react-redux";
import { verifyAccountRegistered, getCurrentRAMPrice } from "../../../../../actions/EOSAction";

const mapStoreToProps = ( state, ownProps ) => {
    return {
        RAMPrice: state.eosStore.RAMPrice
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // 获取帐号信息
    getAccountPost: (account, data, success, faild) => {
        dispatch(verifyAccountRegistered(account, data, (err, res) => {
            success && success(err, res);
        }, () => {
            faild && faild();
        }));
    },
    updateRAMPrice: (account) => {
        dispatch(getCurrentRAMPrice(account));
    },
});

const RegisterAccountByContract = connect(
    mapStoreToProps,
    mapDispatchToProps
)(RegisterAccountByContractView);

export default RegisterAccountByContract;
