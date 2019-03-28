//******************************************************************************************************
//  Power.ts - Gbtc
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
//  03/18/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React  from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";
import * as moment from "moment";
import Legend, { iLegendData } from './../Graphs/Legend';
import 'flot';
//import './../../../flot/jquery.flot.crosshair.min.js';
import './../../../flot/jquery.flot.navigate.min.js';
import { BarChartAnalyticServiceFunction } from '../../../TS/Services/OpenSEE';

export type GetDataFunction = (props: BarChartAnaltyicalBaseProps, ctrl: BarChartAnalyticBase) => void;

export interface BarChartAnaltyicalBaseProps { eventId: number, pixels: number, stateSetter: Function, height: number, tableData: Map<string, { data: number, color: string }>, pointsTable: any[], postedData: iPostedData, tableSetter: Function, fftStartTime: string, fftEndTime: string };
interface BarChartAnalyticBasePropsExtended extends BarChartAnaltyicalBaseProps{
    openSEEServiceFunction: BarChartAnalyticServiceFunction, legendEnable: Function, legendDisplay: Function,
    legendKey: string, getData?: GetDataFunction
}
export default class BarChartAnalyticBase extends React.Component<any, any>{
    plot: any;
    options: object;
    clickHandled: boolean;
    panCenter: number;
    props: BarChartAnalyticBasePropsExtended
    state: { legendRows: Map<string, iLegendData>, dataSet: any, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        ctrl.state = {
            dataSet: {}, 
            dataHandle: undefined,
            legendRows: new Map<string, iLegendData>()
        };
        ctrl.options = {
            canvas: true,
            legend: { show: false },
            crosshair: { mode: "x"},
            grid: {
                autoHighlight: true,
                hoverable: true,
                markings: []
                
            },
            xaxis: {
                tickLength: 10,
                reserveSpace: false,
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

        ctrl.panCenter = null;
        ctrl.clickHandled = false;

        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);
    }

    getColor(label, index) {
        if (label.ChartLabel.indexOf('VAN') >= 0) return '#A30000';
        if (label.ChartLabel.indexOf('VBN') >= 0) return '#0029A3';
        if (label.ChartLabel.indexOf('VCN') >= 0) return '#007A29';
        if (label.ChartLabel.indexOf('IAN') >= 0) return '#FF0000';
        if (label.ChartLabel.indexOf('IBN') >= 0) return '#0066CC';
        if (label.ChartLabel.indexOf('ICN') >= 0) return '#33CC33';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }


    createLegendRows(data) {
        var ctrl = this;

        var legend = (this.state.legendRows != undefined ? this.state.legendRows : new Map<string, iLegendData>());

        $.each(data, function (i, key) {
            var record = legend.get(key.ChartLabel);
            if (record == undefined)
                legend.set(key.ChartLabel, { color: ctrl.getColor(key, i), display: ctrl.props.legendDisplay(key.ChartLabel), enabled: ctrl.props.legendEnable(key.ChartLabel), data: key.DataPoints });
            else
                legend.get(key.ChartLabel).data = key.DataPoints
        });

        legend = new Map(Array.from(legend).sort((a, b) => {
            return natural_compare(a[0], b[0]);
        }));
        this.setState({ legendRows: legend });
        return legend;

        function pad(n) { return ("00000000" + n).substr(-8); }
        function natural_expand(a) { return a.replace(/\d+/g, pad) };
        function natural_compare(a, b) {
            return natural_expand(a).localeCompare(natural_expand(b));
        }

    }

    componentDidMount() {
        this.getData(this.props);
    }

    componentWillUnmount() {
        if (this.state.dataHandle !== undefined && this.state.dataHandle.abort !== undefined) {
            this.state.dataHandle.abort();
            this.setState({ dataHandle: undefined });
        }

        var placeholder = $(this.refs.graphWindow);
        placeholder.off("plothover");
    }

    getData(props: BarChartAnalyticBasePropsExtended) {
        var handle = this.props.openSEEServiceFunction(props.eventId, props.fftStartTime, props.fftEndTime).then(data => {
            if (data == null) {
                return;
            }

            this.props.stateSetter({ fftStartTime: data.CalculationTime, fftEndTime: data.CalculationEnd});

            var legend = this.createLegendRows(data.Data);

            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });
        this.setState({ dataHandle: handle });

    }

    componentWillReceiveProps(nextProps: BarChartAnalyticBasePropsExtended) {
        var props = _.clone(this.props) as any;
        var nextPropsClone = _.clone(nextProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        delete props.tableSetter;
        delete nextPropsClone.tableSetter;
        delete props.pointsTable;
        delete nextPropsClone.pointsTable;
        delete props.tableData;
        delete nextPropsClone.tableData;
        delete props.postedData;
        delete nextPropsClone.postedData;
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;
        delete props.getColor;
        delete nextPropsClone.getColor;
        delete props.getData;
        delete nextPropsClone.getData;
        delete props.legendEnable;
        delete nextPropsClone.legendEnable;
        delete props.legendDisplay;
        delete nextPropsClone.legendDisplay;

        if (!(_.isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
        }

    }

    createDataRows(data, legend: Map<string, iLegendData>) {
        // if start and end date are not provided calculate them from the data set

        var legendRow = this.state.legendRows.entries().next().value;
        var harmonic = 1;
        if (legendRow != undefined && legendRow[1].harmonic != undefined)
            harmonic = 1/legendRow[1].harmonic;


        var ctrl = this;
        var setKey = Array.from(legend).find(x => x[1].enabled);
        var dataPoints = data.Data.find(x => x.ChartLabel == setKey[0]);
        var newVessel = [{ data: Object.keys(dataPoints.DataPoints).map(a => [a, dataPoints.DataPoints[a]]), bars: { show: true, fillColor: setKey[1].color, barWidth: harmonic }, color: '#464646'}];

        this.plot = $.plot($(ctrl.refs.graphWindow), newVessel, this.options);
        this.plotHover();
    }


    plotHover() {
        var ctrl = this;
        $(ctrl.refs.graphWindow).off("plothover");
        $(ctrl.refs.graphWindow).bind("plothover", (event, pos, item) => {
            var selectedChannel = Array.from(this.state.legendRows).find(x => x[1].enabled);
            var table = new Map([...Array.from(this.props.tableData)]);
            var index = Math.floor(pos.x);

            if (selectedChannel[1].data[index] != undefined) {
                table.set(selectedChannel[0], { data: selectedChannel[1].data[index] as any, color: selectedChannel[1].color });
            }

            this.props.tableSetter(table);
        });
    }

    handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iLegendData, key: string, getData?: boolean): void {
        if (key != undefined) {
            var legendRows = this.state.legendRows;
            var oldRow = Array.from(this.state.legendRows).find(x => x[1].enabled)[0];
            legendRows.get(oldRow).enabled = false;
            legendRows.get(key).enabled = true;

            this.setState({ legendRows: legendRows });
            this.createDataRows(this.state.dataSet, legendRows);
        }


        if (getData == true)
            this.getData(this.props);

    }


    render() {
        return (
            <>
            <div ref="graphWindow" style={{ height: this.props.height, float: 'left', width: this.props.pixels - 220 }}></div>
            <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height} />

            </>
        );
    }




}