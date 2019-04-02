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
import './../../../jquery-ui.js';
import { style } from "typestyle"

// styles
const outerDiv: React.CSSProperties = {
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white',
    width: 530,
    height: 340
};

const handle = style({
    width: '100 %',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});

export interface PolarChartProps {
    data: Map<string, { data: number, color: string }>,
    callback: Function
}

export default class PolarChart extends React.Component<any, any>{
    props: PolarChartProps;
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
       
        if (this.props.data.get('VAN RMS') == undefined || this.props.data.get('IAN RMS') == undefined ) return;

        var dataV = [
            { mag: this.props.data.get('VAN RMS').data, ang: this.props.data.get('VAN Phase').data, color: this.props.data.get('VAN RMS').color },
            { mag: this.props.data.get('VBN RMS').data, ang: this.props.data.get('VBN Phase').data, color: this.props.data.get('VBN RMS').color },
            { mag: this.props.data.get('VCN RMS').data, ang: this.props.data.get('VCN Phase').data, color: this.props.data.get('VCN RMS').color }
        ];

        var dataI = [
            { mag: this.props.data.get('IAN RMS').data, ang: this.props.data.get('IAN Phase').data, color: this.props.data.get('IAN RMS').color },
            { mag: this.props.data.get('IBN RMS').data, ang: this.props.data.get('IBN Phase').data, color: this.props.data.get('IBN RMS').color },
            { mag: this.props.data.get('ICN RMS').data, ang: this.props.data.get('ICN Phase').data, color: this.props.data.get('ICN RMS').color }
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
        var vanRMS = this.props.data.get('VAN RMS');
        var vbnRMS = this.props.data.get('VBN RMS');
        var vcnRMS = this.props.data.get('VCN RMS');
        var ianRMS = this.props.data.get('IAN RMS');
        var ibnRMS = this.props.data.get('IBN RMS');
        var icnRMS = this.props.data.get('ICN RMS');

        var vanPhase = this.props.data.get('VAN Phase');
        var vbnPhase = this.props.data.get('VBN Phase');
        var vcnPhase = this.props.data.get('VCN Phase');
        var ianPhase = this.props.data.get('IAN Phase');
        var ibnPhase = this.props.data.get('IBN Phase');
        var icnPhase = this.props.data.get('ICN Phase');


        return (
            <div id="phasor" className="ui-widget-content" style={outerDiv}>
                <div id="phasorhandle" className={handle}></div>
                <div id="phasorchart" style={{ width: '500px', height: '300px', zIndex: 1001 }}>
                    <canvas id="phasorCanvas" width="300" height="300" style={{ display: 'block' , float: 'left'}}></canvas>
                    <table className="table" style={{ width: 200, height: 300, float: 'right' }}>
                        <thead>
                            <tr>
                                <th>Phase</th>
                                <th>Mag</th>
                                <th>Angle</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>VAN</td>
                                <td>{( vanRMS != undefined ? vanRMS.data.toFixed(2) : null)}</td>
                                <td>{(vanPhase != undefined ? vanPhase.data.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td>VBN</td>
                                <td>{(vbnRMS != undefined ? vbnRMS.data.toFixed(2) : null)}</td>
                                <td>{(vbnPhase != undefined ? vbnPhase.data.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td>VCN</td>
                                <td>{(vcnRMS != undefined ? vcnRMS.data.toFixed(2) : null)}</td>
                                <td>{(vcnPhase != undefined ? vcnPhase.data.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td>IAN</td>
                                <td>{(ianRMS != undefined ? ianRMS.data.toFixed(2) : null)}</td>
                                <td>{(ianPhase != undefined ? ianPhase.data.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td>IBN</td>
                                <td>{(ibnRMS != undefined ? ibnRMS.data.toFixed(2) : null)}</td>
                                <td>{(ibnPhase != undefined ? ibnPhase.data.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td>ICN</td>
                                <td>{(icnRMS != undefined ? icnRMS.data.toFixed(2) : null)}</td>
                                <td>{(icnPhase != undefined ? icnPhase.data.toFixed(2) : null)}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ phasorButtonText: "Show Phasor" });
                    $('#phasor').hide();
                }}>X</button>

            </div>
        );
    }
}
