//******************************************************************************************************
//  LowPassFilter.ts - Gbtc
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

import { createElement } from 'react';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import LineChartAnalyticBase, { LineChartAnaltyicalBaseProps } from './../Graphs/LineChartAnalyticBase';

export default function LowPassFilter(props: LineChartAnaltyicalBaseProps): JSX.Element {
    var openSEEService = new OpenSEEService();
    return createElement(LineChartAnalyticBase, {
        legendDisplay: (key) => key.indexOf("V") == 0,
        legendEnable: (key) => key.indexOf("V") == 0,
        legendKey: "LowPassFilter",
        openSEEServiceFunction: (eventid, pixels, startDate, endDate) => openSEEService.getLowPassFilterData(eventid, pixels,1, startDate, endDate),
        endDate: props.endDate,
        eventId: props.eventId,
        height: props.height,
        hover: props.hover,
        pixels: props.pixels,
        pointsTable: props.pointsTable,
        postedData: props.postedData,
        startDate: props.startDate,
        stateSetter: props.stateSetter,
        tableData: props.tableData,
        tableSetter: props.tableSetter,
        tooltipWithDeltaTable: props.tooltipWithDeltaTable,
    }, null);
}