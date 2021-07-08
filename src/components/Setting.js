import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from "react-router-dom";
import { useStyles } from 'react-styles-hook'
import { useHistory } from "react-router";

import { Container, Button, Icon, Table, Header, Modal, Input, Message, Dropdown, Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

import { UserContext } from "../stores/contexts/UserContext";

import { getSession } from '../stores/actions/userAction';
import { updateBaseCurrency } from '../stores/actions/userAction';

const styles = useStyles({
    fluidInput: {
        width: '100%',
        marginBottom: '10px'
    }
})

const Setting = (props) => {

    const history = useHistory();

    console.log(useContext(UserContext));

    const base_currency = [
        {
            key: 1,
            text: 'USD',
            value: 'USD',
        },
        {
            key: 2,
            text: 'GBP',
            value: 'GBP',
        },
        {
            key: 3,
            text: 'EUR',
            value: 'EUR',
        },
        {
            key: 4,
            text: 'JPY',
            value: 'JPY',
        },
        {
            key: 5,
            text: 'HKD',
            value: 'HKD',
        },
        {
            key: 6,
            text: 'RMB',
            value: 'RMB',
        },
        {
            key: 7,
            text: 'CAD',
            value: 'CAD',
        }
    ]

    // const [transaction, setTransaction] = useState([]);

    const onBaseCurrencyChange = (e, data) => {
        const selected_currency = data.value


    }

    useEffect(() => {

    });

    return (
        <>
            <Container fluid>
                <label>First Name</label>
                <Dropdown placeholder='Direction' onChange={onBaseCurrencyChange} style={{ width: '100%', marginBottom: '10px' }} fluid selection options={base_currency} />
            </Container>
        </>

    )
}

export default Setting