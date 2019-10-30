//******************************************************************************************************
//  EventSearchRelayPerformance.tsx - Gbtc
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
//  09/21/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
declare var homePath: string;

import * as React from 'react';
import * as moment from 'moment';
import OpenSEEService from '../../../../TS/Services/OpenSEE';

export default class RelayPerformanceTrend extends React.Component<{ breakerid: number, channelid: number }, {tableRows: Array<JSX.Element> }>{
    openSEEService: OpenSEEService;
    constructor(props, context) {
        super(props, context);

        this.openSEEService = new OpenSEEService();

        this.state = {
            tableRows: []
        };
    }

    componentDidMount() {
        if (this.props.breakerid >= 0)
            this.createTableRows(this.props.breakerid, this.props.channelid);
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.breakerid >= 0)
            this.createTableRows(nextProps.breakerid, nextProps.channelid);
    }


    createTableRows(eventID: number, channelid: number) {
        this.openSEEService.getRelayTrendPerformance(this.props.breakerid, this.props.channelid).done(data => {
            var rows = [];
            for (var index = 0; index < data.length; ++index) {
                var row = data[index];
                var background = 'default';

                rows.push(Row(row, background));
            }

            this.setState({ tableRows: rows });
        });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">Breaker Performance:</div>

                <div className="card-body">
                    <table className="table">
                        <thead>
                            <HeaderRow />
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

const Row = (row, background) => {
    return (
        <tr style={{ background: background }} key={row.EventID}>
            <td key={'EventID' + row.EventID}><a id="eventLink" target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + row.EventID} ><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
            <td key={'InitiateTime' + row.EventID}>{moment(row.TripInitiate).format('MM/DD/YY HH:mm:ss.SSSS')}</td>
            <td key={'TripTime' + row.EventID}>{row.TripTime} micros</td>
            <td key={'PickupTime' + row.EventID}>{row.PickupTime} micros</td>
            <td key={'ExtinctionTime' + row.EventID}> micros</td>
            <td key={'TripCoilCondition' + row.EventID}>{row.TripCoilCondition.toFixed(2)} A/s</td>
            <td key={'L1' + row.EventID}>{row.Imax1.toFixed(3)} A</td>
            <td key={'L2' + row.EventID}>{row.Imax2.toFixed(3)} A</td>
        </tr>
    );
}

const HeaderRow = () => {
    return (
        <tr key='Header'>
            <th key='EventID'>Event ID</th>
            <th key='InitiateTime'>Trip Initiation Time</th>
            <th key='TripTime'>Trip Time</th>
            <th key='PickupTime'>Pickup Time</th>
            <th key='ExtinctionTime'>Extinction Time</th>
            <th key='TripCoilCondition'>Trip Coil Condition</th>
            <th key='L1'>L1</th>
            <th key='L2'>L2</th>
        </tr>
    );
}


