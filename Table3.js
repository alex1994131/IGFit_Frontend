import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as IG from "./IGClient.js";
//import { IGAccount } from "./IGAccount.js";
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import { Container, Divider } from 'semantic-ui-react';

const App = (props) => {
    //  const [data, setData] = useState();
    // const [fetch, setFetch] = useState(0);
    const [searchdata, setSearchData] = useState([]);
    const cb = useCallback((data) => {
        var data2 = data.map((element) => { var resp = element; resp.y = resp.y * (props.pnl?1:-1); return resp; });
        setSearchData(data2);
    },[]);
    // const [acc, setAcc] = useState({});
    // const [calc, setCalc] = useState([]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (!fetch) {
    //             IG.downloadactivity().then((igdata) => {
    //                 var csvdata2 = igdata;
    //                 var acc2 = new IGAccount(csvdata2.ISA.trades, "ISA", setData, setCalc);
    //                 setAcc(acc2);
    //             });
    //             setFetch(1);
    //         }
    //     };
    //     fetchData();
    // });

    //var data = props.data;
    // var fetch = props.fetch;
    //var calc = props.calc;
    const [calc,setCalc] = useState();
    const [data,setData] = useState();
    var acc = props.acc;
    var dataLoaded = props.dataLoaded;
    // var data = [];

    useEffect(() => {
        if (dataLoaded && acc) {
            setData(acc.getData().slice())
            if (dataLoaded == 2) {
                setCalc(acc.getCalc());
            }
        }
    }, [props.acc, props.dataLoaded]);

    const cols = useRef({
    x : "date",
    y : props.col?props.col:"overall_unrealized_cost_base_ccy",
    category : "base_cost",
    show : ["date", props.col?props.col:"overall_unrealized_cost_base_ccy"]
    });

    if (dataLoaded == 2) {
        //var resp = [];
        //if (searchdata.length > 0) {
          var  resp = //resp.concat(
                // <Container fluid>
                <div>
                    <NewChartmemo key="NewChart1" data={searchdata}
                        calc={calc}
                        type="line"
                        title={<h3 style={{ margin:"0 0 10px 0"}}>Overview</h3>}
                    />
                    <Divider />
                    <NewTablememo key="NewTable1" set_search_data={cb}
                        data={data}
                        cols={cols.current}
                    /></div>
                    // </Container>
            //);
      /*   }
        else {
            resp = resp.concat(
                <Container fluid><NewTablememo key="NewTable1" set_search_data={cb}
                    data={data}
                    cols={cols.current}
                /></Container>
            ); */
        // }
        return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);

const NewChartmemo = React.memo(NewChart);
const NewTablememo = React.memo(NewTable);