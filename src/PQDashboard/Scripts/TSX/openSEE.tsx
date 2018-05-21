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
import PolarChart from './PolarChart';
import Points from './AccumulatedPoints';
import Tooltip from './Tooltip';

export class OpenSEE extends React.Component<any, any>{
    history: object;
    openSEEService: OpenSEEService;
    resizeId: any;
    TableData: object;

    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);
        this.resizeId;
        this.state = {
            eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate'],
            displayVolt: true,
            displayCur: true,
            faultcurves: query['faultcurves'],
            breakerdigitals: query['breakerdigitals'],
            Height: (window.innerHeight - $('#pageHeader').height()-30) / (2 + Number(Boolean(query['faultcurves'])) + Number(Boolean(query['breakerdigitals']))),
            Width: window.innerWidth,
            Hover: 0,
            PointsTable: [],
            TableData: {}
        }
        this.TableData = {};
        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate'],
                faultcurves: query['faultcurves'],
                breakerdigitals: query['breakerdigitals'],
            });
        });

        ReactDOM.render(<button className="smallbutton" onClick={() => this.resetZoom()}>Reset Zoom</button>, document.getElementById('resetBtn'));

    }

    componentDidMount() {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
    }

    componentWillUnmount() {
        $(window).off('resize');
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.setState({
                Width: window.innerWidth,
                Height: (window.innerHeight - $('#pageHeader').height() - 30) / (Number(this.state.displayVolt) + Number(this.state.displayCur) + Number(this.state.FaultCurves) + Number(this.state.BreakerDigitals))
            });
        }, 500);
    }

    render() {
        return ( 
            <div className="panel-body collapse in" style={{ padding: '0' }}>
                <PolarChart data={this.state.TableData} callback={this.stateSetter.bind(this)}/>
                <Points pointsTable={this.state.PointsTable} callback={this.stateSetter.bind(this)} />
                <Tooltip data={this.state.TableData} hover={this.state.Hover}/>

                <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Voltage" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} showXAxis={true} height={this.state.Height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayVolt}></WaveformViewerGraph>
                <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Current" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} showXAxis={true} height={this.state.Height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayCur}></WaveformViewerGraph>
                <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="F" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} showXAxis={true} height={this.state.Height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.faultcurves}></WaveformViewerGraph>
                <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="B" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} showXAxis={true} height={this.state.Height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.breakerdigitals}></WaveformViewerGraph>                
            </div>
        );
    }

    stateSetter(obj) {
        this.setState(obj, () => {
            var prop = _.clone(this.state);
            delete prop.Hover;
            delete prop.Height;
            delete prop.Width;
            delete prop.TableData;
            delete prop.PointsTable;
            delete prop.displayCur;
            delete prop.displayVolt;

            var qs = queryString.parse(queryString.stringify(prop, { encode: false }));
            var hqs = queryString.parse(this.history['location'].search);

            if(!_.isEqual(qs, hqs))
                this.history['push']('OpenSEE?' + queryString.stringify(prop, { encode: false }));
        });
    }

    tableUpdater(obj) {
        this.TableData = _.merge(this.TableData, obj);
        this.setState({ TableData: this.TableData });
    }

    resetZoom() {
        this.history['push']('OpenSEE?eventid=' + this.state.eventid + (this.state.faultcurves == 1 ? '&faultcurves=1' : '') + (this.state.breakerdigitals == 1 ? '&breakerdigitals=1': ''));
    }

}

ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));
