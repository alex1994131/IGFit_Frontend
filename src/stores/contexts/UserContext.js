import React, { createContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import merge from 'lodash.merge'
import { getUserAuth } from '../actions/userAction'
import { useHistory, useLocation } from "react-router-dom";

const UserContext = createContext(null)

const UserProvider = ({ children }) => {

    const accessToken = useSelector((state) => state.auth.authorizationToken)
    const history = useHistory();
    const location = useLocation();

    const updateUserDetails = ({ user }) => {
        setUserDetails(prevState => {
            const newState = { ...prevState }
            return merge(newState, { user })
        })
    }

    const userState = {
        user: null,
        updateUserDetails,
    }

    const [userDetails, setUserDetails] = useState(userState)

    const load = async () => {
        if (accessToken) {
            if (location.pathname == "/signin" || location.pathname == "/singup") {
                history.push("/")
            }

            let res = await getUserAuth(accessToken)
            if (res.status) {
                setUserDetails({
                    user: res.user,
                    updateUserDetails
                })
            }
        } else {
            if (location.pathname == "/signin" || location.pathname == "/singup") {
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
