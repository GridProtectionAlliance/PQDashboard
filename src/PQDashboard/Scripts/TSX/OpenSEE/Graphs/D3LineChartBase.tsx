//******************************************************************************************************
//  D3LineChartBase.ts - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  01/06/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React  from 'react';
import { clone, isEqual, each, findLast } from "lodash";
import * as d3 from '../../../D3/d3';

import { utc } from "moment";
import D3Legend from './D3Legend';
import { StandardAnalyticServiceFunction } from '../../../TS/Services/OpenSEE';

export type LegendClickCallback = (event?: React.MouseEvent<HTMLDivElement>, row?: iD3DataSeries, getData?: boolean) => void;
export type GetDataFunction = (props: D3LineChartBaseProps, ctrl: D3LineChartBase) => void;

export interface D3LineChartBaseProps {
    eventId: number, startDate: string, endDate: string, pixels: number, stateSetter: Function, height: number
};

interface D3LineChartBaseClassProps extends D3LineChartBaseProps{
    legendKey: string, openSEEServiceFunction: StandardAnalyticServiceFunction, legendEnable: Function, legendDisplay: Function,
    getData?: GetDataFunction

}

interface iD3DataSet {
     Data: Array<iD3DataSeries>, EndDate: string, StartDate: string
}

export interface iD3DataSeries {
    ChannelID: number,
    ChartLabel: string,
    XaxisLabel: string,

    Color: string,
    Display: boolean,
    Enabled: boolean,
    
    LegendClass: string,
    LegendGroup: string,
    SecondaryLegendClass: string,
    DataPoints: Array<[number, number]>,
}


export default class D3LineChartBase extends React.Component<D3LineChartBaseClassProps, any>{
    plot: any;
    state: { dataSet: iD3DataSet, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        ctrl.state = {
            dataSet: {
                Data: null, EndDate: null, StartDate: null
            } , 
            dataHandle: undefined,
        };
        
        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);
        
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

    

    getData(props: D3LineChartBaseProps) {
        var handle = this.props.openSEEServiceFunction(props.eventId, props.pixels, props.startDate, props.endDate).then((data: iD3DataSet) => {
            if (data == null) {
                return;
            }

            
            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            dataSet.Data = this.createLegendRows(dataSet.Data);

            this.createDataRows(dataSet.Data);

            this.setState({ dataSet: data });
        });
        this.setState({ dataHandle: handle });

    }

    createLegendRows(data) {
        var ctrl = this;

        let legend: Array<iD3DataSeries> = [];

        $.each(data, function (i, key) {

            key.Display = true;
            key.Enabled = false;

            legend.push(key);
        });

        return legend;

    }

    componentWillReceiveProps(nextProps: D3LineChartBaseClassProps) {
        var props = clone(this.props) as any;
        var nextPropsClone = clone(nextProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        delete props.tableSetter;
        delete nextPropsClone.tableSetter;


        delete props.legendDisplay;
        delete nextPropsClone.legendDisplay;
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;
        delete props.legendEnable;
        delete nextPropsClone.legendEnable;

        delete props.getData;
        delete nextPropsClone.getData;

        if (nextProps.startDate && nextProps.endDate) {
            if (this.plot != null && (this.props.startDate != nextProps.startDate || this.props.endDate != nextProps.endDate)) {
                // Changed Date -> Redraw Axis
            }
        }

        if (!(isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
        }
        
    }

    // create Plot
    createDataRows(data) {
        // if start and end date are not provided calculate them from the data set
        var ctrl = this;
        var startString = this.props.startDate;
        var endString = this.props.endDate;

        var newVessel = [];

        data.forEach((row, key, map) => {
            if (row.enabled) {
                newVessel.push({ label: key, data: row.data, color: row.color })
                if (row.markerdata.length > 0) {
                    let visiblemarker = [];
                    let mx = Math.max(...row.data.map(item => item[0]));
                    let mn = Math.min(...row.data.map(item => item[0]));

                    row.markerdata.forEach(pt => {
                        if ((pt[0] > mn) && (pt[0] < mx)) {
                            visiblemarker.push(pt);
                        }

                    });

                    if (visiblemarker.length > 0) {
                        newVessel.push({
                            label: key, data: visiblemarker, color: row.color, lines: { show: false }, points: {
                                show: true,
                                symbol: "circle",
                                radius: 4,
                                fill: true,
                                fillColor: row.color
                            }
                        })
                    }
                }
            }

        });

        console.log("Plotting")
        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 30, left: 60 },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#graphWindow")
            .append("svg")
            .attr("width", "calc(100% - 220px)")
            .attr("height", this.props.height)
            .append("g");

        var yAxis = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d.value; })])
            .range(['calc(100 % - 220px)', 0]);

        svg.append("g").call(d3.axisLeft(yAxis));

        var xAxis = d3.scaleTime().domain(d3.extent(data, function (d) { return d.date; })).range([0, width]);

        svg.append("g").attr("transform", "translate(0," + this.props.height + ")").call(d3.axisBottom(xAxis));




        
    }



    
   
    // round to nearby lower multiple of base
    floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iD3DataSeries, key: number, getData?: boolean): void {
        if (row != undefined)
            row.Enabled = !row.Enabled;

        this.setState({ dataSet: this.state.dataSet });    

        this.createDataRows(this.state.dataSet.Data);

       if (getData == true)
            this.getData(this.props);
    }


    render() {
        return (
            <div>
                <div ref="graphWindow" style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)'}}></div>
                <D3Legend data={this.state.dataSet.Data} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height}/>
            </div>
        );
    }




    
    
}