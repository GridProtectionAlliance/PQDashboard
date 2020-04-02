//******************************************************************************************************
//  FFTTable.tsx - Gbtc
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
import OpenSEEService from './../../../TS/Services/OpenSEE';
import { style } from "typestyle"

const outerDiv: React.CSSProperties = {
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


export default class FFTTable extends React.Component<any, any>{
    props: { dataSet: { Data: Array<{ChartLabel: string, DataPoints: any}>, CalculationTime:number, CalculationEnd: number} }
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        ($("#ffttable") as any).draggable({ scroll: false, handle: '#ffttablehandle', containment: '#chartpanel' });
    }

    render() {
        var table = null;
        if (this.props.dataSet.Data != undefined) {
            var width = 'calc(' +parseInt((100/(this.props.dataSet.Data.length + 1)).toString()) + '%)';

            table = <table className="table" style={{ fontSize: 'large', marginBottom: 0 }}>
                <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' }}>
                    <tr><th style={{ width: width }}>Harmonic</th>{this.props.dataSet.Data.map(x => <th style={{ width: width }} key={'header-'+x.ChartLabel}>{x.ChartLabel}</th>)}</tr>
                </thead>
                <tbody style={{ fontSize: 'medium',  maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                    {
                        Object.keys(this.props.dataSet.Data[0].DataPoints).sort((a,b) => parseFloat(a) - parseFloat(b)).map(x => <tr style={{ width: 'calc(100%)', display: 'table' }} key={x}><td style={{ width: width }} key={x + '-harmonic'}>{x}</td>{this.props.dataSet.Data.map(data => <td style={{ width: width }} key={x + '-' + data.ChartLabel}>{data.DataPoints[x].toFixed(3)}</td>)}</tr>)
                    }
                </tbody>
            </table>
        }
        return (
            <div id="ffttable" className="ui-widget-content" style={outerDiv}>
                <div id="ffttablehandle" className={handle}></div>
                <div style={{ maxWidth: 1700 }}>
                    {table}
                </div>
                <button className={closeButton} onClick={() => {
                    $('#ffttable').hide();
                }}>X</button>
            </div>
        );
    }
}

