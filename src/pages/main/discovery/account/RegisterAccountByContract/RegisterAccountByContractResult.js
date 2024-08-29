import RegisterAccountByContractResultView from "./RegisterAccountByContractResultView";
import { connect } from "react-redux";

const mapStoreToProps = ( state, ownProps ) => {
    return {
    }
};

const mapDispatchToProps = ( dispatch, ownProps ) => ({
});

const RegisterAccountByContractResult = connect(
    mapStoreToProps,
    mapDispatchToProps
)(RegisterAccountByContractResultView);

export default RegisterAccountByContractResult;
