//******************************************************************************************************
//  HarmonicStats.tsx - Gbtc
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
    state: { rows: Array<Object>, header: Array<Object>, secondaryHeader: Array<Object>, exportData: any}
    openSEEService: OpenSEEService;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.state = {
            rows: [],
            header: [],
            secondaryHeader: [],
            exportData: null
        };
    }
    componentDidMount() {
        ($("#harmonicstats") as any).draggable({ scroll: false, handle: '#harmonichandle' });
        this.openSEEService.getHarmonicStats(this.props.eventId).done(data => {
            var headers = HeaderRow(data.map(x => x.Channel), this.props.exportCallback);
            var secondaryHeader = SecondaryHeaderRow(data.map(x => x.Channel));
            var jsons = data.map(x => JSON.parse(x.SpectralData));
            var numHarmonics = Math.max(...jsons.map(x => Object.keys(x).length));
            var numChannels = data.length;

            var rows = [];

            for (var index = 1; index <= numHarmonics; ++index) {
                var tds = [];
                var label = 'H' + index
                for (var j = 0; j < numChannels; ++j) {
                    var key = data[j].Channel + label
                    if (jsons[j][label] != undefined) {
                        tds.push(<td key={key + 'Mag'}>{jsons[j][label].Magnitude.toFixed(2)}</td>);
                        tds.push(<td key={key + 'Ang'}>{jsons[j][label].Angle.toFixed(2)}</td>);
                    }
                    else {
                        tds.push(<td key={key + 'Mag'}></td>);
                        tds.push(<td key={key + 'Ang'}></td>);
                    }
                }
                rows.push(Row({label: label, tds: tds}))
            }
            this.setState({header: headers, secondaryHeader: secondaryHeader, rows: rows});
        });
    }

    render() {

        return (
            <div id="harmonicstats" className="ui-widget-content" style={outerDiv}>
                <div id="harmonichandle" className={handle}></div>
                <div id="harmoniccontent">
                    <table className="table" style={{fontSize: 'large', marginBottom: 0}}>
                        <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)'}}>
                            {this.state.header}
                            {this.state.secondaryHeader}
                        </thead>
                        <tbody style={{ fontSize: 'medium', height: 500, maxHeight: 500, overflowY: 'auto', display: 'block'}}>
                            {this.state.rows}
                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ statButtonText: "Show Stats" });
                    $('#harmonicstats').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row) => {
    return (
        <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={row.label}>
            <td>{row.label}</td>
            {row.tds}
        </tr>
    );
}

const HeaderRow = (row, callback) => {
    return (
        <tr key='Header'><th colSpan={1}><button className='btn btn-primary' onClick={() => callback('harmonics')}>Export(csv)</button></th>
            {row.map(key => <th colSpan={2} scope='colgroup' key={key}>{key}</th>)}
        </tr>
    );
}
const SecondaryHeaderRow = (row) => {
    var tds = [];
    $.each(row, (i, r) => {
        tds.push(<th key={r.toString() + 'Mag'}>Mag</th>);
        tds.push(<th key={r.toString() + 'Ang'}>Ang</th>);
    });

    return (
        <tr key='SecondaryHeader'><th>Harmonic</th>{tds}</tr>
    );
}



