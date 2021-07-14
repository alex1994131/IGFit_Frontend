
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

export const deleteTransaction = async (transaction, portfolio, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/delete_transaction`, {
        transaction: transaction,
        portfolio: portfolio
    })
    return res.data
}

export const getTicker = async (search_string, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_ticker`, { search_string, search_string })
    return res.data
}

export const getPrice = async (token, data) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_price`, data)
    return res.data
}

export const getCurrency = async (token, data) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_currency`, data)
    return res.data
}

export const calcPortfolio = async (portfolio_id, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/calc_portfolio`, { portfolio_id: portfolio_id })
    return res.data
}

export const setTransactionData = (transaction) => {
    return dispatch => {
        dispatch({ type: actionTypes.SET_TRANSACTION, transaction: transaction });
    }
}