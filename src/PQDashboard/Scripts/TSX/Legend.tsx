//******************************************************************************************************
//  Legend.tsx - Gbtc
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
//  03/09/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import 'bootstrap/dist/css/bootstrap.css'
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

export default class Legend extends React.Component<any, any>{
    props: {type: string, data: Array<any>, callback: Function, height: number}
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.data == null || Object.keys(this.props.data).length == 0) return null;

        let rows = Object.keys(this.props.data).sort().filter(key => this.props.data[key].display).map(row => {
            return <Row key={row} label={row} color={this.props.data[row].color} enabled={this.props.data[row].enabled} callback={() => {
                this.props.data[row].enabled = !this.props.data[row].enabled;
                this.props.callback();
            }} />
        });

        return (
            <div id={this.props.type + '-legend'} className='legend' style={{ float: 'right', width: '200px', height: this.props.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'hidden' }}>
                {(this.props.type == "Voltage" || this.props.type == "Current"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="checkbox" name="options" defaultValue="Wave" onChange={this.toggleAll.bind(this)}>
                            <ToggleButton type="checkbox" name="checkbox" value="Wave" style={{ width: '25%', height: 28 }}>Wave</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="RMS" style={{ width: '25%', height: 28 }}>RMS</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="Amp" style={{ width: '25%', height: 28 }}>Amp</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="Phase" style={{ width: '25%', height: 28 }}>Ph</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}
                {(this.props.type == "B"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="options" defaultValue="All" onChange={this.toggleDigitals.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="All" style={{ width: '50%', height: 28}}>All</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Breakers" style={{ width: '50%', height: 28}}>Breakers</ToggleButton>
                        </ToggleButtonGroup>
                    </div> : null)}
                <table ref="table" style={{ maxHeight: this.props.height - 70, overflowY: 'auto', display: 'block' }}>
                <tbody >
                    {rows}
                </tbody>
                </table>
            </div>
        );
    }

    toggleAll(type, event) {
        var data = this.props.data;

        _.each(Object.keys(data), (key: string, i: number) => {
            data[key].enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type.indexOf("Wave") >= 0 && key.indexOf('RMS') < 0 && key.indexOf('Amplitude') < 0 && key.indexOf('Phase') < 0) {
                data[key].enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("RMS") >= 0 && key.indexOf('RMS') >= 0) {
                data[key].enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("Amp") >= 0 && key.indexOf('Amplitude') >= 0) {
                data[key].enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("Phase") >= 0 && key.indexOf('Phase') >= 0) {
                data[key].enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    toggleDigitals( type, event) {
        var data = this.props.data;

        _.each(Object.keys(data), (key: string, i: number) => {
            data[key].enabled = false;
            data[key].display = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Breakers" && key.toLowerCase().indexOf("status") >= 0 || key.toLowerCase().indexOf("trip coil energized") >= 0) {
                data[key].enabled = true;
                data[key].display = true;
                $('[name="' + key + '"]').prop('checked', true);
            }
            else if(type == 'All' ){
                data[key].enabled = true;
                data[key].display = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }
}

const Row = (props) => {
    return (
        <tr>
            <td>
                <input name={props.label} className='legendCheckbox' type="checkbox" style={{ display: 'none' }} defaultChecked={props.enabled}/>
            </td>
            <td>
                <div style={{ border: '1px solid #ccc', padding: '1px' }}>
                    <div style={{ width: ' 4px', height: 0, border: '5px solid', borderColor: (props.enabled ? convertHex(props.color, 100) : convertHex(props.color, 50)), overflow: 'hidden' }} onClick={props.callback}>
                    </div>
                </div>
            </td>
            <td>
                <span style={{color: props.color, fontSize: 'smaller', fontWeight: 'bold', whiteSpace: 'nowrap'}}>{props.label}</span>
            </td>
        </tr>
    );
}

function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return result;
}
