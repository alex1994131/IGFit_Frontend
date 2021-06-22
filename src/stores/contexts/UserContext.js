import React, { createContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import merge from 'lodash.merge'
import { getSession, GetUserAuth } from '../actions/userAction'

import { history } from '../../history'

const UserContext = createContext({
    user: null,
    settings: {},
    setUserDetails: userDetails => { }
})

const UserProvider = ({ children }) => {
    const dispatch = useDispatch()

    const setUserDetails = ({ user }) => {
        updateUserDetails(prevState => {
            const newState = { ...prevState }
            return merge(newState, { user })
        })
    }

    const setSettings = ({ settings }) => {
        updateUserDetails(prevState => {
            const newState = { ...prevState }
            return merge(newState, { settings })
        })
    }

    const userState = {
        user: null,
        settings: {},
        setUserDetails,
    }

    const [userDetails, updateUserDetails] = useState(userState)

    const load = async () => {
        const get_sess = getSession() // session existing

        if (get_sess) {
            const r = await GetUserAuth({ token: get_sess })
            if (r.status) {
                setUserDetails({ user })
                setSettings({});
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
