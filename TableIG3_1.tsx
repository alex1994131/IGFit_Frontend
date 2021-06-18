import React, { useState, useEffect, useCallback } from 'react';
import * as IG from "./IGClient.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider, Grid, GridColumn, Dropdown } from 'semantic-ui-react';
import { Positions, Position, Single_Position_On_Date, Total_Position_On_Date } from "./IGAccount"

interface posData {
    date: string;
    date_obj: Date;
    price: any;
    quantity: number;
    quantity_bought: number;
    quantity_sold: number;
    market_value: number;
    running_cost: number;
    running_proceeds: number;
    unrealized_pnl: number;
    unrealized_pnl_2: number;
    realized_pnl: number;
    total_pnl: number;
}

interface posDataList {
    [pos: string]: posData[]
}

const App = (props) => {
    // var [annotations, setAnnotations] = useState([]);
    const [positionList, setPositionList] = useState();
    const [positionData, setPositionData] : [posDataList,any] = useState();
    const [selected, setSelected] : [string,any] = useState();
    const [selectedChart, setSelectedChart] : [any,any] = useState();

    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    var positions : Positions;

    useEffect(() => {
        var positionlist : any = [];
        var positions_data : any = {};
        if (dataLoaded == 2) {
            positions = acc.positions;
            var poscalc : Total_Position_On_Date[] = acc.poscalc;
            for (let [key, value] of Object.entries(positions)) {
                if ("price_chart" in positions[key]) {
                    positionlist.push({key:key,text:key,value:key})
                    positions_data[key] = [];
                }
            }
            for (let pos_date of poscalc) {
                let date = pos_date.date_obj;
                for(let pos of pos_date.pos) {
                    if(positionlist.findIndex(e=>e.value==pos.market) > -1) {
                        let position_data_date = {
                            date: pos_date.date,
                            date_obj: pos_date.date_obj,
                            price: pos.market_price.close,
                            quantity: pos.quantity,
                            quantity_bought: pos.quantity_bought,
                            quantity_sold: pos.quantity_sold,
                            market_value: pos.market_value,
                            running_cost: -pos.running_cost_local_ccy,
                            running_proceeds: pos.running_realized_proceeds_local_ccy,
                            unrealized_pnl: pos.unrealized_pnl_local_ccy,
                            unrealized_pnl_2: pos.unrealized_pnl_local_ccy_2,
                            realized_pnl: pos.realized_pnl_local_ccy,
                            total_pnl: pos.total_pnl_local_ccy
                        }
                        positions_data[pos.market].push(position_data_date);
                    }
                }
            }
            setPositionList(positionlist);
            setPositionData(positions_data);
        }
    }, [props.acc, props.dataLoaded]);

    useEffect(()=>{
        if (selected) {
            let chart_data = [];
            let selected_pos = positionData[selected];

            for (let pos_date of selected_pos) {
                if (Math.abs(pos_date.quantity) > 0.00001) {
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.price,
                        category: "price"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.total_pnl,
                        category: "total_pnl"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.unrealized_pnl_2,
                        category: "unrealized_pnl"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.total_pnl-pos_date.unrealized_pnl_2,
                        category: "realized_pnl"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.running_cost+pos_date.running_proceeds,
                        category: "running_value"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: Math.abs(pos_date.market_value),
                        category: "market_value"
                    })
                    chart_data.push({
                        x: pos_date.date,
                        y: pos_date.quantity,
                        category: "quantity"
                    })
                }
            }

            setSelectedChart(chart_data);
        }
    },
    [selected]);


    if (dataLoaded == 2) {
        var resp = (
            <div>
                <h3 style={{ margin: "0 0 5px 0" }}>Position</h3>
                <Dropdown
                placeholder='Select Friend'
                fluid
                selection
                options={positionList}
                onChange={(e,{value}:any)=>setSelected(value)}
                value={selected}
            />
                {(selected && selectedChart) ? <NewChart key="NewChart31" data={selectedChart}
                    type="line"
                    height={props.height ? props.height : 800}
                    // annotations={annotations}
                    legend={{
                        layout: 'vertical',
                        position: 'right',
                        animate: false
                    }}
                    appendPaddingRight={120}
                /> : ""}
            </div>
        );

        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);