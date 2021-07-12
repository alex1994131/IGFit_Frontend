import React, { createContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import merge from 'lodash.merge'
import { getUserAuth } from '../actions/userAction'
import { useHistory, useLocation } from "react-router-dom";

const UserContext = createContext({
    username: '',
    email: '',
    currency: '',
    portfolio: [],
    updateUserDetails: userDetails => { }
})

const UserProvider = ({ children }) => {

    const accessToken = useSelector((state) => state.auth.authorizationToken)
    const history = useHistory();
    const location = useLocation();

    const updateUserDetails = ({
        username,
        email,
        currency,
        portfolio
    }) => {
        setUserDetails(prevState => {
            const newState = { ...prevState }
            return merge(newState, {
                username,
                email,
                currency,
                portfolio
            })
        })
    }

    const userState = {
        username: '',
        email: '',
        currency: '',
        portfolio: [],
        updateUserDetails
    }

    const [userDetails, setUserDetails] = useState(userState)

    const load = async () => {
        if (accessToken) {
            if (location.pathname == "/signin" || location.pathname == "/signup") {
                history.push("/")
            }

            let res = await getUserAuth(accessToken)
            if (res.status) {
                updateUserDetails({
                    username: res.user.username,
                    email: res.user.email,
                    currency: res.user.currency,
                    portfolio: res.user.portfolio,
                })
            }
        } else {
            if (location.pathname == "/signin" || location.pathname == "/signup") {
                history.push("/signin")
            }
        }
    }

    useEffect(() => {
        load()
    }, [accessToken])

    return (
        <UserContext.Provider value={userDetails}>
            {children}
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext }
