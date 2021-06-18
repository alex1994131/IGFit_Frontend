import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import { findmatchintable } from './filtermatches.js';
import { Grid } from 'semantic-ui-react';
import { shorten, formatter_commas, debounce } from './utils';
import ChartEditDataComponent from './ChartEditDataComponent.js';

import * as AntChart from '@ant-design/charts';

const App = (props) => {

    var [activeIndex, setActiveIndex] = useState(500);
    let chart_data = [
        { x: "1", y: 100 },
        { x: "2", y: 200 },
        { x: "3", y: 300 },
    ];

    var config = {
        data: chart_data,
         autoFit: true,
        height: activeIndex,
        xField: 'x',
        yField: 'y',
    };

    var handleRangeChange = (e) => { 
        
        
        setActiveIndex(Number(e.target.value));console.log(typeof e.target.value) };

    let chart = <Newchartmemo data={chart_data} height={activeIndex} type="column" />

    // return (<Grid stackable relaxed columns={2} className="standard">
    //     <Grid.Row stretched style={{height:1200}}>
    //         <Grid.Column width={5}>
    //             {chart}
    //             {chart}
    //             {chart}
    //             {chart}
    //         </Grid.Column>
    //         <Grid.Column width={11}>
    //         {chart}
    //         {chart}
    //         </Grid.Column>
    //     </Grid.Row>
    // </Grid>)

    return (
        <div>
        <input
        type='number'
        min={500}
        max={1000}
        value={activeIndex}
        onChange={handleRangeChange}
        // style={{ width: "30%", margin: "5px 5px 0 5px" }}
    />
    {/* <AntChart.Column {...config} /> */}
    {<Testchartmemo height={activeIndex} type="column"/>}
    </div>
    )
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);

const Testchart = (props) => {
    let chart_data = [
        { x: "1", y: 100 },
        { x: "2", y: 200 },
        { x: "3", y: 300 },
    ];

    var config = {
        data: chart_data,
         autoFit: true,
        height: props.height,
        xField: 'x',
        yField: 'y',
    };

    var type=props.type;
    var ref=useRef();

    // return (
    // //     <div style={{height:props.height}}>
    // // <AntChart.Column {...config} />
    // // </div>
    // <Newchartmemo data={chart_data} height={props.height}/>
    // )

    var chart;
    if (type == "column") {
        chart = <AntChart.Column
            {...config}
        />
    } else if (type == "line") {
        chart = <AntChart.Line
            {...config} style={{}}
        />
    } else if (type == "pie") {
        chart = <AntChart.Pie {...config} style={{}}
        />
    }
    return (
        // <div>
       // {/* <div>{typeof props.title == 'object'? props.title:<h4 style={{ fontWeight: 'normal', margin:"10px 0 10px 0", textAlign:"left", textOverflow:"ellipsis", whiteSpace:"nowrap", overflow:"auto" }}>{("title" in props) && props.title}</h4>}</div> */}
        <div style={{ height: props.height ?? 400 }}>
            {chart}
        </div>//</div>
    )
}

const Testchartmemo = React.memo(Testchart);