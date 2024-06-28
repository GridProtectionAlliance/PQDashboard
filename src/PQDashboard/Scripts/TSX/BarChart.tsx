//******************************************************************************************************
//  BarChart.tsx - Gbtc
//
//  Copyright © 2024, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  03/04/2024 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import moment from 'moment';
import { Plot, Bar, BarGroup } from '@gpa-gemstone/react-graph';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { ReactTable } from '@gpa-gemstone/react-table';
import { PQDashboard } from './global';
import { renderTimeDetailTable } from './DetailTable/TimeDetailTable';

interface IProps {
    SiteID: string,
    StartDate: string,
    EndDate: string,
    Tab: PQDashboard.Tab,
    TimeContext: PQDashboard.TimeContext,
    SetTimeContext: (timeContext: PQDashboard.TimeContext) => void,
    XLimits: [number, number]
    SetXLimits: (limits: [number, number]) => void;
}

interface IGraphData {
    Name: string,
    DataPoints: [number, number][],
    Color: string
}

declare let homePath;

const contexts = ['custom', 'day', 'hour', 'minute', 'second'];

const BarChart = (props: IProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const hoverContainerRef = React.useRef<HTMLDivElement | null>(null);

    const [plotSize, setPlotSize] = React.useState<{ Height: number, Width: number }>({ Height: 0, Width: 0 });
    const [graphData, setGraphData] = React.useState<IGraphData[]>([]);
    const [dataMap, setDataMap] = React.useState<Map<number, any> | null>(null);

    const [yLimits, setYLimits] = React.useState<[number, number]>([0, 0])

    const [hoverPosition, setHoverPosition] = React.useState<React.CSSProperties | null>(null);
    const [hoverTimePoint, setHoverTimePoint] = React.useState<number | null>(null);

    const hoverContent = React.useMemo(() => {
        if (hoverTimePoint == null || dataMap == null) return <></>
        const matchedData = dataMap.get(hoverTimePoint);
        if (matchedData == null) return <></>
        const data: [{ Key: any, Value: any }] = [{ Key: 'Date', Value: getFormattedDate(hoverTimePoint, props.TimeContext) }];
        const keys = Object.keys(matchedData).map(d => d);
        data.push(...keys.map(key => ({ Key: key, Value: matchedData[key] })));
        return (
            <div ref={hoverContainerRef}>
                <ReactTable.Table<{ Key: string, Value: number }>
                    Data={data}
                    SortKey=''
                    Ascending={false}
                    OnSort={() => { }}
                    KeySelector={(row, index) => index ?? -1}
                >
                    <ReactTable.Column<{ Key: string, Value: number }>
                        Key={`Key`}
                        Field={'Key'}
                    >
                        {'\u200B'}
                    </ReactTable.Column>
                    <ReactTable.Column<{ Key: string, Value: number }>
                        Key={`Value`}
                        Field={`Value`}
                        RowStyle={{ textAlign: 'right' }}
                    >
                        {'\u200B'}
                    </ReactTable.Column>
                </ReactTable.Table>
            </div>
        )

    }, [hoverTimePoint, dataMap])


    React.useEffect(() => {
        renderTimeDetailTable(`Detail${props.Tab}`, props.SiteID, getFormattedDate(props.XLimits?.[0], props.TimeContext), props.Tab, props.TimeContext)
    }, [props.TimeContext, props.Tab, props.XLimits, props.SiteID])

    React.useEffect(() => {
        updateUrlParams('context', props.TimeContext)
    }, [props.TimeContext])

    React.useEffect(() => {
        if (props.XLimits == null || props.TimeContext == 'custom')
            props.SetXLimits([moment.utc(_.cloneDeep(props.StartDate)).valueOf(), moment.utc(_.cloneDeep(props.EndDate)).valueOf()]);
    }, [props.StartDate, props.EndDate])

    //This needs to be removed once the Application component is implemented and replaced with a layoutEffect
    React.useEffect(() => {
        if (containerRef.current == null) return;

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);

        handleResize();

        return () => {
            resizeObserver.disconnect();
        };

    }, [containerRef]);

    const handleResize = () => {
        if (containerRef.current == null) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width != plotSize.Width || height != plotSize.Height) {
            if (isFinite(height) && isFinite(width) && !isNaN(height) && !isNaN(width))
                setPlotSize({ Height: height, Width: width })
        }
    };

    React.useEffect(() => {
        if (props.TimeContext === 'second') return;
        let startDate = _.cloneDeep(props.StartDate)
        let endDate = _.cloneDeep(props.EndDate)
        if (props.XLimits != null && props.TimeContext !== 'custom') {
            startDate = getFormattedDate(props.XLimits[0], props.TimeContext);
            endDate = startDate;
        }

        $.ajax({
            type: "POST",
            url: `${homePath}api/${props.Tab}/BarChart`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ siteID: props.SiteID, targetDateFrom: startDate, targetDateTo: endDate, context: props.TimeContext }),
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => {
            if (data !== null) {
                let graphDataArray: IGraphData[] = [];
                let graphDataMap = new Map();

                data.Types.forEach(type => {
                    let dataPoints = type.Data.map(dataPoint => {
                        let date = moment.utc(dataPoint.m_Item1).valueOf();
                        let value = dataPoint.m_Item2;

                        if (!graphDataMap.has(date))
                            graphDataMap.set(date, { Total: 0 });

                        let dateObj = graphDataMap.get(date);
                        dateObj[type.Name] = value;
                        dateObj.Total += value;

                        graphDataMap.set(date, dateObj);

                        return [date, value];
                    });

                    graphDataArray.push({
                        Name: type.Name,
                        DataPoints: dataPoints,
                        Color: type.Color
                    });
                });
                let min = Math.min(...graphDataArray.flatMap(dd => dd.DataPoints.map(d => d[1])));
                let max = Math.max(...Array.from(graphDataMap.values()).map(d => d.Total));

                setYLimits([min, max])
                setDataMap(graphDataMap);
                setGraphData(graphDataArray);
                updateMapHeaderDate(moment.utc(data.StartDate).valueOf(), moment.utc(data.EndDate).valueOf(), props.TimeContext, props.Tab);
            }
        })
    }, [props.SiteID, props.StartDate, props.EndDate, props.Tab, props.TimeContext, props.XLimits]);

    const handleOnClick = (time: number) => {
        if (props.Tab === "Completeness" || props.Tab === "Correctness") {
            let startTime = moment(time).utc().startOf('day').valueOf();
            updateUrlParams('contextDate', getFormattedDate(startTime, 'day'));
            renderTimeDetailTable(`Detail${props.Tab}`, props.SiteID, getFormattedDate(startTime, 'day'), props.Tab, 'day');
            updateMapHeaderDate(startTime, startTime, 'day', props.Tab);
            const startDate = getFormattedDate(startTime, props.TimeContext);

            //Temp function from Default.js to essentially rerender map and grid until they get moved to React Components
            (window as any)?.getLocationsAndPopulateMapAndMatrix(props.Tab, startDate, startDate, '', props.TimeContext);
            return;
        }

        if (props.TimeContext === 'second') {
            const startTime = moment(time).utc().startOf(props.TimeContext).valueOf()
            updateUrlParams('contextDate', getFormattedDate(startTime, startTime));
            (window as any)?.getLocationsAndPopulateMapAndMatrix(props.Tab, getFormattedDate(startTime, props.TimeContext), getFormattedDate(startTime, props.TimeContext), '', props.TimeContext);
            return;
        }

        const newContext = handleTimeContext(true);

        const startTime = moment(time).utc().startOf(newContext === 'custom' ? 'day' : newContext as any).valueOf()
        const endTime = moment(time).utc().endOf(newContext === 'custom' ? 'day' : newContext as any).valueOf()

        updateUrlParams('contextDate', getFormattedDate(startTime, newContext));
        props.SetXLimits([startTime, endTime]);

        const startDate = getFormattedDate(startTime, props.TimeContext);
        const endDate = props.TimeContext !== 'custom' ? startDate : getFormattedDate(endTime, props.TimeContext);

        //Temp function from Default.js to essentially rerender map and grid until they get moved to React Components
        (window as any)?.getLocationsAndPopulateMapAndMatrix(props.Tab, getFormattedDate(startTime, props.TimeContext), endDate, '', props.TimeContext);
    }

    const handleTimeContext = (leftToRight) => {
        if (leftToRight) {
            if (contexts.indexOf(props.TimeContext) < contexts.length - 1) {
                const newContext = contexts[contexts.indexOf(props.TimeContext) + 1] as PQDashboard.TimeContext
                props.SetTimeContext(newContext);
                updateUrlParams('context', newContext)
                return newContext
            }
        }
        else {
            if (contexts.indexOf(props.TimeContext) > 0) {
                const newContext = contexts[contexts.indexOf(props.TimeContext) - 1] as PQDashboard.TimeContext
                props.SetTimeContext(newContext);
                updateUrlParams('context', newContext);

                if (newContext === 'custom')
                    props.SetXLimits(getTimeRangeFromDatePicker(newContext))
                else
                    props.SetXLimits(stepDomainOut(newContext, props.XLimits));

                return newContext
            }
        }
    }

    const handleHover = (time, left, top) => {
        if (isNaN(time) || isNaN(left) || isNaN(top)) {
            setHoverPosition(null);
            setHoverTimePoint(null);
            return;
        }

        if (hoverPosition?.left != left || hoverPosition?.top != top)
            setHoverPosition({ left, top });

        if (hoverTimePoint != time)
            setHoverTimePoint(time);
    }

    return (
        <>
            <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', overflow: 'hidden' }}>
                {props.TimeContext != 'custom' ?
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button className="btn" onClick={() => props.SetXLimits(moveTimeDomainBackwards(props.TimeContext, props.XLimits))}><ReactIcons.ArrowBackward Size={7} /></button>
                        <span onClick={() => handleTimeContext(false)}>Step Out</span>
                        <button className="btn" onClick={() => props.SetXLimits(moveTimeDomainForward(props.TimeContext, props.XLimits))}><ReactIcons.ArrowForward Size={7} /></button>
                    </div>
                    : null}
                <div style={{ display: 'flex', flexGrow: 1, flexShrink: 1, overflow: 'hidden' }} ref={containerRef}>
                    <Plot
                        height={plotSize.Height}
                        width={plotSize.Width - 25}
                        defaultTdomain={props.XLimits ?? [0, 0]}
                        Tmin={props.XLimits?.[0] ?? 0}
                        Tmax={props.XLimits?.[1] ?? 0}
                        defaultYdomain={yLimits}
                        legend={'right'}
                        Tlabel={'Time'}
                        Ylabel={`${props.Tab}`}
                        showGrid={true}
                        showMouse={false}
                        zoom={true}
                        pan={true}
                        useMetricFactors={false}
                        legendWidth={300}
                        menuLocation={'right'}
                        onSelect={x => handleOnClick(x)}
                        defaultMouseMode='select'
                    >
                        <BarGroup>
                            {graphData.map((d, index) => (d.DataPoints != null && d.DataPoints.length !== 0) ? (
                                <Bar key={index} OnHover={(time, left, top) => handleHover(time, left, top - 100)} Data={d.DataPoints} Color={d.Color} Legend={d.Name} Opacity={1} StrokeColor='gray' StrokeWidth={0.5} />
                            ) : null)}
                        </BarGroup>
                    </Plot>
                    {hoverPosition != null ? <div className='tooltip' style={{ ...hoverPosition, pointerEvents: 'none', top: getHoverTop(containerRef.current?.offsetHeight ?? 0, hoverContainerRef.current?.offsetHeight ?? 0, hoverPosition?.top as number ?? 0) }}>{hoverContent}</div> : null}
                </div>
            </div>
        </>)
}


//Helper functions
const getHoverTop = (containerHeight: number, hoverContentHeight: number, currentTop: number): number => {
    if (hoverContentHeight + currentTop > containerHeight)
        return containerHeight - hoverContentHeight
    if (currentTop < 0)
        return 0
    return currentTop
}

export const getFormattedDate = (date, timeContext): string => {
    if (date == null) return "";
    if (timeContext == "day")
        return moment(date).utc().format('YYYY-MM-DDTHH:00') + 'Z';
    else if (timeContext == "hour")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    else if (timeContext == "minute")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else if (timeContext == "second")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else
        return moment(date).utc().format('YYYY-MM-DDT00:00:00') + 'Z';
}

const stepDomainOut = (timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] => {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && contexts.includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

const moveTimeDomainForward = (timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] => {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && contexts.includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).add(1, `${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

function updateUrlParams(param, value) {
    var urlParams = new URLSearchParams(window.location.search);

    let paramValue = value.toLowerCase();
    urlParams.set(param, paramValue);
    history.pushState(null, '', "?" + urlParams.toString());
}

function moveTimeDomainBackwards(timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && ['day', 'hour', 'minute', 'second'].includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).subtract(1, `${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

//Temp JQuery function as these havent been moved to react componets yet..
function updateMapHeaderDate(datefrom, dateto, timeContext, tab) {
    if (timeContext == "custom") {
        $("#mapHeader" + tab + "From").show();
        $("#mapHeader" + tab + "Divider").show();
        $("#mapHeader" + tab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + tab + "To").text(moment(dateto).utc().format('MM/DD/YY'));
        $('.contextWindow').text('Date Range');
    }
    else if (timeContext == "day") {
        $("#mapHeader" + tab + "From").hide();
        $("#mapHeader" + tab + "Divider").hide();
        $("#mapHeader" + tab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + tab + "To").text(moment(dateto).utc().format('MM/DD/YY'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY'));
    }
    else if (timeContext == "hour") {
        $("#mapHeader" + tab + "From").hide();
        $("#mapHeader" + tab + "Divider").hide();
        $("#mapHeader" + tab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + tab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:00'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:00'));

    }
    else if (timeContext == "minute") {
        $("#mapHeader" + tab + "From").hide();
        $("#mapHeader" + tab + "Divider").hide();
        $("#mapHeader" + tab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + tab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:mm'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:mm'));
    }
    else if (timeContext == "second") {
        $("#mapHeader" + tab + "From").hide();
        $("#mapHeader" + tab + "Divider").hide();
        $("#mapHeader" + tab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + tab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:mm:ss'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:mm:ss'));
    }

}

//temporary function to get startDate and endDate via dateRangePicker
function getTimeRangeFromDatePicker(timeContext): [number, number] {
    let startTime = 0;
    let endTime = 0;

    if (timeContext == "custom") {
        startTime = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().valueOf();
        endTime = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().valueOf();
    }

    return [startTime, endTime];
}

//Render function
export function renderBarChart(div, siteID, thedatefrom, thedateto, currentTab, globalContext, setTimeContext, XLimits, setXLimits) {
    let container = document.getElementById(div)
    if (container != null)
        ReactDOM.render(
            <BarChart SiteID={siteID} StartDate={thedatefrom} EndDate={thedateto} Tab={currentTab} TimeContext={globalContext} SetTimeContext={setTimeContext} XLimits={XLimits} SetXLimits={setXLimits} />, container);
}
