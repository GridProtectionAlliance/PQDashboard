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

import * as React  from 'react';
import * as ReactDOM from 'react-dom';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import BarChartAnalyticBase, { BarChartAnaltyicalBaseProps } from './../Graphs/BarChartAnalyticBase';

export default class FFT extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: BarChartAnaltyicalBaseProps
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
    }

    componentWillUnmount() {
        this.props.stateSetter({fftStartTime: undefined, fftEndTime: undefined});
    }

    render() {
        return <BarChartAnalyticBase
            openSEEServiceFunction={this.openSEEService.getFFTData}
            legendEnable={(key) => key.indexOf("VAN") == 0 && key.indexOf("Mag") >= 0}
            legendDisplay={(key) => key.indexOf("V") == 0 && key.indexOf("Mag") >= 0}
            legendKey="FFT"
            fftStartTime={this.props.fftStartTime}
            fftEndTime={this.props.fftEndTime}

            eventId={this.props.eventId}
            height={this.props.height}
            pixels={this.props.pixels}
            pointsTable={this.props.pointsTable}
            postedData={this.props.postedData}
            stateSetter={this.props.stateSetter}
            tableData={this.props.tableData}
            tableSetter={this.props.tableSetter}

        />
    }

}