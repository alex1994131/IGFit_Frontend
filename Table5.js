import React, { useState, useEffect } from 'react';

import * as IG from "./IGClient.js";
import { IGAccount } from "./IGAccount.ts";
import * as Pocketsmith from "./Pocketsmith.js"
import "./utils.js"

import Table3 from "./Table3";
import Table4 from "./Table4";
import TableIG from "./TableIG";
import TableIG2 from "./TableIG2";
import TableIG3 from "./TableIG3";
import TableIG4 from "./TableIG4";
import TablePx1 from "./TablePx1";
import TablePx2 from "./TablePx2";
import TablePx3 from "./TablePx3";
import TableIGNew from "./TableIGNew";
import TablePxAcc from "./TablePxAcc";
import TablePx4 from "./TablePx4"
import TableIG31 from "./TableIG3_1.tsx"
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
// import 'react-tabs/style/react-tabs.css';

import { Tab, Dropdown } from 'semantic-ui-react'
//import 'semantic-ui-css/semantic.min.css'
//import './styles.css'

import 'semantic-ui-less/semantic.less'

import { Container, Header, List, Divider } from "semantic-ui-react";

const offlineMode = 1;


const Table5 = props => {
    // const [data, setData] = useState([]);
    const [datatx, setDatatx] = useState([]);
    const [Px, setPx] = useState();
    const [fetch, setFetch] = useState(0);

    const [acc, setAcc] = useState();
    const [accCfd, setAccCfd] = useState();
    const [accShd, setAccShd] = useState();
    /* const [calc, setCalc] = useState([]);
    const [chart, setChart] = useState([]);
    const [chart2, setChart2] = useState([]);
    const [positions, setPositions] = useState({}); */
    const [dataLoaded, setDataLoaded] = useState(0);
    const [dataLoadedCfd, setDataLoadedCfd] = useState(0);
    const [dataLoadedShd, setDataLoadedShd] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                IG.downloadactivity(0,offlineMode).then((igdata) => {
                    var csvdata2 = igdata;
                    var acc2 = new IGAccount(csvdata2.ISA.trades, "ISA", offlineMode, /* setData, setCalc, setChart, setChart2, setPositions, */ setDataLoaded);
                    if (!offlineMode) {
                        var acc3 = new IGAccount(csvdata2.CFD.activity, "CFD", offlineMode, /* setData, setCalc, setChart, setChart2, setPositions, */ setDataLoadedCfd);
                        var acc4 = new IGAccount(csvdata2.SHD.trades, "SHD", offlineMode, /* setData, setCalc, setChart, setChart2, setPositions, */ setDataLoadedShd);
                    } else {
                        var acc3 = acc2;
                        var acc4 = acc2;
                    }
                    setAcc(acc2);
                    // setAccCfd(acc3);
                    // setAccShd(acc4);
                    //setDataLoaded(1);
                });
                Pocketsmith.fetchAllTransactions(offlineMode).then((tx) => {
                    var data = tx.map((element) => JSON.flatten(element));
                    setDatatx(data);
                    setPx(new Pocketsmith.Px(data));
                });
                setFetch(1);
            }
        };
        fetchData();
    });

    return (
        // <Table4 data={datatx} />
        <>
        <Container fluid style={{ padding: "20px 20px 0 20px" }}>
            <Header as="h3">Dashboard ({new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: '2-digit'})})</Header>
            <List bulleted>
                <List.Item>
                    IG
                    </List.Item>
                <List.Item>
                    TX
                    </List.Item>
            </List>
            </Container>
            <Divider/>
            <Container fluid style={{ padding: "0 6px 0 6px" }}>
            { Tab2(/* data,  */fetch, /* calc, */ datatx, /* chart, chart2, positions, */ acc, dataLoaded, Px, accCfd, dataLoadedCfd, accShd, dataLoadedShd) }
            </Container>
        </>

    )
}

export default Table5

// function Tab1(data, fetch, calc, datatx) {
//     return <Tabs forceRenderTabPanel>
//         <TabList>
//             <Tab>ST</Tab>
//             <Tab>TX</Tab>
//         </TabList>

//         <TabPanel>
//             <Table3 data={data} fetch={fetch} calc={calc} />
//         </TabPanel>
//         <TabPanel>
//             <Table4 data={datatx} fetch={fetch} />
//         </TabPanel>
//     </Tabs>;
// }

const Tab2 = (/* data,  */fetch, /* calc,  */datatx, /* chart, chart2, positions, */ acc, dataLoaded, Px, accCfd, dataLoadedCfd, accShd, dataLoadedShd) => {

    const panes = [
        {
            menuItem: 'Pricing',
            pane: {
                content: (<TableIGNew acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 10'
            }
        },
        {
            menuItem: 'Pricing2',
            pane: {
                content: (<TableIGNew acc={accShd} dataLoaded={dataLoadedShd}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 18'
            }
        },
        {
            menuItem: 'Spending',
            pane: {
                content: (<TablePx2 data={datatx} searchQuery="acc:amount:-m:12 acc:category.title:-m:12 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card” category.title!=taxes" />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 8'
            }
        },
        {
            menuItem: 'Overview',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 1'
            }
        },
        {
            menuItem: 'Overview2',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */acc={accCfd} dataLoaded={dataLoadedCfd} col="overall_total_pnl_base_ccy_2" pnl />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 13'
            }
        },
        {
            menuItem: 'Overview3',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */acc={accShd} dataLoaded={dataLoadedShd}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 15'
            }
        },
        {
            menuItem: 'IG Chart',
            pane: {
                content: (<TableIG31 /* data={positions} fetch={fetch} calc={[]}  */acc={accCfd} dataLoaded={dataLoadedCfd}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 14'
            }
        },
        {
            menuItem: 'IG Price Charts',
            pane: {
                content: (<TableIG4 /* data={positions} fetch={fetch} calc={[]}  */acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 5'
            }
        },
        {
            menuItem: 'IG Price Charts2',
            pane: {
                content: (<TableIG4 /* data={positions} fetch={fetch} calc={[]}  */acc={accShd} dataLoaded={dataLoadedShd}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 16'
            }
        },
        {
            menuItem: 'IG Price Overview',
            pane: {
                content: (<TableIG3 /* data={positions} fetch={fetch} calc={[]}  */acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 4'
            }
        },
        {
            menuItem: 'IG ISA',
            pane: {
                content: (<TableIG /* data={chart} fetch={fetch} calc={[]}  */acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 2'
            }
        },
        {
            menuItem: 'IG ISA2',
            pane: {
                content: (<TableIG /* data={chart} fetch={fetch} calc={[]}  */acc={accShd} dataLoaded={dataLoadedShd}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 17'
            }
        },
        {
            menuItem: 'IG ISA Breakdown',
            pane: {
                content: (<TableIG2 /* data={chart2} fetch={fetch} calc={[]} */ acc={acc} dataLoaded={dataLoaded}/>),
                style: {marginTop:0,marginBottom:0/* ,minWidth:1000 */},
                attached: false,
                key: 'Tab 3'
            }
        },
        {
            menuItem: 'TX Summary',
            pane: {
                content: (<TablePxAcc Px={Px}/>),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 11'
            }
        },
        {
            menuItem: 'TX Category',
            pane: {
                content: (<TablePx1 data={datatx} searchQuery="acc:amount:-m:12 acc:category.title:-m:12 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card” category.title!=taxes" />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 7'
            }
        },
            
             
        /* {
            menuItem: 'Tab 9',
            pane: {
                content: (<TablePx3 data={datatx} searchQuery="acc:amount:-m:12 acc:category.title:-m:12 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card” category.title!=taxes" />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 9'
            }
        }, */
       
        
        {
            menuItem: 'TX Search',
            pane: {
                content: (<Table4 data={datatx} />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 6'
            }
        },
        {
            menuItem: 'TX List',
            pane: {
                content: (<TablePx4 data={datatx} />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 12'
            }
        },
       /*  {
            menuItem: 'Test',
            pane: {
                content: (<TablePx3 data={datatx} />),
                style: {marginTop:0,marginBottom:0},
                attached: false,
                key: 'Tab 6'
            }
        }, */
    ]

    //const dropdownOptions = [1,2,3,4,5,6,7,8,9,10].map(e=>{return {key: panes[e-1].pane.key, text: panes[e-1].menuItem, value:(e-1)}});

    let dropdownOptions = [];

    for(let i=0;i<panes.length;i++) {
        dropdownOptions.push({key: panes[i].pane.key, text: panes[i].menuItem, value:i})
    }

       const [currentTab, setTab] = useState(0);

    const onChange = (e,data) => {
        setTab("value" in data?data.value:data.activeIndex);
        console.log("value" in data?data.value:data.activeIndex);
    }

    return ( 
    <>
    {<Dropdown
        // defaultValue={0}
        fluid
        selection
        options={dropdownOptions}
        onChange={onChange}
        style={{margin:"0 0 10px 0"}}
        className="mobile-visible"
        value={currentTab}
      />}
      <Tab menu={{ fluid: true, vertical: true, secondary: true, pointing: true, className:"desktop-visible" }} panes={panes} onTabChange={onChange} activeIndex={currentTab} renderActiveOnly={false} grid={{ paneWidth: 14, tabWidth: 2, className: "hi" }}/>
      </>
    )
}