import React from "react"
import { Container } from "semantic-ui-react";

import Header from "../components/Header"
import LeftSidar from "../components/LeftSidar"

const MainLayout = ({ children }) => {
    return (
        <>
            <Header />
            {/* <LeftSidar />
            <Container fluid style={{ padding: "20px 20px 0 20px", width: "100%", }}> */}
            {
                children
            }
            {/* </Container> */}
        </>
    )
}

export default MainLayout