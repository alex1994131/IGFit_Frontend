
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config } from '../configs';

export const getTransaction = async (token, portfolio) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_transaction`, { portfolio: portfolio })
    return res.data
}

export const addTransaction = async (data, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/add_transaction`, data)
    return res.data
}

export const deleteTransaction = async (id, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/delete_transaction`, { id, id })
    return res.data
}

// export const setSignIn = (token) => {
//     return dispatch => {
//         dispatch({ type: actionTypes.LOGIN_SUCCESSFUL, authorizationToken: token });
//     }
// }