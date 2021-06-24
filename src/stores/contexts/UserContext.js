import React, { createContext, useEffect, useState } from 'react'
import merge from 'lodash.merge'
import { getSession, getUserAuth } from '../actions/userAction'

import { history } from '../../history'

const UserContext = createContext({
    user: null,
    setUserDetails: userDetails => { }
})

const UserProvider = ({ children }) => {

    const setUserDetails = ({ user }) => {
        updateUserDetails(prevState => {
            const newState = { ...prevState }
            return merge(newState, { user })
        })
    }

    const userState = {
        user: null,
        setUserDetails,
    }

    const [userDetails, updateUserDetails] = useState(userState)

    const load = async () => {
        const accessToken = getSession()

        if (accessToken) {
            if (history.location.pathname == "/signin" || history.location.pathname == "/singup") {
                history.push("/")
            }

            let res = await getUserAuth({ token: accessToken })
            if (res.status) {
                setUserDetails(res.user)
            }
        } else {
            if (history.location.pathname !== "/signin" || history.location.pathname !== "/singup") {
                history.push("/signin")
            }
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <UserContext.Provider value={userDetails}>
            {children}
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext }
