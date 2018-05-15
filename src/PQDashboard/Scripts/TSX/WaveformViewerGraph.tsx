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
import './../flot/jquery.flot.selection.min.js';
import './../flot/jquery.flot.time.min.js';
import { WheelEvent } from 'react';

declare var systemFrequency: any;
declare var postedEventMilliseconds: any;


export default class WaveformViewerGraph extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    plot: any;
    options: object;
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
            hover: props.hover,
            tableData: props.tableData,
            pointsTable: props.pointsTable,
            tableSetter: props.tableSetter
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
                markings: []
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

    getColor(label, index) {
        if( label.ChartLabel.indexOf('IRES') >= 0) return '#999999';
        if( label.ChartLabel.indexOf('VAN') >= 0) return '#A30000';
        if( label.ChartLabel.indexOf('VBN') >= 0) return '#0029A3';
        if( label.ChartLabel.indexOf('VCN') >= 0) return '#007A29';
        if( label.ChartLabel.indexOf('IAN') >= 0) return '#FF0000';
        if( label.ChartLabel.indexOf('IBN') >= 0) return '#0066CC';
        if( label.ChartLabel.indexOf('ICN') >= 0) return '#33CC33';
        if( label.ChartLabel.indexOf('ING') >= 0) return '#ffd900';
        if (label.ChartLabel.indexOf('Simp') >= 0) return '#edc240';
        if (label.ChartLabel.indexOf('Reac') >= 0) return '#afd8f8';
        if (label.ChartLabel.indexOf('Modi') >= 0) return '#4da74d';
        if (label.ChartLabel.indexOf('Taka') >= 0) return '#cb4b4b';
        if (label.ChartLabel.indexOf('Novo') >= 0) return '#9440ed';
        if (label.ChartLabel.indexOf('Doub') >= 0) return '#BD9B33';
        else if (index == 0) return '#edc240';
        else if (index == 1) return '#afd8f8';
        else if (index == 2) return '#cb4b4b';
        else if (index == 3) return '#4da74d';
        else if (index == 4) return '#9440ed';
        else if (index == 5) return '#bd9b33';
        else if (index == 6) return '#3498db';
        else if (index == 7) return '#1d5987';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
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
            this.options['grid'].markings.push(this.highlightCycle(data));
            var legend = this.createLegendRows(data.Data);

            var dataSet = this.state.dataSet;
            _.each(data.Data, x => {
                
            });
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });

        this.openSEEService.getData(state, "Freq").then(data => {
            var legend = this.createLegendRows(data.Data);

            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            this.createDataRows(dataSet, legend);
            this.setState({ dataSet: dataSet });
        })


    }

    getFaultDistanceData(state) {
        this.openSEEService.getFaultDistanceData(state).then(data => {
            this.options['grid'].markings.push(this.highlightSample(data));

            var legend = this.state.legendRows;

            if (this.state.legendRows == undefined)
                legend = this.createLegendRows(data.Data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });

    }

    getBreakerDigitalsData(state) {
        this.openSEEService.getBreakerDigitalsData(state).then(data => {
            this.options['grid'].markings.push(this.highlightSample(data));

            var legend = this.state.legendRows;

            if (legend == undefined)
                legend = this.createLegendRows(data.Data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });

    }


    componentWillReceiveProps(nextProps) {
        var props = _.clone(this.props) as any;
        var nextPropsClone = _.clone(nextProps);

        delete props.hover;
        delete nextPropsClone.hover;
        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        delete props.tableSetter;
        delete nextPropsClone.tableSetter;
        delete props.pointsTable;
        delete nextPropsClone.pointsTable;
        delete props.tableData;
        delete nextPropsClone.tableData;



        if (!(_.isEqual(props, nextPropsClone))) {
            this.setState(nextProps);
            this.getData(nextProps);

        }
        else if (this.props.hover != nextProps.hover) {
            if(this.plot)
                this.plot.setCrosshair({ x: nextProps.hover });
            var table = _.clone(this.state.tableData);
            _.each(this.state.dataSet.Data, (data, i) => {
                var vector = _.findLast(data.DataPoints, (x) => x[0] <= nextProps.hover);
                if (vector)
                    table[data.ChartLabel] = { data: vector[1], color: this.state.legendRows[data.ChartLabel].color } ;
            });
            this.state.tableSetter(table);

        }

    }


    componentDidMount() {
        this.getData(this.state);
    }
    componentWillUnmount() {
        $("#" + this.state.type).off("plotselected");
        $("#" + this.state.type).off("plotzoom");
        $("#" + this.state.type).off("plothover");
        $("#" + this.state.type).off("plotclick");

    }

    createLegendRows(data) {
        var ctrl = this;

        var legend = ( this.state.legendRows != undefined ? this.state.legendRows : {});

        $.each(data, function (i, key) {
            if(legend[key.ChartLabel]  == undefined)
                legend[key.ChartLabel] = { color: ctrl.getColor(key, i), enabled: (ctrl.state.type == "F" || ctrl.state.type == "B" || key.ChartLabel == key.ChartLabel.substring(0, 3)), data: key.DataPoints };
            else
                legend[key.ChartLabel].data = key.DataPoints
        });

        this.setState({ legendRows: legend });
        return legend;
    }

    createDataRows(data, legend) {
        // if start and end date are not provided calculate them from the data set
        var ctrl = this;
        var startString = this.state.startDate;
        var endString = this.state.endDate;
        if (this.state.startDate == null) {
            this.setState({ startDate: moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            startString = moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        if (this.state.endDate == null) {
            this.setState({ endDate: moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            endString = moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        var newVessel = [];
        $.each(Object.keys(legend), (i, key) => {
            if (legend[key].enabled)
                newVessel.push({ label: key, data: legend[key].data, color: legend[key].color })
        });

        newVessel.push([[this.getMillisecondTime(startString), null], [this.getMillisecondTime(endString), null]]);
        this.plot = $.plot($("#" + this.state.type), newVessel, this.options);
        this.plotSelected();
        this.plotZoom();
        this.plotHover();
        this.plotClick();
    }

    plotZoom() {
        var ctrl = this;
        $("#" + this.state.type).off("plotzoom");
        $("#" + ctrl.state.type).bind("plotzoom", function (event) {
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.state.hover;
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

            if ((event.originalEvent as any).wheelDelta != undefined)
                delta = (event.originalEvent as any).wheelDelta;
            else
                delta = -(event.originalEvent as any).detail;

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
        $("#" + this.state.type).off("plotselected");    
        $("#" + ctrl.state.type).bind("plotselected", function (event, ranges) {
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to)});
        });
    }

    plotHover() {
        var ctrl = this;
        $("#" + this.state.type).off("plothover");
        $("#" + ctrl.state.type).bind("plothover", function (event, pos, item) {
            ctrl.state.stateSetter({ Hover: pos.x });
        });
    }

    plotClick() {
        var ctrl = this;
        $("#" + this.state.type).off("plotclick");
        $("#" + ctrl.state.type).bind("plotclick", function (event, pos, item) {
            var time;
            var deltatime;
            var deltavalue;

            if (!item)
                return;

            var pointsTable = _.clone(ctrl.state.pointsTable);

            time = (item.datapoint[0] - Number(postedEventMilliseconds)) / 1000.0;
            deltatime = 0.0;
            deltavalue = 0.0;

            if (pointsTable.length > 0) {
                deltatime = time - pointsTable[pointsTable.length - 1].thetime;
                deltavalue = item.datapoint[1] - pointsTable[pointsTable.length - 1].thevalue;
            }

            pointsTable.push({
                theseries: item.series.label,
                thetime: time,
                thevalue: item.datapoint[1].toFixed(3),
                deltatime: deltatime,
                deltavalue: deltavalue.toFixed(3),
                arrayIndex: ctrl.state.pointsTable.length
            });

            ctrl.state.stateSetter({PointsTable: pointsTable});
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

    highlightSample(series) {
        if(series.CalculationTime > 0)
        return {
            color: "#EB0",
            xaxis: {
                from: series.CalculationTime,
                to: series.CalculationTime
            }
        };
    }

    highlightCycle(series) {
        if (series.CalculationTime > 0 && series.CalculationEnd > 0)
        return {
            color: "#FFA",
            xaxis: {
                from: series.CalculationTime,
                to: series.CalculationEnd
            }
        };
    }



    render() {
        return (
            <div>
                <div id={this.state.type} style={{ height: (this.props.showXAxis ? this.state.height : this.state.height - 20), float: 'left', width: this.state.pixels - 220 /*, margin: '0x', padding: '0px'*/}}></div>
                <div id={this.state.type + '-legend'} className='legend' style={{ float: 'right', width: '200px', height: this.state.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'auto'}}>
                    <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} />
                </div>
            </div>
        );
    }

}