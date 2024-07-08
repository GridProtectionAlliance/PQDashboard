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
import { PQDashboard } from '../global';
import { ContextManager } from './ContextManager';
import { renderTableWrapper } from '../DetailTables/TableWrapper';

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

    const [plotSize, setPlotSize] = React.useState<{ Height: number, Width: number }>({ Height: 0, Width: 0 });
    const [graphData, setGraphData] = React.useState<IGraphData[]>([]);

    const [yLimits, setYLimits] = React.useState<[number, number]>([0, 0])

    React.useEffect(() => {
        //Temp until the layout is converted to React components(need to render in a certain div)
        renderTableWrapper(`Detail${props.Tab}`, props.SiteID, getFormattedDate(props.XLimits?.[0], props.TimeContext), props.Tab, props.TimeContext)
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
        if (props.XLimits == null) return;
        const startDate = getFormattedDate(props.XLimits[0], props.TimeContext)
        const endDate = props.TimeContext == 'custom' ? getFormattedDate(props.XLimits[1], props.TimeContext) : startDate

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
                const graphDataArray: IGraphData[] = [];
                const timeTotalMap = new Map<number, number>()

                data.Types.forEach(type => {
                    const dataPoints = type.Data.map(dataPoint => {
                        const date = moment.utc(dataPoint.m_Item1).valueOf();
                        const value = dataPoint.m_Item2;

                        if (!timeTotalMap.has(date))
                            timeTotalMap.set(date, 0);

                        let total = timeTotalMap.get(date) as number;
                        total += value;
                        timeTotalMap.set(date, total)
                        return [date, value];
                    });

                    graphDataArray.push({
                        Name: type.Name,
                        DataPoints: dataPoints,
                        Color: type.Color
                    });
                });
                const min = Math.min(...graphDataArray.flatMap(dd => dd.DataPoints.map(d => d[1])));
                const max = Math.max(...Array.from(timeTotalMap.values()));
                setYLimits([min, max])
                setGraphData(graphDataArray);
                updateMapHeaderDate(moment.utc(data.StartDate).valueOf(), moment.utc(data.EndDate).valueOf(), props.TimeContext, props.Tab);
            }
        })
    }, [props.SiteID, props.StartDate, props.EndDate, props.Tab, props.TimeContext, props.XLimits]);

    const handleOnClick = (time: number) => {
        if (props.Tab === "Completeness" || props.Tab === "Correctness") {
            const startTime = moment(time).utc().startOf('day').valueOf();
            updateUrlParams('contextDate', getFormattedDate(startTime, 'day'));
            renderTableWrapper(`Detail${props.Tab}`, props.SiteID, getFormattedDate(startTime, 'day'), props.Tab, 'day');
            updateMapHeaderDate(startTime, startTime, 'day', props.Tab);
            const startDate = getFormattedDate(startTime, props.TimeContext);

            (window as unknown as PQDashboard.IWindow)?.getLocationsAndPopulateMapAndMatrix(props.Tab, startDate, startDate, '', props.TimeContext);
            return;
        }

        const newContext = handleTimeContext(true);
        if (newContext == null) return;

        const startTime = moment(time).utc().startOf(newContext === 'custom' ? 'day' : newContext).valueOf()
        const endTime = moment(time).utc().endOf(newContext === 'custom' ? 'day' : newContext).valueOf()

        updateUrlParams('contextDate', getFormattedDate(startTime, newContext));
        props.SetXLimits([startTime, endTime]);

        const startDate = getFormattedDate(startTime, props.TimeContext);
        const endDate = props.TimeContext !== 'custom' ? startDate : getFormattedDate(endTime, props.TimeContext);

        //Temp function from Default.js to essentially rerender map and grid until they get moved to React Components
        (window as unknown as PQDashboard.IWindow)?.getLocationsAndPopulateMapAndMatrix(props.Tab, getFormattedDate(startTime, props.TimeContext), endDate, '', props.TimeContext);
    }

    const handleTimeContext = (leftToRight: boolean) => {
        if (leftToRight) {
            if (contexts.indexOf(props.TimeContext) < contexts.length - 1) {
                const newContext = contexts[contexts.indexOf(props.TimeContext) + 1] as PQDashboard.TimeContext
                if(newContext === 'second')
                    return props.TimeContext
                
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

    return (
        <>
            <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', overflow: 'hidden' }}>
                <ContextManager TimeContext={props.TimeContext} XLimits={props.XLimits} SetTimeContext={props.SetTimeContext} SetXLimits={props.SetXLimits} />
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
                        snapMouse={true}
                    >
                        <BarGroup ShowHoverInfoBox={true}>
                            {graphData.map((d, index) => (d.DataPoints != null && d.DataPoints.length !== 0) ? (
                                <Bar key={index} Data={d.DataPoints} Color={d.Color} Legend={d.Name} Opacity={1} StrokeColor='gray' StrokeWidth={0.5}/>
                            ) : null)}
                        </BarGroup>
                    </Plot>
                </div>
            </div>
        </>)
}

//Helper functions
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

function updateUrlParams(param, value) {
    const urlParams = new URLSearchParams(window.location.search);

    const paramValue = value.toLowerCase();
    urlParams.set(param, paramValue);
    history.pushState(null, '', "?" + urlParams.toString());
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
export function renderBarChart(siteID, thedatefrom, thedateto, currentTab, globalContext, setTimeContext, XLimits, setXLimits) {
    const container = document.getElementById(`Overview${currentTab}`)
    if (container != null)
        ReactDOM.render(
            <BarChart SiteID={siteID} StartDate={thedatefrom} EndDate={thedateto} Tab={currentTab} TimeContext={globalContext} SetTimeContext={setTimeContext} XLimits={XLimits} SetXLimits={setXLimits} />, container);
}
