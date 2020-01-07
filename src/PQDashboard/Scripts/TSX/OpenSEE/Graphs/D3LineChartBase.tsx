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
import { clone, isEqual, each, findLast} from "lodash";
import { utc } from "moment";
import D3Legend, { iD3LegendData } from './D3Legend';
import { StandardAnalyticServiceFunction } from '../../../TS/Services/OpenSEE';

export type LegendClickCallback = (event?: React.MouseEvent<HTMLDivElement>, row?: iD3LegendData, key?: string, getData?: boolean) => void;
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
interface iD3DataSeries {
    ChannelID: number, ChartLabel: string, XaxisLabel: string, Color: string, LegendClass: string, SecondaryLegendClass: string, LegendGroup: string, DataPoints: Array<[number, number]>
}


export default class D3LineChartBase extends React.Component<D3LineChartBaseClassProps, any>{
    plot: any;
    state: { legendRows: Map<string, iD3LegendData>, dataSet: iD3DataSet, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        ctrl.state = {
            legendRows: new Map<string, iD3LegendData>(),
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

            var legend = this.createLegendRows(data.Data);

            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            //this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });
        this.setState({ dataHandle: handle });

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

    createLegendRows(data) {
        var ctrl = this;

        var legend = (this.state.legendRows != undefined ? this.state.legendRows : new Map<string, iD3LegendData>());

        $.each(data, function (i, key) {
            var record = legend.get(key.ChartLabel);

            if (record == undefined)
                legend.set(key.ChartLabel, {
                    color: key.Color, display: ctrl.props.legendDisplay(key.ChartLabel), enabled: ctrl.props.legendEnable(key.ChartLabel), channelID: key.ChannelID, chartLabel: key.ChartLabel, legendClass: key.LegendClass,
                    legendGroup: "Test", secondaryLegendClass: key.SecondaryLegendClass});

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
   
    // round to nearby lower multiple of base
    floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iD3LegendData, key: string, getData?: boolean): void {
        if (row != undefined)
            row.enabled = !row.enabled;

        this.setState({ legendRows: this.state.legendRows });

       if (getData == true)
            this.getData(this.props);
    }


    render() {
        return (
            <div>
                <div ref="graphWindow" style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)'}}></div>
                <D3Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height}/>
            </div>
        );
    }




    
    
}