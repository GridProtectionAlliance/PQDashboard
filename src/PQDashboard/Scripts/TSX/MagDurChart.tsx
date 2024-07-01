//******************************************************************************************************
//  MagDurChart.tsx - Gbtc
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
import { Line, Plot, Circle } from '@gpa-gemstone/react-graph';
import { OpenXDA } from "@gpa-gemstone/application-typings"

declare let homePath;

interface IProps {
    meterIDs: string,
    startDate: string,
    endDate: string,
    context: string,
    aggregatingCircles: boolean
}

const MagDurChart: React.FC<IProps> = (props: IProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [circles, setCircles] = React.useState<[number, number][]>([[0, 0]])
    const [lines, setLines] = React.useState<OpenXDA.Types.MagDurCurve[]>([])
    const [plotHeight, setPlotHeight] = React.useState<number>(0);
    const [plotWidth, setPlotWidth] = React.useState<number>(0);
    const tDomain: [number, number] = React.useMemo(() => [0.00001, 1000], [])
    const yDomain: [number, number] = React.useMemo(() => [0, 5], [])

    React.useEffect(() => {
        if (containerRef.current == null) return;

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);

        handleResize();

        return () => {
            resizeObserver.disconnect();
        };

    }, [containerRef]);

    //This needs to be removed once the Application component is implemented and replaced with a layoutEffect
    const handleResize = () => {
        if(containerRef.current == null) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        if(width != plotWidth || height != plotHeight){
            setPlotWidth(width);
            setPlotHeight(height);
        }
    };

    React.useEffect(() => {
        $.ajax({
            type: "GET",
            url: `${homePath}api/Disturbances/StandardMagDurCurve`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => {
            setLines(data)
        })

        $.ajax({
            type: "POST",
            url: `${homePath}api/Disturbances/MagDur`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ meterIds: props.meterIDs, startDate: props.startDate, endDate: props.endDate, context: props.context }),
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => {
            setCircles(data.map(d => [d.DurationSeconds, d.PerUnitMagnitude * 100]))
        })

    }, [props.startDate, props.endDate, props.meterIDs, props.context]);

    function generateCurve(curve: OpenXDA.Types.MagDurCurve) {
        const pt = curve.Area.split(',');
        const cu = pt.map(point => { const s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])] as [number, number]; })
        return cu;
    }

    return (
        <>
            <div ref={containerRef} className="d-flex" style={{ height: '100%', width: '100%' }}>
                <Plot
                    height={plotHeight}
                    width={plotWidth - 35}
                    defaultTdomain={tDomain}
                    defaultYdomain={yDomain}
                    Tmax={1000}
                    Tmin={0.00001}
                    Ymax={9999}
                    Ymin={0}
                    legend={'right'}
                    Tlabel={'Duration (s)'}
                    Ylabel={'Magnitude (pu)'}
                    showMouse={false}
                    showGrid={true}
                    zoom={true}
                    pan={true}
                    useMetricFactors={false}
                    XAxisType={'log'}
                    legendWidth={150}
                    menuLocation={'right'}
                >
                    {lines.map((curve, i) => (
                        <Line
                            showPoints={false}
                            lineStyle={'-'}
                            color={curve.Color}
                            data={generateCurve(curve)}
                            legend={curve.Name}
                            key={i}
                            width={3}
                            highlightHover={false}
                        />
                    ))}
                    {circles.map((circle, i) => (
                        <Circle
                            data={circle}
                            color={'blue'}
                            radius={2.5}
                            key={i}
                        />
                    ))}
                </Plot>
            </div>
        </>
    );
};

export function renderMagDurChart(meterIDs, startDate, endDate, context, aggregatingCircles) {
    const container = document.getElementById("OverviewDisturbancesMagDur")
    if (container != null)
        ReactDOM.render(<MagDurChart aggregatingCircles={aggregatingCircles} meterIDs={meterIDs} startDate={startDate} endDate={endDate} context={context} />, container);
}
