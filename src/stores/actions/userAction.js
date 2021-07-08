
import * as actionTypes from './actionTypes'
import axios from 'axios';
import { axios_config } from '../configs';

export const getSession = () => {
    if (localStorage['jwtToken'] && localStorage['jwtToken'] !== "undefined") {
        return localStorage['jwtToken'];
    } else {
        return false;
    }
}

export const getUserAuth = async (token) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/get_user`)
    return res.data
}

export const signinAction = async (auth_info) => {
    const res = await axios.post(`/signin`, JSON.stringify(auth_info), axios_config)
    return res.data
}

export const signupAction = async (user_info) => {
    const res = await axios.post(`/signup`, JSON.stringify(user_info), axios_config)
    return res.data
}

export const signoutAction = async (token) => {
    const res = await axios.post(`/signout`, JSON.stringify(token), axios_config)
    return res.data
}

export const updateBaseCurrency = async (token, data) => {
    axios_config.headers.Authorization = 'Bearer ' + token;
    const res = await axios.create(axios_config).post(`/update_basecurrency`, { portfolio: portfolio })
    return res.data
}

export const setSignIn = (token) => {
    return dispatch => {
        dispatch({ type: actionTypes.LOGIN_SUCCESSFUL, authorizationToken: token });
    }
}

export const setSignOut = () => {
    return dispatch => {
        dispatch({ type: actionTypes.LOGOUT_USER });
    }
}