//******************************************************************************************************
//  Tooltip.tsx - Gbtc
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
import { utc } from "moment";
import { style } from "typestyle"

// styles
const outerDiv: React.CSSProperties = {
    minWidth : '400px',
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

export interface TooltipWithDeltaProps {
    data: Map<string, Map<string, { data: number, color: string }>>,
    callback: Function
}

export default class TooltipWithDelta extends React.Component<any, any>{
    props: TooltipWithDeltaProps;
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var ctrl = this;
        ($('#tooltipwithdelta') as any).draggable({ scroll: false, handle: '#tooltipwithdeltahandle', containment: 'document' });
    }

    getMillisecondTime(date) {
        var milliseconds = utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0')) * 1000;

        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    }

    render() {
        var rows = [];
        var keyIterator = this.props.data.keys();
        var firstDate = keyIterator.next().value;
        var secondDate = keyIterator.next().value;

        if (firstDate != undefined && secondDate != undefined) {
            this.props.data.get(firstDate).forEach((value, key, map) => {

                if ($('.legendCheckbox:checked').toArray().map(x => (x as any).name).indexOf(key) >= 0) 
                    var row = Row(key, value.color, value.data, this.props.data.get(secondDate).get(key).data);
                rows.push(row);
            });
        }

        return (
            <div id="tooltipwithdelta" className="ui-widget-content" style={outerDiv}>
                <div id="tooltipwithdeltahandle" className={handle}></div>
                <div>
                    <div style={{textAlign: 'center'}}>
                        <table className="table" style={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight * 0.9}}>
                            <thead>
                                <tr><td style={{width: 34}}></td><td></td><td><b>{firstDate}</b></td><td><b>{secondDate}</b></td><td><b>{(firstDate != undefined && secondDate != undefined ? (this.getMillisecondTime(secondDate) - this.getMillisecondTime(firstDate)) / 1000 + ' (s)' : '')}</b></td></tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
                <button className={closeButton} onClick={() => {
                    $('#tooltipwithdelta').hide();
                    $('.legendCheckbox').hide();
                    this.props.callback({ TooltipWithDeltaTable: new Map<string, Map<string, { data: number, color: string }>>()});
                }}>X</button>
            </div>
        );
    }
}

const Row = ( label: string, color: string, data1: number, data2: number ) => {
    return (
        <tr key={label}>
            <td className="dot" style={{ background: color, width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
            <td style={{ textAlign: 'left' }}><b>{label}</b></td>
            <td style={{ textAlign: "right" }}><b>{data1.toFixed(2)}</b></td>
            <td style={{ textAlign: "right" }}><b>{data2.toFixed(2)}</b></td>
            <td style={{ textAlign: "right" }}><b>{(data2 - data1).toFixed(2)}</b></td>
        </tr>
    );
}

