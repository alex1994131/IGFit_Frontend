import React, { createContext, useEffect, useState } from 'react'
import merge from 'lodash.merge'
import { getSession, getUserAuth } from '../actions/userAction'

import { history } from '../../history'

const UserContext = createContext(null)

const UserProvider = ({ children }) => {

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
        const accessToken = getSession()

        if (accessToken) {
            if (history.location.pathname == "/signin" || history.location.pathname == "/singup") {
                history.push("/")
            }

            if (!userDetails.user) {
                let res = await getUserAuth(accessToken)
                if (res.status) {

                    setUserDetails({
                        user: res.user,
                        updateUserDetails
                    })
                }
            }
        } else {
            if (history.location.pathname !== "/signin" || history.location.pathname !== "/singup") {
                history.push("/signin")
            }
        }
    }

    useEffect(() => {
        load()
    })

    return (
        <UserContext.Provider value={userDetails}>
            {children}
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext }
