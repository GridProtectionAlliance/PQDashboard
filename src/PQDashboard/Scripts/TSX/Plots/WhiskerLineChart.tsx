//******************************************************************************************************
//  WhiskerLineChart.tsx - Gbtc
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
//  06/27/2024 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import moment from 'moment';
import { Plot, WhiskerLine } from '@gpa-gemstone/react-graph';
import { getFormattedDate } from './BarChart';
import { PQDashboard } from '../global';
import { renderTableWrapper } from '../DetailTables/TableWrapper';

interface IProps {
    SiteID: string,
    StartDate: string,
    EndDate: string,
    Tab: string,
    TimeContext: PQDashboard.TimeContext, //temp as we dont have a global state besides variables in default.js
    XLimits: [number, number] //temp as we dont have a global state besides variables in default.js
}

interface ITrendingData {
    Date: string,
    Minimum: number,
    Maximum: number,
    Average: number
}

interface IGraphData {
    Name: string,
    Value: number,
    Color: string
}

declare let homePath;

const WhiskerLineChart = (props: IProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const [plotSize, setPlotSize] = React.useState<{ Height: number, Width: number }>({ Height: 0, Width: 0 });
    const [plotData, setPlotData] = React.useState<[number, IGraphData[]][]>([]);

    const [dataMap, setDataMap] = React.useState<Map<number, IGraphData[]>>(new Map());

    const [xLimits, setXLimits] = React.useState<[number, number]>([moment.utc(props.StartDate).valueOf(), moment.utc(props.EndDate).valueOf()]);
    const [yLimits, setYLimits] = React.useState<[number, number]>([0, 1]);
    const [hoverPosition, setHoverPosition] = React.useState<React.CSSProperties | null>(null);
    const [clickPosition, setClickPosition] = React.useState<React.CSSProperties | null>(null);
    const [hoverData, setHoverData] = React.useState<IGraphData | null>(null);
    const [clickData, setClickData] = React.useState<IGraphData | null>(null);

    const hoverContent = React.useMemo(() => {
        if (hoverData == null || dataMap == null || hoverPosition == null) return <></>
        return (
            <div className='tooltip' style={{ ...hoverPosition, pointerEvents: 'none' }}>
                <p>{`${hoverData.Name}: ${hoverData.Value.toFixed(3)}`}</p>
            </div>
        )

    }, [hoverData, dataMap, hoverPosition])

    const clickContent = React.useMemo(() => {
        if (clickData == null || dataMap == null || clickPosition == null) return <></>
        return (
            <div className="tooltip" style={{ ...clickPosition }}>
                <p>{`${clickData.Name}: ${clickData.Value.toFixed(3)}`}</p>
            </div>
        )

    }, [clickData, dataMap, clickPosition])

    React.useEffect(() => {
        setXLimits([moment.utc(props.StartDate).valueOf(), moment.utc(props.EndDate).valueOf()]);
    }, [props.StartDate, props.EndDate])


    React.useEffect(() => {
        renderTableWrapper(`Detail${props.Tab}`, props.SiteID, getFormattedDate(props.XLimits?.[0], props.TimeContext), props.Tab, props.TimeContext)
    }, [props.TimeContext, props.Tab, props.XLimits, props.SiteID])


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
        $.ajax({
            type: "POST",
            url: `${homePath}api//TrendingData/ErrorBarChart`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ siteID: props.SiteID, colorScale: $('#contourColorScaleSelect').val(), targetDateFrom: props.StartDate, targetDateTo: props.EndDate }),
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: ITrendingData[]) => {
            if (data !== null) {
                const map = new Map<number, IGraphData[]>()
                const graphData: [number, IGraphData[]][] = []

                if (data.length !== 0 && data != null)
                    data.map(d => {
                        const newData: IGraphData[] = [{ Name: 'Minimum', Value: d.Minimum, Color: 'black' }, { Name: 'Average', Value: d.Average, Color: 'green' }, { Name: 'Maximum', Value: d.Maximum, Color: 'black' }]
                        map.set(new Date(d.Date).valueOf(), newData)
                        graphData.push([new Date(d.Date).valueOf(), newData])
                    })

                const yMin = Math.min(...graphData.flatMap(d => d[1].flatMap(dd => dd.Value)));
                const yMax = Math.max(...graphData.flatMap(d => d[1].flatMap(dd => dd.Value)));
                setYLimits([yMin, yMax]);
                setPlotData(graphData)
                setDataMap(map);
            }
        })
    }, [props.SiteID, props.StartDate, props.EndDate, xLimits]);

    const handleOnHover = (xValue: number, yValue: number, left: number, top: number) => {
        if (isNaN(xValue), isNaN(yValue), isNaN(left), isNaN(top)) {
            setHoverPosition(null);
            setHoverData(null);
            return;
        }

        if (hoverPosition?.left != left || hoverPosition?.top != top)
            setHoverPosition({ left, top });

        const matchedX = dataMap.get(xValue)
        if (matchedX != null) {
            const matchedData = matchedX.find(d => d.Value === yValue)
            if (matchedData != null && !_.isEqual(matchedData, hoverData))
                setHoverData(matchedData)
        }

    }

    const handleOnClick = (xValue: number, yValue: number, left: number, top: number) => {
        if (isNaN(xValue) || isNaN(yValue) || isNaN(left) || isNaN(top)) {
            setClickPosition(null);
            setClickData(null);
            return;
        }

        const data = dataMap.get(xValue);
        if (data == null) return;

        const matchedData = data.find(d => d.Value === yValue)
        if (matchedData == null) return;
        setClickData(matchedData);
        setClickPosition({ left, top })
    }

    return (
        <>
            <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexGrow: 1, flexShrink: 1, overflow: 'hidden' }} ref={containerRef}>
                    <Plot
                        height={plotSize.Height}
                        width={plotSize.Width - 25}
                        defaultTdomain={xLimits ?? [0, 0]}
                        Tmin={xLimits?.[0] ?? 0}
                        Tmax={xLimits?.[1] ?? 0}
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
                    >
                        <WhiskerLine Data={plotData} Legend={"Trending Data"} Color={''} OnHover={handleOnHover} OnClick={handleOnClick} />
                    </Plot>
                    {hoverContent}
                    {clickContent}

                </div>
            </div>
        </>)
}


//Render function
export function renderWhiskerLineChart(div, siteID, thedatefrom, thedateto, tab, timeContext, xLimits) {
    const container = document.getElementById(div)
    if (container != null)
        ReactDOM.render(
            <WhiskerLineChart SiteID={siteID} StartDate={thedatefrom} EndDate={thedateto} Tab={tab} TimeContext={timeContext} XLimits={xLimits} />, container);
}