import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import { findmatchintable } from './filtermatches.js';
import { Grid } from 'semantic-ui-react';
import { shorten, formatter_commas, debounce, Responsive, useBreakpoints } from './utils';
import ChartEditDataComponent from './ChartEditDataComponent.js';
import TableIG3 from "./TableIG3";

const App = (props) => {
    //const searchQuery = props.searchQuery ? props.searchQuery : "acc:amount";
    const [filteredData, setFilteredData] = useState();
    const [saved_elements, setSavedElements] = useState([]);
    const [priceIndex, setPriceIndex] = useState();
    const [sortButton, setSortButton] = useState(1);

    const breakpoints = useBreakpoints();

    var handleRadioChange = useCallback((e) => {
        if (e.target.value === "Sort") {
            setSortButton(1);
        } else if (e.target.value === "No Sort") {
            setSortButton(0);
        }

    });

    var handleInput = useCallback((e) => {
        // console.log(e);
        console.log("add element");
        let new_element = <Grid.Column key={"gridchartdata " + saved_elements.length}><ChartEditDataComponent id={"chartdata " + saved_elements.length} searchQuery="acc:category.title:m" data={props.data} style={{ margin: "50px 50px 50px 50px" }} title={<h4 style={{ margin: "0 0 5px 0" }}>{"Chart " + (saved_elements.length + 1)}</h4>} height={100} /></Grid.Column>
        let new_arr = saved_elements.concat(new_element);
        setSavedElements(new_arr);
    });

    useEffect(() => {
        if(props.acc?.positions) {
            let price_index = {}
            let days = [7,30,365];
            days.forEach(e=>price_index[e]=[]);
            for(let [name,value] of Object.entries(props.acc.positions)) {
                if(value?.price_chart) {
                    let end_date = value.price_chart[value.price_chart.length-1].compare_date;
                    for(let [day,index] of Object.entries(price_index)) {
                        let compare_date = new Date(end_date);
                        console.log("day "+(compare_date.getUTCDate()-Number(day)));
                        compare_date.setUTCDate(compare_date.getUTCDate()-Number(day));
                        let start_price = value.price_chart.find(e=>e.compare_date==compare_date.getTime());
                        //if (start_price) {
                            index.push({ x: value.ticker, y: start_price?value.price_chart[value.price_chart.length - 1].value.close / start_price.value.close * 100:null });
                        //}
                    }
                }
            }
            let keys={}

            price_index[days[0]].sort((a, b) => b.y - a.y);
            for(let i=0;i<price_index[days[0]].length;i++){
                keys[price_index[days[0]][i].x] = i;
            }
            for(let [day,index] of Object.entries(price_index)) {
                if (sortButton) {
                    index = index.sort((a, b) => b.y - a.y);
                } else {
                    if(day==days[0]) {
                    } else {
                        index = index.sort((a,b) => keys[a.x]-keys[b.x])
                    }
                }
            }
            if(price_index[days[0]]?.length) {
                setPriceIndex(price_index);
            }
        }
    }, [props.dataLoaded, sortButton])

    console.log("new chart5");
    var resp = (
        <div /* style={{width:"90%", margin:"auto"}} */>
           
            {/* <div> */}
            <Grid stackable columns={2} className="standard">
                <Grid.Row stretched>
                    <Grid.Column width={7}>
                     <h3 style={{ margin: "0 0 5px 0" }}>Pricing Breakdown</h3>
            {/* <div>
                <button onClick={handleInput} style={{ margin: "0 0 10px 0" }}>
                    Activate Lasers
                    </button>
            </div> */}
           <div style={{ margin: "0 0 10px 0"}}>
                    <input
                        type='radio'
                        name='Sort'
                        value="Sort"
                        defaultChecked={true}
                        onChange={handleRadioChange}
                    /> Sort Descending
                <input
                        type='radio'
                        name='Sort'
                        value="No Sort"
                        onChange={handleRadioChange}
                        style={{ marginLeft: 10 }}
                    /> Sort By Top Chart
                </div>
                    {PriceChart(priceIndex, 7, Responsive(breakpoints,150))}
                    {PriceChart(priceIndex, 30, Responsive(breakpoints,150))}
                    {PriceChart(priceIndex, 365, Responsive(breakpoints,150))}
                    </Grid.Column>
                    <Grid.Column width={9}>
                    <div><TableIG3 acc={props.acc} dataLoaded={props.dataLoaded} height={Responsive(breakpoints,550,900)}/></div>
                    {/* {Element("acc:category.title:-m:3 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card”", "3 Months View", props, 300, 
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
                    {NewElement(catcalc, props, 300)} */}
                    </Grid.Column>
                </Grid.Row>
                </Grid>
                {/* </div> */}
            {/* <Grid columns={2} className="very compact" style={{ overflow: "auto" }}>
                {props.data?.length > 0 ? saved_elements : "Loading..."}
            </Grid> */}
        </div>)
    return resp
    // }
    // else
    //     return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);

function PriceChart(priceIndex, days, height) {
    if (priceIndex) {
        if (priceIndex[days]?.length) {
            return <Newchartmemo data={priceIndex[days]} type="column" height={height} xAxis={{
                type: "cat", nice: false, label: {
                    autoRotate: true,
                    autoHide: false,
                    autoEllipsis: true,
                    rotate: -180/360*3.14,
                    offset: undefined,
                    offsetX: 10,
                    offsetY: 10,
                    offset: 25,
                    formatter: (e) => e.substr(0,4).replace(/[ .]*/g, "")
                }
            }} label={{
                formatter: (e) => {
                    return e.y?.toFixed(0);
                },
                position: 'top',
            }} 
            setcolor={
                (e)=>{
                    //console.log(priceIndex[days].find(e2=>e2.x==e.x).y);
                    return (priceIndex[days].find(e2=>e2.x==e.x).y)>100?null:'grey'
            }}
            Axis={{nice: true, line: null, label: null, grid: null}} appendPadding={[10, 0, 0, 0]} title={days+" Days"}/>;
        }
    } else {
        return "Loading...";
    }
}

