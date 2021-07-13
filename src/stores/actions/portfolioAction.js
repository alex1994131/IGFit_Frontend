
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config } from '../configs';

export const getPortfolio = async (token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_portfolio`)
    return res.data
}

export const newPortfolio = async (name, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/new_portfolio`, { name: name })
    return res.data
}

export const getPortfolioOne = async (id, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_portfolioOne`, { id: id })
    return res.data
}