import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"

const App = (props) => {
    const [calcCharts,setCharts] = useState();
    const acc_result = props.acc_result;

    useEffect(()=>{
        if(acc_result){
            let charts=[];
            //for(let i of Object.keys(acc_result)) {
            for(let acc of acc_result) {
                //const type = acc_result[i].type;
                const type = acc.type;
                if(type=="total") {
                    //let result = acc_result[i].result;
                    let result = acc.result;
                    let total_data = Object.keys(result).map(e=>{
                        return <>{e}:{result[e].toFixed(2)}<br/></>
                    });
                    let chart_data = Object.keys(result).map(e=>{
                        return {x: e, y:Math.abs(result[e])}
                    });
                    chart_data.sort((a,b)=>b.y-a.y);
                    //let chart = <div key={"NewChartAccResult"+i}>{total_data}</div>
                    let chart = <Newchartmemo key={"NewChartAccResult"+acc.name+acc.type} data={chart_data} type="pie"/>
                    charts.push(chart);
                } else {
                    //let result = acc_result[i].result;
                    let result = acc.result;
                    let chart_data = [];
                    console.log(JSON.stringify(result));
                    for(let i2 of Object.keys(result)) {
                        let obj = result[i2];
                        for(let [key, value] of Object.entries(obj)) {
                            let data = {x: i2, y: value*acc.multiply_sign, category:key};
                            chart_data.push(data);
                        }
                    }
                    let chart = <Newchartmemo key={"NewChartAccResult"+acc.name+acc.type} data={chart_data} type="column" isStack/>
                    charts.push(chart);
                }
            }
            console.log(JSON.stringify(charts));
            setCharts(charts);
        }
    },[acc_result]);

    if (calcCharts?.length > 0) {
        console.log("calccharts");

        var resp = (<div style={{margin:"10px 0 25px 0"}}>
            {calcCharts}
        </div>)
        return resp
    }
    else
        //return <>Loading...</>;
        return null;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);
const Newtablememo = React.memo(NewTable);