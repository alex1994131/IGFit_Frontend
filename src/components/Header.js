import React from "react"
import { Container, Header, Menu, Divider, Button } from "semantic-ui-react";

const PageHeader = () => {
    return (
        <>
            <Container fluid style={{ padding: "20px 20px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Header as="h3">IG Fit ({new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })})</Header>
                <Button >
                    Signout
                </Button>
                {/* <Menu
                    borderless
                >
                    <Container text>
                        <Menu.Menu position='right'>
                            <Button as='a' style={{ marginLeft: '0.5em' }}>
                                Sign Out
                            </Button>
                        </Menu.Menu>
                    </Container>
                </Menu> */}
            </Container>
            <Divider />
        </>
    )
}

export default PageHeader