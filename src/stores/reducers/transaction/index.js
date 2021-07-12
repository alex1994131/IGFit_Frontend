import * as actionTypes from '../../actions/actionTypes'

const initialState = {
    transactionData: []
};

const auth = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_TRANSACTION: {
            return {
                transactionData: action.transaction
            }
        }
        default:
            return state;
    }
}

export default auth