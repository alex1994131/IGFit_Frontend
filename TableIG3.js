import React, { useState, useEffect, useCallback } from 'react';
import * as IG from "./IGClient.js";
// import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider, Grid, GridColumn } from 'semantic-ui-react';
//import throttle from 'lodash.throttle';
import { throttle } from "lodash"

// const colorpalette = [
//     "#5B8FF9",
//     "#CDDDFD",
//     "#61DDAA",
//     "#CDF3E4",
//     "#65789B",
//     "#CED4DE",
//     "#F6BD16",
//     "#FCEBB9",
//     "#7262fd",
//     "#D3CEFD",
//     "#78D3F8",
//     "#D3EEF9",
//     "#9661BC",
//     "#DECFEA",
//     "#F6903D",
//     "#FFE0C7",
//     "#008685",
//     "#BBDEDE",
//     "#F08BB4",
//     "#FFE0ED",
// ];

const colorpalette = [
    "#5B8FF9",
    "#CDDDFD",
    "#61DDAA",
    "#CDF3E4",
    "#65789B",
    "#CED4DE",
    "#F6BD16",
    "#FCEBB9",
    "#7262fd",
    "#D3CEFD",
    "#78D3F8",
    "#D3EEF9",
    "#9661BC",
    "#DECFEA",
    "#F6903D",
    "#FFE0C7",
    "#008685",
    "#BBDEDE",
    "#F08BB4",
    "#FFE0ED",
];

const pSBC = (p, c0, c1, l) => {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    var pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) {
            [r, g, b, a] = d = d.split(","), n = d.length;
            if (n < 3 || n > 4) return null;
            x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
        } else {
            if (n == 8 || n == 6 || n < 4) return null;
            if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
            d = i(d.slice(1), 16);
            if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
            else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
        } return x
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}


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