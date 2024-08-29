import { connect } from 'react-redux';
import EOSTransactionListPageView from "./EOSTransactionListPageView";
import { getEOSTransactions } from '../../../actions/EOSAction';
import { getNetType } from '../../../actions/ChainAction';

const mapStoreToProps = ( state, ownProps ) => ({
    netType: getNetType()
});

const mapDispatchToProps = ( dispatch, ownProps ) => ({
    onGetEOSTransactions: ( account, data, callback ) => {
        dispatch( getEOSTransactions( account, data, ( error, resBody ) => {
            callback && callback( error, resBody );
        } ) )
    },
});

const EOSTransactionListPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( EOSTransactionListPageView );

export default EOSTransactionListPage;
