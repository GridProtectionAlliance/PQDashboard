//******************************************************************************************************
//  EventSearchAssetVoltageDisturbances.tsx - Gbtc
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as moment from 'moment';
import PQDashboardService from './../../../../TS/Services/PQDashboard';

export default class EventSearchHistory extends React.Component<{ eventId: number }, {tableRows: Array<JSX.Element> }>{
    pqDashboardService: PQDashboardService;
    constructor(props, context) {
        super(props, context);

        this.pqDashboardService = new PQDashboardService();

        this.state = {
            tableRows: []
        };
    }

    componentDidMount() {
        if (this.props.eventId >= 0)
            this.createTableRows(this.props.eventId);
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.eventId >= 0)
            this.createTableRows(nextProps.eventId);
    }


    createTableRows(eventID: number) {
        this.pqDashboardService.getEventSearchAsssetHistoryData(eventID).done(data => {
            var rows = data.map((d,i) =>
                <tr key={i}>
                    <td>{d.EventType}</td>
                    <td>{moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS')}</td>
                    <td><a href={homePath + 'Main/OpenSEE?eventid=' + d.ID} target="_blank">View in OpenSEE</a></td>
                </tr>)

            this.setState({ tableRows: rows});
        });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">Asset History:</div>

                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr><th>Event Type</th><th>Date</th><th></th></tr>
                        </thead>
                        <tbody>
                            {this.state.tableRows}
                        </tbody>

                    </table>

                </div>
            </div>
        );
    }
}
