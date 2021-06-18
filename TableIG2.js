import React, { useState, useEffect } from 'react';
import * as IG from "./IGClient.js";
// import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider, Grid, GridColumn } from 'semantic-ui-react';

const App = (props) => {

    //var data = props.data;
    // var fetch = props.fetch;
    // var calc = props.calc;
    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    var data;

    if (dataLoaded == 2 && acc) {
        data = acc.chartdata2;
        //}

        //if (dataLoaded==2 && Object.keys(data).length > 0) {
        var charts = []
        // var rows = 0;
        // var cols = 0;
        // var rowchart = []
        for (var key of Object.keys(data)) {
            console.log("unique key"+key);
            charts.push(<Grid.Column key={key+"col"}><NewChart key={key} data={data[key]}
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
            <div><h3 style={{ margin:"0 0 0px 0"}}>ISA Breakdown</h3>
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