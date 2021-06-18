import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Pocketsmith from "./Pocketsmith.js"
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import ChartAccResult from "./ChartAccResult.js"
import ChartDataComponent from "./ChartDataComponent.js"

const App = (props) => {
    const [searchdata, setSearchData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [transfersOn, setTransfersOn] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [redraw, setRedraw] = useState(0);
    const [redraw2, setRedraw2] = useState(0);
    const [sliderdata2, setSliderData2] = useState(0);
    const [acc_result, setAccResult] = useState();
    const sliderdata = useRef(0);
    const setsliderdata = useCallback((e)=>sliderdata.current=e,[]);
    const [cols, setCols] = useState();

    var cb = useCallback((e) => setSliderData(e), []);
    const cb2 = useCallback((e) => { console.log("cb2"); setSearchData(e) }, []);
    //var cols;
   
    var handleRadioChange = useCallback((e) => {
       
        if (e.target.value === "Transfer") {
            setFilteredData(props.data);
            console.log("setting transfers");
        } else {
            if (props.data.length > 0) {
                setFilteredData(props.data.filter(
                    element => { return ((element.is_transfer == false) || (!element.is_transfer)) }
                ))
            }
            console.log("setting no transfers");
        }
        
    }, [props.Px]);

    useEffect(() => {
        if (props.Px) {
            if (filteredData.length == 0) {
                let balances = props.Px.getBalancesAsData();
                setFilteredData(balances);
                let dates = Object.keys(balances[0]).slice(1);
                let months = (()=>{
                    let months = {};
                    dates.forEach(e=>months[e.slice(0,7)]=1);
                    months=Object.keys(months);
                    months = months.map(e=>e+"-01");
                    return months;
                })();
                months = months.filter(e=>dates.indexOf(e)>-1);
                setCols({
                    x: "name",
                    y: "2021-01-01",
                    //cols.category = "base_cost";
                    show: ["name", ...months, dates[dates.length-1]]
                })
            }
            console.log("on");
        }
    }, [props.Px])

    //const cols = {show: Object.keys(props.data?.[0]??{})};
    //var cols;

    // const cols = useRef({
    //     x: "name",
    //     y: "2021-01-01",
    //     //cols.category = "base_cost";
    //     show: filteredData?.length?Object.keys(filteredData[0]):["name"]//["name"]
    // });

    if (filteredData?.length > 0) {
        console.log("creating2");
        var resp = "Loading1";
        //if (searchdata.length > 0) {
            //  var Newchartmemo = React.memo(props=>{return(<NewChart key="NewChart2" data={searchdata} type="column" slider setSliderData={sliderdata} setSliderData2={setSliderData2} /* sliderdata2={getsliderdata} */ redraw={redraw2} setRedraw={setRedraw2}
            //         />)});
            resp = (<div>
                        <h3 style={{ margin:"0 0 5px 0"}}>Accounts Overview</h3>
                        <div style={{margin:"0 0 15px 0"}}/>

     

<Newtablememo key="NewTable2" set_search_data={cb2}
                    data={filteredData}
                    cols={cols}
                    // set_acc_result={setAccResult}
                    /* redraw={redraw}
                    setRedraw={setRedraw}
                    setRedraw2={setRedraw2} */
                    responsive={"standard"}
                />
                </div>)

                return resp
            
      
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);
const Newtablememo = React.memo(NewTable);