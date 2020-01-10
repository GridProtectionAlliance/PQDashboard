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
import * as d3 from '../../../D3v5/d3';

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
        var startString = new Date(this.props.startDate);
        var endString = new Date(this.props.endDate);

        // remove the previous SVG object
        d3.select("#graphWindow-" + this.props.legendKey + ">svg").remove()

        //add new Plot
        var container = d3.select("#graphWindow-" + this.props.legendKey);
        
        var svg = container.append("svg")
            .attr("width", '100%')
            .attr("height", this.props.height).append("g")
            .attr("transform", "translate(40,10)");

        var lines = [];
        data.forEach((row, key, map) => {
            if (row.Enabled) {
                lines.push(row);

            }
        });

        let xmin = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(item => item[0]))));
        let xmax = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(item => item[0]))));

        let ymin = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(item => item[1]))));
        let ymax = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(item => item[1]))));

        var yAxis = d3.scaleLinear()
            .domain([ymin, ymax])
            .range([this.props.height - 40, 0]);

        var xAxis = d3.scaleLinear()
            .domain([xmin, xmax])
            .range([0, container.node().getBoundingClientRect().width - 100])
            ;

        svg.append("g").call(d3.axisLeft(yAxis));
        svg.append("g").attr("transform", "translate(0," + (this.props.height - 40) + ")").call(d3.axisBottom(xAxis));
        var datagroup = svg.append("g");

        lines.forEach((row, key, map) => {
            console.log(row.DataPoints.map(item => { return { x: item[0], y: item[1] } }))

            datagroup.append("path").datum(row.DataPoints.map(item => { return {x: item[0], y: item[1] } })).attr("fill", "none")
                .attr("stroke", row.Color)
                .attr("stroke-width", 2.0)
                .attr("d", d3.line()
                    .x(function (d) { return xAxis(d.x) })
                    .y(function (d) { return yAxis(d.y) })
            );
        });
                
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
                <div id={"graphWindow-" + this.props.legendKey} style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)'}}></div>
                <D3Legend data={this.state.dataSet.Data} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height}/>
            </div>
        );
    }




    
    
}