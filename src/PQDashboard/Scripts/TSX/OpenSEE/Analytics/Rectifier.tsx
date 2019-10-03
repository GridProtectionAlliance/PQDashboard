//******************************************************************************************************
//  SymmetricalComponents.tsx - Gbtc
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
//  03/20/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import LineChartAnalyticBase, { LineChartAnaltyicalBaseProps } from './../Graphs/LineChartAnalyticBase';
import { iLegendData } from '../Graphs/Legend';


interface rectifierProps extends LineChartAnaltyicalBaseProps {
    Trc: number;
}

export default class Rectifier extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: rectifierProps
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.getData = this.getData.bind(this);
    }


    getData(props, ctrl: LineChartAnalyticBase) {
        console.log(props);

        var legendRow = ctrl.state.legendRows.entries().next().value;
        var handle = this.openSEEService.getRectifierData(props.eventId, props.pixels, this.props.Trc, props.startDate, props.endDate).then(data => {
            if (data == null) {
                return;
            }

            var hightlightFunction = ctrl.props.highlightCycle == undefined || ctrl.props.highlightCycle ? ctrl.highlightCycle : ctrl.highlightSample
            var highlight = hightlightFunction(data);
            if (highlight != undefined)
                ctrl.options['grid'].markings.push(highlight);

            var legend = ctrl.createLegendRows(data.Data);

            ctrl.createDataRows(data, legend);
            ctrl.setState({ dataSet: data });
        });
        ctrl.setState({ dataHandle: handle });
        ctrl.setState({ Trc: this.props.Trc });

    }
    render() {
        var ctrl = this;
        return <LineChartAnalyticBase
            legendDisplay={(key) => key.indexOf("V") == 0}
            legendEnable={(key) => key.indexOf("V") == 0}
            legendKey={"Rectifier"}
            openSEEServiceFunction={ctrl.openSEEService.getFirstDerivativeData}
            getData={this.getData}
            endDate={this.props.endDate}
            getColor={(key, index) => this.getColor(key)}
            eventId={this.props.eventId}
            height={this.props.height}
            hover={this.props.hover}
            pixels={this.props.pixels}
            pointsTable={this.props.pointsTable}
            postedData={this.props.postedData}
            startDate={this.props.startDate}
            stateSetter={this.props.stateSetter}
            Trc={this.props.Trc}
            tableData={this.props.tableData}
            tableSetter={this.props.tableSetter}
            tooltipWithDeltaTable={this.props.tooltipWithDeltaTable}
        />
    }

    getColor(label) {
        if (label.ChartLabel.indexOf('Rectifier') >= 0) return '#2e2a41';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }
}