import React, { useState, useEffect, useRef } from 'react'
import * as AntChart from '@ant-design/charts';
import { formatDate, useBreakpoints } from "./utils"

const NewChart = props => {

    var data = props.data;
    var calc = props.calc ?? [];
    var type = props.type ?? "column";
    const ref = useRef();
    var setSliderData = props.setSliderData;
    var slider = props.slider;
    //var redraw = props.redraw;
    /* var setRedraw = props.setRedraw; */
    var setSliderData2 = props.setSliderData2;
    var sliderdata2 = props.sliderdata2?.current;

    const formatter_commas = function (v) {
        return ''.concat(v).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
            return ''.concat(s, ',');
        });
    }

    const formatfunc = (datum) => { return datum.x+"\n"+formatter_commas(datum.y.toFixed(0)) };

    const {isSs, isXs, isSm, isMd, isLg, active} = useBreakpoints();
    const divider=(isSs || isXs)?1.5:1;

    var config = {
        data: data.concat(calc),
        width: "100%",
        height: props.height ?? 400,
        autoFit: true,
        xField: 'x',
        yField: 'y',
        ...(type == "pie" && { 
            colorField: 'x', 
            angleField: 'y', 
            label: { 
                type: "outer",
                labelHeight: 28, 
                formatter: formatfunc,
                content: (...args) => {
                    if(args[0].percent>0.01)
                    return args[0].x+"\n"+formatter_commas(args[0].y.toFixed(0))+" / "+(args[0].percent*100).toFixed(0)+"%";
                }
            },
            ...(!props.legend && {
                legend: {layout: 'vertical',
                position: 'right',
              }}),
              radius:(isSs||isXs)?0.5:0.9,
              innerRadius:(isSs||isXs)?0.6:0.6,
              statistic: props.statistic??false
        }),
        // label: {
        //     position: 'center',
        //     style: {
        //         fill: '#000000',
        //         opacity: 1.0,
        //     },
        //     //offset: -10,
        //     formatter: ({ y }) => `${(y).toFixed(1)}`
        // },
        // animation: {
        //     appear: {
        //         animation: 'path-in',
        //         duration: 0,
        //     },
        // },
        animation: false,
        title: { visible: true, text: "long chart title" },
        animate: false,
        xAxis: {
            type: "timeCat",
            nice: true,
            //tickMethod: "time-cat",
            label: {
                formatter: function formatter(v) {
                    return formatDate(new Date(v));
                }
            }
        },
        yAxis: {
            nice: true,
            tickMethod: "d3-linear",
            label: {
                formatter: function formatter(v) {
                    return ''.concat(v).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                        return ''.concat(s, ',');
                    });
                }
            }
        },
        padding: "auto",
        renderer: "canvas",
        tooltip: {
            fields: type!="pie"?['category', 'y']:['x','y'],
            formatter: (datum) => { 
                return { name: type!="pie"?datum.category:datum.x, value: datum.y?.toFixed(1) } 
            },
            ...(props.enterable && {enterable: true}),
            // showContent: true,
            customContent: (title, items) => {
                // var values = []
                // for(var i of Object.keys(items)) {
                //    values.push({name:items[i].data.category, value:items[i].data.y});
                // }
                items = items.sort((a, b) => b.value - a.value);
                //var str = values.map((element)=>{return element.name+": "+element.value.toFixed(0)+"\n"});
                //return `<pre>${str}</pre>`;

                var formatter = function (v) {
                    return ''.concat(v).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                        return ''.concat(s, ',');
                    })
                };


                return (
                    <>
                        <h5 style={{ marginTop: 16 }}>{type!="pie"?title:""}</h5>
                        <ul style={{ paddingLeft: 0 }}>
                            {items?.map((item, index) => {
                                const { name, value, color } = item;
                                var value2 = formatter(item.data.y?.toFixed(0));
                                return (
                                    <li
                                        key={"key "+name+index}
                                        className="g2-tooltip-list-item"
                                        data-index={index}
                                        style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}
                                    >
                                        <span className="g2-tooltip-marker" style={{ backgroundColor: color }}></span>
                                        <span
                                            style={{ display: 'inline-flex', flex: 1, justifyContent: 'space-between' }}
                                        >
                                            <span style={{ marginRight: 16 }}>{name}:</span>
                                            <span className="g2-tooltip-list-item-value">{value2}</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                );
            },
        },
    };

    if (props.yAxis) {
        config.yAxis = { /* min: props.yAxis.min, max: props.yAxis.max,  */...config.yAxis, ...props.yAxis }
        if (props.yAxis.tickInterval) {
            config.yAxis.tickInterval = props.yAxis.tickInterval;
        }
    }

    if(props.label) {
        config.label = props.label;
    }

    if (props.xAxis) {
        config.xAxis = { ...config.xAxis, ...props.xAxis }
        if(props.xAxis.label && typeof(props.xAxis.label) == 'object') {
            // console.log(props.xAxis.label);
            config.xAxis.label = {...props.xAxis.label, style:(isXs||isSs)?{fontSize:10}:{}};
            config.yAxis = {...props.yAxis, label:{...config.yAxis?.label, style:(isXs||isSs)?{fontSize:10}:{}}};
            config.label = {...config.label, offset:(isXs||isSs)?5:5, /* autoRotate:false, */ style:{...config.label?.style, ...((isXs||isSs)&&{fontSize:10})}}
            // console.log("edit")
            // console.log(config.xAxis.label);
        }
    }

    if (config.data.length > 0 && "category" in config.data[0]) {
        config.seriesField = "category"
    }

    if (props.annotations) {
        config.annotations = props.annotations;
        config.appendPadding = [0, (props.appendPaddingRight ?? 30)/divider, 0, 0];
    }

    if (props.appendPadding) {
        if (typeof props.appendPadding == "number") {
            config.appendPadding = props.appendPadding / divider;
        } else if (Array.isArray(props.appendPadding)) {
            config.appendPadding = props.appendPadding.map(e => e / divider);
        }
    }

    if(props.isStack) {
        config.isStack = props.isStack;
    }

    if(props.smooth) {
        config.smooth = props.smooth;
    }
    
    if ("legend" in props) {
        config.legend = props.legend;
        if(props.legend) {
            if("position" in props.legend) {
                props.legend.position=(isSs || isXs)?"bottom":"right"
                props.legend.layout=(isSs || isXs)?"horizontal":"vertical"
            }
        }
    }

    if (props.colors) {
        config.theme = { colors20: props.colors.colorpalette };
        config.color = ({ category }) => {
            return props.colors.colormapping[category];
        }
        config.colorField = config.seriesField
    }

    if (props.setcolor) {
        config.color = props.setcolor;
    }

    if (props.interactions) {
        config.interactions = props.interactions;
    }

    if (props.slider) {
        //console.log("redraw"+redraw);
        console.log("sliderdata"+sliderdata2);

        if (/* redraw == 0 || */ sliderdata2==0) {
            config.slider = {
                start: 0.8,
                end: 1.0,
            }
        }

        if (ref.current) {
            let slider = ref.current.chart.controllers.find((e) => e.name == 'slider');
            if (slider) {
                if(slider.slider) {
                let min = slider.slider.component.cfg.minText;
                let max = slider.slider.component.cfg.maxText;
                console.log("min2" + min + "max2" + max)
                // setSliderData.current.min = min;
                // setSliderData.current.max = max;
                let closest = (list, x) => {
                    let list2 = list.map((e) => { return new Date(e.x).getTime() });
                    let x2 = new Date(x).getTime();
                    let min,
                        chosen = 0;
                    for (var i in list2) {
                        min = Math.abs(list2[chosen] - x2);
                        if (Math.abs(list2[i] - x2) < min) {
                            chosen = i;
                        }
                    }
                    return chosen;
                }

                // var found1 = closest(config.data, setSliderData.current.min);
                // var found2 = closest(config.data, setSliderData.current.max);

                var found1 = closest(config.data, min);
                var found2 = closest(config.data, max);

                console.log("new f10 " + min);
                console.log("new f20 " + max);

                console.log("new f1 " + found1);
                console.log("new f2 " + found2);

                console.log("new f11 " + found1 / (config.data.length - 1));
                console.log("new f22 " + found2 / (config.data.length - 1));

                let new_start = isNaN(found1 / (config.data.length - 1))?0:found1 / (config.data.length - 1);
                let new_end = (isNaN(found2 / (config.data.length - 1)) || found2 == 0)?1:found2 / (config.data.length - 1);

                console.log(new_start);
                console.log(new_end);

                if(new_start==new_end) {
                    new_start = 0;
                    new_end = 1;
                }

                config.slider = {
                    start: new_start,
                    end: new_end,
                }}
            }

        // if ("min" in setSliderData.current && redraw == 1) {
        //     if (setSliderData.current.min && setSliderData.current.max) {
            //if(sliderdata2 /* && redraw==1 */) {
                // var found1 = config.data.findIndex((e) => e.x == setSliderData.current.min)
                // var found2 = config.data.findIndex((e) => e.x == setSliderData.current.max);

                // const closest = (list, x) => {
                //     let list2 = list.map((e) => { return new Date(e.x).getTime() });
                //     let x2 = new Date(x).getTime();
                //     var min,
                //         chosen = 0;
                //     for (var i in list2) {
                //         min = Math.abs(list2[chosen] - x2);
                //         if (Math.abs(list2[i] - x2) < min) {
                //             chosen = i;
                //         }
                //     }
                //     return chosen;
                // }

                // // var found1 = closest(config.data, setSliderData.current.min);
                // // var found2 = closest(config.data, setSliderData.current.max);

                // var found1 = closest(config.data, sliderdata2.min);
                // var found2 = closest(config.data, sliderdata2.max);

                // console.log("f10 " + sliderdata2.min);
                // console.log("f20 " + sliderdata2.max);

                // console.log("f1 " + found1);
                // console.log("f2 " + found2);

                // console.log("f11 " + found1 / (config.data.length - 1));
                // console.log("f22 " + found2 / (config.data.length - 1));

                // config.slider = {
                //     start: found1 / (config.data.length - 1),
                //     end: found2 / (config.data.length - 1),
                // }

                //setRedraw(2);

           // }
        }
    }

    if(props.chartRef) {
        props.chartRef.current = ref.current;
    }

    useEffect(() => {
        if (ref.current) {
            // click point
            ref.current.on('slider:mousemove', (args) => {
                var slider = args.view.controllers.find((e) => e.name == 'slider');
                if (slider) {
                    let min = slider.slider.component.cfg.minText;
                    let max = slider.slider.component.cfg.maxText;
                    console.log("min" + min + "max" + max)
                    // setSliderData.current.min = min;
                    // setSliderData.current.max = max;
                    setSliderData2({ min: min, max: max });
                }
                //console.log(args[0])
            });
            ref.current.on('slider:valuechanged', (args) => {
                var slider = args.view.controllers.find((e) => e.name == 'slider');
                if (slider) {
                    let min = slider.slider.component.cfg.minText;
                    let max = slider.slider.component.cfg.maxText;
                    console.log("min1" + min + "max1" + max)
                    // setSliderData.current.min = min;
                    // setSliderData.current.max = max;
                    setSliderData2({ min: min, max: max });
                }
                //console.log(args[0])
            });
            // ref.current.on('*', (args) => {
            //     if(args.type)
            //     console.log(args.type)
            //     // var slider = args.view.controllers.find((e) => e.name == 'slider');
            //     // if (slider) {
            //     //     let min = slider.slider.component.cfg.minText;
            //     //     let max = slider.slider.component.cfg.maxText;
            //     //     console.log("min1" + min + "max1" + max)
            //     //     // setSliderData.current.min = min;
            //     //     // setSliderData.current.max = max;
            //     //     setSliderData2({ min: min, max: max });
            //     // }
            //     //console.log(args[0])
            // });
            if (props.binding) {
                for (let bind of props.binding) {
                    ref.current.on(bind.event, bind.cb)
                }
            }
        }
        
    
    }, []);

    // console.log("height"+typeof config.height+typeof props.height)

    var chart;
    if (type == "column") {
        chart = <AntChart.Column
            {...config} /* style={{}} */style={{height:props.height??400}}
            chartRef={ref}
        />
    } else if (type == "line") {
        chart = <AntChart.Line
            {...config} /* style={{}} */style={{height:props.height??400}}
            chartRef={ref}
        />
    } else if (type == "pie") {
        chart = <AntChart.Pie {...config} /* style={{}} */style={{height:props.height??400}}
        chartRef={ref}
        />
    }
    return (
        <div>
        <div>{typeof props.title == 'object'? props.title:<h4 style={{ fontWeight: 'normal', margin:"10px 0 10px 0", textAlign:"left", textOverflow:"ellipsis", whiteSpace:"nowrap", overflow:"auto" }}>{("title" in props) && props.title}</h4>}</div>
        <div style={{ height: props.height ?? 400 }}>
            {chart}
        </div></div>
    )
}

export default NewChart
