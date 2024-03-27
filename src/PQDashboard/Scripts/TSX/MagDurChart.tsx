//******************************************************************************************************
//  MagDurChart.tsx - Gbtc
//
//  Copyright ©c 2024, Grid Protection Alliance.  All Rights Reserved.
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
import { LoadingIcon } from "@gpa-gemstone/react-interactive"

declare var homePath;

interface IProps {
    meterIDs: string[], //Later on this could probably be stored in a slice/a context/state, since multiple components are going to be using this
    startDate: string,
    endDate: string,
    timeUnit: string,
    aggregatingCircles: boolean
}

const MagDurChart: React.FC<IProps> = (props: IProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [circles, setCircles] = React.useState<[number, number][]>([[0, 0]])
    const [lines, setLines] = React.useState<OpenXDA.Types.MagDurCurve[]>([])
    const [plotHeight, setPlotHeight] = React.useState<number>(0);
    const [plotWidth, setPlotWidth] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const urlParams = new URLSearchParams(window.location.search)
    const assetGroup = urlParams.get("assetGroup")

    React.useLayoutEffect(() => {
        if (containerRef.current != null) {
            const handleResize = () => {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setPlotWidth(width);
                setPlotHeight(height);
            };

            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(containerRef.current);

            handleResize();

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [containerRef]);

    React.useEffect(() => {
        setIsLoading(true)
        $.post(homePath + "api/Disturbances/MagDur", { meterIds: meterIDs, startDate: startDate, endDate: endDate, context: timeUnit }).done(data => {
            setCircles(data.map(d => [d.DurationSeconds, d.PerUnitMagnitude * 100]))
            setIsLoading(false) //only setting the loading on this call as it is the one that takes longer..
        });

        $.get(homePath + 'api/Disturbances/StandardMagDurCurve').done(curves => {
            setLines(curves)
        });

    }, [props.startDate, props.endDate, props.meterIDs, assetGroup])

    function generateCurve(curve: OpenXDA.Types.MagDurCurve) {
        const pt = curve.Area.split(',');
        const cu = pt.map(point => { const s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])] as [number, number]; })
        return cu;
    }

    return (
        <>
            <div ref={containerRef} className="d-flex" style={{ height: '100%', width: '100%' }}>
                {isLoading ? <LoadingIcon Show={isLoading} Label={"Loading..."} /> :
            <Plot
                        height={plotHeight}
                        width={plotWidth}
                defaultTdomain={[0.00001, 1000]}
                defaultYdomain={[0, 5]}
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
                    </Plot>}
            </div>
        </>
    );
};

export function renderMagDurChart(meterIDs, startDate, endDate, timeUnit, aggregatingCircles) {
    let container = document.getElementById("OverviewDisturbancesMagDur")
    if (container)
        ReactDOM.render(<MagDurChart meterIDs={meterIDs} startDate={startDate} endDate={endDate} timeUnit={timeUnit} aggregatingCircles={aggregatingCircles} />, container);
}
