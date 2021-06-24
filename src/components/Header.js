import React from "react"
import { useDispatch } from 'react-redux';
import { Container, Header, Menu, Divider, Button } from "semantic-ui-react";

import { getSession, setSignOut, signoutAction } from '../stores/actions/userAction';

const PageHeader = (props) => {

    const dispatch = useDispatch()

    const onSignOut = async (e) => {
        const accessToken = getSession()

        let res = await signoutAction({ token: accessToken });
        if (res.status) {
            localStorage.removeItem("jwtToken");
            dispatch(setSignOut())
            props.push("/signin");
        } else {
            alert("Failure");
        }
    }

    return (
        <>
            <Container fluid style={{ padding: "20px 20px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Header as="h3">IG Fit ({new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })})</Header>
                <Button onClick={onSignOut}>
                    Signout
                </Button>
            </Container>
            <Divider />
        </>
    )
}

export default PageHeader