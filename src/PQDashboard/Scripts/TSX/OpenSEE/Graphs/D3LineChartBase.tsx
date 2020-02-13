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
import moment = require('moment');

export type LegendClickCallback = (event?: React.MouseEvent<HTMLDivElement>, row?: iD3DataSeries, getData?: boolean) => void;
export type GetDataFunction = (props: D3LineChartBaseProps, ctrl: D3LineChartBase) => void;

export interface D3LineChartBaseProps {
    eventId: number, startTime: number, endTime: number, startDate: string, endDate: string, pixels: number, stateSetter: Function, height: number, options: D3PlotOptions, hover: number,
};

interface D3LineChartBaseClassProps extends D3LineChartBaseProps{
    legendKey: string, openSEEServiceFunction: StandardAnalyticServiceFunction
    getData?: GetDataFunction,
   
}

interface D3PlotOptions {
    showXLabel: boolean,
}

interface iD3DataSet {
    Data: Array<iD3DataSeries>,
    StartDate: string,
    EndDate: string,
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

    yAxis: any;
    xAxis: any;
    yScale: any;
    xScale: any;
    paths: any;
    brush: any;
    hover: any;
    area: any;
    xlabel: any;

    mousedownX: number;

    state: { dataSet: iD3DataSet, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        ctrl.state = {
            dataSet: {
                Data: null,
                StartDate: null,
                EndDate: null
            } , 
            dataHandle: undefined,
          
        };
        
        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);

        ctrl.mousedownX = 0;
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

            if (this.props.endTime == null) this.props.stateSetter({ endTime: moment(data.EndDate + "Z").valueOf() });
            if (this.props.startTime == null) this.props.stateSetter({ startTime: moment(data.StartDate + "Z").valueOf() });

            dataSet.Data = this.createLegendRows(dataSet.Data);

            this.createDataRows(dataSet.Data);

            this.setState({ dataSet: data });
        });
        this.setState({ dataHandle: handle });

    }

    createLegendRows(data) {
        var ctrl = this;

        let legend: Array<iD3DataSeries> = [];

        let secondaryHeader: Array<string> = Array.from(new Set(data.map(item => item.SecondaryLegendClass)));
        let primaryHeader: Array<string> = Array.from(new Set(data.map(item => item.LegendClass)));


        data.sort((a, b) => {
            if (a.LegendGroup == b.LegendGroup) {
                return (a.ChartLabel > b.ChartLabel) ? 1 : ((b.ChartLabel > a.ChartLabel) ? -1 : 0)
            }
            return (a.LegendGroup > b.LegendGroup) ? 1 : ((b.LegendGroup > a.LegendGroup) ? -1 : 0)
        })


        $.each(data, function (i, key) {

            key.Display = false;
            key.Enabled = false;

            if (primaryHeader.length < 2 || key.LegendClass == primaryHeader[0]) {

                key.Display = true;

                if (secondaryHeader.length < 2 || key.SecondaryLegendClass == secondaryHeader[0]) {
                    key.Enabled = true;
                }
            }

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

        delete props.startTime;
        delete nextPropsClone.startTime;
        delete props.endTime;
        delete nextPropsClone.endTime;

        delete props.hover;
        delete nextPropsClone.hover;

        delete props.legendKey;
        delete nextPropsClone.legendKey;

        if (nextProps.startTime && nextProps.endTime) {
            if (this.xScale != null && (this.props.startTime != nextProps.startTime || this.props.endTime != nextProps.endTime)) {
                this.updateZoom(this, nextProps.startTime, nextProps.endTime);
            }
        }

        if (nextProps.hover != null && nextProps.hover != this.props.hover) {
            this.updateHover(this, nextProps.hover);
            
        }

        if (nextProps.legendKey != this.props.legendKey) {
            this.setState({
                dataSet: {
                    Data: null,
                    startDate: null,
                    endDate: null
                } })
            this.getData(nextProps);
        }

        if (!(isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
            

        }
        
    }

   
    // create Plot
    createDataRows(data) {
        // if start and end date are not provided calculate them from the data set
        var ctrl = this;

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

        function isNum(n) { return !isNaN(parseFloat(n)) }

        function isNumberMax(d) {
            if (isNum(d[1])) { return d[1] }
            else { return Number.MIN_VALUE }
        }
        function isNumberMin(d) {
            if (isNum(d[1])) { return d[1] }
            else { return Number.MIN_VALUE }
        }

        let ymin = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(isNumberMin))));
        let ymax = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(isNumberMax))));

        if (ymin == Number.MAX_VALUE) { ymin = NaN; }
        if (ymax == Number.MIN_VALUE) { ymax = NaN; }

        ctrl.yScale = d3.scaleLinear()
            .domain([ymin, ymax])
            .range([this.props.height - 60, 0]);

        ctrl.xScale = d3.scaleLinear()
            .domain([this.props.startTime, this.props.endTime])
            .range([20, container.node().getBoundingClientRect().width - 100])
            ;

        ctrl.yAxis = svg.append("g").attr("transform", "translate(20,0)").call(d3.axisLeft(ctrl.yScale));

        let timeLabel = "Time";

        if ((this.props.endTime - this.props.startTime) < 1000) {
            ctrl.xAxis = svg.append("g").attr("transform", "translate(0," + (this.props.height - 60) + ")").call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeMilliSeconds(d)));
            timeLabel = timeLabel + " (ms)";
        }
        else {
            ctrl.xAxis = svg.append("g").attr("transform", "translate(0," + (this.props.height - 60) + ")").call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeSeconds(d)));
            timeLabel = timeLabel + " (s)";
        }
        

        if (ctrl.props.options.showXLabel) {
            this.xlabel = svg.append("text")
                .attr("transform", "translate(" + ((container.node().getBoundingClientRect().width - 100) / 2) + " ," + (this.props.height - 20) + ")")
                .style("text-anchor", "middle")
                .text(timeLabel);
        }

        const distinct = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        let yLabel = lines.map(item => item.XaxisLabel).filter(distinct).join("/");
       
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",-30)
            .attr("x", -(this.props.height / 2 - 30))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);

        this.hover = svg.append("line")
            .attr("stroke", "#000")
            .attr("x1", 10).attr("x2", 10)
            .attr("y1", 0).attr("y2", this.props.height - 60)
            .style("opacity", 0.5);

        // for zooming
        this.brush = svg.append("rect")
            .attr("stroke", "#000")
            .attr("x", 10).attr("width", 0)
            .attr("y", 0).attr("height", this.props.height - 60)
            .attr("fill", "black")
            .style("opacity", 0);


        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip-" + this.props.legendKey)
            .append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0);

        


        ctrl.paths = svg.append("g").attr("id","path-" + this.props.legendKey).attr("clip-path", "url(#clip-" + this.props.legendKey + ")");

        
        lines.forEach((row, key, map) => {
            ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1] } })).attr("fill", "none")
                .attr("stroke", row.Color)
                .attr("stroke-width", 2.0)
                .attr("d", d3.line()
                    .x(function (d) { return ctrl.xScale(d.x) })
                    .y(function (d) { return ctrl.yScale(d.y) })
                    .defined(function (d) {
                        let tx = !isNaN(parseFloat(ctrl.yScale(d.x)));
                        let ty = !isNaN(parseFloat(ctrl.yScale(d.y)));
                        return tx && ty;
                    })
            );
        });      

        this.area = svg.append("g").append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mousemove', function () { ctrl.mousemove(ctrl) })
            .on('mouseout', function () { ctrl.mouseout(ctrl) })
            .on('mousedown', function () { ctrl.mousedown(ctrl) })
            .on('mouseup', function () { ctrl.mouseup(ctrl) })
            .on("wheel", function () { ctrl.mousewheel(ctrl) })
    }

    formatTimeSeconds(d) {

        let TS = moment(d);
        return TS.format("ss.SS")
    }

    formatTimeMilliSeconds(d) {

        let TS = moment(d);
        return TS.format("SSS.S")
    }


    updateZoom(ctrl: D3LineChartBase, startTime: number, endTime: number) {

        ctrl.xScale.domain([startTime, endTime]);

        ctrl.updateTimeAxis(ctrl, startTime, endTime)

        ctrl.yScale.domain(ctrl.getYLimits(ctrl, startTime, endTime));
        ctrl.yAxis.transition().duration(1000).call(d3.axisLeft(ctrl.yScale))

        ctrl.paths.selectAll('path')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function (d) { return ctrl.xScale(d.x) })
                .y(function (d) { return ctrl.yScale(d.y) })
            )
    }

    mousemove(ctrl: D3LineChartBase) {
        
            // recover coordinate we need
        var x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        
        let selectedData = x0
        
        if (ctrl.state.dataSet.Data.length > 0) {
            let i = d3.bisect(ctrl.state.dataSet.Data[0].DataPoints.map(item => item[0]), x0, 1);
            selectedData =ctrl.state.dataSet.Data[0].DataPoints[i][0]
        }



        ctrl.props.stateSetter({ Hover: ctrl.xScale(selectedData) });

        let h = ctrl.mousedownX - ctrl.xScale(selectedData);


        if (h < 0) {
            ctrl.brush.attr("width", -h)
                .attr("x", ctrl.mousedownX)
        }
        else {
            ctrl.brush.attr("width", h)
                .attr("x", ctrl.xScale(selectedData))
        }

    }

    mousedown(ctrl: D3LineChartBase) {
        // create square as neccesarry
        var x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);


        let selectedData = [x0]

        //if (ctrl.state.dataSet.Data.length > 0) {
        //    let i = d3.bisect(ctrl.state.dataSet.Data[0].DataPoints.map(item => item[0]), x0, 1);
        //    selectedData = ctrl.state.dataSet.Data[0].DataPoints[i];
        //}

        ctrl.mousedownX = ctrl.xScale(selectedData[0])

        ctrl.brush
            .attr("x", ctrl.xScale(selectedData[0]))
            .attr("width", 0)
            .style("opacity", 0.25)
        

    }

    updateHover(ctrl: D3LineChartBase, hover: number) {
        if (hover == null) {
            ctrl.hover.style("opacity", 0);
            return;
        }

        ctrl.hover.attr("x1", hover)
            .attr("x2", hover)

        ctrl.hover.style("opacity", 1);

    }

    mouseout(ctrl: D3LineChartBase) {
        ctrl.setState({ Hover: null });
        ctrl.brush.style("opacity", 0);
        ctrl.mousedownX = 0;
    }

    mouseup(ctrl: D3LineChartBase) {
        
        if (ctrl.mousedownX < 10) {
            ctrl.brush.style("opacity", 0);
            ctrl.mousedownX = 0;
            return;
        }

        let x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);

        let selectedData = [x0]

        //if (ctrl.state.dataSet.Data.length > 0) {
        //    let i = d3.bisect(ctrl.state.dataSet.Data[0].DataPoints.map(item => item[0]), x0, 1);
        //    selectedData = ctrl.state.dataSet.Data[0].DataPoints[i];
        //}


        let h = ctrl.mousedownX - ctrl.xScale(selectedData[0]);

        if (Math.abs(h) < 10) {
            h = 10;
        }

        if (Math.abs(ctrl.xScale.invert(ctrl.mousedownX) - selectedData[0]) > 10) {

            if (h < 0) {
                ctrl.props.stateSetter({ startTime: ctrl.xScale.invert(ctrl.mousedownX), endTime: selectedData[0] });
            }
            else {
                ctrl.props.stateSetter({ startTime: selectedData[0], endTime: ctrl.xScale.invert(ctrl.mousedownX) });
            }
        }

        ctrl.brush.style("opacity", 0);
        ctrl.mousedownX = 0;
    }

    mousewheel(ctrl: D3LineChartBase) {

        // start by figuring out new total
        let diffX = ctrl.props.endTime - ctrl.props.startTime
        let diffNew = diffX - diffX * 0.15 * d3.event.wheelDelta / 120;

        let zoomPoint = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);

        //then figure out left and right proportion
        let pLeft = (zoomPoint - ctrl.props.startTime) / diffX
        let pRight = (ctrl.props.endTime - zoomPoint) / diffX

        if (diffNew < 10) {
            diffNew = 10;
        }

        //ensure we do not go beyond startdate and enddate
        let newStartTime = Math.max((zoomPoint - pLeft * diffNew), moment.utc(ctrl.props.startDate).valueOf())
        let newEndTime = Math.min((zoomPoint + pRight * diffNew), moment.utc(ctrl.props.endDate).valueOf())

        ctrl.props.stateSetter({ startTime: newStartTime, endTime: newEndTime });
    }
    //Reset Axis
    resetChart(ctrl: D3LineChartBase) {

        ctrl.brush.style("opacity", 0);

        var startTime = new Date(ctrl.props.startDate + "Z").getTime();
        var endTime = new Date(ctrl.props.endDate + "Z").getTime();
        ctrl.xScale.domain([startTime, endTime]);

        ctrl.updateTimeAxis(ctrl, startTime, endTime)

        ctrl.paths.select(".brush").call(ctrl.brush.move, null)
        
        ctrl.xAxis.transition().duration(1000).call(d3.axisBottom(ctrl.xScale))
        ctrl.paths.selectAll('path')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function (d) { return ctrl.xScale(d.x) })
                .y(function (d) { return ctrl.yScale(d.y) })
            )
    }

    updateTimeAxis(ctrl: D3LineChartBase, startTime: number, endTime: number) {

        let timeLabel = "Time"
        if ((endTime - startTime) < 1000) {
            ctrl.xAxis.transition().duration(1000).call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeMilliSeconds(d)))
            timeLabel = timeLabel + " (ms)";
        }
        else {
            ctrl.xAxis.transition().duration(1000).call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeSeconds(d)))
            timeLabel = timeLabel + " (s)";
        }

        if (ctrl.props.options.showXLabel) {
            ctrl.xlabel.text(timeLabel)
        }
    }

    // Get current Y axis limits
    getYLimits(ctrl: D3LineChartBase, startTime: number, endTime: number) {

        var lines = [];
        ctrl.state.dataSet.Data.forEach((row, key, map) => {
            if (row.Enabled) {
                lines.push(row);
            }
        });


        let ymax = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(item => item[1]))));
        let ymin = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(item => item[1]))));

        let xmin = startTime;
        let xmax = endTime;

        lines.forEach((row, index, map) => {
            row.DataPoints.forEach((pt, i, points) => {
                if (pt[0] < xmax && pt[0] > xmin) {
                    if (pt[1] > ymax) {
                        ymax = pt[1];
                    }
                    if (pt[1] < ymin) {
                        ymin = pt[1];
                    }
                }
            })
        })

        return [ymin, ymax];
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