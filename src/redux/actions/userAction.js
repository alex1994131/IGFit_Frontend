import * as actionTypes from './index'
// import jwt from 'jsonwebtoken';
// import axios from 'axios';
import { history } from "../../history"

export const is_session = () => {
    if (localStorage['jwtToken'] && localStorage['jwtToken'] !== "undefined") {
        return true;
    } else {
        return false;
    }
}


export const getSession = () => {

}

export const fake_session = () => {

}


export const GetUserAuth = () => {

}