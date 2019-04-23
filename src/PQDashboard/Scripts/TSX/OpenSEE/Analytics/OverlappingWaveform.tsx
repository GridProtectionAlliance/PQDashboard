//******************************************************************************************************
//  FFT.tsx - Gbtc
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
import * as React from "react";
import { clone, isEqual } from "lodash";
import OpenSEEService from './../../../TS/Services/OpenSEE';
import Legend, { iLegendData } from './../Graphs/Legend';

export interface OverlappingWaveformProps {
    eventId: number, startDate: string, endDate: string, height: number, pixels: number
};

export default class OverlappingWaveform extends React.Component{
    plot: any;
    options: object;
    openSEEService: OpenSEEService;
    props: OverlappingWaveformProps;
    state: { legendRows: Map<string, iLegendData>, dataSet: any, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        this.openSEEService = new OpenSEEService();
        ctrl.state = {
            legendRows: new Map<string, iLegendData>(),
            dataSet: {},
            dataHandle: undefined
        };
        ctrl.options = {
            canvas: true,
            legend: { show: false },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true,
                markings: [],
            },
            xaxis: {
                tickLength: 10,
                reserveSpace: true,
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

    componentDidMount() {
        this.getData(this.props);
    }

    componentWillUnmount() {
        if (this.state.dataHandle !== undefined && this.state.dataHandle.abort !== undefined) {
            this.state.dataHandle.abort();
            this.setState({ dataHandle: undefined });
        }
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

    getData(props: OverlappingWaveformProps) {
        var handle = this.openSEEService.getOverlappingWaveformData(props.eventId, props.startDate, props.endDate).then(data => {
            if (data == null) {
                return;
            }

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

    componentWillReceiveProps(nextProps) {
        var props = clone(this.props) as any;
        var nextPropsClone = clone(nextProps);

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
        delete props.postedData;
        delete nextPropsClone.postedData;
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;
        delete props.getColor;
        delete nextPropsClone.getColor;
        delete props.getData;
        delete nextPropsClone.getData;

        if (!(isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
        }
    }

    createLegendRows(data) {
        var ctrl = this;

        var legend = (this.state.legendRows != undefined ? this.state.legendRows : new Map<string, iLegendData>());

        $.each(data, function (i, key) {
            var record = legend.get(key.ChartLabel);
            if (record == undefined)
                legend.set(key.ChartLabel, { color: ctrl.getColor(key, i), display: key.ChartLabel.indexOf('V') == 0, enabled: key.ChartLabel.indexOf('V') == 0, data: key.DataPoints });
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

    createDataRows(data, legend) {
        // if start and end date are not provided calculate them from the data set
        var ctrl = this;

        var newVessel = [];
        legend.forEach((row, key, map) => {
            if (row.enabled)
                newVessel.push({ label: key, data: row.data, color: row.color })
        });

        this.plot = $.plot($(ctrl.refs.graphWindow), newVessel, this.options);
    }


    handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iLegendData, key: string, getData?: boolean): void {
        if (row != undefined)
            row.enabled = !row.enabled;

        this.setState({ legendRows: this.state.legendRows });
        this.createDataRows(this.state.dataSet, this.state.legendRows);

        if (getData == true)
            this.getData(this.props);
    }


    render() {
        return (
            <div>
            <div ref="graphWindow" style={{ height: this.props.height, float: 'left', width: this.props.pixels - 220 /*, margin: '0x', padding: '0px'*/ }}></div>
            <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} type="OverlappingWaveform" height={this.props.height} />
            </div>
        );
    }
}