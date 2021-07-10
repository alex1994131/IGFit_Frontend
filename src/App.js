import React, { useEffect } from "react"
import { useDispatch } from 'react-redux';
import { setSignIn, signinAction } from './stores/actions/userAction';

import Router from './Router'
import './App.css';


const App = props => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (localStorage['jwtToken'] && localStorage['jwtToken'] !== "undefined") {
            dispatch(setSignIn(localStorage['jwtToken']))
            console.log("accesstokenInitialize")
        }
    }, [])

    return (
        <Router />
    )
}
export default App