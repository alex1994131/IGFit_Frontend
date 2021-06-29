import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";

import { Container, Button, Icon, Table, Header, Modal, Input, Message } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

import Pagination from './Pagination'

import { getSession } from '../stores/actions/userAction';
import { getTransaction, addTransaction, deleteTransaction } from '../stores/actions/transactionAction';

const Transaction = (props) => {

    const history = useHistory();

    const [portfolio, setPortfolio] = useState('');
    const [error, setError] = useState("")
    const [transaction, setTransaction] = useState([]);

    const [transticket, setTransTicket] = useState('')
    const [transdirection, setTransDirection] = useState('')
    const [transprice, setTransPrice] = useState('')
    const [transquantity, setTransQuantity] = useState('')
    const [transcommission, setTransCommission] = useState('')
    const [transcurrency, setTransCurrency] = useState('')

    const [modalOpen, setModalOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)

    const [fetch, setFetch] = useState(0);

    const pageItemCount = 10
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);

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

    const onAddTransaction = async (e) => {
        if (!transticket) {
            return setError('Please enter ticket')
        }

        if (!transdirection) {
            return setError('Please enter Direction')
        }

        if (!transprice) {
            return setError('Please enter Price')
        }

        if (!transquantity) {
            return setError('Please enter Quantity')
        }

        if (!transcommission) {
            return setError('Please enter Quantity')
        }

        if (!transcurrency) {
            return setError('Please enter Quantity')
        }

        const transaction_data = {
            portfolio: portfolio,
            ticker: transticket,
            direction: transdirection,
            price: transprice,
            quantity: transquantity,
            commission: transcommission,
            currency: transcurrency
        }

        const accessToken = getSession()
        const res = await addTransaction(transaction_data, accessToken);
        if (res.status) {
            let data = res.data;
            data.map((d, idx) => {
                d.no = idx;
            })
            setTransaction(data)
        }
        else {
            alert(res.message);
        }

        setModalOpen(false)
    }

    const onDismiss = () => {
        setError("")
        setErrorMessageOpen(true)
    }

    const onTicketChange = (e) => {
        setTransTicket(e.target.value)
    }

    const onDirectionChange = (e) => {
        setTransDirection(e.target.value)
    }

    const onPriceChange = (e) => {
        setTransPrice(e.target.value)
    }

    const onQuantityChange = (e) => {
        setTransQuantity(e.target.value)
    }

    const onCommissionChange = (e) => {
        setTransCommission(e.target.value)
    }

    const onCurrencyChange = (e) => {
        setTransCurrency(e.target.value)
    }

    const onDeleteTransaction = async (id) => {
        const accessToken = getSession()
        const res = await deleteTransaction(id, accessToken);
        if (res.status) {
            let data = res.data;
            data.map((d, idx) => {
                d.no = idx;
            })
            setTransaction(data)
        }
        else {
            alert(res.message);
        }

    }

    useEffect(() => {
        prepareCurrentData(transaction)
    }, [currentPage])

    useEffect(() => {
        prepareCurrentData(transaction)
    }, [transaction])

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                setPortfolio(props.portfolio);
                const accessToken = getSession()
                const res = await getTransaction(accessToken, props.portfolio);
                setFetch(1);
                if (res.status) {
                    let data = res.data;
                    data.map((d, idx) => {
                        d.no = idx;
                    })
                    setTransaction(data);
                }
                else {
                    history.push("/signin");
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
                        <Input onChange={onTicketChange} placeholder='Enter Ticket ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onDirectionChange} placeholder='Enter Direction ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onPriceChange} placeholder='Enter Price ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onQuantityChange} placeholder='Enter Quantity ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onCommissionChange} placeholder='Enter Commission ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onCurrencyChange} placeholder='Enter Currency ....' style={{ width: "100%", marginBottom: '10px' }} />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={() => setModalOpen(false)}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='green' onClick={() => onAddTransaction()}>
                        <Icon name='checkmark' /> Save
                    </Button>
                </Modal.Actions>
            </Modal>
            <Container fluid>
                <div style={{ padding: "20px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px" }}>
                        <Button color='blue' size='large' onClick={() => setModalOpen(true)}>
                            Add Transaction
                        </Button>
                    </div>
                    <div>
                        <Table sortable celled selectable padded>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>No</Table.HeaderCell>
                                    <Table.HeaderCell>Ticker</Table.HeaderCell>
                                    <Table.HeaderCell>Date</Table.HeaderCell>
                                    <Table.HeaderCell>Direction</Table.HeaderCell>
                                    <Table.HeaderCell>Price</Table.HeaderCell>
                                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                                    <Table.HeaderCell>Commission</Table.HeaderCell>
                                    <Table.HeaderCell>Currency</Table.HeaderCell>
                                    <Table.HeaderCell>Total</Table.HeaderCell>
                                    <Table.HeaderCell>Action</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            {
                                transaction.length > 0 ? (
                                    <>
                                        <Table.Body>
                                            {currentData.map((item, index) => {
                                                return <Table.Row key={index}>
                                                    <Table.Cell>{item.no + 1}</Table.Cell>
                                                    <Table.Cell>{item.ticker}</Table.Cell>
                                                    <Table.Cell>{new Date(item.date).toDateString()}</Table.Cell>
                                                    <Table.Cell>{item.direction}</Table.Cell>
                                                    <Table.Cell>{item.price}</Table.Cell>
                                                    <Table.Cell>{item.quantity}</Table.Cell>
                                                    <Table.Cell>{item.commission}</Table.Cell>
                                                    <Table.Cell>{item.currency}</Table.Cell>
                                                    <Table.Cell>{item.price * item.quantity}</Table.Cell>
                                                    <Table.Cell textAlign='center'>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Button onClick={(e) => { onDeleteTransaction(item._id) }}>Delete</Button>
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            })}
                                        </Table.Body>
                                        <Table.Footer>
                                            <Table.Row>
                                                <Table.HeaderCell colSpan='10'>
                                                    <Pagination
                                                        totalRecords={transaction.length}
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
                                            <Table.Cell colSpan='10'>There is no records</Table.Cell>
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

export default Transaction