
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config } from '../configs';

export const getPrice = async (search_string, token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_price`, { search_string, search_string })
    return res.data
}