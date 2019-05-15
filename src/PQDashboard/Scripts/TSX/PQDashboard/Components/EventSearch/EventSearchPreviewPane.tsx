//******************************************************************************************************
//  EventSearchPreviewPane.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as moment from 'moment';
import OpenSEEService from './../../../../TS/Services/OpenSEE';
import EventSearchNoteWindow from './EventSearchNoteWindow';
import EventSearchAssetVoltageDisturbances from './EventSearchAssetVoltageDisturbances';
import EventSearchFaultSegments from './EventSearchAssetFaultSegments';
import EventSearchHistory from './EventSearchAssetHistory';
import EventSearchCorrelatedSags from './EventSearchCorrelatedSags';

export default class EventPreviewPane extends React.Component<{ eventid: number }, {}> {
    openSEEService: OpenSEEService;
    optionsV: object;
    optionsI: object;

    constructor(props, context) {
        super(props, context);

        this.openSEEService = new OpenSEEService();
        this.optionsV = {
            canvas: true,
            legend: { show: false },
            xaxis: { show: false },
            yaxis: { show: false }
        };

        this.optionsI = {
            canvas: true,
            legend: { show: false },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true,
                markings: [],
            },
            xaxis: {
                mode: "time",
                tickLength: 10,
                reserveSpace: false,
                ticks: (axis) => {
                    var ticks = [],
                        delta = (axis.max - axis.min) / 11,
                        start = this.floorInBase(axis.min, axis.delta),
                        i = 0,
                        v = Number.NaN,
                        prev;

                    //do {
                    //    prev = v;
                    //    v = start + i * axis.delta;
                    //    ticks.push(v);
                    //    ++i;
                    //} while (v < axis.max && v != prev);
                    for (var i = 1; i < 11; ++i) {
                        ticks.push(axis.min + i * delta);
                    }

                    return ticks;
                },
                tickFormatter: (value, axis) => {
                    if (axis.delta < 1) {
                        var trunc = value - this.floorInBase(value, 1000);
                        return this.defaultTickFormatter(trunc, axis) + " ms";
                    }

                    if (axis.delta < 1000) {
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: { show: false }
        }




    }

    defaultTickFormatter(value, axis) {

        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;

        // If tickDecimals was specified, ensure that we have exactly that
        // much precision; otherwise default to the value's own precision.

        if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
            if (precision < axis.tickDecimals) {
                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
        }

        return formatted;
    };
    // round to nearby lower multiple of base
    floorInBase(n, base) {
        return base * Math.floor(n / base);
    }


    componentDidMount() {
        if (this.props.eventid >= 0)
            this.getData(this.props);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.eventid >= 0)
            this.getData(nextProps);
    }

    getColor(label) {
        if (label.indexOf('VA') >= 0) return '#A30000';
        if (label.indexOf('VB') >= 0) return '#0029A3';
        if (label.indexOf('VC') >= 0) return '#007A29';
        if (label.indexOf('VN') >= 0) return '#c3c3c3';
        if (label.indexOf('IA') >= 0) return '#FF0000';
        if (label.indexOf('IB') >= 0) return '#0066CC';
        if (label.indexOf('IC') >= 0) return '#33CC33';
        if (label.indexOf('IR') >= 0) return '#c3c3c3';

        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }

    getData(props) {
        $(this.refs.voltWindow).children().remove();
        $(this.refs.curWindow).children().remove();
        var pixels = (window.innerWidth - 300 - 40) / 2;

        this.openSEEService.getWaveformVoltageData(props.eventid, pixels).then(data => {
            if (data == null) {
                return;
            }

            var newVessel = [];
            $.each(data.Data, (index, value) => {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) })
            });


            $.plot($(this.refs.voltWindow), newVessel, this.optionsV);


        });

        this.openSEEService.getWaveformCurrentData(props.eventid, pixels).then(data => {
            if (data == null) {
                return;
            }

            var newVessel = [];
            $.each(data.Data, (index, value) => {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) })
            });


            $.plot($(this.refs.curWindow), newVessel, this.optionsI);


        });


    }
    render() {
        return (
            <div>
                <div className="card">
                    <div className="card-header"><a href={homePath + 'Main/OpenSEE?eventid=' + this.props.eventid} target="_blank">View in OpenSEE</a></div>
                    <div className="card-body">
                        <div ref="voltWindow" style={{ height: 200, width: 'calc(100%)' /*, margin: '0x', padding: '0px'*/ }}></div>
                        <div ref="curWindow" style={{ height: 200, width: 'calc(100%)' /*, margin: '0x', padding: '0px'*/ }}></div>
                    </div>
                </div>
                <EventSearchFaultSegments eventId={this.props.eventid} />
                <EventSearchAssetVoltageDisturbances eventId={this.props.eventid} />
                <EventSearchCorrelatedSags eventId={this.props.eventid} />
                <EventSearchHistory eventId={this.props.eventid} />
                <EventSearchNoteWindow eventId={this.props.eventid}/>
            </div>
        );
    }
}

