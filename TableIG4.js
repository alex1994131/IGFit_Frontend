import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as IG from "./IGClient.js";
// import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider, Grid, GridColumn } from 'semantic-ui-react';

const yAxis = { min: 50, max: 200, tickInterval: 50 };
var max_i;
var min_i;
var newsort, oldsort;

const inputStyle = { width: "30%", margin: "5px 5px 0px 5px" };
const inputStyle2 = { margin: "0 10px 0 0px" };
const inputStyle3 = { marginRight: "10px" };
const App = (props) => {

    //var positions = props.data;
    // var fetch = props.fetch;
    var max = 730;
    var [activeIndex, setActiveIndex] = useState(max - 180);
    var [chartarr, setChartArr] = useState();
    //var [count, setCount] = useState(0);
    var [isSort, setIsSort] = useState(0);
    var [chartsData, setChartsData] = useState();
    var [annotationsData, setAnnotations] = useState();
    var [clicked, setclicked] = useState(0);
    var days = max - activeIndex;
    var start_date = new Date();
    start_date.setDate(start_date.getDate() - days);
    start_date.setHours(0, 0, 0, 0);

    var [first, setFirst] = useState(1);

    var handleRangeChange = useCallback((e) => {
        setActiveIndex(e.target.value)
    });

    var handleInputChange = useCallback((event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (value) {
            sort(chartarr, chartsData, charts, setChartArr);
        }
        target.type === 'checkbox' ? setIsSort(value) : null;
        //console.log("sort"+value);
    });

    var charts = useRef(null);
    if(!charts.current)
        charts.current=[];
    charts.current.length=0;
    var acc = props.acc;
    var dataLoaded = props.dataLoaded;

    useEffect(() => {
        if (props.acc && props.acc?.positions) {
            let keys = [];
            for (let key of Object.keys(props.acc.positions)) {
                if (props.acc.positions[key].price_chart) {
                    keys.push(key);
                }
            };
            setChartArr(keys);
            //console.log("setting");
        }
    }, [props.dataLoaded]);

    useEffect(() => {
        // let start_date = new Date();
        // start_date.setDate(start_date.getDate() - (max - activeIndex));
        // start_date.setHours(0, 0, 0, 0);
        calcNewCharts(start_date, acc, setChartsData, setAnnotations, isSort, setChartArr, chartarr, [first,setFirst]);
        //setclicked(clicked+1);
        charts.current=[];
    }, [activeIndex, props.dataLoaded, chartarr, isSort, first]);

/*      useEffect(()=>{
         if (isSort) {
             setChartArr(chartarr.slice().sort((a, b) => {
                 let a_index = chartsData[a][chartsData[a].length - 1].y;
                 let b_index = chartsData[b][chartsData[b].length - 1].y;
                 return b_index - a_index;
             }));
         }
     },[isSort]); */

    const onButtonPress = useCallback(() => {
        
        sort(chartarr, chartsData, charts, setChartArr);
        //setclicked(clicked+1);
        //setActiveIndex(20);
        //setCount(count+1);
    });

/*     useEffect(() => {
        if (JSON.stringify(oldsort) != JSON.stringify(chartarr)) {
            console.log("in");
            oldsort = chartarr;
            charts.current = [];
            setclicked(clicked+1);
        }
    }, [chartarr]) */

    if (dataLoaded == 2 && acc && chartarr && chartsData && annotationsData) {
        //console.log("rendering"+chartarr[0]);
        let maxy, miny, range;
        // if (annotationsData[chartarr[0]] && annotationsData[chartarr[chartarr.length - 1]]) {
        //     maxy = annotationsData[chartarr[0]][0].position?.y;
        //     miny = annotationsData[chartarr[chartarr.length - 1]][0].position?.y;
        //     range = (maxy - miny) / 3;
        // }
        maxy = max_i;
        miny = min_i;
        range = (maxy - miny) / 3;

        // for (var key of Object.keys(chartsdata)) {\
        //let pos = 0;
        //console.log("days"+activeIndex);
        for (var key of chartarr) {
            //console.log("pushing"+key+"with key"+(key+"price_chart"+count)+"in position"+pos+"with color"+(annotationsData[key][0].position.y > maxy-range?'green':annotationsData[key][0].position.y > maxy-(range*2)?'blue':'red'));
            charts.current.push(<Grid.Column key={key + "column"}><Newchartmemo key={key + "price_chart"} data={chartsData[key]} annotations={annotationsData[key]}
                type="line"
                height={150}
                yAxis={yAxis}
                setcolor={annotationsData[key][0].position.y > maxy - range ? 'green' : annotationsData[key][0].position.y > maxy - (range * 2) ? 'blue' : 'red'}
                legend={false}
                title={key}
            /></Grid.Column>);

            // cols++;
            // if(cols==6) {
            //     rowchart.push(<Grid.Row>{charts}</Grid.Row>);
            //     charts = [];
            //     cols = 0;
            // }
            //pos++;
        }
        //count++;

        // if(cols>0) {
        //     rowchart.push(<Grid.Row>{charts}</Grid.Row>);
        // }

        var resp =
            <div>
                <div><h3 style={{ margin:"0 0 5px 0"}}>Price Index Breakdown</h3>
                {<div>{days} Days - Start Date: {start_date?.toLocaleDateString("en-US")} End Date: {(new Date()).toLocaleDateString("en-US")}</div>}
                <input
                    type='range'
                    max={max}
                    value={activeIndex}
                    onChange={handleRangeChange}
                    // style={inputStyle}
                    className="input-range"
                />
                <button type="button" onClick={onButtonPress} style={inputStyle2}>Sort</button>
                {<label>
                    <input type="checkbox" name="Sort" checked={isSort}
                        onChange={handleInputChange} style={inputStyle3} />
                    Keep sorting?
                </label>}
                {/* <Containermemo fluid> */}
                    <Gridmemo stackable columns={6} className="very compact">
                        {charts.current}
                    </Gridmemo>
                {/* </Containermemo> */}
            </div>
</div>
        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);

function sort(chartarr, chartsData, charts, setChartArr) {
    var newsort = chartarr.slice().sort((a, b) => {
        let a_index = chartsData[a][chartsData[a].length - 1].y;
        let b_index = chartsData[b][chartsData[b].length - 1].y;
        return b_index - a_index;
    });
    if (JSON.stringify(oldsort) != JSON.stringify(newsort)) {
        oldsort = newsort;
        charts.current = [];
        setChartArr(newsort);
        //    setclicked(clicked+1);
    }
}

function calcNewCharts(start_date, acc, setChartsData, setAnnotations, isSort, setChartArr, chartarr, [first=0,setFirst=null]) {
    let start_time = start_date.getTime();
    let positions = acc?.positions;
    //console.log('days'+activeIndex);
    //}

    //if (dataLoaded==2 && Object.keys(positions).length > 0) {
    if (positions && chartarr?.length) {
        var chartsdata = {};
        let annotations2 = {};
        max_i = null;
        min_i = null;
        calcNewChartsData(positions, chartsdata, start_time, annotations2);
        setChartsData(chartsdata);
        setAnnotations(annotations2);
        if (isSort || first) {
            setChartArr(chartarr./* slice(). */sort((a, b) => {
                let a_index = chartsdata[a][chartsdata[a].length - 1].y;
                let b_index = chartsdata[b][chartsdata[b].length - 1].y;
                return b_index - a_index;
            }));
            if (first) {
                setFirst(0);
            }
        }
    }
    return positions;
}

function calcNewChartsData(positions, chartsdata, start_time, annotations2) {
    for (var key of Object.keys(positions)) {
        var price_index = 0;
        if ("price_chart" in positions[key]) {
            var label = {
                type: 'text',
                style: {
                    fill: 'black',
                },
                offsetX: 5,
                offsetY: 0,
                autoAdjust: true,
                animate: false
            };
            chartsdata[key] = [];
            for (var i = 0; i < positions[key].price_chart.length; i++) {
                //var compare_date = new Date(positions[key].price_chart[i].date);
                //compare_date.setHours(0, 0, 0, 0);
                var compare_date = positions[key].price_chart[i].compare_date;
                if (compare_date == start_time) {
                    price_index = positions[key].price_chart[i].value.close / 100;;
                    chartsdata[key].push({ x: positions[key].price_chart[i].date, y: 100, category: key });
                } else if (compare_date > start_time) {
                    if (price_index == 0) {
                        price_index = positions[key].price_chart[i].value.close / 100;
                    }
                    chartsdata[key].push({ x: positions[key].price_chart[i].date, y: (positions[key].price_chart[i].value.close / price_index) /* * 100 */, category: key });
                    if (i == positions[key].price_chart.length - 1) {
                        label.position = { x: positions[key].price_chart[i].date, y: (positions[key].price_chart[i].value.close / price_index) /* * 100 */, category: key };
                        label.content = label.position.y.toFixed(0);
                        if (!max_i && !min_i) {
                            max_i = label.position.y;
                            min_i = label.position.y;
                        } else {
                            if (label.position.y > max_i) {
                                max_i = label.position.y;
                            }
                            if (label.position.y < min_i) {
                                min_i = label.position.y;
                            }
                        }
                    }
                }
            }
            annotations2[key] = [label];
        }
    }
}
//const Newchartmemo = NewChart;
const Gridmemo = React.memo(Grid);
const Containermemo = React.memo(Container);