import React, { useState, useEffect } from 'react';

import { Container, Tab, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

import * as IG from "../helpers/IGClient.js";
import { IGAccount } from "../helpers/IGAccount.ts";
import * as Pocketsmith from "../helpers/Pocketsmith.js"
import "../helpers/utils.js"

import Table3 from "../components/table/Table3";
import Table4 from "../components/table/Table4";
import TableIG from "../components/table/TableIG";
import TableIG2 from "../components/table/TableIG2";
import TableIG3 from "../components/table/TableIG3";
import TableIG4 from "../components/table/TableIG4";
import TablePx1 from "../components/table/TablePx1";
import TablePx2 from "../components/table/TablePx2";
import TablePx3 from "../components/table/TablePx3";
import TableIGNew from "../components/table/TableIGNew";
import TablePxAcc from "../components/table/TablePxAcc";
import TablePx4 from "../components/table/TablePx4"
import TableIG31 from "../components/table/TableIG3_1.tsx"

const offlineMode = 1;

const Dashboard = (props) => {
    // const [data, setData] = useState([]);
    const [datatx, setDatatx] = useState([]);
    const [Px, setPx] = useState();
    const [fetch, setFetch] = useState(0);

    const [acc, setAcc] = useState();
    const [accCfd, setAccCfd] = useState();
    const [accShd, setAccShd] = useState();
    // const [calc, setCalc] = useState([]);
    // const [chart, setChart] = useState([]);
    // const [chart2, setChart2] = useState([]);
    // const [positions, setPositions] = useState({});
    const [dataLoaded, setDataLoaded] = useState(0);
    const [dataLoadedCfd, setDataLoadedCfd] = useState(0);
    const [dataLoadedShd, setDataLoadedShd] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!fetch) {
                console.log('-------------- Begin ----------------')
                IG.downloadactivity(0, offlineMode).then((igdata) => {
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

    const panes = [
        {
            menuItem: 'Pricing',
            pane: {
                content: (<TableIGNew acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 10'
            }
        },
        {
            menuItem: 'Pricing2',
            pane: {
                content: (<TableIGNew acc={accShd} dataLoaded={dataLoadedShd} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 18'
            }
        },
        {
            menuItem: 'Spending',
            pane: {
                content: (<TablePx2 data={datatx} searchQuery="acc:amount:-m:12 acc:category.title:-m:12 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card” category.title!=taxes" />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 8'
            }
        },
        {
            menuItem: 'Overview',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */ acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 1'
            }
        },
        {
            menuItem: 'Overview2',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */ acc={accCfd} dataLoaded={dataLoadedCfd} col="overall_total_pnl_base_ccy_2" pnl />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 13'
            }
        },
        {
            menuItem: 'Overview3',
            pane: {
                content: (<Table3 /* data={data} fetch={fetch} calc={calc}  */ acc={accShd} dataLoaded={dataLoadedShd} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 15'
            }
        },
        {
            menuItem: 'IG Chart',
            pane: {
                content: (<TableIG31 /* data={positions} fetch={fetch} calc={[]}  */ acc={accCfd} dataLoaded={dataLoadedCfd} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 14'
            }
        },
        {
            menuItem: 'IG Price Charts',
            pane: {
                content: (<TableIG4 /* data={positions} fetch={fetch} calc={[]}  */ acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 5'
            }
        },
        {
            menuItem: 'IG Price Charts2',
            pane: {
                content: (<TableIG4 /* data={positions} fetch={fetch} calc={[]}  */ acc={accShd} dataLoaded={dataLoadedShd} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 16'
            }
        },
        {
            menuItem: 'IG Price Overview',
            pane: {
                content: (<TableIG3 /* data={positions} fetch={fetch} calc={[]}  */ acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 4'
            }
        },
        {
            menuItem: 'IG ISA',
            pane: {
                content: (<TableIG /* data={chart} fetch={fetch} calc={[]}  */ acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 2'
            }
        },
        {
            menuItem: 'IG ISA2',
            pane: {
                content: (<TableIG /* data={chart} fetch={fetch} calc={[]}  */ acc={accShd} dataLoaded={dataLoadedShd} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 17'
            }
        },
        {
            menuItem: 'IG ISA Breakdown',
            pane: {
                content: (<TableIG2 /* data={chart2} fetch={fetch} calc={[]} */ acc={acc} dataLoaded={dataLoaded} />),
                style: { marginTop: 0, marginBottom: 0/* ,minWidth:1000 */ },
                attached: false,
                key: 'Tab 3'
            }
        },
        {
            menuItem: 'TX Summary',
            pane: {
                content: (<TablePxAcc Px={Px} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 11'
            }
        },
        {
            menuItem: 'TX Category',
            pane: {
                content: (<TablePx1 data={datatx} searchQuery="acc:amount:-m:12 acc:category.title:-m:12 category.title!=transfer category.title!=sal category.title!=inc category.title!=“credit card” category.title!=taxes" />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 7'
            }
        },
        {
            menuItem: 'TX Search',
            pane: {
                content: (<Table4 data={datatx} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 6'
            }
        },
        {
            menuItem: 'TX List',
            pane: {
                content: (<TablePx4 data={datatx} />),
                style: { marginTop: 0, marginBottom: 0 },
                attached: false,
                key: 'Tab 12'
            }
        }
    ]

    let dropdownOptions = [];

    for (let i = 0; i < panes.length; i++) {
        dropdownOptions.push({ key: panes[i].pane.key, text: panes[i].menuItem, value: i })
    }

    const [currentTab, setTab] = useState(0);

    const onChange = (e, data) => {
        setTab("value" in data ? data.value : data.activeIndex);
    }

    return (
        <>
            <Container fluid style={{ padding: "0 6px 0 6px" }}>
                {<Dropdown
                    fluid
                    selection
                    options={dropdownOptions}
                    onChange={onChange}
                    style={{ margin: "0 0 10px 0" }}
                    className="mobile-visible"
                    value={currentTab}
                />}
                <Tab menu={{ fluid: true, vertical: true, secondary: true, pointing: true, className: "desktop-visible" }} panes={panes} onTabChange={onChange} activeIndex={currentTab} renderActiveOnly={false} grid={{ paneWidth: 14, tabWidth: 2, className: "hi" }} />
            </Container>
        </>

    )
}

export default Dashboard