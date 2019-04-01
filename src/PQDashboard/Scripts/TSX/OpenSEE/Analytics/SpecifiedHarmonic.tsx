//******************************************************************************************************
//  SpecifiedHarmonic.tsx - Gbtc
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
import OpenSEEService from './../../../TS/Services/OpenSEE';
import LineChartAnalyticBase, { LineChartAnaltyicalBaseProps } from './../Graphs/LineChartAnalyticBase';
import { iLegendData } from '../Graphs/Legend';

export default class SpecifiedHarmonic extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: LineChartAnaltyicalBaseProps
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();

        this.createLegendRows = this.createLegendRows.bind(this);
        this.getData = this.getData.bind(this);
    }

    createLegendRows(data, ctrl) {
        var legend = new Map<string, iLegendData>();

        $.each(data, function (i, key) {
            var record = legend.get(key.ChartLabel);
            if (record == undefined)
                legend.set(key.ChartLabel, { color: ctrl.getColor(key, i), display: ctrl.props.legendDisplay(key.ChartLabel), enabled: ctrl.props.legendEnable(key.ChartLabel), data: key.DataPoints, harmonic: 1 });
            else
                legend.get(key.ChartLabel).data = key.DataPoints
        });

        legend = new Map(Array.from(legend).sort((a, b) => {
            return natural_compare(a[0], b[0]);
        }));
        ctrl.setState({ legendRows: legend });
        return legend;

        function pad(n) { return ("00000000" + n).substr(-8); }
        function natural_expand(a) { return a.replace(/\d+/g, pad) };
        function natural_compare(a, b) {
            return natural_expand(a).localeCompare(natural_expand(b));
        }

    }

    getData(props, ctrl: LineChartAnalyticBase) {
        var legendRow = ctrl.state.legendRows.entries().next().value;
        var harmonic = 1;
        if (legendRow != undefined)
            harmonic = legendRow[1].harmonic;

        var handle = this.openSEEService.getSpecifiedHarmonicData(props.eventId, props.pixels, harmonic, props.startDate, props.endDate).then(data => {
            if (data == null) {
                return;
            }

            var hightlightFunction = ctrl.props.highlightCycle == undefined || ctrl.props.highlightCycle ? ctrl.highlightCycle : ctrl.highlightSample
            ctrl.options['grid'].markings.push(hightlightFunction(data));

            var legend = this.createLegendRows(data.Data, ctrl);

            ctrl.createDataRows(data, legend);
            ctrl.setState({ dataSet: data });
        });
        ctrl.setState({ dataHandle: handle });


    }
    render() {
        var ctrl = this;
        return <LineChartAnalyticBase
            legendDisplay={(key) => key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0}
            legendEnable={(key) => key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0}
            legendKey="SpecifiedHarmonic"
            openSEEServiceFunction={ctrl.openSEEService.getFirstDerivativeData}
            getData={this.getData}

            endDate={this.props.endDate}
            eventId={this.props.eventId}
            height={this.props.height}
            hover={this.props.hover}
            pixels={this.props.pixels}
            pointsTable={this.props.pointsTable}
            postedData={this.props.postedData}
            startDate={this.props.startDate}
            stateSetter={this.props.stateSetter}
            tableData={this.props.tableData}
            tableSetter={this.props.tableSetter}
            tooltipWithDeltaTable={this.props.tooltipWithDeltaTable}
        />
    }

}