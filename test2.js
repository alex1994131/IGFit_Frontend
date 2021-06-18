import React, { useState, useEffect, useCallback } from 'react';
import * as IG from "./IGClient.js";
//import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider, Grid, GridColumn } from 'semantic-ui-react';
//import throttle from 'lodash.throttle';
import { throttle } from "lodash"


const App = (props) => {

    //var positions = props.data;
    // var fetch = props.fetch;
    var max = 730;
    var [activeIndex, setActiveIndex] = useState(max - 180);
    //var days = 180;
    var [days, setDays] = useState(180);
    var [chart, setChart] = useState([]);
    var [annotations, setAnnotations] = useState([]);
    var [colormapping, setColorMapping] = useState({});

    var start_date = new Date();
    start_date.setDate(start_date.getDate() - days);
    start_date.setHours(0, 0, 0, 0);

    var handleRangeChange = (e) => { setActiveIndex(e.target.value); throttlefunc(e.target.value); };
    var throttlefunc = useCallback(throttle(q => setDays(max - q), 100), []);

    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    var positions;

    if (dataLoaded == 2 && acc) {
        positions = acc.positions;
    }

    useEffect(() => {
        // start_date = new Date();
        // start_date.setDate(start_date.getDate()-days);
        // start_date.setHours(0, 0, 0, 0);
        var chart2 = [];
        var annotations2 = [];
        var colormapping2 = {};
        //if (dataLoaded==2 && Object.keys(positions).length > 0) {
        if (dataLoaded == 2) {
            var colorindex = 0;
            for (let [key, value] of Object.entries(positions)) {
                var price_index = 0;
                if ("price_chart" in positions[key]) {
                    colormapping2[key] = colorpalette[colorindex];
                    colorindex++;
                    if (colorindex == 20) {
                        colorindex = 0;
                    }
                    var label = {
                        type: 'text',
                        style: {
                            fill: colormapping2[key],
                        },
                        offsetX: 5,
                        autoAdjust: true,
                        animate: false
                    };
                    for (var i = 0; i < positions[key].price_chart.length; i++) {
                        var compare_date = new Date(positions[key].price_chart[i].date);
                        compare_date.setHours(0, 0, 0, 0);
                        if (compare_date.getTime() == start_date.getTime()) {
                            price_index = positions[key].price_chart[i].value.close;
                            chart2.push({ x: positions[key].price_chart[i].date, y: 100, category: key })
                        } else if (compare_date.getTime() > start_date.getTime()) {
                            if (price_index == 0) {
                                price_index = positions[key].price_chart[i].value.close;
                            }
                            chart2.push({ x: positions[key].price_chart[i].date, y: (positions[key].price_chart[i].value.close / price_index) * 100, category: key })
                            if (i == positions[key].price_chart.length - 1) {
                                label.position = { x: positions[key].price_chart[i].date, y: (positions[key].price_chart[i].value.close / price_index) * 100, category: key };
                                label.content = label.position.y.toFixed(0) + " " + key.replace(/ .*/, '');
                            }
                        }
                    }
                    annotations2.push(label);
                }
            }
            setChart(chart2);
            setAnnotations(annotations2);
            setColorMapping(colormapping2);
            //console.log("data");
        }
    }, [days, positions])

    //if (fetch && Object.keys(positions).length > 0) {
    if (dataLoaded == 2) {
        var resp = (
            <div>
                <h3 style={{ margin:"0 0 5px 0"}}>Price Index</h3>
                <div>{days} Days - Start Date: {start_date?.toLocaleDateString("en-US")} End Date: {(new Date()).toLocaleDateString("en-US")}</div>
                <input
                    type='range'
                    max={max}
                    value={activeIndex}
                    onChange={handleRangeChange}
                    // style={{ width: "30%", margin: "5px 5px 0 5px" }}
                    className="input-range"
                />
                {/* <Container fluid> */}
                    <NewChart key="NewChart4" data={chart}
                        type="line"
                        height={props.height?props.height:800}
                        annotations={annotations}
                        legend={{
                            layout: 'vertical',
                            position: 'right',
                            animate: false
                        }}
                        appendPaddingRight={120}
                    //colors={{colorpalette,colormapping}}
                    // title={<h3 style={{ margin:"0 0 10px 0"}}>Price Index</h3>}
                    />
                {/* </Container> */}
            </div>
        );


        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);