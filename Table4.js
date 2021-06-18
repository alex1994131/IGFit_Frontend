import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Pocketsmith from "./Pocketsmith.js"
import NewChart from "./NewChart.js"
import NewTable from "./NewTable.js"
import ChartAccResult from "./ChartAccResult.js"
import ChartDataComponent from "./ChartDataComponent.js"
import { updatePocketsmithData } from "./Pocketsmith.js"
import { getCol } from "./utils.js"
import { Dropdown } from './Dropdown';

const App = (props) => {
    //const [data, setData] = useState([{ x: 0, y: 0 }]);
    //const [fetch, setFetch] = useState(0);
    const [searchdata, setSearchData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [transfersOn, setTransfersOn] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [redraw, setRedraw] = useState(0);
    const [redraw2, setRedraw2] = useState(0);
    const [sliderdata2, setSliderData2] = useState(0);
    const [acc_result, setAccResult] = useState();
    const categories = useRef([]);
    const columns = useRef([]);
    const sliderdata = useRef(0);
    const data2 = useRef();
    const setsliderdata = useCallback((e)=>sliderdata.current=e,[]);

    var cb = useCallback((e) => setSliderData(e), []);
    //const getsliderdata = useCallback(() => { return sliderdata2 }, [redraw2]);
    const cb2 = useCallback((e) => { console.log("cb2"); /* setRedraw2(redraw2+1); */ setSearchData(e) }, []);
    // var Newchartmemo = React.memo(NewChart, (before,after) => {
    //                     console.log("before"+JSON.stringify(before));
    //                     console.log("after"+JSON.stringify(after));
    //                     return before == after;
    //                 });
    // var Newchartmemo = React.memo(props=>{return(<NewChart key="NewChart2" data={searchdata} type="column" slider setSliderData={sliderdata} setSliderData2={setSliderData2} sliderdata2={getsliderdata} setRedraw={setRedraw2}
    // />)});
    var handleRadioChange = useCallback((e) => {
        //setTransfersOn(e.target.value === "Transfer"); 
        //setRedraw(1);
        //console.log(e.target.value === "Transfer");
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
        //setRedraw2(1);
    }, [props.data]);

    useEffect(() => {
        if (filteredData.length == 0) {
            setFilteredData(props.data);
            data2.current = props.data
            if (props.data.length>0) {
                let list = {}
                for (let row of props.data) {
                    list[row["category.title"]] = 1;
                }
                categories.current = Object.keys(list);
                columns.current = Object.keys(props.data[0]);
            }
            //console.log(Object.keys(list));
        }
        console.log("on");
    }, [props.data])


    // useEffect(() => {
    //     // if (transfersOn) {
    //         setFilteredData(props.data);
    //     // } else {
    //     //     if (props.data.length > 0) {
    //     //         setFilteredData(props.data.filter(
    //     //             element => element.is_transfer == false
    //     //         ))
    //     //     }
    //     // }
    // });

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (!fetch) {
    //             var tx = await Pocketsmith.fetchAllTransactions();
    //             var data = tx.map((element) => JSON.flatten(element));
    //             setData(data);
    //             setFetch(1);
    //         }
    //     };
    //     fetchData();
    // });

    //var data = props.data;
    // var fetch = props.fetch;

    const cols = useRef({
        x: "date",
        y: "amount_in_base_currency",
        //cols.category = "base_cost";
        show: ["date", "payee", "category.title", "amount_in_base_currency", "closing_balance", "is_transfer", "transaction_account.name", "transaction_account.currency_code"],
        custom: {
            "category.title": {
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (<Dropdown
                        value={value}
                        row={tableMeta.rowData}
                        updateValue={updateValue}
                        dropdown_list={categories.current}
                        update={async (value,row)=>{
                            let id = getCol("id", row, columns.current)
                            let rowdata = props.data.find(e=>e.id==id);
                            rowdata["category.title"] = value;
                            return await updatePocketsmithData(getCol("id", row, columns.current), "category.title", value);
                        }} />)
                }
            },
            "is_transfer": {
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (<Dropdown
                        component='checkbox'
                        value={value}
                        row={tableMeta.rowData}
                        updateValue={updateValue}
                        dropdown_list={[true,false]}
                        label="Transfer"
                        update={async (value,row)=>{
                            let id = getCol("id", row, columns.current)
                            console.log(tableMeta);
                            let rowdata = data2.current.find(e=>e.id==id);
                            rowdata["is_transfer"] = value;
                            return await updatePocketsmithData(getCol("id", row, columns.current), "is_transfer", value);
                            
                        }} />)
                }
            }
        }
    });

    if (filteredData.length > 0) {
        console.log("creating2");
        var resp = "Loading1";
        //if (searchdata.length > 0) {
            //  var Newchartmemo = React.memo(props=>{return(<NewChart key="NewChart2" data={searchdata} type="column" slider setSliderData={sliderdata} setSliderData2={setSliderData2} /* sliderdata2={getsliderdata} */ redraw={redraw2} setRedraw={setRedraw2}
            //         />)});
            resp = (<div>
                        <h3 style={{ margin:"0 0 5px 0"}}>Transactions</h3>
                <input
                    type='radio'
                    name='Transfer'
                    value="Transfer"
                    // checked={activeIndex}
                    defaultChecked={true}
                    onChange={handleRadioChange}
                /> Transfer
                <input
                    type='radio'
                    name='Transfer'
                    value="No Transfer"
                    // checked={activeIndex}
                    onChange={handleRadioChange}
                    style={{ margin: "0 0 10px 10px" }}
                /> No Transfer
                {/* <br /><br /> */}

                <ChartAccResult key="chartAccResult" acc_result={acc_result} style={{margin:"50px 50px 50px 50px"}}/>
                <ChartDataComponent key="chartdata" searchQuery="acc:category.title:m" data={filteredData} style={{margin:"50px 50px 50px 50px"}}/>
                <Newchartmemo key="NewChart212" data={searchdata} type="column" slider /* setSliderData={sliderdata} */ setSliderData2={setsliderdata}  sliderdata2={sliderdata}  /* redraw={redraw2}  *//* setRedraw={setRedraw2} */
                />

<Newtablememo key="NewTable2" set_search_data={cb2}
                    data={filteredData}
                    cols={cols.current}
                    set_acc_result={setAccResult}
                    /* redraw={redraw}
                    setRedraw={setRedraw}
                    setRedraw2={setRedraw2} */
                /></div>)

                return resp
            
        //}
    //     resp =  <Newtablememo key="NewTable2" set_search_data={cb2}
    //     data={filteredData}
    //     cols={cols.current}
    //     /* redraw={redraw}
    //     setRedraw={setRedraw}
    //     setRedraw2={setRedraw2} */
    // />
        //return resp;
    }
    else
        return <>Loading...</>;
};

export default React.memo(App);

const Newchartmemo = React.memo(NewChart);
const Newtablememo = React.memo(NewTable);