import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button, Header, Image, Icon } from 'semantic-ui-react';
import { Dropdown } from './Dropdown';
import { getPocketsmithStatus, updatePocketsmithData, updatePocketsmithTransactions, fetchAllTransactions } from './Pocketsmith';
import { formatter_commas } from './utils';
import NewTable3 from "./NewTable3.js"

// const data = [
//     {
//         img: 'https://zos.alipayobjects.com/rmsportal/dKbkpPXKfvZzWCM.png',
//         title: 'Meet hotel',
//         des: '不是所有的兼职汪都需要风吹日晒',
//     },
//     {
//         img: 'https://zos.alipayobjects.com/rmsportal/XmwCzSeJiqpkuMB.png',
//         title: 'McDonald\'s invites you',
//         des: '不是所有的兼职汪都需要风吹日晒',
//     },
//     {
//         img: 'https://zos.alipayobjects.com/rmsportal/hfVtzEhPzTUewPm.png',
//         title: 'Eat the week',
//         des: '不是所有的兼职汪都需要风吹日晒',
//     },
// ];

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

const App = props => {
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState();
    const [status, setStatus] = useState();
    const [open, setOpen] = React.useState(false)
    const categories = useRef([]);
    const columns = useRef([]);
    const selectedrow = useRef();

    useEffect(() => {
        if (props.data.length) {
            setFilteredData(props.data);
            if (props.data.length > 0) {
                let list = {}
                for (let row of props.data) {
                    list[row["category.title"]] = 1;
                }
                categories.current = Object.keys(list);
                columns.current = Object.keys(props.data[0]);
            }
        }
    }, [props.data]);

    useEffect(() => {
        if (!props.minimal) {
            getStatus();
        }
    }, []);

    const getStatus = async () => {
        let resp = await getPocketsmithStatus();
        setStatus(resp);
        console.log(resp);
        return resp;
    }

    const handleInput = useCallback((e) => {
        console.log("setting" + e.target.value);
        setSearchQuery(e.target.value);
    });

    const onClick = (e, rowData) => {
        console.log(e);
        console.log(rowData);
        selectedrow.current = rowData;
        setOpen(true);
    }

    const headerComponents = (
        <span className={"header span"}>
            <span style={{ marginRight: 5, fontSize: 12 }}>
                {status ? (status.loading ? ("Loading..." + status.t) : status.updating ? "Updating..." : "Last update: " + new Date(status.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })) : ""}
            </span>
            <span>
                <Button icon labelPosition='right'
                    onClick={async () => {
                        await updatePocketsmithTransactions();
                        const checkStatus = async (t = 0) => {
                            let result = await getStatus();
                            result = { ...result, t: t };
                            setStatus(result);
                            if (result?.loading) {
                                setTimeout(checkStatus, 1000, t + 1);
                                console.log(result);
                                console.log("checking")
                            } else {
                                console.log("loading 1");
                                result = { ...result, updating: 1 };
                                setStatus(result);
                                fetchAllTransactions().then(e => {
                                    result.updating = 0;
                                    setStatus(result);
                                    let data = e.map((element) => JSON.flatten(element));
                                    setFilteredData(data);
                                    console.log("updated")
                                }).catch((err) => console.log(err));
                            }
                        }
                        checkStatus();
                    }}
                    size='mini'
                    loading={status ? status.loading : false}
                    style={{ height: 20, padding: 0 }}
                ><Icon name='cloud download' />Update
                </Button>
            </span>
        </span>)

    const renderHeader = (sortDir, setSortDir, filteredData) => {
        return () =>
            // <span>{/* header */}</span>
            <div
                style={{
                    zIndex: 3,
                    backgroundColor: '#FFF',
                    // color: 'white',
                    fontSize: 12,
                    fontWeight: "bold",
                    margin: "0 0 5px 0",
                    display: "flex",
                    justifyContent: "space-between"
                    // padding:"0px 0px 0px 0px"
                }}
                onClick={() => setSortDir(!sortDir)}>
                <span>Sort by Date <Icon name={'arrow ' + (sortDir ? 'down' : 'up')} /></span>
                {!props.minimal?<span style={{ textAlign: "right" }}>
                    Transactions: {formatter_commas(filteredData.length)} | Income: {
                        formatter_commas(sumif(filteredData, e => {
                            if (e['amount_in_base_currency'] >= 0 && e['is_transfer'] != true) {
                                return e['amount_in_base_currency']
                            }
                            return 0;
                        }).toFixed(0))} | Expense: {formatter_commas(sumif(filteredData, e => {
                            if (e['amount_in_base_currency'] < 0 && e['is_transfer'] != true) {
                                return e['amount_in_base_currency']
                            }
                            return 0;
                        }).toFixed(0))}
                </span>:""}
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
                        <Header style={{ margin: "8px 0" }}>{selectedrow.current?.date}</Header>

                        <div style={{ color: '#888', fontSize: 14, margin: "8px 0" }}>{selectedrow.current?.["transaction_account.name"]}</div>

                        <div style={{ margin: "8px 0", width: "100%", position: "relative", fontSize: 18, fontWeight: "bold" }}><div style={{ width: "70%" }}>{selectedrow.current?.payee}</div>

                            <span style={{ "float": "right", position: "absolute", top: 0, right: 5 }}>{Number(selectedrow?.current?.["amount_in_base_currency"]).toLocaleString(undefined, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 })}</span>

                        </div>

                        <span style={{ marginRight: 20 }}>
                            <Dropdown
                                value={selectedrow.current?.["category.title"]}
                                row={selectedrow.current}
                                updateValue={(value) => updateValue(selectedrow.current, value, "category.title")}
                                dropdown_list={categories.current}
                                update={async (value, row) => {
                                    return await updatePocketsmithData(selectedrow.current?.id, "category.title", value);
                                }} />
                        </span>

                        <span style={{ position: "relative", top: -3 }}>
                            <Dropdown
                                component='checkbox'
                                value={selectedrow.current?.["is_transfer"]}
                                row={selectedrow.current}
                                updateValue={(value) => updateValue(selectedrow.current, value, "is_transfer")}
                                dropdown_list={[true, false]}
                                label="Transfer"
                                update={async (value, row) => {
                                    return await updatePocketsmithData(selectedrow.current?.id, "is_transfer", value);
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
                    // color: 'white',
                    fontSize: 12,
                    fontWeight: "bold",
                    // margin:"0 0 5px 0",
                    // padding:"0px 0px 0px 0px"
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
                >{obj["transaction_account.name"].toUpperCase()}</div>
                <div style={{ display: '-webkit-box', display: 'flex', padding: '3px 0' }}>
                    <div style={{ lineHeight: 1, width: "100%" }}>
                        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{obj.payee}</div>
                        <div><div className='colored-circle' /><span style={{ fontSize: '12px', color: '#FF6E27' }}>{obj["category.title"]}</span><span style={{ fontSize: '12px', float: "right", color: obj["amount_in_base_currency"] > 0 ? 'green' : 'red' }}>{Number(obj["amount_in_base_currency"]).toLocaleString(undefined, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 })}</span></div>
                    </div>
                </div>
            </div>
        );
    };

    return (<NewTable3
        genData={genData}
        data={filteredData}
        search={!props.minimal?true:false}
        sort={(a, b) => new Date(b["date"]).getTime() - new Date(a["date"]).getTime()}
        col_amount={"amount_in_base_currency"}
        find={row => e => e.id == row.id}
        headerComponents={!props.minimal?headerComponents:""}
        renderHeader={renderHeader}
        renderSectionHeader={renderSectionHeader}
        rowRender={row}
        modal={modal}
    />)
}

export default App;

var thisyear = new Date().getFullYear();

function formatDate(date) {
    if (typeof date == 'string') {
        date = new Date(date);
    }
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return monthNames[monthIndex] + ' ' + day + (year != thisyear ? ', ' + ''.concat(year) : "");
}

function sumif(data, cb) {
    let result = 0;
    for (let i = 0; i < data.length; i++) {
        result += cb(data[i]);
    }
    return result;
}