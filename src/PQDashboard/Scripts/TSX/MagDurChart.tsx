//******************************************************************************************************
//  MagDurChart.tsx - Gbtc
//
//  Copyright �c 2024, Grid Protection Alliance.  All Rights Reserved.
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

declare var homePath;

interface IProps {
    meterIDs: string[], //Later on this could probably be stored in a slice/a context/state, since multiple components are going to be using this
    startDate: string,
    endDate: string,
    timeUnit: string,
    aggregatingCircles: boolean
}

const MagDurChart: React.FC<IProps> = (props: IProps) => {
    const [circles, setCircles] = React.useState<[number, number][]>([[0, 0]])
    const [lines, setLines] = React.useState<OpenXDA.Types.MagDurCurve[]>([])
    const [containerDimensions, setContainerDimensions] = React.useState<DOMRect>({ width: 0, height: 0, x: 0, y: 0, top: 0, bottom: 0, left: 0, right: 0, toJSON: () => false })

    React.useLayoutEffect(() => {
        const container = document.getElementById('OverviewDisturbances')
        setContainerDimensions(container.getBoundingClientRect())
    }, [])

    React.useEffect(() => {
        $.post(homePath + "api/Disturbances/MagDur", { meterIds: props.meterIDs, startDate: props.startDate, endDate: props.endDate, context: props.timeUnit }, (data) => {
            setCircles(data.map(d => [d.DurationSeconds, d.PerUnitMagnitude * 100]))
        });

        $.get(homePath + 'api/Disturbances/StandardMagDurCurve', curves => {
            setLines(curves)
        });

    }, [])

    function generateCurve(curve: OpenXDA.Types.MagDurCurve) {
        if (curve.LowerCurve == null && curve.UpperCurve == null) {
            const pt = curve.Area.split(',');
            const cu = pt.map(point => { const s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])] as [number, number]; })
            return cu;
        }
        return [];
    }

    return (
        <>
            <Plot
                height={containerDimensions.height}
                width={containerDimensions.width - 10}
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
            </Plot>
        </>
    );
};

export function renderMagDurChart(meterIDs, startDate, endDate, timeUnit, aggregatingCircles) {
    let container = document.getElementById("OverviewDisturbancesMagDur")
    if (container)
        ReactDOM.render(<MagDurChart meterIDs={meterIDs} startDate={startDate} endDate={endDate} timeUnit={timeUnit} aggregatingCircles={aggregatingCircles} />, container);
}