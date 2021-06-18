import { ListView } from 'antd-mobile';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import { findmatchintable } from './filtermatches';
import NewChart from './NewChart';

const App = props => {
    let listData = useRef({
        pageIndex: 0,
        txIndex: 0,
        dataBlobs: {},
        sectionsIDs: [],
        rowIDs: []
    });

    const genData = (tx, pIndex = 0) => {
        if(props.genData) {
            return props.genData(listData,tx,pIndex);
        } else {
            const genData2 = (getSectionID, getRowID) => {
                (rows, pIndex = 0) => {
                    let NUM_SECTIONS = 25;
                    let sectionIndex = -1;
                    let rowIndex = listData.current.txIndex;
                    let ii;
                    let currentID;
                    let prevID;

                    while (sectionIndex < NUM_SECTIONS) {
                        if (rowIndex >= rows.length) {
                            break;
                        }

                        currentID = getSectionID(rows[rowIndex]);
                        if (currentID != prevID) {
                            sectionIndex++;
                            if (sectionIndex >= NUM_SECTIONS) {
                                break;
                            }
                            const sectionName = currentID;
                            listData.current.sectionIDs.push(sectionName);
                            prevID = currentID;
                            listData.current.dataBlobs[sectionName] = [];
                            ii = sectionIndex + (NUM_SECTIONS * pIndex);
                            listData.current.rowIDs[ii] = [];
                        }
                        const rowID = getRowID(rows[rowIndex]);
                        listData.current.rowIDs[ii].push(rowID);
                        listData.current.dataBlobs[rowID] = rows[rowIndex];
                        listData.current.dataBlobs[currentID].push(rows[rowIndex]);
                        rowIndex++;
                    }

                    listData.current.txIndex = rowIndex;

                    listData.current.sectionIDs = [...listData.current.sectionIDs];
                    listData.current.rowIDs = [...listData.current.rowIDs];
                }
            }
            return genData2(props.getSectionID?props.getSectionID:e => e.date,props.getRowID?props.getRowID:e => e.id)(tx,pIndex);
        }
    }

    const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
    const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

    const [dataSource, setDataSource] = useState(new ListView.DataSource({
        getRowData,
        getSectionHeaderData: getSectionData,
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }));

    const [isLoading, setLoading] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState();
    const [saved_query, setSavedQuery] = useState();
    const [calcCharts, setCharts] = useState();

    const [sortDir, setSortDir] = useState(1);

    const lv = useRef();

    const handleInput = useCallback((e) => {
        console.log("setting" + e.target.value);
        setSearchQuery(e.target.value);
    });

    useEffect(() => {
        if (props.data.length) {
            setFilteredData(props.data);
        }
    }, [props.data]);

    useEffect(() => {
        listData.current.dataBlobs = {};
        listData.current.sectionIDs = [];
        listData.current.rowIDs = [];
        listData.current.pageIndex = 0;
        listData.current.txIndex = 0;
        // let data = filteredData.sort((a,b)=>(new Date(b["date"]).getTime() - new Date(a["date"]).getTime())*(sortDir?1:-1));
        let data = filteredData.sort((a,b)=>props.sort(a,b)*(sortDir?1:-1));
        genData(data);
        let newData = dataSource.cloneWithRowsAndSections(listData.current.dataBlobs, listData.current.sectionIDs, listData.current.rowIDs);
        setDataSource(newData);
        setLoading(0);
    }, [filteredData, sortDir]);

    useEffect(() => {
        if (props.data?.length > 0 && searchQuery) {
            let columns = Object.keys(props.data[0]).map((element) => { return { name: element, display: "true" } });
            let { rows_matched2, query } = findmatchintable(searchQuery, props.data, columns, props.col_amount, 0);
            console.log("rows matched" + rows_matched2?.length);
            setSavedQuery(query);
            setFilteredData(rows_matched2);
            console.log("setting data2");
        } else if (props.data?.length > 0 && !searchQuery) {
            setFilteredData(props.data.slice());
            setCharts();
        }
    }, [props.data, searchQuery]);

    useEffect(() => {
        if(!props.minimal) {
        let acc_result = saved_query?.acc_result;
        if (acc_result) {
            let charts = [];
            if (!props.customRender) {
                for (let acc of acc_result) {
                    const type = acc.type;
                    if (type == "total") {
                        let result = acc.result;
                        let chart_data = Object.keys(result).map(e => {
                            return { x: e, y: Math.abs(result[e]) }
                        });
                        chart_data.sort((a, b) => b.y - a.y);
                        let chart = <Newchartmemo key={"NewChartAccResult" + acc.name + acc.type} data={chart_data} type="pie" height={props.height} {...props.chartProps} />
                        charts.push(chart);
                    } else {
                        let result = acc.result;
                        let chart_data = [];
                        let categories_total = {};
                        let date_total = {}
                        let dates = Object.keys(result).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                        if (acc.periods_to_show != 0) {
                            dates = dates.slice(-acc.periods_to_show);
                        }
                        for (let date_key of dates) {
                            let obj = result[date_key];
                            let sum = 0;
                            for (let [key, value] of Object.entries(obj)) {
                                categories_total[key] = (categories_total[key] || 0) + value * acc.multiply_sign;
                                sum = sum + value * acc.multiply_sign;
                            }
                            date_total[date_key] = sum;
                        }
                        let group = 1;
                        let num_to_show = 10;
                        let category_arr;
                        if (group && dates.length > 0) {
                            if (group == 1) {
                                category_arr = Object.entries(categories_total).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, num_to_show);
                            } else if (group == 2) {
                                category_arr = Object.entries(result[dates[dates.length - 1]]).sort((a, b) => (Math.abs(b?.[1]) - Math.abs(a?.[1]))).slice(0, num_to_show);
                            }
                        }
                        let chart_data_other = []
                        for (let date_key of dates) {
                            let obj = result[date_key];
                            let other = 0;
                            for (let [key, value] of Object.entries(obj)) {
                                let data = { x: date_key, y: value * acc.multiply_sign, category: key, x_total: date_total, category_total: categories_total };
                                if (!group) {
                                    chart_data.push(data);
                                } else {
                                    if (category_arr?.find(e => e[0] == key)) {
                                        chart_data.push(data);
                                    } else {
                                        other += data.y;
                                    }
                                }
                                //categories_total[key] = (categories_total[key] || 0) + value*acc.multiply_sign;
                            }
                            if (group && other) {
                                chart_data_other.push({ x: date_key, y: other, category: "Other", x_total: date_total })
                            }
                        }
                        if (dates.length > 0) {
                            if (group != 2) {
                                chart_data.sort((a, b) => (Math.abs(categories_total[a.category]) - Math.abs(categories_total[b.category])));
                            } else if (group == 2) {
                                chart_data.sort((a, b) => (Math.abs(result[dates[dates.length - 1]][a.category]) - Math.abs(result[dates[dates.length - 1]][b.category])));
                            }
                            chart_data = chart_data_other.concat(chart_data);

                            var annotations;
                            if(props.getAnnotation) {
                                annotations = props.getAnnotation(dates, acc, chart_data);
                            }
                            let chart = <Newchartmemo key={"NewChartAccResult" + acc.name + acc.type} data={chart_data} type="column" isStack legend={{position: "right"}} height={props.height} annotations={annotations} {...props.chartProps} />
                            charts.push(chart);
                        }
                    }
                }
            } else {
                let data = props.customRender(acc_result);
                charts = data.map(e=><Newchartmemo key={"NewChartAccResultCustom"} data={e.data} {...e.chartProps} height={props.height}/>);
            }
            setCharts(charts);
        }
    }
    }, [saved_query, props.height]);

    const onEndReached = (event) => {
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (isLoading /* && !hasMore */ || listData.current.txIndex == filteredData.length) {
            return;
        }
        console.log('reach end', event);
        setLoading(1);
        genData(filteredData, ++listData.current.pageIndex);
        let newData = dataSource.cloneWithRowsAndSections(listData.current.dataBlobs, listData.current.sectionIDs, listData.current.rowIDs);
        setDataSource(newData)
        setLoading(0);
    }

    const separator = (sectionID, rowID) => (
        <div
            key={`${sectionID}-${rowID}`}
            style={{
                backgroundColor: '#F5F5F9',
                height: 1,
                borderTop: '0.5px solid #ECECED',
                // borderBottom: '0.5px solid #ECECED',
            }}
        />
    );

    const updateValue = (row,value,column) => {
        let filteredData2 = filteredData.slice();
        let rowdata = filteredData2.find(props.find(row));
        if(rowdata) {
            rowdata[column] = value;       
            listData.current.dataBlobs[rowdata.id] = JSON.parse(JSON.stringify(row));       
            setFilteredData(filteredData2);
        }
    }

    const row = props.rowRender;

    return (
        <div>
            <div>
                <input
                    type='text'
                    name='Search'
                    value={searchQuery}
                    onChange={handleInput}
                    className={"input-range"}
                    style={{ marginBottom: 5, display: props.search ? "inline" : "none" }}
                />
                {props.headerComponents?props.headerComponents:""}
            </div>
            <div style={{ margin: "0 0 10px 0" }}>
                {calcCharts ? calcCharts : ""}
            </div>
            
                {props.modal? props.modal(updateValue) : ""}
            
            <ListView
                ref={el => lv.current = el}
                dataSource={dataSource}
                className="am-list sticky-list"
                useBodyScroll
                renderSectionWrapper={sectionID => (
                    <StickyContainer
                        key={`s_${sectionID}_c`}
                        className="sticky-container"
                        style={{ zIndex: 4 }}
                    />
                )}
                renderSectionHeader={sectionData => (
                    <Sticky>
                        {props.renderSectionHeader(sectionData)}
                    </Sticky>
                )}
                renderHeader={props.renderHeader(sortDir,setSortDir,filteredData)
                }
                renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                    {isLoading ? 'Loading...' : 'Loaded'}
                </div>)}
                renderRow={row}
                renderSeparator={separator}
                pageSize={20}
                onScroll={() => { console.log('scroll'); }}
                scrollEventThrottle={200}
                onEndReached={onEndReached}
                onEndReachedThreshold={10}
            />
        </div>
    );
}

export default App;

let Newchartmemo = React.memo(NewChart);