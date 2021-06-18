import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { findmatchintable } from './filtermatches.js';
import { Grid, Button } from 'semantic-ui-react';
import { shorten, formatter_commas, debounce, Responsive, useBreakpoints } from './utils';
import ChartEditDataComponent from './ChartEditDataComponent.js';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { dateStr, sumif } from "./utils"
import TablePx4 from "./TablePx4.js"

const App = (props) => {
    //const searchQuery = props.searchQuery ? props.searchQuery : "acc:amount";
    const [filteredData, setFilteredData] = useState();
    const [saved_elements, setSavedElements] = useState([]);
    const breakpoints = useBreakpoints();
    const [categoryData, setCategoryData] = useState();
    const [cols, setCols] = useState();
    const showTable=useRef(0);
    const [,setShow] = useState();
    const chartRef = useRef(0);
    const sumdata = useRef();
    //const [rowsMatched, setRowsMatched] = useState();
    //const [calcCharts, setCharts] = useState();
    //const [searchQuery, setSearchQuery] = useState();
    //const [searchText, setSearchText] = useState();
    //const [editButton, setEditButton] = useState(props.edit ? props.edit : 1);
    //const [scaleButton, setScaleButton] = useState(1);
    //const debouncedSetSearchQuery = useCallback(debounce(setSearchQuery,250));

    const [currentRange, setNewRange] = useState();
    const selectedCategory = useRef();
    
    const onChange = (event, data) => {
        if(data.value?.length>1 || !data.value) {
        showTable.current=0;
        sumdata.current=0;
        setCategoryData();
        setNewRange(data.value);
        }

        console.log("setting"+data.value);
        // console.log(data.value);
        // console.log(" AND (date>"+dateStr(data.value[0])+" AND date<"+dateStr(data.value[1])+")");
    }

    var handleInput = useCallback((e) => {
        // console.log(e);
        console.log("add element");
        let new_element = <Grid.Column key={"gridchartdata " + saved_elements.length}><ChartEditDataComponent id={"chartdata " + saved_elements.length} searchQuery="acc:category.title:m" data={props.data} style={{ margin: "50px 50px 50px 50px" }} title={<h4 style={{ margin: "0 0 5px 0" }}>{"Chart " + (saved_elements.length + 1)}</h4>} height={100} /></Grid.Column>
        let new_arr = saved_elements.concat(new_element);
        setSavedElements(new_arr);
    });

    var onClick = dir => {
        return useCallback(e => {
            setHighlightBy(getElements(chartRef),(e)=>{showTable.current=e;setShow(e);},selectedCategory,setCategoryData,dir);
            console.log(e);
        });
    }

    useEffect(() => {
        if (filteredData?.length == 0) {
            setFilteredData(props.data);
        }
        setCols({show: ["date", "payee", "amount_in_base_currency"]});
        console.log("on data px2");
    }, [props.data])

    const ytdcalc = {
        title: "YTD Analysis",
        searchQuery: "acc:amount:d category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”",
        customRender: SumToDate("y")
    }

    const mtdcalc = {
        title: "MTD Analysis",
        searchQuery: "acc:amount:d category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”",
        customRender: SumToDate("m")
    }

    const mthcalc = {
        title: "Monthly Analysis",
        searchQuery: "acc:amount:m category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”",
        customRender: MonthlyAnalysis()
    }

    const catcalc = {
        title: "Month Analysis",
        searchQuery: "acc:amount:d:8 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”" + (currentRange?" acc:category.title AND (date>"+dateStr(currentRange[0])+" AND date<"+dateStr(currentRange[1])+")":"acc:category.title:m:1"),
        customRender: MonthAnalysis(currentRange,setCategoryData,(e)=>{showTable.current=e;setShow(e);},showTable,chartRef,selectedCategory,sumdata)
    }

    //if (calcCharts?.length > 0) {
    console.log("new chart4");
    var resp = (
        <div /* style={{width:"90%", margin:"auto"}} */>
            <h3 style={{ margin: "0 0 5px 0" }}>Category Breakdown</h3>
            <div>
                <button onClick={handleInput} style={{ margin: "0 0 10px 0" }}>
                    Activate Lasers
                    </button>
            </div>
            <div>
            <Grid stackable relaxed columns={2} className="standard">
                <Grid.Row stretched>
                    <Grid.Column width={6}>
                    {NewElement(ytdcalc, props, Responsive(breakpoints, 125,200))}
                    {NewElement(mtdcalc, props, Responsive(breakpoints, 125,200))}
                    {Element("acc:amount:m category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”", "Monthly Expense", props, Responsive(breakpoints, 125,200), {legend: false})}
                    {NewElement(mthcalc, props, Responsive(breakpoints, 125,200))}
                    </Grid.Column>
                    <Grid.Column width={10}>
                    {Element("acc:category.title:-m:3 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”", "3 Months View", props, Responsive(breakpoints, 350,300), 
                    {
                        label: {
                            position: 'middle',
                            style: {
                                fill: 'black',
                            },
                            formatter: (...args) => {
                                if ((args[0].y / Math.max(...Object.values(args[0].x_total))) > 0.1)
                                    return `${formatter_commas((args[0].y).toFixed(0))}`
                            }
                        },
                    }, getColStackAnnotation)}
                    {NewElement(catcalc, props, Responsive(breakpoints, 350-38,350-38), <SemanticDatepicker onChange={onChange} type="range" />)}
                    <div className="prev-next" style={{textAlign:"center",display:"flex",justifyContent:"space-between"}}>
                    <Button icon='left chevron' className="prev-next-button left"  style={{paddingLeft:"5%"}}  onClick={onClick("prev")}/>
                    <span style={{alignSelf:"center",height:39}}>
                    {categoryData?.length ? <div style={{fontSize:13,fontWeight:"bold",marginBottom:1}}><div className='colored-circle' style={{height:7,width:7,marginRight:7}}/>
                            {categoryData?.length ? categoryData[0]["category.title"]+" "+"("+ (sumif(categoryData, e=>e["amount_in_base_currency"])/sumdata.current*100).toFixed(0)+"%"+")":""}</div> : ""}
                            <div style={{fontSize:18,fontWeight:"bold",color:categoryData?.length ? sumif(categoryData, e=>e["amount_in_base_currency"])>=0?"green":"darkorange":"darkorange"}}>
                            {categoryData?.length ? sumif(categoryData, e=>e["amount_in_base_currency"]).toLocaleString(undefined, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }) : ""}</div>
                    </span> 
                    <Button icon='right chevron' className="prev-next-button right"   style={{paddingRight:"5%"}}  onClick={onClick("next")}/>   
                    </div>
                    </Grid.Column>
                </Grid.Row>
                </Grid>
                </div>
                <div style={{display:showTable.current?"inline":"none"}}>
                {/* {(categoryData)?<Newtablememo key="NewTableCategories" 
                    data={categoryData}
                    cols={cols}
                    searchOpen={false}
                    responsive={"standard"}
                />:""} */}
                {(categoryData)?<TablePx4 key="NewTableCategories" /* set_search_data={cb2} */
                    data={categoryData}
                    minimal
                />:""}
                </div>
            <Grid columns={2} className="very compact" style={{ overflow: "auto" }}>
                {props.data?.length > 0 ? saved_elements : "Loading..."}
            </Grid>
        </div>)
    return resp
    // }
    // else
    //     return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);
const Newtablememo = React.memo(NewTable);

const SumToDate = (type = "y") => {
    return (acc_result) => {
        let resp = []
        for (let acc of acc_result) {
            let result = acc.result;
            let chart_data = [];
            let dates = Object.keys(result).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            let ytd = new Date();

            let prev = 0;
            let first_date = new Date(dates[0]);
            let dd = (new Date(first_date.getUTCFullYear(), first_date.getUTCMonth(), first_date.getUTCDate()) - new Date(new Date(dates[0]).getUTCFullYear(), 0, 1)) / 1000 / 60 / 60 / 24 + 1;

            for (let day = first_date; day.getTime() <= new Date(dates[dates.length - 1]).getTime();) {
                function dateStr(date) {
                    var d = new Date(date);
                    let str = [
                        d.getFullYear().toString().slice(0),
                        ('0' + (d.getMonth() + 1)).slice(-2),
                        ('0' + d.getDate()).slice(-2)
                    ].join('-');
                    return str;
                }
                let date_key = dateStr(day);
                if (day.getUTCDate() == 1 && day.getUTCMonth() == (type=="y"?0:ytd.getUTCMonth())) {
                    prev = 0;
                    dd = 1;
                }
                if ((type == "y" && day.getUTCMonth() < ytd.getUTCMonth()) || (day.getUTCMonth() == ytd.getUTCMonth() && day.getUTCDate() <= ytd.getUTCDate())) {
                    //console.log("adding" + ytd.getUTCFullYear() + " " + day.getUTCMonth() + " " + day.getUTCDate());
                    let data = { x: new Date(ytd.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()), y: prev + (result[date_key] ? Object.values(result[date_key])[0] : 0), category: day.getUTCFullYear().toString() };
                    chart_data.push(data);
                    prev = data.y;
                }
                dd++;
                day.setUTCDate(day.getUTCDate() + 1);
            }
            resp.push({
                data: chart_data, chartProps: {
                    type: "line", legend: {
                        layout: 'vertical',
                        position: 'right',
                        animate: false,
                        flipPage: false,
                        itemHeight: 1,
                    },
                    appendPadding: [0, 0, 0, type!="y"?15:0]
                }
            })
        }
        return resp;
    }
}

const MonthlyAnalysis = () => {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (acc_result) => {
        let resp = []
        let chart_data = [];
        for (let acc of acc_result) {
            let result = acc.result;
            let dates = Object.keys(result).sort((a,b)=>new Date(a).getTime()-new Date(b).getTime());
            for (let date_key of dates) {
                let obj = result[date_key];
                for (let [key, value] of Object.entries(obj)) {
                    let data = { x: monthNames[new Date(date_key).getUTCMonth()], month: new Date(date_key).getUTCMonth(), y: value * acc.multiply_sign, category: new Date(date_key).getUTCFullYear().toString() };
                    chart_data.push(data);
                }
            }
            chart_data.sort((a,b)=>a.month-b.month)
            resp.push({
                data: chart_data, chartProps: {
                    type: "line", smooth: true, xAxis: {type:"cat", label:undefined}, legend: {
                        layout: 'vertical',
                        position: 'right',
                        animate: false,
                        flipPage: false,
                        itemHeight: 1,
                        marker: {symbol:'hyphen'}
                    },
                }
            })
        }
        return resp;
    }
}

const MonthAnalysis = (currentRange,setCategoryData,setShow,showTable,chartRef,selectedCategory,sumdata) => {
    //var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (acc_result) => {
        let resp = []
        let chart_data = [];
        let sum = 0;
        let sum_7 = 0;
        let mtd;
        let month_days;
        for (let acc of acc_result) {
            let result = acc.result;
            let dates = Object.keys(result).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            
            if (acc.periods_to_show != 0) {
                dates = dates.slice(-acc.periods_to_show);
                if(acc.type=="d"){
                    mtd = Number(dates[dates.length-1].slice(8,10));
                    month_days = new Date(dates[dates.length-1]);
                    month_days.setUTCMonth(month_days.getUTCMonth()+1,1);
                    month_days.setUTCDate(0);
                    month_days = month_days.getUTCDate();
                    dates = dates.slice(0,dates.length-1);
                }
            }
            for (let date_key of dates) {
                let obj = result[date_key];
                // for (let [key, value] of Object.entries(obj)) {
                //     let data = { x: monthNames[new Date(date_key).getUTCMonth()], month: new Date(date_key).getUTCMonth(), y: value * acc.multiply_sign, category: new Date(date_key).getUTCFullYear().toString() };
                //     chart_data.push(data);
                // }
                if (acc.type == "m") {
                    chart_data.push(...(Object.keys(obj).map(e => {
                        sum += obj[e];
                        return { x: e, y: Math.abs(obj[e]), rows: acc.result_rows[date_key][e] }
                    })));
                } else if (acc.type == "d") {
                    sum_7 += Object.values(obj)[0];
                } else {
                    sum += obj;
                    chart_data.push({ x: date_key, y: Math.abs(obj), rows: acc.result_rows[date_key] });
                }
            }
        }
        chart_data.sort((a, b) => b.y - a.y);

        const text = !currentRange?[["MTD: ", sum], ["e(7d): ", sum_7/7*month_days], ["e(mtd): ", sum/mtd*month_days]] : [["Total: ", sum]];
        sumdata.current = sum;
        const bindevent = categorySelectFn();

            //chart_data.sort((a,b)=>a.month-b.month)
            resp.push({
                data: chart_data, chartProps: {
                    type: "pie",
                    legend: false,
                    statistic: {
                        title: {
                            //formatter: () => "MTD: " + formatter_commas(sum.toFixed(0)),
                            //style: { fontSize: 16, fontWeight: "Normal" },
                            customHtml: () => {
                                return (
                                // {/* <ul style={{ listStyle:"none", display:"table", paddingLeft: 0,fontSize:"14px", fontWeight:"Normal" }}>
                                //     <li
                                //         key="mtd"
                                //         className="g2-html-annotation"
                                //     > */}
                                    <div style={{textAlign:"start"}} className="responsive-text-p">
                                        {/* <p style={{margin:"0 0 0 0"}}><span style={{width: "55%", textAlign: "right", paddingRight:"5px", float:"left"}}>MTD: </span>{formatter_commas(sum.toFixed(0))}</p> */}
                                  {/* /*   </li>
                                    <li
                                        key="mtd2"
                                        className="g2-html-annotation"
                                    > */}
                     {/*                <p style={{margin:"0 0 0 0"}}><span style={{width: "55%", textAlign: "right", paddingRight:"5px", float:"left"}}>e(7d): </span>{formatter_commas((sum_7/7*month_days).toFixed(0))}</p> */}
                                       
                                 {/*   /*  </li>
                                
                                    <li
                                        key="mtd3"
                                        className="g2-html-annotation"
                                    > */}
                                  {/*       <p style={{margin:"0 0 0 0"}}><span style={{width: "55%", textAlign: "right", paddingRight:"5px", float:"left"}}>e(mtd): </span>{formatter_commas((sum/mtd*month_days).toFixed(0))}</p> */}
                                        {text.map((e,i)=><p key={"key "+i} style={{margin:"0 0 0 0"}}><span style={text.length>1?{width: "55%", textAlign: "right", paddingRight:"5px", float:"left"}:{}}>{e[0]}</span>{formatter_commas((e[1]).toFixed(0))}</p>)}
                                   {/* /*  </li>
                        </ul> */}
                        </div>
                        )
                    
                        },
                    },
                        content: false
                        // content: {
                        //     formatter:()=>"e(mtd): "+formatter_commas((sum/mtd*month_days).toFixed(0))+"\n\n"+"e(7d): "+formatter_commas((sum_7/7*month_days).toFixed(0)),
                        //     style: { fontSize: 16, fontWeight: "Normal" }
                        // }
                    },
                    interactions: [{ type: 'element-single-selected', cfg: {
                        start:[
                            {trigger:"element:touchend",action:"element-single-highlight:toggle", callback:cb},
                            {trigger:"element:click",action:"element-single-highlight:toggle", callback:cb}
                        ]
                    } 
                }],
                    binding: [{event:"element:click",cb:bindevent},{event:"element:touchend",cb:bindevent}],
                    chartRef: chartRef
                }
            })

        return resp;
    }

    function cb(event) {
        console.log(event);
        // console.log(chartRef.current);
        // console.log(chartRef.current.chart.geometries[0].getElementsBy((element)=>{
        //     console.log(element);
        // }))
    }

    function categorySelectFn() {
        return (event) => {
            console.log(event);
            console.log(event.data.data); //x, y, rows
            console.log(showTable.current);
    
            if(event.data.data.x==selectedCategory.current && showTable.current) {
                setShow(0);
                setCategoryData(event.data.data.rows);
            } else {
                selectedCategory.current = event.data.data.x;
                setShow(1);
                setCategoryData(event.data.data.rows);
            }
        }
    }
}



function NewElement(element, props, height, children) {
    console.log(element.searchQuery);
    return <ChartEditDataComponent id={"chartdata" + element.title} searchQuery={element.searchQuery} data={props.data} customRender={element.customRender} style={{ margin: "10px 10px 10px 10px" }} title={<><h4 style={{ margin: "0 0 5px 0" }}>{element.title}</h4>{children}</>} height={height} hidden />;
}

function Element(searchQuery, title, props, height, chartProps, getAnnotation) {
    return <ChartEditDataComponent id={"chartdata" + title} searchQuery={searchQuery} data={props.data} style={{ margin: "10px 10px 10px 10px" }} title={<h4 style={{ margin: "0 0 5px 0" }}>{title}</h4>} height={height} hidden getAnnotation={getAnnotation} chartProps={chartProps} />;
}

const getColStackAnnotation = (dates, acc, chart_data) => {
    let annotations2 = [];
    let result = acc.result;
    for (let date_key of dates) {
        let obj = result[date_key];
        let sum = 0;
        for (let [key, value] of Object.entries(obj)) {
            sum = sum + value * acc.multiply_sign;
        }
        var label = {
            type: 'text',
            offsetX: -15,
            offsetY: -10,
            style: {
                fill: 'black',
            },
            autoAdjust: true,
            animate: false,
        };
        label.position = (xScale, yScale) => {
            const ratio = xScale.ticks ? 1 / xScale.ticks.length : 1;
            const x = xScale.scale(new Date(date_key).getTime());
            const y = yScale.y.scale(sum);
            return [''.concat(x * 100, '%'), ''.concat((1 - y) * 100, '%')];
        };
        label.content = formatter_commas(sum.toFixed(0));
        label.offsetX = -label.content.length * 3;
        annotations2.push(label);
    }
    return annotations2;
};

function getElements(chartRef) {
    return chartRef.current.chart.geometries[0].elements;
}

function setHighlightBy(elements, setShow, selectedCategory, setCategoryData, dir = "next") {
    let enable = true;
    let found = 0;

    const STATUS_UNACTIVE = 'inactive';
    const STATUS_ACTIVE = 'active';

    for (let i = 0; i < elements.length; i++) {
        let el = elements[i];
        // 需要处理 active 和 unactive 的互斥
        if (el.hasState(STATUS_ACTIVE)) {
            el.setState(STATUS_ACTIVE, false);
            el.setState(STATUS_UNACTIVE, enable);
            found = i;
            break;
        }
    }
    found = found + (dir == "next" ? 1 : -1)
    if (found == elements.length) {
        found = 0;
    } else if (found == -1) {
        found = elements.length - 1;
    }
    let el = elements[found];
    if (el.hasState(STATUS_UNACTIVE)) {
        el.setState(STATUS_UNACTIVE, false);
    }
    el.setState(STATUS_ACTIVE, enable);
    console.log(elements);

    selectedCategory.current = el.data.x;
    setShow(1);
    setCategoryData(el.data.rows);
}