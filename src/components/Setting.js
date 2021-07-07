import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useStyles } from 'react-styles-hook'
import { useHistory } from "react-router";

import { Container, Button, Icon, Table, Header, Modal, Input, Message, Dropdown, Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import Pagination from './Pagination'

import { getSession } from '../stores/actions/userAction';
import { addTransaction, deleteTransaction, getTicker } from '../stores/actions/transactionAction';

const styles = useStyles({
    fluidInput: {
        width: '100%',
        marginBottom: '10px'
    }
})

const Setting = (props) => {

    const history = useHistory();

    // const [transaction, setTransaction] = useState([]);
    // const [dataLoaded, setDataLoaded] = useState(props.dataLoaded);
    // const [portfolio, setPortfolio] = useState(props.portfolio);

    useEffect(() => {

    });

    return (
        <>
            <Container fluid>
                Settings
            </Container>
        </>

    )
}

export default Setting