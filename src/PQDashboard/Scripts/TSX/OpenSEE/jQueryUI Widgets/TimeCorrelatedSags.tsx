//******************************************************************************************************
//  TimeCorrelatedSags.tsx - Gbtc
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
//  02/05/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import { style } from "typestyle"

// styles
const outerDiv: React.CSSProperties = {
    minWidth: '200px',
    maxWidth: '400px',
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowY: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white'
};

const handle = style({
    width: '100 %',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});


export default class HarmonicStats extends React.Component<any, any>{
    props: { eventId: number, callback: Function, exportCallback: Function }
    state: { rows: Array<Object>, header: Array<Object>, exportData: any}
    openSEEService: OpenSEEService;

    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.state = {
            rows: [],
            header: [],
            exportData: null
        };
    }

    componentDidMount() {
        ($("#correlatedsags") as any).draggable({ scroll: false, handle: '#correlatedsagshandle' });

        this.openSEEService.getTimeCorrelatedSags(this.props.eventId).done(data => {
            var header = HeaderRow(this.props.exportCallback);
            var rows = [];

            for (var index = 0; index < data.length; ++index) {
                var row = data[index];
                var background = 'default';

                if (row.EventID == this.props.eventId)
                    background = 'lightyellow';

                rows.push(Row(row, background));
            }

            this.setState({header: header, rows: rows});
        });
    }

    render() {
        return (
            <div id="correlatedsags" className="ui-widget-content" style={outerDiv}>
                <div id="correlatedsagshandle" className={handle}></div>
                <div id="correlatedsagscontent">
                    <table className="table" style={{fontSize: 'small', marginBottom: 0}}>
                        <thead style={{ display: 'table', tableLayout: 'fixed'}}>
                            {this.state.header}
                        </thead>
                        <tbody style={{ maxHeight: 500, overflowY: 'auto', display: 'block'}}>
                            {this.state.rows}
                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ correlatedSagsButtonText: "Show Correlated Sags" });
                    $('#correlatedsags').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row, background) => {

    return (
        <tr style={{ display: 'table', tableLayout: 'fixed', background: background }} key={row.EventID}>
            <td style={{ width: 60 }} key={'EventID' + row.EventID}><a href={'./OpenSEE?eventid=' + row.EventID}><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
            <td style={{ width: 80 }} key={'EventType' + row.EventID}>{row.EventType}</td>
            <td style={{ width: 80 }} key={'SagMagnitude' + row.EventID}>{row.SagMagnitudePercent}%</td>
            <td style={{ width: 150 }} key={'SagDuration' + row.EventID}>{row.SagDurationMilliseconds} ms ({row.SagDurationCycles} cycles)</td>
            <td style={{ width: 220 }} key={'StartTime' + row.EventID}>{row.StartTime}</td>
            <td style={{ width: 150 }} key={'MeterName' + row.EventID}>{row.MeterName}</td>
            <td style={{ width: 400 }} key={'LineName' + row.EventID}>{row.LineName}</td>
        </tr>
    );
}

const HeaderRow = (exportCallback) => {
    return (
        <tr key='Header'>
            <th style={{ width: 60 }} key='EventID'>Event ID</th>
            <th style={{ width: 80 }} key='EventType'>Event Type</th>
            <th style={{ width: 80 }} key='SagMagnitude'>Magnitude</th>
            <th style={{ width: 150 }} key='SagDuration'>Duration</th>
            <th style={{ width: 220 }} key='StartTime'>Start Time</th>
            <th style={{ width: 150 }} key='MeterName'>Meter Name</th>
            <th style={{ width: 'calc(400px - 1em)' }} key='LineName'>Line Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => exportCallback("correlatedsags")}>Export(csv)</button></th>
        </tr>
    );
}



