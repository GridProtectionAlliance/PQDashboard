//******************************************************************************************************
//  openSEE.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OpenSEEService from './../TS/Services/OpenSEE';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";
import WaveformViewerGraph from './WaveformViewerGraph';

export class OpenSEE extends React.Component<any, any>{
    history: object;
    openSEEService: OpenSEEService;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
            EventId: (query['eventid'] != undefined ? query['eventid'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate'],
            FaultCurves: Boolean(query['faultcurves']),
            BreakerDigitals: Boolean(query['breakerdigitals']),
            Height: (window.innerHeight - 90) / (2 +  Number(Boolean(query['faultcurves'])) + Number(Boolean(query['breakerdigitals'])))
        }

        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                EventID: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate']
            });
        });
    }

    render() {
        return ( 
            <div className="panel-body collapse in" style={{ padding: '0' }}>
                <WaveformViewerGraph eventId={this.state.EventId} startDate={this.state.StartDate} endDate={this.state.EndDate} type="V" pixels={window.innerWidth} stateSetter={this.stateSetter} showXAxis={true} height={this.state.Height}></WaveformViewerGraph>
                <WaveformViewerGraph eventId={this.state.EventId} startDate={this.state.StartDate} endDate={this.state.EndDate} type="I" pixels={window.innerWidth} stateSetter={this.stateSetter} showXAxis={true} height={this.state.Height}></WaveformViewerGraph>
                {(this.state.FaultCurves ? <WaveformViewerGraph eventId={this.state.EventId} startDate={this.state.StartDate} endDate={this.state.EndDate} type="F" pixels={window.innerWidth} stateSetter={this.stateSetter} showXAxis={true}></WaveformViewerGraph> : '')}
                {(this.state.BreakerDigitals ? <WaveformViewerGraph eventId={this.state.EventId} startDate={this.state.StartDate} endDate={this.state.EndDate} type="B" pixels={window.innerWidth} stateSetter={this.stateSetter} showXAxis={true}></WaveformViewerGraph> : '')}                
            </div>
        );
    }

       stateSetter(obj) {
        this.setState(obj);
    }

}

 ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));