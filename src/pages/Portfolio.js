import React, { useState, useEffect } from 'react';

import { Container, Button, Icon, Label, Menu, Table, Header, Modal, Input, Message } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

import { getSession } from '../stores/actions/userAction';
import { getPortfolio, newPortfolio } from '../stores/actions/portfolioAction';

const Portfolio = (props) => {

    const [error, setError] = useState("")
    const [portfolio, setPortfolio] = useState([]);
    const [newPortfolioName, setNewPortfolioName] = useState('')
    const [modalOpen, setModalOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)

    const accessToken = getSession()

    useEffect(() => {
        const res = getPortfolio(accessToken);
        if (res.status) {
            setPortfolio(res.data)
        }
        else {
            props.history.push("/signin");
        }
    });

    const onNewCreate = (e) => {
        if (!newPortfolioName) {
            return setError('Please enter new portfolio name')
        }

        // const res = newPortfolio(newPortfolioName, accessToken);
        // if (res.status) {
        //     setPortfolio(res.data)
        // }
        // else {
        //     alert(res.message);
        // }

        setModalOpen(false)
    }

    const onNewPortfolioNameChange = (e) => {
        setNewPortfolioName(e.target.value)
    }

    const onDismiss = () => {
        setError("")
        setErrorMessageOpen(true)
    }

    return (
        <>
            <Modal
                closeIcon
                size='small'
                open={modalOpen}
                onOpen={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
            >
                <Header icon='archive' content='Archive Old Messages' />
                <Modal.Content>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {
                            error && (
                                <Message
                                    error
                                    header='Error'
                                    content={error}
                                    onDismiss={onDismiss}
                                    style={{ width: '100%' }}
                                />
                            )
                        }
                        <Input id="portfolio_name" onChange={onNewPortfolioNameChange} placeholder='Enter Portfolio Name ....' style={{ width: "100%" }} />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={() => setModalOpen(false)}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='green' onClick={() => onNewCreate()}>
                        <Icon name='checkmark' /> Save
                    </Button>
                </Modal.Actions>
            </Modal>
            <Container fluid>
                <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px" }}>
                        <Button id="new_portfolio" color='blue' size='large' onClick={() => setModalOpen(true)}>
                            New Portfolio
                        </Button>
                    </div>
                    <div>
                        <Table sortable celled fixed>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Header</Table.HeaderCell>
                                    <Table.HeaderCell>Header</Table.HeaderCell>
                                    <Table.HeaderCell>Header</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            {
                                portfolio.length > 0 ? (
                                    <>
                                        <Table.Body>
                                            <Table.Row>
                                                <Table.Cell>Cell</Table.Cell>
                                                <Table.Cell>Cell</Table.Cell>
                                                <Table.Cell>Cell</Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                        <Table.Footer>
                                            <Table.Row>
                                                <Table.HeaderCell colSpan='3'>
                                                    <Menu floated='right' pagination>
                                                        <Menu.Item as='a' icon>
                                                            <Icon name='chevron left' />
                                                        </Menu.Item>
                                                        <Menu.Item as='a'>1</Menu.Item>
                                                        <Menu.Item as='a'>2</Menu.Item>
                                                        <Menu.Item as='a'>3</Menu.Item>
                                                        <Menu.Item as='a'>4</Menu.Item>
                                                        <Menu.Item as='a' icon>
                                                            <Icon name='chevron right' />
                                                        </Menu.Item>
                                                    </Menu>
                                                </Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Footer>
                                    </>
                                ) : (
                                    <Table.Body>
                                        <Table.Row textAlign='center'>
                                            <Table.Cell colSpan='3'>There is no records</Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                )
                            }
                        </Table>
                    </div>
                </div>
            </Container>
        </>

    )
}

export default Portfolio