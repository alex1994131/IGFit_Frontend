import React, { useState, useEffect } from 'react';
import MUIDataTable, { debounceSearchRender } from "mui-datatables";
import * as AntChart from '@ant-design/charts';
import { txdata2 } from "./txdata.js";

import { makeStyles } from "@material-ui/core/styles";
import * as Pocketsmith from "./Pocketsmith.js"

const useStyles = makeStyles((theme) => ({
    alignrightHeader: {
        "& span": {
            display: "flex",
            justifyContent: "flex-end",
        }
    }
}));

async function getTotal() {
    var url = "https://api.pocketsmith.com/v2/users/162199/transactions";
    var options = { headers: { "x-developer-key": "981081937f8f6098257c0e2619de68639a87852eb8f51d5db1e8dd00a3c24e3e342ee7902c2a0f0dff518de06c4c6ab3e10a62ec5bc761a1643cc027952da3f0", "Accept": "application/json", 'Content-Type': 'application/json;charset=UTF-8' } };
    //var response = await fetch(url, options);
    //var tx = await response.json();
    var tx = txdata2;
    var tx = await Pocketsmith.fetchAllTransactions();
    var data = [];
    tx.forEach(txdata => {
        var point = { x: new Date(txdata["date"]), y: txdata["amount"] };
        data.push(point);
    });

    const res = reducearray(tx, (txdata) => new Date(txdata["date"]).getTime(), (txdata) => txdata["amount"], (acc, value) => acc + value);

    var tx_flatten = tx.map((element) => JSON.flatten(element));

    //return res.map((element) => { return { x: new Date(element.key), y: (element.value.total) } });
    return tx_flatten;
}

function reducearray(tx, getkey, getvalue, sumvalue) {
    //var tx_new = tx.map((txdata) => { return { date: new Date(txdata["date"]).getTime(), data: { value: txdata["amount"], data: [txdata] } } });
    var tx_new = tx.map((txdata) => { return { key: getkey(txdata), value: { total: getvalue(txdata), data: [txdata] } } });

    const res = Array.from(tx_new.reduce(
        (m, { key, value }) => {

            //console.log(m.get(key) ? m.get(key).total : 0);
            return m.set(key, { total: sumvalue((m.get(key)?.total || 0), value.total), data: m.get(key) ? [...m.get(key).data, value.data[0]] : value.data })
        }, new Map
    ), ([key, value]) => ({ key, value }));
    return res;
}

JSON.flatten = function (data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

const App = () => {
    // Generating some dummy data

    const [data, setData] = useState([{ x: 0, y: 0 }]);
    const [fetch, setFetch] = useState(0);
    const [searchdata, setSearchData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                const data = await getTotal();
                setData(data);
                setFetch(1);
            }
        };

        fetchData();
    });

    //const columns = ["Name", "Company", "City", "State"];

    var options = {
        filterType: 'checkbox',
        resizableColumns: true,
        searchOpen: true,
        response: 'standard',
        print: false,
        draggableColumns: { enabled: true },
        selectableRows: 'multiple',
        selectableRowsHideCheckboxes: true,
        selectableRowsOnClick: true,
        rowsPerPage: 100,
        selectToolbarPlacement: 'above',
        customSearchRender: debounceSearchRender(500),
        onTableInit: (action, tableState) => {
            console.log('ontableinit action ' + action);
            var search_data = tableState.displayData.map((element) => {
                return {
                    x: new Date(data[element.dataIndex].date),
                    y: data[element.dataIndex].amount_in_base_currency
                }
            });
            const res = reducearray(search_data, (txdata) => txdata.x.getTime(), (txdata) => txdata.y, (acc, value) => acc + value);
            const tabledata = res.map((element) => { return { x: element.key, y: (element.value.total) } });
            setSearchData(tabledata);

        },
        onTableChange: (action, tableState) => {
            console.log('ontablechange action ' + action)
            if (action == 'search' || action == 'filterChange' || action == 'resetFilters') {
                console.log(action);
                var search_data = tableState.displayData.map((element) => {
                    return {
                        x: new Date(data[element.dataIndex].date),
                        y: data[element.dataIndex].amount_in_base_currency
                    }
                });
                const res = reducearray(search_data, (txdata) => txdata.x.getTime(), (txdata) => txdata.y, (acc, value) => acc + value);
                const tabledata = res.map((element) => { return { x: element.key, y: (element.value.total) } });
                setSearchData(tabledata);
            }
        }
    };

    const classes = useStyles();

    if (fetch) {
        const columns = Object.keys(data[0]).map((element) => { return { name: element, options: { display: false } } });
        var columnorder = [];
        const show = ["date", "payee", "category.title", "amount_in_base_currency", "closing_balance", "is_transfer", "transaction_account.name", "transaction_account.currency_code"];
        show.forEach((element) => { columnorder.push(Object.keys(data[0]).indexOf(element)) });
        columns.forEach((element) => {
            if (show.indexOf(element.name) > -1) {
                element.options.display = true;
            }
            //if (element.name == "date")
            //    columnorder = [columns.indexOf(element), ...columnorder];
            else
                columnorder.push(columns.indexOf(element));

            //if (element.name == "amount")
            if (typeof (data[0][element.name]) === 'number') {
                element.options.customBodyRenderLite = (dataIndex, rowIndex) => data[dataIndex][element.name].toLocaleString('en-US', { minimumFractionDigits: 2 });
                element.options.setCellProps = value => ({ style: { textAlign: 'right' } });
                element.options.setCellHeaderProps = value => ({ className: classes.alignrightHeader });
            }

            if (typeof (data[0][element.name]) === 'boolean')
                element.options.customBodyRenderLite = (dataIndex, rowIndex) => data[dataIndex][element.name] ? "true" : "false";
        });

        options.columnOrder = columnorder;

        var config = {
            data: searchdata,
            xField: 'x',
            yField: 'y',
            label: {
                position: 'center',
                style: {
                    fill: '#000000',
                    opacity: 1.0,
                },
                //offset: -10,
                formatter: ({ y }) => `${(y).toFixed(1)}`
            },
            xAxis: {
                type: "timeCat"
            },
            tooltip: {
                fields: ['y'],
                formatter: (datum) => { return { name: config.yField, value: datum.y.toFixed(1) } }
            }
        };

        var resp;
        if (searchdata.length > 0) {
            resp =
                <>
                    <AntChart.Column
                        {...config}
                    />
                    <MUIDataTable
                        title={"Employee List"}
                        data={data}
                        columns={columns}
                        options={options}
                    />


                </>
                ;
        } else {
            resp =
                <>
                    <MUIDataTable
                        title={"Employee List"}
                        data={data}
                        columns={columns}
                        options={options}
                    />

                </>
        }

        return resp;
    }
    else
        return <>Loading...</>;
};

export default App;