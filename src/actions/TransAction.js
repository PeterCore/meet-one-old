import ethTransactionActionTypes from "../reducers/ethtransaction/ethTransactionActionTypes";

export function requestTransactionList( isResfreshing,
                                        loading,
                                        address,
                                        isLoadMore,
                                        page = 1 ) {
    return {
        type: ethTransactionActionTypes.REQUEST_TRANSACTION_LIST,
        isResfreshing,
        loading,
        isLoadMore,
        address,
        page
    }
}

export function fetchTransactionList( isResfreshing,
                                      loading,
                                      isLoadMore, ) {
    return {
        type: ethTransactionActionTypes.FETCH_TRANSACTION_LIST,
        isResfreshing,
        loading,
        isLoadMore,
    }
}

export function receiveTransactionList( txList ) {
    return {
        type: ethTransactionActionTypes.RECEIVE_TRANSACTION_LIST,
        txList,
    }
}


