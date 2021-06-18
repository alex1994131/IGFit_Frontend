import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import { findmatchintable } from './filtermatches.js';
import { Grid } from 'semantic-ui-react';
import { shorten, formatter_commas, debounce, formatDate } from './utils';
import NewTable from './NewTable.js';
import TablePx4 from "./TablePx4.js"

const App = (props) => {
    //const searchQuery = props.searchQuery ? props.searchQuery : "acc:amount";
    const [filteredData, setFilteredData] = useState();
    const [saved_query, setSavedQuery] = useState();
    const [rowsMatched, setRowsMatched] = useState();
    const [calcCharts, setCharts] = useState();
    const [searchQuery, setSearchQuery] = useState();
    const [searchText, setSearchText] = useState("");
    const [editButton, setEditButton] = useState(props.edit ? props.edit : 1);
    const [scaleButton, setScaleButton] = useState(1);
    const debouncedSetSearchQuery = useCallback(debounce(setSearchQuery,250));

    const [categoryData, setCategoryData] = useState();
    const [cols, setCols] = useState();
    const showTable=useRef(0);
    const [,setShow] = useState();
    const [selectedResult, setSelected] = useState();
    const [titles,setTitles] = useState();

    var handleRadioChange = useCallback((e) => {
        if (e.target.value === "Edit") {
            setEditButton(1);
        } else if (e.target.value === "No Edit") {
            setEditButton(0);
        }

        if(e.target.value === "Scale") {
            setScaleButton(1);
        } else if (e.target.value === "No Scale") {
            setScaleButton(0);
        }
    }, [props.data]);

    var handleInput = useCallback((e) => {
        setSearchText(e.target.value);
        debouncedSetSearchQuery(e.target.value);
        if (!e.target.value) {
            setCharts([]);
        }
    });
    
    useEffect(() => {
        setSearchText(props.searchQuery);
        setSearchQuery(props.searchQuery);
    }, [props.searchQuery]);

    useEffect(() => {
        if (props.data?.length > 0 && searchQuery) {
            setFilteredData(props.data);
            let columns = Object.keys(props.data[0]).map((element) => { return { name: element, display: "true" } });
            let { rows_matched, query } = findmatchintable(searchQuery, props.data, columns, "amount_in_base_currency", 0);
            setSavedQuery(query);
            setRowsMatched(rows_matched);

            setCols({show: ["date", "payee", "amount_in_base_currency"]});
        }
    }, [props.data, searchQuery]);

    useEffect(() => {
        let acc_result = saved_query?.acc_result;
        console.log("calc new chart2");
        if (acc_result) {
            console.log("in acc_result");
            let charts = [];
            let chart_data = [];
            let categories_total = {};
            let min_date = null;
            let max_date = null;
            let chart_titles = [];

            for (let acc of acc_result) {
                let result = acc.result;
                // console.log(JSON.stringify(result));
                let dates = Object.keys(result).sort((a,b)=>new Date(a).getTime()-new Date(b).getTime());
                if(acc.periods_to_show!=0) {
                    dates = dates.slice(-acc.periods_to_show);
                }
                min_date=new Date(dates[0]).getTime();
                max_date=new Date(dates[dates.length-1]);
                for (let date_key of dates) {
                    let obj = result[date_key];
                    for (let [key, value] of Object.entries(obj)) {
                        let data = { x: date_key, y: value*acc.multiply_sign, category: key, rows: acc.result_rows[date_key][key] };
                        chart_data.push(data);
                        categories_total[key] = (categories_total[key] || 0) + value*acc.multiply_sign;
                    }

                    // let compare_date = new Date(date_key).getTime();
                    // if (!min_date) {
                    //     min_date = compare_date;
                    // } else {
                    //     if (compare_date < min_date) {
                    //         min_date = compare_date
                    //     }
                    // }
                }
            }

            
            const category_limit = 500;
            let category_arr = Object.entries(categories_total).filter(e=>Math.abs(e[1])>category_limit).sort((a,b)=>b[1]-a[1]);

            let data = props.data;

            const bindevent = categorySelectFn();

            function categorySelectFn() {
                var selectedCategory,selectedDate;
                return (event) => {
                    console.log(event);
                    console.log(event.data.data); //x, y, rows
                    console.log(showTable.current);
                    setSelected(event.data.data);

                    // console.log("selectedcategory is "+selectedCategory);
                    // console.log("selecteddata is"+selectedDate);
            
                    if(event.data.data.x==selectedDate && event.data.data.category==selectedCategory && showTable.current) {
                        showTable.current = 0;
                        setShow(0);
                        setCategoryData(event.data.data.rows);
                    } else {
                        // console.log("setting selecteddate"+event.data.data.x);
                        // console.log("setting selected category"+event.data.data.category);
                        selectedDate = event.data.data.x;
                        selectedCategory = event.data.data.category;
                        showTable.current = 1;
                        setShow(1);
                        setCategoryData(event.data.data.rows);
                    }
                }
            }

            for (let [category,value] of category_arr) {
                let category_data;
                category_data = chart_data.filter(e => e.category == category);
                let end_date = new Date(max_date);
                end_date.setDate(1);
                end_date.setUTCHours(0,0,0,0);
                for(let i=min_date;i<=end_date.getTime();){
                    if(!category_data.find(e=>{
                        let compare_date = new Date(e.x).getTime();
                        return i==compare_date;
                    })) {
                        category_data.push({x: new Date(i).toISOString(), y: 0, category: category, rows: []});
                    }
                    let next_month = new Date(i);
                    next_month.setUTCMonth(next_month.getUTCMonth()+(acc_result[0].type=="m"?1:12));
                    next_month.setUTCHours(0,0,0,0);
                    i=next_month.getTime();
                }

                let category_name = data.find((e)=>{
                    return e["category.title"]?.toLowerCase()==category;
                });

                category_name = category_name ? category_name?.["category.title"] : category;

                let yAxis = scaleButton? { min: 0, max: acc_result[0].type=="m"?2000:20000, /* tickInterval: 200 */ } : { min: undefined, max: undefined, tickInterval: undefined } ;

                let chartProps = {
                    binding: [{ event: "element:click", cb: bindevent }, { event: "element:touchend", cb: bindevent }]
                };

                chart_titles.push({category: category, title:shorten(category_name,20)+": £"+formatter_commas(value.toFixed(0))+"", name:shorten(category_name,20)});

                let chart = <Grid.Column key={"NewChartPx1" + category}>{/*<div style={{ fontWeight: 'normal', fontSize:"14px", margin:"10px 0 1px 0", textAlign:"left", textOverflow:"ellipsis", whiteSpace:"nowrap", overflow:"auto" }}>{shorten(category_name,20)+": £"+formatter_commas(value.toFixed(0))+""}</div> */}<Newchartmemo data={category_data} type="column" height={120} yAxis={yAxis} legend={false} title={shorten(category_name,20)+": £"+formatter_commas(value.toFixed(0))+""} {...chartProps}/></Grid.Column>
                charts.push(chart);
            }
            setCharts(charts);
            setTitles(chart_titles);
        }
        // console.log(JSON.stringify(charts));
    }, [saved_query, scaleButton]);


    //if (calcCharts?.length > 0) {
        console.log("new chart3");
        var resp =
            //<div style={{overflow:"scroll"}}>
            <div /* style={{width:"90%", margin:"auto"}} */>
                <h3 style={{ margin:"0 0 5px 0"}}>Category Breakdown</h3>
                <div style={{ margin: "0 0 0 0"}}>
                    <input
                        type='radio'
                        name='Edit'
                        value="Edit"
                        defaultChecked={true}
                        onChange={handleRadioChange}
                    /> Edit
                <input
                        type='radio'
                        name='Edit'
                        value="No Edit"
                        onChange={handleRadioChange}
                        style={{ marginLeft: 10 }}
                    /> No Edit
                     <input
                        type='radio'
                        name='Scale'
                        value="Scale"
                        defaultChecked={true}
                        onChange={handleRadioChange}
                        style={{ marginLeft: 10 }}
                    /> Fixed Scale
                <input
                        type='radio'
                        name='Scale'
                        value="No Scale"
                        onChange={handleRadioChange}
                        style={{ marginLeft: 10, }}
                    /> <span style={{marginRight: 10}}>No Fixed Scale</span>
                <input
                        type='text'
                        name='Search'
                        value={searchText}
                        onChange={handleInput}
                        style={{ display: editButton ? "inline" : "none" }}
                    />
                </div>
                <Grid stackable columns={2} className="very compact">
                    <Grid.Row>
                        <Grid.Column width={10}>
                
                
                
                            <Grid stackable columns={3} className="very compact" style={{ overflow: "auto" }}>
                                {props.data?.length > 0 ? calcCharts : "Loading..."}
                            </Grid>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <h3 style={{ margin: "0 0 5px 0" }}>{!showTable.current?"Select a Category":titles.find(e => e.category == selectedResult.category).name + " ("+formatDate(new Date(selectedResult.x))+")"}</h3>
                            <div style={{ display: showTable.current ? "inline" : "none" }}>
                            {/* {categoryData ? <Newtablememo key="NewTableCategories2" 
                                data={categoryData}
                                cols={cols}
                                searchOpen={false}
                                responsive={"standard"}     
                            /> : ""} */}
                            {categoryData ? <TablePx4 key="NewTableCategories2" /* set_search_data={cb2} */
                                data={categoryData}
                                minimal
                            /> : ""}
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        return resp
    // }
    // else
    //     return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);
const Newtablememo = React.memo(NewTable);

