
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config } from '../configs';

export const getPortfolio = async (token) => {
    axios_config.Authorization = 'Bearer ' + token;
    const res = await axios.post(`/get_portfolio`, axios_config)
    return res.data
}

export const newPortfolio = async (name, token) => {
    axios_config.Authorization = 'Bearer ' + token;
    const res = await axios.post(`/new_portfolio`, name, axios_config)
    return res.data
}

// export const setSignIn = (token) => {
//     return dispatch => {
//         dispatch({ type: actionTypes.LOGIN_SUCCESSFUL, authorizationToken: token });
//     }
// }