//******************************************************************************************************
//  PolarChart.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  05/10/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";

export default class PolarChart extends React.Component<any, any>{
    constructor(props) {
        super(props);

        this.state = {
            data: props.data,
            callback: props.callback
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }

    }

//   updatePhasorChart() {
//        var canvas = $("#phasorCanvas");
//        var context = canvas[0].getContext("2d");
//
//        var padding = 10;
//        var center = { x: canvas.width() / 2, y: canvas.height() / 2 };
//        var chartRadius = Math.min(center.x, center.y) - padding;
//
//        if (canvas.is(":hidden"))
//            return;
//
//        function drawGrid() {
//            context.lineWidth = 1;
//            context.strokeStyle = "#BBB";
//
//            for (var i = 0; i < 4; i++)
//                drawVector(chartRadius, i * Math.PI / 2);
//
//            context.strokeStyle = "#DDD";
//            drawCircle(0.9 * chartRadius / 2);
//            drawCircle(0.9 * chartRadius);
//        }
//
//        function drawPhasors() {
//            var vMax = 0;
//            var iMax = 0;
//
//            context.lineWidth = 3;
//
//            $.each(phasorData, function (key, series) {
//                if (series == undefined)
//                    return;
//
//                if (series.color == undefined)
//                    return;
//
//                $.each(series.data, function (_, dataPoint) {
//                    series.vector = dataPoint;
//
//                    if (dataPoint[0] >= xaxisHover)
//                        return false;
//                });
//
//                if (key < 3 && series.vector[1] > vMax)
//                    vMax = series.vector[1];
//                if (key >= 3 && series.vector[1] > iMax)
//                    iMax = series.vector[1];
//            });
//
//            $.each(phasorData, function (key, series) {
//                var scale;
//
//                if (series == undefined)
//                    return;
//
//                if (series.vector == undefined)
//                    return;
//
//                if (key < 3) {
//                    scale = 0.9 * chartRadius / vMax;
//                }
//                else {
//                    scale = 0.9 * chartRadius / iMax;
//                    context.setLineDash([10, 5]);
//                }
//
//                context.strokeStyle = series.color;
//                drawVector(series.vector[1] * scale, series.vector[2]);
//                context.setLineDash([]);
//            });
//        }
//
//        function drawVector(r, t) {
//            var x = r * Math.cos(t);
//            var y = r * Math.sin(t);
//
//            context.beginPath();
//            context.moveTo(center.x, center.y);
//            context.lineTo(center.x + x, center.y - y);
//            context.stroke();
//        }
//
//        function drawCircle(r) {
//            context.beginPath();
//            context.arc(center.x, center.y, r, 0, 2 * Math.PI);
//            context.stroke();
//        }
//
//        context.clearRect(0, 0, canvas.width(), canvas.height());
//        drawGrid();
//        drawPhasors();
//    }


    render() {
        return (
            <div>
                <div id="phasorhandle"></div>
                <div id="phasorchart" style={{width: '300px', height: '300px', zIndex: 1001}}>
                    <canvas id="phasorCanvas" width="300" height="300" style={{ display: 'block' }}></canvas>
                </div>
                <button className="CloseButton" onClick={() => {
                    $('#phasor').hide();
                    $('#showphasor').val('Show Phasor');
                }}>X</button>
            </div>
        );
    }
}
