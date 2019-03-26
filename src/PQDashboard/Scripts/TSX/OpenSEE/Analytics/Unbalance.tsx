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
import * as ReactDOM from 'react-dom';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import LineChartAnalyticBase, { LineChartAnaltyicalBaseProps } from './../Graphs/LineChartAnalyticBase';

export default class Unbalance extends React.Component {
    openSEEService: OpenSEEService;
    props: LineChartAnaltyicalBaseProps
    constructor(props, context) {
        super(props, context);

        this.openSEEService = new OpenSEEService();
    }
    getColor(label) {
        if (label.ChartLabel.indexOf('S0') >= 0) return '#2e2a41';
        if (label.ChartLabel.indexOf('S1') >= 0) return '#d417a3';
        if (label.ChartLabel.indexOf('S2') >= 0) return '#78e0fd';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }

    render() {
        return <LineChartAnalyticBase
            legendDisplay={(key) => key.indexOf("V") == 0}
            legendEnable={(key) => key.indexOf("V") == 0}
            legendKey="Unbalance"
            openSEEServiceFunction={this.openSEEService.getUnbalanceData}
            getColor={this.getColor}

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

               />
    }
}