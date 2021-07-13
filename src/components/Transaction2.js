import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button, Header, Image, Icon } from 'semantic-ui-react';
import { Dropdown } from './basic/Dropdown';
import NewTable3 from "./table/NewTable3.js"

import { formatter_commas } from '../helpers/utils';
import { getPocketsmithStatus, updatePocketsmithData, updatePocketsmithTransactions, fetchAllTransactions } from '../helpers/Pocketsmith';

function genData(listData, tx, pIndex = 0) {
    const NUM_SECTIONS = 25;
    let number_of_dates = -1;
    let i = listData.current.txIndex;
    let ii;
    let current_date;
    let prev_date;

    while (number_of_dates < NUM_SECTIONS) {
        if (i >= tx.length) {
            break;
        }

        current_date = tx[i].date;
        if (current_date != prev_date) {
            number_of_dates++;
            if (number_of_dates >= NUM_SECTIONS) {
                break;
            }
            const sectionName = current_date;
            listData.current.sectionIDs.push(sectionName);
            prev_date = current_date;
            listData.current.dataBlobs[sectionName] = [];
            ii = number_of_dates + (NUM_SECTIONS * pIndex);
            listData.current.rowIDs[ii] = [];
        }

        listData.current.rowIDs[ii].push(tx[i].id);
        listData.current.dataBlobs[tx[i].id] = tx[i];
        listData.current.dataBlobs[current_date].push(tx[i]);
        i++;
    }

    listData.current.txIndex = i;

    listData.current.sectionIDs = [...listData.current.sectionIDs];
    listData.current.rowIDs = [...listData.current.rowIDs];
}

var thisyear = new Date().getFullYear();

function formatDate(date) {
    if (typeof date == 'string') {
        date = new Date(date);
    }

    return date.toDateString().split(' ').slice(1).join(' ');
}

function sumif(data, cb) {
    let result = 0;
    for (let i = 0; i < data.length; i++) {
        result += cb(data[i]);
    }
    return result;
}

const App = props => {
    const [transaction, setTransaction] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(props.dataLoaded);
    const [portfolio, setPortfolio] = useState({
        _id: '',
        name: 'UNKNOWN',
    });
    
    const [open, setOpen] = React.useState(false)
    const categories = useRef([]);
    const columns = useRef([]);
    const selectedrow = useRef();

    const onClick = (e, rowData) => {
        selectedrow.current = rowData;
        setOpen(true);
    }
    
    useEffect(() => {
        setDataLoaded(props.dataLoaded)
        if (props.transactions.length) {
            var data = props.transactions.map((element, idx) => { 
                element.id = idx
                return JSON.flatten(element)
            });

            setTransaction(data);
            if (data.length > 0) {
                let list = {}
                for (let row of data) {
                    list[row["currency"]] = 1;
                }
                categories.current = Object.keys(list);
                columns.current = Object.keys(data[0]);
            }
        }
    }, [props.dataLoaded, props.transactions]);

    useEffect(() => {
        if(props.portfolio) {
            setPortfolio(props.portfolio)
        }
    }, [props.portfolio]);

    const headerComponents = () => {}

    const renderHeader = (sortDir, setSortDir, filteredData) => {
        return () =>
            <div
                style={{
                    zIndex: 3,
                    backgroundColor: '#FFF',
                    fontSize: 12,
                    fontWeight: "bold",
                    margin: "0 0 5px 0",
                    display: "flex",
                    justifyContent: "space-between"
                }}
                onClick={() => setSortDir(!sortDir)}>
                <span>Sort by Date <Icon name={'arrow ' + (sortDir ? 'down' : 'up')} /></span>

                {<span style={{ textAlign: "right" }}>
                    Transactions: {formatter_commas(filteredData.length)}
                </span>}
            </div>
    }

    const modal = (updateValue) => {
        return (
            <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}>
                <Modal.Header>Edit Transaction</Modal.Header>
                <Modal.Content image>
                    <Image size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' wrapped />
                    <Modal.Description style={{ width: "100%" }}>
                        <Header style={{ margin: "8px 0" }}>
                            { 
                                selectedrow.current && (new Date(selectedrow.current.date).toDateString().split(' ').slice(1).join(' '))
                            }
                        </Header>

                        {/* <div style={{ color: '#888', fontSize: 14, margin: "8px 0" }}>
                        {
                            portfolio && (
                                portfolio.name.toUpperCase()
                            )
                        }
                        </div> */}

                        <div style={{ margin: "8px 0", width: "100%", position: "relative", fontSize: 18, fontWeight: "bold" }}>
                            <div style={{ width: "70%" }}>
                                { selectedrow.current?.name } - 
                                { selectedrow.current?.direction }
                                { selectedrow.current?.quantity } @
                                { selectedrow.current?.price }
                            </div>

                            <span style={{ "float": "right", position: "absolute", top: 0, right: 5 }}>{Number(selectedrow?.current?.["price"]).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>

                        </div>

                        <span style={{ marginRight: 20 }}>
                            <Dropdown
                                value={selectedrow.current?.["currency"]}
                                row={selectedrow.current}
                                updateValue={(value) => updateValue(selectedrow.current, value, "currency")}
                                dropdown_list={categories.current}
                                update={async (value, row) => {
                                    return await updatePocketsmithData(selectedrow.current?.id, "currency", value);
                                }} />
                        </span>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        content="OK"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => setOpen(false)}
                        positive
                    />
                </Modal.Actions></Modal>)
    }

    const renderSectionHeader = sectionData => {
        return ({
            style,
        }) => (
            <div
                className="sticky"
                style={{
                    ...style,
                    zIndex: 3,
                    backgroundColor: '#EEE',
                    fontSize: 12,
                    fontWeight: "bold"
                }}
            >{formatDate(sectionData[0].date)}</div>
        )
    }

    const row = (rowData, sectionID, rowID) => {
        const obj = rowData
        return (
            <div key={rowID} style={{ padding: '0 0 5px 0' }} onClick={e => onClick(e, rowData)}>
                <div
                    style={{
                        color: '#888',
                        fontSize: 10,
                    }}
                >
                    {
                        portfolio && (
                            portfolio.name.toUpperCase()
                        )
                    }
                </div>
                <div style={{ display: '-webkit-box', display: 'flex', padding: '3px 0' }}>
                    <div style={{ lineHeight: 1, width: "100%" }}>
                        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{obj.name} - {obj.direction} {obj.quantity} @ {obj.price}</div>
                        <div>
                            <div className='colored-circle' />
                            <span style={{ fontSize: '12px', color: '#FF6E27' }}>{obj.currency}</span>
                            <span style={{ fontSize: '12px', float: "right", color: 'red' }}>
                                {Number(obj.total).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <NewTable3
            genData={genData}
            data={transaction}
            search={true}
            sort={(a, b) => new Date(b["date"]).getTime() - new Date(a["date"]).getTime()}
            col_amount={"amount_in_base_currency"}
            find={row => e => e.id == row.id}
            headerComponents={!props.minimal ? headerComponents : ""}
            renderHeader={renderHeader}
            renderSectionHeader={renderSectionHeader}
            rowRender={row}
            modal={modal}
        />
    )
}

export default App;