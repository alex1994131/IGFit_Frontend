import React, { useState, useEffect } from 'react';
import { Container, Divider, Grid, GridColumn } from 'semantic-ui-react';

import NewChart from "../chart/NewChart.js"
import NewTable from "./NewTable.js"

import * as IG from "../../helpers/IGClient.js";
// import { IGAccount } from "../../helpers/IGAccount.js";

const App = (props) => {

    //var data = props.data;
    // var fetch = props.fetch;
    // var calc = props.calc;
    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    var data;

    if (dataLoaded == 2 && acc) {
        data = acc.chartdata2;
        var charts = []

        for (var key of Object.keys(data)) {
            charts.push(<Grid.Column key={key + "col"}><NewChart key={key} data={data[key]}
                type="line"
                height={150}
                legend={false}
                title={key}
            /></Grid.Column>);
            // cols++;
            // if(cols==6) {
            //     rowchart.push(<Grid.Row>{charts}</Grid.Row>);
            //     charts = [];
            //     cols = 0;
            // }
        }

        // if(cols>0) {
        //     rowchart.push(<Grid.Row>{charts}</Grid.Row>);
        // }

        var resp =
            //<div style={{overflow:"scroll"}}>
            <div><h3 style={{ margin: "0 0 0px 0" }}>ISA Breakdown</h3>
                <Grid stackable columns={6} className="very compact" style={{ overflow: "auto" }}>
                    {charts}
                </Grid>
            </div>
        //</div>

        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);