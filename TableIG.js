import React, { useState, useEffect } from 'react';
import * as IG from "./IGClient.js";
// import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider } from 'semantic-ui-react';

const App = (props) => {

    //var data = props.data;
    // var fetch = props.fetch;
    // var calc = props.calc;
    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    var data;

    if (dataLoaded == 2 && acc) {
        data = acc.chartdata;


        //if (dataLoaded==2 && data?.length > 0) {
        //var resp = [];

        var resp = //resp.concat(
            // <Container fluid>
                <NewChart key="NewChart3" data={data}
                    // calc={calc}
                    type="line"
                    height={800}
                    legend={{
                        layout: 'vertical',
                        position: 'right',
                        animate: false
                    }}
                    title={<h3 style={{ margin:"0 0 10px 0"}}>ISA</h3>}
                />
            // </Container>
        //);

        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);