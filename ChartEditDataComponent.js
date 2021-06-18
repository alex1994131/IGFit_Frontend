import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import { findmatchintable } from './filtermatches.js';

const App = (props) => {
    //const searchQuery = props.searchQuery ? props.searchQuery : "acc:amount";
    const [filteredData, setFilteredData] = useState();
    const [saved_query, setSavedQuery] = useState();
    const [rowsMatched, setRowsMatched] = useState();
    const [calcCharts, setCharts] = useState();
    const [searchQuery, setSearchQuery] = useState("");
    const [editButton, setEditButton] = useState(props.edit?props.edit:1);

    var handleRadioChange = useCallback((e) => {
        if (e.target.value === "Edit") {
            setEditButton(1);
            //setFilteredData(props.data);
            console.log("setting transfers");
        } else {
            setEditButton(0);
            // if (props.data.length > 0) {
            //     setFilteredData(props.data.filter(
            //         element => { return ((element.is_transfer == false) || (!element.is_transfer)) }
            //     ))
            // }
            console.log("setting no transfers");
        }

    }, [props.data]);

    var handleInput = useCallback((e) => {
        console.log("setting"+e.target.value);
        setSearchQuery(e.target.value);
        if(!e.target.value){
            setCharts([]);
        }
    });

    useEffect(() => {
        setSearchQuery(props.searchQuery);
    },[props.searchQuery]);

    useEffect(() => {
        if (props.data?.length > 0 && searchQuery) {
            setFilteredData(props.data);
            let columns = Object.keys(props.data[0]).map((element) => { return { name: element, display: "true" } });
            // let rows_matched;
            // let query;
            let { rows_matched, query } = findmatchintable(searchQuery, props.data, columns, "amount_in_base_currency", 0);
            console.log("rows matched" + rows_matched?.length);
            console.log(JSON.stringify(query));
            setSavedQuery(query);
            setRowsMatched(rows_matched);
            console.log("setting data2");
        }
    }, [props.data, searchQuery]);

    useEffect(() => {
        let acc_result = saved_query?.acc_result;
        console.log("calc new chart");
        if (acc_result) {
            console.log("in acc_result");
            let charts = [];
            if (!props.customRender) {
                for (let acc of acc_result) {
                    const type = acc.type;
                    if (type == "total") {
                        let result = acc.result;
                        // let total_data = Object.keys(result).map(e=>{
                        //     return <>{e}:{result[e].toFixed(2)}<br/></>
                        // });
                        let chart_data = Object.keys(result).map(e => {
                            return { x: e, y: Math.abs(result[e]) }
                        });
                        chart_data.sort((a, b) => b.y - a.y);
                        //let chart = <div key={"NewChartAccResult"+i}>{total_data}</div>
                        let chart = <Newchartmemo key={"NewChartAccResult" + acc.name + acc.type} data={chart_data} type="pie" height={props.height} {...props.chartProps} />
                        charts.push(chart);
                    } else {
                        let result = acc.result;
                        let chart_data = [];
                        let categories_total = {};
                        let date_total = {}
                        // console.log(JSON.stringify(result));
                        let dates = Object.keys(result).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                        if (acc.periods_to_show != 0) {
                            dates = dates.slice(-acc.periods_to_show);
                        }
                        for (let date_key of dates) {
                            let obj = result[date_key];
                            let sum = 0;
                            for (let [key, value] of Object.entries(obj)) {
                                //let data = { x: i2, y: value*acc.multiply_sign, category: key };
                                //chart_data.push(data);
                                categories_total[key] = (categories_total[key] || 0) + value * acc.multiply_sign;
                                sum = sum + value * acc.multiply_sign;
                            }
                            date_total[date_key] = sum;
                        }
                        let group = 1;
                        let num_to_show = 10;
                        let category_arr;
                        if (group && dates.length > 0) {
                            if (group == 1) {
                                category_arr = Object.entries(categories_total).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, num_to_show);
                            } else if (group == 2) {
                                category_arr = Object.entries(result[dates[dates.length - 1]]).sort((a, b) => (Math.abs(b?.[1]) - Math.abs(a?.[1]))).slice(0, num_to_show);
                            }
                        }
                        let chart_data_other = []
                        for (let date_key of dates) {
                            let obj = result[date_key];
                            let other = 0;
                            for (let [key, value] of Object.entries(obj)) {
                                let data = { x: date_key, y: value * acc.multiply_sign, category: key, x_total: date_total, category_total: categories_total };
                                if (!group) {
                                    chart_data.push(data);
                                } else {
                                    if (category_arr?.find(e => e[0] == key)) {
                                        chart_data.push(data);
                                    } else {
                                        other += data.y;
                                    }
                                }
                                //categories_total[key] = (categories_total[key] || 0) + value*acc.multiply_sign;
                            }
                            if (group && other) {
                                chart_data_other.push({ x: date_key, y: other, category: "Other", x_total: date_total })
                            }
                        }
                        if (dates.length > 0) {
                            if (group != 2) {
                                chart_data.sort((a, b) => (Math.abs(categories_total[a.category]) - Math.abs(categories_total[b.category])));
                            } else if (group == 2) {
                                chart_data.sort((a, b) => (Math.abs(result[dates[dates.length - 1]][a.category]) - Math.abs(result[dates[dates.length - 1]][b.category])));
                            }
                            chart_data = chart_data_other.concat(chart_data);

                            var annotations;
                            if(props.getAnnotation) {
                                annotations = props.getAnnotation(dates, acc, chart_data);
                            }
                            let chart = <Newchartmemo key={"NewChartAccResult" + acc.name + acc.type} data={chart_data} type="column" isStack legend={{position: "right"}} height={props.height} annotations={annotations} {...props.chartProps} />
                            charts.push(chart);
                        }
                    }
                }
            } else {
                let data = props.customRender(acc_result);
                console.log("customrender height"+props.height+typeof props.height)
                charts = data.map(e=><Newchartmemo key={"NewChartAccResultCustom"} data={e.data} {...e.chartProps} height={props.height}/>);
            }
            // console.log(JSON.stringify(charts));
            setCharts(charts);
        }
    }, [saved_query, props.height]);


    // if (calcCharts?.length > 0) {
        console.log("new chart");
        var resp = (
            <div>
                <div>{typeof props.title == 'object'? props.title:<h4 style={{ fontWeight: 'normal', margin:"10px 0 5px 0", textAlign:"left", textOverflow:"ellipsis", whiteSpace:"nowrap", overflow:"auto" }}>{("title" in props) && props.title}</h4>}</div>
                <div style={{ display: props.hidden? "none":"block" }}>
                <input
                    type='radio'
                    name={'Transfer2'+props.id??""}
                    value="Edit"
                    defaultChecked={true}
                    onChange={handleRadioChange}
                /> Edit
            <input
                    type='radio'
                    name={'Transfer2'+props.id??""}
                    value="No Edit"
                    onChange={handleRadioChange}
                    style={{ marginLeft: 10 }}
                /> No Edit
                <input
                    type='text'
                    name='Search'
                    value={searchQuery}
                    onChange={handleInput}
                    style={{ marginLeft: 10, display: editButton? "inline":"none" }}
                />
            </div>
                <div style={{ margin: "0 0 10px 0" }}>
                    {/* {calcCharts?.length > 0 ? calcCharts : "Loading..."} */}
                    {props.data?.length > 0 ? calcCharts: "Loading..."}
                </div>
            </div>)
        return resp
    // }
    // else
    //     return <>Loading...</>;
};

export default App;

const Newchartmemo = React.memo(NewChart);