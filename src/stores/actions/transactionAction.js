
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config, eodhistorical_api } from '../configs';

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

export const getStock = async (search_string, token) => {
    // const res = await axios.create(eodhistorical_api).get(`/${text}`, { api_token: "60db83f2b0ab55.00463877" })
    // const res = await axios.get('https://eodhistoricaldata.com/api/search/AAPL?api_token=60db83f2b0ab55.00463877', {
    //     headers: {
    //         "Content-type": "application/json",
    //     }
    // })

    // const res = await fetch('https://eodhistoricaldata.com/api/search/AAPL?api_token=60db83f2b0ab55.00463877', {
    //     mode: 'no-cors',
    //     method: "GET",
    //     headers: {
    //         "Content-type": "application/json"
    //     }
    // })

    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_ticker`, { search_string, search_string })
    return res.data
}