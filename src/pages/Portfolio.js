import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
import { useSelector } from "react-redux"

import { Container, Button, Icon, Table, Header, Modal, Input, Message } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

import Pagination from '../components/Pagination'
import { getPortfolio, newPortfolio } from '../stores/actions/portfolioAction';
import { UserContext } from "../stores/contexts/UserContext";

const Portfolio = (props) => {

    const history = useHistory();
    const accessToken = useSelector((state) => state.auth.authorizationToken)
    const current_user = useContext(UserContext);

    const [error, setError] = useState("")
    const [portfolio, setPortfolio] = useState([]);
    const [newPortfolioName, setNewPortfolioName] = useState('')
    const [modalOpen, setModalOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)

    const [fetch, setFetch] = useState(0);

    const pageItemCount = 10
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);

    const getCurrencySymbol = (locale, currency) => {
        return (0).toLocaleString(
            locale,
            {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).replace(/\d/g, '').trim()
    }

    const prepareCurrentData = (data) => {
        setCurrentData(data.slice(
            (currentPage - 1) * pageItemCount,
            (currentPage - 1) * pageItemCount + pageItemCount
        ))
    }

    const onPageChanged = useCallback(
        (event, page) => {
            event.preventDefault();
            setCurrentPage(page);
        },
        [setCurrentPage]
    );

    const onNewCreate = async (e) => {
        if (!newPortfolioName) {
            return setError('Please enter new portfolio name')
        }

        const res = await newPortfolio(newPortfolioName, accessToken);
        if (res.status) {
            let data = res.data;
            data.map((d, idx) => {
                d.no = idx;
            })
            setPortfolio(data)
        }
        else {
            alert(res.message);
        }

        setModalOpen(false)
    }

    const onNewPortfolioNameChange = (e) => {
        setNewPortfolioName(e.target.value)
    }

    const onDismiss = () => {
        setError("")
        setErrorMessageOpen(true)
    }

    const onDashboard = (e, id) => {
        e.preventDefault()
        history.push(`dashboard?id=${id}`)
    }

    useEffect(() => {
        prepareCurrentData(portfolio)
    }, [currentPage])

    useEffect(() => {
        prepareCurrentData(portfolio)
    }, [portfolio])

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                const res = await getPortfolio(accessToken);
                setFetch(1);
                if (res.status) {
                    let data = res.data;
                    data.map((d, idx) => {
                        d.no = idx;
                    })
                    setPortfolio(data);
                }
                else {
                    props.history.push("/signin");
                }
            }
        }
        fetchData()
    });

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
                        <Table sortable celled selectable padded>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>No</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Value</Table.HeaderCell>
                                    <Table.HeaderCell>Profit</Table.HeaderCell>
                                    <Table.HeaderCell>Date</Table.HeaderCell>
                                    <Table.HeaderCell>Action</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            {
                                portfolio.length > 0 ? (
                                    <>
                                        <Table.Body>
                                            {currentData.map((item, index) => {
                                                return <Table.Row key={index}>
                                                    <Table.Cell>{item.no + 1}</Table.Cell>
                                                    <Table.Cell>{item.name}</Table.Cell>
                                                    <Table.Cell>
                                                        {
                                                            current_user.hasOwnProperty('currency') ? (
                                                                Number(item.value).toLocaleString(undefined, { style: 'currency', currency: current_user['currency'], minimumFractionDigits: 2 })
                                                            ) : (
                                                                ""
                                                            )
                                                        }
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {
                                                            current_user.hasOwnProperty('currency') ? (
                                                                Number(item.profit).toLocaleString(undefined, { style: 'currency', currency: current_user['currency'], minimumFractionDigits: 2 })
                                                            ) : (
                                                                ""
                                                            )
                                                        }
                                                    </Table.Cell>
                                                    <Table.Cell>{new Date(item.created_at).toDateString()}</Table.Cell>
                                                    <Table.Cell textAlign='center'>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Button onClick={(e) => onDashboard(e, item._id)}>Go to Dashboard</Button>
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            })}
                                        </Table.Body>
                                        <Table.Footer>
                                            <Table.Row>
                                                <Table.HeaderCell colSpan='6'>
                                                    <Pagination
                                                        totalRecords={portfolio.length}
                                                        pageLimit={pageItemCount}
                                                        pageNeighbours={2}
                                                        onPageChanged={onPageChanged}
                                                        currentPage={currentPage}
                                                    />
                                                </Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Footer>
                                    </>
                                ) : (
                                    <Table.Body>
                                        <Table.Row textAlign='center'>
                                            <Table.Cell colSpan='6'>There is no records</Table.Cell>
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