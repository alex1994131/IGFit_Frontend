import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from "react-router-dom";
import { useStyles } from 'react-styles-hook'
import { useHistory } from "react-router";

import { Container, Button, Dropdown, Divider, Icon } from 'semantic-ui-react'
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

    const current_user = useContext(UserContext);

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

    const [defaultValue, setDefaultValue] = useState('');
    const [currency, setCurrency] = useState('')

    const onBaseCurrencyChange = async (e, data) => {
        setCurrency(data.value)
    }

    const onSaveCurrency = async () => {
        const accessToken = getSession()
        const result = await updateBaseCurrency(accessToken, currency)
        if (result.status) {
            console.log(result.data)
            current_user.updateUserDetails(result.data)
            setDefaultValue(currency)
        }
        else {
            alert(result.data)
        }
    }

    useEffect(() => {
        if (current_user.user.currency) {
            console.log('-----------------------okokokoo')
            setDefaultValue(current_user.user.currency)
        }
    });

    return (
        <>
            <Container fluid>
                <label>Base Currency</label>
                <Dropdown placeholder='Base Currency' onChange={onBaseCurrencyChange} style={{ width: '100%', marginBottom: '10px' }} defaultValue={defaultValue} fluid selection options={base_currency} />
                <Divider />
                <Button color='red' onClick={(e) => onSaveCurrency(e)}>
                    <Icon name='save' /> Save
                </Button>
            </Container>
        </>

    )
}

export default Setting