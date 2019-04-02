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
import './../../../jquery-ui.js';
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
            <div id="scalarstats" className="ui-widget-content" style={outerDiv}>
                <div id="statshandle" className={handle}></div>
                <div id="statscontent" style={{maxWidth: 500, overflowX: 'auto'}}>
                    <table className="table" style={{fontSize: 'small', marginBottom: 0}}>
                        <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)'}}>
                            <tr><th>Stat</th><th>Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => this.props.exportCallback("stats")}>Export(csv)</button></th></tr>
                        </thead>
                        <tbody style={{ maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                            {this.state.rows}
                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ statButtonText: "Show Stats" });
                    $('#scalarstats').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row) => {
    return (
        <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={row.label}>
            <td>{row.label}</td>
            <td>{row.data}</td>
        </tr>
    );
}

