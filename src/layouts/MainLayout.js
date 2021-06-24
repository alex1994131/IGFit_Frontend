import React from "react"
import { Container } from "semantic-ui-react";

import Header from "../components/Header"
import LeftSidar from "../components/LeftSidar"

const MainLayout = ({ history, children }) => {
    return (
        <>
            <Header {...history} />
            {
                children
            }
        </>
    )
}

export default MainLayout