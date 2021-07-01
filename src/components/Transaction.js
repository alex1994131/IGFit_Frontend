import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useStyles } from 'react-styles-hook'
import { useHistory } from "react-router";

import { Container, Button, Icon, Table, Header, Modal, Input, Message, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import Pagination from './Pagination'

import { getSession } from '../stores/actions/userAction';
import { getTransaction, addTransaction, deleteTransaction, getStock } from '../stores/actions/transactionAction';

const styles = useStyles({
    fluidInput: {
        width: '100%',
        marginBottom: '10px'
    }
})

const Transaction = (props) => {

    const history = useHistory();

    const [stock, setStock] = useState([])
    const [displayDropDown, setDisplayDropDown] = useState([])

    const [portfolio, setPortfolio] = useState('');
    const [error, setError] = useState("")
    const [transaction, setTransaction] = useState([]);

    const [transname, setTransName] = useState('')
    const [transticker, setTransTicker] = useState('')
    const [transdirection, setTransDirection] = useState('')
    const [transdate, setTransDate] = useState('')
    const [transprice, setTransPrice] = useState('')
    const [transquantity, setTransQuantity] = useState('')
    const [transcommission, setTransCommission] = useState('')

    const [modalOpen, setModalOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)

    const [fetch, setFetch] = useState(0);

    const pageItemCount = 10
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);

    const directionOptions = [{
        key: 1,
        text: 'BUY',
        value: 'BUY',
    }, {
        key: 2,
        text: 'SELL',
        value: 'SELL',
    }]

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
        if (!transticker) {
            return setError('Please enter Name/Ticker/Currency')
        }

        if (!transdirection) {
            return setError('Please enter Direction')
        }

        if (!transdate) {
            return setError('Please enter Date')
        }

        if (!transprice) {
            return setError('Please enter Price')
        }

        if (!transquantity) {
            return setError('Please enter Quantity')
        }

        if (!transcommission) {
            return setError('Please enter Commission')
        }

        const transaction_data = {
            portfolio: portfolio,
            ticker: transticker,
            direction: transdirection,
            date: transdate,
            price: transprice,
            quantity: transquantity,
            commission: transcommission
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
            alert(res.data);
        }

        setModalOpen(false)
    }

    const onDismiss = () => {
        setError("")
        setErrorMessageOpen(true)
    }

    const onNameChange = (e) => {
        setTransName(e.target.value)
    }

    const onTickerChange = (e, data) => {
        setTransTicker(data.value)
        // setStock([])
    }

    const onDirectionChange = (e, data) => {
        setTransDirection(data.value)
    }

    const onDateChange = (e, data) => {
        setTransDate(data.value)
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

    const onDeleteTransaction = async (id) => {
        const accessToken = getSession()
        const res = await deleteTransaction(id, portfolio, accessToken);
        if (res.status) {
            let data = res.data;
            data.map((d, idx) => {
                d.no = idx;
            })
            setTransaction(data)
        }
        else {
            alert(res.data);
        }

    }

    const onModalClose = () => {
        setModalOpen(false)
        setStock([])
    }

    useEffect(() => {
        const fetchData = async () => {
            console.log(transname)
            if (transname === '') {
                console.log('aaaaaaaaaaaaaa')
                setStock([])
            }
            else {
                console.log('bbbbbbbbbbbb')
                const accessToken = getSession()
                const result = await getStock(transname, accessToken)
                if (result.status) {
                    console.log(result.data)
                    console.log(transname)
                    console.log(typeof transname === typeof '')
                    if (transname === '') {
                        setStock([])
                    }
                    else {
                        setStock(result.data)
                    }
                }
                else {
                    alert(result.data)
                }
            }
        }
        fetchData()
    }, [transname])

    useEffect(() => {
        if (stock.length === 0) {
            setDisplayDropDown([])
        }
        else {
            const stateOptions = _.map(stock, (sto, index) => ({
                key: index,
                text: `${sto.Name} (${sto.Code}, ${sto.Currency})`,
                value: `${sto.Name}:${sto.Code}:${sto.Currency}`,
            }))

            setDisplayDropDown(stateOptions)
        }
    }, [stock])

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
                onClose={() => onModalClose()}
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
                        <Dropdown placeholder='Name/Ticker/Currency' style={{ width: '100%', marginBottom: '10px' }} search selection options={displayDropDown} onChange={onTickerChange} onSearchChange={onNameChange} />
                        <Dropdown placeholder='Direction' onChange={onDirectionChange} style={{ width: '100%', marginBottom: '10px' }} fluid selection options={directionOptions} />
                        <div className='dateContainer'>
                            <SemanticDatepicker className='fluid-input' onChange={onDateChange} />
                        </div>
                        <Input onChange={onPriceChange} placeholder='Enter Price ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onQuantityChange} placeholder='Enter Quantity ....' style={{ width: "100%", marginBottom: '10px' }} />
                        <Input onChange={onCommissionChange} placeholder='Enter Commission ....' style={{ width: "100%", marginBottom: '10px' }} />
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
                                    <Table.HeaderCell>Name</Table.HeaderCell>
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
                                                    <Table.Cell>{item.name}</Table.Cell>
                                                    <Table.Cell>{item.ticker}</Table.Cell>
                                                    <Table.Cell>{new Date(item.date).toDateString()}</Table.Cell>
                                                    <Table.Cell>{item.direction}</Table.Cell>
                                                    <Table.Cell>{item.price}</Table.Cell>
                                                    <Table.Cell>{item.quantity}</Table.Cell>
                                                    <Table.Cell>{item.commission}</Table.Cell>
                                                    <Table.Cell>{item.currency}</Table.Cell>
                                                    <Table.Cell>{(Number(item.price * item.quantity) + Number(item.commission))}</Table.Cell>
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
                                                <Table.HeaderCell colSpan='11'>
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
                                            <Table.Cell colSpan='11'>There is no records</Table.Cell>
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