import * as actionTypes from './index'
// import jwt from 'jsonwebtoken';
// import axios from 'axios';
import { history } from "../../history"

export const getSession = () => {
    if (localStorage['jwtToken'] && localStorage['jwtToken'] !== "undefined") {
        return localStorage['jwtToken'];
    } else {
        return false;
    }
}

export const GetUserAuth = (token) => {

}

export const signinAction = (auth_info) => {
    console.log(auth_info);
}

export const signupAction = (auth_info) => {
    console.log(auth_info)
}