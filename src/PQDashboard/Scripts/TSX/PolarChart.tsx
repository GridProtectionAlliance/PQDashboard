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
import * as _ from "lodash";
import './../jquery-ui.js';

export default class PolarChart extends React.Component<any, any>{
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        this.updatePhasorChart();
    }

    componentDidMount() {
        ($("#phasor") as any).draggable({ scroll: false, handle: '#phasorhandle' });
        this.updatePhasorChart();
    }

   updatePhasorChart() {
        var canvas = $("#phasorCanvas");
        var context = (canvas[0] as any).getContext("2d");

        var padding = 10;
        var center = { x: canvas.width() / 2, y: canvas.height() / 2 };
        var chartRadius = Math.min(center.x, center.y) - padding;

        if (canvas.is(":hidden"))
            return;

       context.clearRect(0, 0, canvas.width(), canvas.height());
       this.drawGrid(context, center, chartRadius);
       this.drawPhasors(context, center, chartRadius);
    }

    drawPhasors(context, center, chartRadius) {
        var vMax = 0;
        var iMax = 0;
        var ctrl = this;

        context.lineWidth = 3;
        if (!this.props.data.hasOwnProperty('VAN RMS')) return;

        var dataV = [
            { mag: this.props.data['VAN RMS'].data, ang: this.props.data['VAN Phase'].data, color: this.props.data['VAN RMS'].color },
            { mag: this.props.data['VBN RMS'].data, ang: this.props.data['VBN Phase'].data, color: this.props.data['VBN RMS'].color },
            { mag: this.props.data['VCN RMS'].data, ang: this.props.data['VCN Phase'].data, color: this.props.data['VCN RMS'].color }
        ];

        var dataI = [
            { mag: this.props.data['IAN RMS'].data, ang: this.props.data['IAN Phase'].data, color: this.props.data['IAN RMS'].color },
            { mag: this.props.data['IBN RMS'].data, ang: this.props.data['IBN Phase'].data, color: this.props.data['IBN RMS'].color },
            { mag: this.props.data['ICN RMS'].data, ang: this.props.data['ICN Phase'].data, color: this.props.data['ICN RMS'].color }
        ];

        $.each(dataV, function (key, series) {
            if (series.mag > vMax)
                vMax = series.mag;
        });

        $.each(dataI, function (key, series) {
            if (series.mag > iMax)
                iMax = series.mag;
        });

        $.each(dataV, function (index: number, series) {
            var scale = 0.9 * chartRadius / vMax;
            context.strokeStyle = series.color;
            ctrl.drawVector(context, center, series.mag * scale, series.ang);
            context.setLineDash([]);
        });

        $.each(dataI, function (index: number, series) {
            var scale = 0.9 * chartRadius / iMax;
            context.setLineDash([10, 5]);

            context.strokeStyle = series.color;
            ctrl.drawVector(context, center, series.mag * scale, series.ang);
            context.setLineDash([]);
        });
    }

    drawGrid(context, center, chartRadius) {
        context.lineWidth = 1;
        context.strokeStyle = "#BBB";

        for (var i = 0; i < 4; i++)
            this.drawVector(context, center, chartRadius, i * 90);

        context.strokeStyle = "#DDD";
        this.drawCircle(context, center, 0.9 * chartRadius / 2);
        this.drawCircle(context, center, 0.9 * chartRadius);
    }

    drawVector(context, center, r, t) {
        var x = r * Math.cos(t * Math.PI / 180);
        var y = r * Math.sin(t * Math.PI / 180);

        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(center.x + x, center.y - y);
        context.stroke();
    }

    drawCircle(context, center, r) {
        context.beginPath();
        context.arc(center.x, center.y, r, 0, 2 * Math.PI);
        context.stroke();
    }

    render() {
        return (
            <div id="phasor" className="ui-widget-content" style={{ position: 'absolute', top: '0', width: '300px', height: '320px', display: 'none' }}>
                <div id="phasorhandle"></div>
                <div id="phasorchart" style={{ width: '300px', height: '300px', zIndex: 1001 }}>
                    <canvas id="phasorCanvas" width="300" height="300" style={{ display: 'block' }}></canvas>
                </div>
                <button className="CloseButton" onClick={() => {
                    this.props.callback({ phasorButtonText: "Show Phasor" });
                    $('#phasor').hide();
                }}>X</button>

            </div>
        );
    }
}
