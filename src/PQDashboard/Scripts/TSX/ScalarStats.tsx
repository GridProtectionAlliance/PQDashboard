//******************************************************************************************************
//  ScalarStats.tsx - Gbtc
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
//  05/14/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as _ from "lodash";
import './../jquery-ui.js';
import OpenSEEService from './../TS/Services/OpenSEE';
// Import bootstrap css
//import 'bootstrap/dist/css/bootstrap.min.css';

export default class ScalarStats extends React.Component<any, any>{
    props: { eventId: number, callback: Function, exportCallback: Function }
    state: { rows: Array<Object> }
    openSEEService: OpenSEEService;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.state = {
            rows : []
        };
    }
    componentDidMount() {
        ($("#scalarstats") as any).draggable({ scroll: false, handle: '#statshandle' });
        this.openSEEService.getScalarStats(this.props.eventId).done(data => {
            var rows = Object.keys(data).map(key => Row({ label: key, data: data[key] }));
            this.setState({rows: rows});
        });
    }

    render() {

        return (
            <div id="scalarstats" className="ui-widget-content" style={{ position: 'absolute', top: '0', display: 'none' }}>
                <div id="statshandle"></div>
                <div id="statscontent">
                    <table className="table" style={{fontSize: 'large'}}>
                        <thead>
                            <tr><th>Stat</th><th>Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => this.props.exportCallback("stats")}>Export(csv)</button></th></tr>
                        </thead>
                        <tbody>
                            {this.state.rows}
                        </tbody>
                    </table>
                </div>
                <button className="CloseButton" onClick={() => {
                    this.props.callback({ statButtonText: "Show Stats" });
                    $('#scalarstats').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row) => {
    return (
        <tr key={row.label}>
            <td>{row.label}</td>
            <td>{row.data}</td>
        </tr>
    );
}

