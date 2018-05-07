//******************************************************************************************************
//  WaveformViewGraph.tsx - Gbtc
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
//  03/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OpenSEEService from './../TS/Services/OpenSEE';
import * as _ from "lodash";
import * as moment from "moment";
import Legend from './Legend';
import 'flot';
import './../flot/jquery.flot.crosshair.min.js';
import './../flot/jquery.flot.navigate.min.js';
//import './../flot/jquery.flot.resize.min.js';
import './../flot/jquery.flot.selection.min.js';
import './../flot/jquery.flot.time.min.js';

const color = {
    IRE: '#999999',
    VAN: '#A30000',
    VBN: '#0029A3',
    VCN: '#007A29',
    IAN: '#FF0000',
    IBN: '#0066CC',
    ICN: '#33CC33',
    ING: '#ffd900',
    Sim: '#996633',
    Rea: '#333300',
    Tak: '#9900FF',
    Mod: '#66CCFF',
    Nov:'#CC9900'
}

export default class WaveformViewerGraph extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    plot: any;
    options: object;
    xaxisHover;

    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        var ctrl = this;

        ctrl.state = {
            eventId: props.eventId,
            startDate: props.startDate,
            endDate: props.endDate,
            type: props.type,
            pixels: props.pixels,
            stateSetter: props.stateSetter,
            legendRow: [], 
            dataSet: [],
            height: props.height,
            hover: props.hover
        };
        ctrl.options = {
            canvas: true,
            legend: { show: false },
            crosshair: { mode: "x" },
            selection: { mode: "x" },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true,
            },
            xaxis: {
                mode: "time",
                tickLength: 10,
                //min: ctrl.state.StartDate,
                //max: ctrl.state.EndDate,
                reserveSpace: false,
                ticks: function (axis) {
                    var ticks = [],
                        start = ctrl.floorInBase(axis.min, axis.delta),
                        i = 0,
                        v = Number.NaN,
                        prev;

                    do {
                        prev = v;
                        v = start + i * axis.delta;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                },
                tickFormatter: function (value, axis) {
                    if (axis.delta < 1) {
                        var trunc = value - ctrl.floorInBase(value, 1000);
                        return ctrl.defaultTickFormatter(trunc, axis) + " ms";
                    }

                    if (axis.delta < 1000) {
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).utc().format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: {
                labelWidth: 50,
                panRange: false,
                //ticks: 1,
                tickLength: 10,
                tickFormatter: function (val, axis) {
                    if (axis.delta > 1000000 && (val > 1000000 || val < -1000000))
                        return ((val / 1000000) | 0) + "M";
                    else if (axis.delta > 1000 && (val > 1000 || val < -1000))
                        return ((val / 1000) | 0) + "K";
                    else
                        return val.toFixed(axis.tickDecimals);
                }
            }
        }
    }

    getData(state) {
        switch (state.type) {
            case 'F':
                this.getFaultDistanceData(state);
                break;
            case 'B':
                this.getBreakerDigitalsData(state);
                break;
            default:
                this.getEventData(state);
                break;
        }
    }

    getEventData(state) {
        this.openSEEService.getData(state, "Time").then(data => {
            var legend = this.state.legendRows;

            if (this.state.legendRows == undefined)
                legend = this.createLegendRows(data.Data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
            this.openSEEService.getData(state, "Freq").then(d2 => {
                legend = legend = this.createLegendRows(data.Data.concat(d2.Data));
                data.Data = data.Data.concat(d2.Data);

                this.createDataRows(data, legend);
                this.setState({ dataSet: data });
            })
        });

    }

    getFaultDistanceData(state) {
        this.openSEEService.getFaultDistanceData(state).then(data => {
            var legend = this.state.legendRows;

            if (this.state.legendRows == undefined)
                legend = this.createLegendRows(data.Data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });

    }

    getBreakerDigitalsData(state) {
        this.openSEEService.getBreakerDigitalsData(state).then(data => {
            var legend = this.state.legendRows;

            if (this.state.legendRows == undefined)
                legend = this.createLegendRows(data.Data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });

    }


    componentWillReceiveProps(nextProps) {
        var props = _.clone(this.props);
        var nextPropsClone = _.clone(nextProps);

        delete props.hover;
        delete nextPropsClone.hover;
        delete props.stateSetter;
        delete nextPropsClone.stateSetter;

        if (!(_.isEqual(props, nextPropsClone))) {
            this.setState(nextProps);
            this.getData(nextProps);

        }
        else if (this.props.hover != nextProps.hover) {
            this.plot.setCrosshair(nextProps.hover);
        }

    }


    componentDidMount() {
        this.getData(this.state);
    }
    componentWillUnmount() {
        $("#" + this.state.type).off("plotselected");
        $("#" + this.state.type).off("plotzoom");
        $("#" + this.state.type).off("plothover");
    }

    createLegendRows(data) {
        var ctrl = this;

        var legend = [];
        data.sort((a, b) => {
            var keyA = a.ChartLabel,
                keyB = b.ChartLabel;
            // Compare the 2 dates
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        $.each(data, function (i, key) {
            legend.push({ label: key.ChartLabel, color: color[key.ChartLabel.substring(0,3)], enabled: (ctrl.state.type == "F" || key.ChartLabel == key.ChartLabel.substring(0,3)) });
        });

        this.setState({ legendRows: legend });
        return legend;
    }

    createDataRows(data, legend) {
        // if start and end date are not provided calculate them from the data set
        var startString = this.state.StartDate;
        var endString = this.state.EndDate;
        if (this.state.StartDate == null) {
            this.setState({ StartDate: moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            startString = moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        if (this.state.EndDate == null) {
            this.setState({ EndDate: moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            endString = moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        var newVessel = [];
        var legendKeys = legend.filter(x => x.enabled).map(x => x.label);
        $.each(data.Data, (i, key) => {
            if (legendKeys.indexOf(key.ChartLabel) >= 0)
                newVessel.push({ label: key.ChartLabel, data: key.DataPoints, color: color[key.ChartLabel.substring(0, 3)] })
        });

        newVessel.push([[this.getMillisecondTime(startString), null], [this.getMillisecondTime(endString), null]]);
        this.plot = $.plot($("#" + this.state.type), newVessel, this.options);
        this.plotSelected();
        this.plotZoom();
        this.plotHover();
    }

    plotZoom() {
        var ctrl = this;
        $("#" + this.state.type).off("plotzoom");
        $("#" + ctrl.state.type).bind("plotzoom", function (event, originalEvent) {
            //console.log(event, ctrl.plot.getAxes().xaxis, originalEvent, ctrl.xaxisHover);
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.xaxisHover;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;
            var datamin = xaxis.datamin;
            var datamax = xaxis.datamax;

            var deltaMagnitude;
            var delta;
            var factor;

            if (xmin == null)
                xmin = datamin;

            if (xmax == null)
                xmax = datamax;

            if (xmin == null || xmax == null)
                return;

            xcenter = Math.max(xcenter, xmin);
            xcenter = Math.min(xcenter, xmax);

            if (originalEvent.wheelDelta != undefined)
                delta = originalEvent.wheelDelta;
            else
                delta = -originalEvent.detail;

            deltaMagnitude = Math.abs(delta);

            if (minDelta == null || deltaMagnitude < minDelta)
                minDelta = deltaMagnitude;

            deltaMagnitude /= minDelta;
            deltaMagnitude = Math.min(deltaMagnitude, maxDelta);
            factor = deltaMagnitude / 10;

            if (delta > 0) {
                xmin = xmin * (1 - factor) + xcenter * factor;
                xmax = xmax * (1 - factor) + xcenter * factor;
            } else {
                xmin = (xmin - xcenter * factor) / (1 - factor);
                xmax = (xmax - xcenter * factor) / (1 - factor);
            }

            if (xmin == xaxis.options.xmin && xmax == xaxis.options.xmax)
                return;

            //console.log(ctrl.getDateString(xmin), ctrl.getDateString(xmax));
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(xmin), EndDate: ctrl.getDateString(xmax) });

        });

    }

    plotSelected() {
        var ctrl = this;
        $("#" + this.state.meterId + "-" + this.state.type).off("plotselected");    
        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plotselected", function(event, ranges){
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to)});
        });
    }

    plotHover() {
        var ctrl = this;
        $("#" + this.state.type).off("plothover");
        $("#" + ctrl.state.type).bind("plothover", function (event, pos, item) {
            ctrl.xaxisHover = pos.x;
            ctrl.state.stateSetter({ Hover: pos });
        });
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

    handleSeriesLegendClick() {
        this.createDataRows(this.state.dataSet, this.state.legendRows);
    }

    getMillisecondTime(date) {
        var milliseconds = moment.utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0'))*1000;
      
        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    }

    getDateString(float) {
        var date = moment.utc(float).format('YYYY-MM-DDTHH:mm:ss.SSS');
        var millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'))

        return date + millisecondFraction.toString();
    }

    //highlightCycle(plotIndex, series, calculationCycle) {
    //    if (isNaN(calculationCycle) || calculationCycle >= series.DataPoints.length)
    //        return;

    //    var dataPointCount = Math.min(128, series.DataPoints.length - 1);
    //    var timeStart = series.DataPoints[0][0] / 1000.0;
    //    var timeEnd = series.DataPoints[dataPointCount][0] / 1000.0;
    //    var samplesPerCycle = Math.round(dataPointCount / (systemFrequency * (timeEnd - timeStart)));

    //    var endIndex = Math.min(calculationCycle + samplesPerCycle, series.DataPoints.length - 1);
    //    var from = series.DataPoints[calculationCycle][0];
    //    var to = series.DataPoints[endIndex][0];

    //    return {
    //        color: "#FFA",
    //        xaxis: {
    //            from: from,
    //            to: to
    //        }
    //    };
    //}

    //highlightSample(plotIndex, series, calculationCycle) {
    //    if (isNaN(calculationCycle) || calculationCycle >= series.DataPoints.length)
    //        return;

    //    var from = series.DataPoints[calculationCycle][0];

    //    return {
    //        color: "#EB0",
    //        xaxis: {
    //            from: from,
    //            to: from
    //        }
    //    };
    //}



    render() {
        return (
            <div>
                <div id={this.state.type} style={{ height: (this.props.showXAxis ? this.state.height : this.state.height - 20), float: 'left', width: this.state.pixels - 220 /*, margin: '0x', padding: '0px'*/}}></div>
                <div id={this.state.type + '-legend'} style={{ float: 'right', width: '200px', height: this.state.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px'}}>
                    <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} />
                </div>
            </div>
        );
    }

}