﻿//******************************************************************************************************
//  LightningData.tsx - Gbtc
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
//  03/13/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { utc } from 'moment';
import OpenSEEService from './../../../TS/Services/OpenSEE';
import { style } from "typestyle"

declare var window: any

// styles
const outerDiv = style({
    minWidth: '200px',
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
});

const handle = style({
    width: '100%',
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

export default class LightningData extends React.Component<any, any>{
    props: { eventId: number, callback: Function }
    state: { rows: Array<Object>, header: Array<Object> }
    openSEEService: OpenSEEService;

    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();

        this.state = {
            rows: [],
            header: []
        };
    }

    componentDidMount() {
        ($("#lightningquery") as any).draggable({ scroll: false, handle: '#lightninghandle', containment: '#chartpanel' });

        var lightningQuery = window.LightningQuery;

        if (lightningQuery === undefined)
            return;

        var updateTable = displayData => {
            var arr = Array.isArray(displayData) ? displayData : [displayData];
            var header = HeaderRow(arr[0]);
            var rows = arr.map(Row);
            this.setState({ header: header, rows: rows });
        };

        var errHandler = err => {
            var message = "Unknown error";

            if (typeof (err) === "string")
                message = err;
            else if (err && typeof (err.message) === "string" && err.message !== "")
                message = err.message;

            updateTable({ Error: message });
        };

        updateTable({ State: "Loading..." });
        this.props.callback({ enableLightningData: true });

        this.openSEEService.getLightningParameters(this.props.eventId).done(lightningParameters => {
            var noData = { State: "No Data" };

            var lineKey = lightningParameters.LineKey;
            var startTime = utc(lightningParameters.StartTime).toDate();
            var endTime = utc(lightningParameters.EndTime).toDate();

            if (!lineKey) {
                updateTable(noData);
                return;
            }

            lightningQuery.queryLineGeometry(lineKey, lineGeometry => {
                lightningQuery.queryLineBufferGeometry(lineGeometry, lineBufferGeometry => {
                    lightningQuery.queryLightningData(lineBufferGeometry, startTime, endTime, lightningData => {
                        var displayData = (lightningData.length !== 0) ? lightningData : noData;
                        updateTable(displayData);
                    }, errHandler);
                }, errHandler);
            }, errHandler);
        });
    }

    render() {
        return (
            <div id="lightningquery" className={`${outerDiv} ui-widget-content`} style={{ position: 'absolute' }}>
                <div id="lightninghandle" className={handle}></div>
                <div id="lightningcontent" style={{ maxWidth: 800 }}>
                    <table className="table" style={{fontSize: 'small', marginBottom: 0}}>
                        <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)'}}>
                            {this.state.header}
                        </thead>
                        <tbody style={{ maxHeight: 500, overflowY: 'auto', display: 'block'}}>
                            {this.state.rows}
                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ lightningDataButtonText: "Show Lightning Data" });
                    $('#lightningquery').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row, index) => {
    return (
        <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={"row" + index.toString()}>
            {Object.keys(row).map(key => <td key={"row" + index.toString() + key}>{row[key]}</td>)}
        </tr>
    );
}

const HeaderRow = (row) => {
    return (
        <tr key='Header'>
            {Object.keys(row).map(key => <th key={key}>{key}</th>)}
        </tr>
    );
}


