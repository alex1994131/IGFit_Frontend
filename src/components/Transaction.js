import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"
import { useStyles } from 'react-styles-hook'
import { useHistory } from "react-router";

import { Container, Button, Icon, Table, Header, Modal, Input, Message, Dropdown, Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import Pagination from './Pagination'

import { addTransaction, deleteTransaction, getTicker, setTransactionData } from '../stores/actions/transactionAction';

const styles = useStyles({
    fluidInput: {
        width: '100%',
        marginBottom: '10px'
    }
})

const Transaction = (props) => {

    const history = useHistory();
    const dispatch = useDispatch()
    const accessToken = useSelector((state) => state.auth.authorizationToken)
    
    const [transaction, setTransaction] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(props.dataLoaded);
    const [portfolio, setPortfolio] = useState(props.portfolio);

    const [ticker, setTicker] = useState([])
    const [displayDropDown, setDisplayDropDown] = useState([])

    const [error, setError] = useState("")

    const [transname, setTransName] = useState('')
    const [transticker, setTransTicker] = useState('')
    const [transdirection, setTransDirection] = useState('')
    const [transdate, setTransDate] = useState('')
    const [transprice, setTransPrice] = useState('')
    const [transquantity, setTransQuantity] = useState('')
    const [transcommission, setTransCommission] = useState('')

    const [modalOpen, setModalOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)

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

        if (new Date(transdate).getTime() > new Date().getTime()) {
            return setError('Please enter Correct Date. Transaction Date can not be bigger than now')
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

        const res = await addTransaction(transaction_data, accessToken);
        if (res.status) {
            let data = res.data;
            dispatch(setTransactionData(data))
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
    }

    const onDirectionChange = (e, data) => {
        setTransDirection(data.value)
    }

    const onDateChange = (e, data) => {
        let transaction_date = new Date(data.value)
        let time = transaction_date.toISOString()
        setTransDate(time)
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
        const res = await deleteTransaction(id, portfolio, accessToken);
        if (res.status) {
            let data = res.data;
            dispatch(setTransactionData(data))
        }
        else {
            alert(res.data);
        }
    }

    const onModalClose = () => {
        setModalOpen(false)
        setTicker([])
    }

    useEffect(() => {
        const fetchData = async () => {
            if (transname === '') {
                setTicker([])
            }
            else {
                const result = await getTicker(transname, accessToken)
                if (result.status) {
                    if (transname === '') {
                        setTicker([])
                    }
                    else {
                        if (result.data[0] !== null) {
                            setTicker(result.data)
                        }
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
        if (ticker.length === 0) {
            setDisplayDropDown([])
        }
        else {
            const stateOptions = _.map(ticker, (tic, index) => ({
                key: index,
                text: `${tic.Name}-${tic.Exchange} (${tic.Code}, ${tic.Currency})`,
                value: `${tic.Name}:${tic.Exchange}:${tic.Code}:${tic.Currency}`,
            }))

            setDisplayDropDown(stateOptions)
        }
    }, [ticker])

    useEffect(() => {
        prepareCurrentData(transaction)
    }, [currentPage])

    useEffect(() => {
        prepareCurrentData(transaction)
    }, [transaction])

    useEffect(() => {
        setDataLoaded(props.dataLoaded)
        let data = props.transactions;
        if (data) {
            data.map((d, idx) => {
                d.no = idx;
            })
            setTransaction(data);
        }
    }, [props.dataLoaded, props.transaction]);

    useEffect(() => {
        setPortfolio(props.portfolio)
    }, [props.portfolio]);

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
                {
                    !dataLoaded ? (
                        <>
                            <Loader active inline='centered' size='massive' style={{ marginTop: '20%' }} />
                        </>)
                        : (
                            <div style={{ padding: "20px", margin: "0 auto" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px" }}>
                                    <Button color='blue' size='large' onClick={() => setModalOpen(true)}>
                                        Add Transaction
                                    </Button>
                                </div>
                                <div>
                                    <Table sortable celled selectable padded singleLine>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>No</Table.HeaderCell>
                                                <Table.HeaderCell>Date</Table.HeaderCell>
                                                <Table.HeaderCell>Name</Table.HeaderCell>
                                                <Table.HeaderCell>Ticker</Table.HeaderCell>
                                                <Table.HeaderCell>Direction</Table.HeaderCell>
                                                <Table.HeaderCell>Currency</Table.HeaderCell>
                                                <Table.HeaderCell>Price</Table.HeaderCell>
                                                <Table.HeaderCell>Quantity</Table.HeaderCell>
                                                <Table.HeaderCell>Commission</Table.HeaderCell>
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
                                                                <Table.Cell textAlign='left'>{item.no + 1}</Table.Cell>
                                                                <Table.Cell textAlign='left'>{new Date(item.date).toDateString().split(' ').slice(1).join(' ')}</Table.Cell>
                                                                <Table.Cell textAlign='left'>{item.name}</Table.Cell>
                                                                <Table.Cell textAlign='left'>{item.ticker}</Table.Cell>
                                                                <Table.Cell textAlign='center'>{item.direction}</Table.Cell>
                                                                <Table.Cell textAlign='center'>{item.currency}</Table.Cell>
                                                                <Table.Cell textAlign='right'>{(Math.round(item.price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Table.Cell>
                                                                <Table.Cell textAlign='right'>{(Math.round(item.quantity * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Table.Cell>
                                                                <Table.Cell textAlign='right'>{(Math.round(item.commission * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Table.Cell>
                                                                <Table.Cell textAlign='right'>{(Math.round((Number(item.price * item.quantity) + Number(item.commission)) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Table.Cell>
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
                        )}
            </Container>
        </>

    )
}

export default Transaction