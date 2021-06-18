import React, { useState, useEffect } from 'react';
import MUIDataTable, { debounceSearchRender } from "mui-datatables";
import * as AntChart from '@ant-design/charts';
import { txdata2 } from "./txdata.js";

import { makeStyles } from "@material-ui/core/styles";
import * as Pocketsmith from "./Pocketsmith.js"

import * as IG from "./IGClient.js";
import { csvdata } from "./csvdata.js";
import { IGAccount, findticker, tickers, getallprices } from "./IGAccount.js";

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

    const [data, setData] = useState([]);
    const [fetch, setFetch] = useState(0);
    const [searchdata, setSearchData] = useState([]);
    const [acc, setAcc] = useState({});
    const [prices2, setPrices2] = useState(0);
    const [calc, setCalc] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                // const data = await getTotal();
                //var csvdata2 = csvdata;
                IG.downloadactivity().then((igdata)=>{
                var csvdata2 = igdata;
                var acc2 = new IGAccount(csvdata2.ISA.trades,"ISA",setData, setCalc);
                setAcc(acc2);
                });
                // setData(acc2.positionAsOfDate(new Date("2020-01-01")));
                //setData(acc2.positionsBetweenDate());
                setFetch(1);
                
                
            }
        };

        fetchData();
    });

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
                    x: data[element.dataIndex].date,
                    y: data[element.dataIndex].overall_unrealized_cost_base_ccy
                }
            });
            const res = reducearray(search_data, (txdata) => txdata.x, (txdata) => txdata.y, (acc, value) => acc + value);
            const tabledata = res.map((element) => { return { x: element.key, y: -(element.value.total), category: "base_cost" } });
            setSearchData(tabledata);

        },
        onTableChange: (action, tableState) => {
            console.log('ontablechange action ' + action)
            if (action == 'search' || action == 'filterChange' || action == 'resetFilters') {
                console.log(action);
                var search_data = tableState.displayData.map((element) => {
                    return {
                        x: data[element.dataIndex].date,
                        y: data[element.dataIndex].overall_unrealized_cost_base_ccy
                    }
                });
                const res = reducearray(search_data, (txdata) => txdata.x, (txdata) => txdata.y, (acc, value) => acc + value);
                const tabledata = res.map((element) => { return { x: element.key, y: -(element.value.total), category: "base_cost" } });
                setSearchData(tabledata);
            }
        }
    };

    const classes = useStyles();

    if (fetch && data.length>0) {
        const columns = Object.keys(data[0]).map((element) => { return { name: element, options: { display: false } } });
        var columnorder = [];
        const show = ["date","overall_unrealized_cost_base_ccy"];
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
            data: searchdata.concat(calc),
            xField: 'x',
            yField: 'y',
            seriesField: "category",
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
                    <AntChart.Line
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