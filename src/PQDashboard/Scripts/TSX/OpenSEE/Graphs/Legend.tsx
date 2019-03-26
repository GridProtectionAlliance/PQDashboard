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
import { LegendClickCallback } from './LineChartAnalyticBase';

export interface iLegendData {
    color: string,
    display: boolean,
    enabled: boolean,
    data: Array<Array<number>>,
    harmonic?: number,
}

declare var samplesPerCycle: number;

export default class Legend extends React.Component<any, any>{
    props: { type: string, data: Map<string, iLegendData>, callback: LegendClickCallback, height: number };
    samplesPerCycleOptions: any[];
    constructor(props) {
        super(props);
        this.samplesPerCycleOptions = [];

        for (var i = 0; i <= samplesPerCycle / 2; ++i)
            this.samplesPerCycleOptions.push(<option key={i} value={i.toString()}>{i}</option>)
    }

    render() {
        if (this.props.data == null || this.props.data.size == 0) return null;

        let rows: Array<JSX.Element> = [];
        this.props.data.forEach((row, key, map) => {
            if (row.display)
                rows.push( <Row key={key} label={key} color={row.color} enabled={row.enabled} callback={(e) => this.props.callback(e, row, key)} />)
        });

        return (
            <div id={this.props.type + '-legend'} className='legend' style={{ float: 'right', width: '200px', height: this.props.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'hidden' }}>
                {(this.props.type == "Voltage" || this.props.type == "Current"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="checkbox" name="options" defaultValue="Wave" onChange={this.toggleAll.bind(this)}>
                            <ToggleButton type="checkbox" name="checkbox" value="Wave" style={{ width: '25%', height: 28 }}>W</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="RMS" style={{ width: '25%', height: 28 }}>R</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="Amp" style={{ width: '25%', height: 28 }}>A</ToggleButton>
                            <ToggleButton type="checkbox" name="checkbox" value="Phase" style={{ width: '25%', height: 28 }}>Ph</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}
                {(this.props.type.toLowerCase() == "digital"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="options" defaultValue="All" onChange={this.toggleDigitals.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="All" style={{ width: '33%', height: 28 }}>All</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="StatusChange" style={{ width: '33%', height: 28 }}>Chng</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Breakers" style={{ width: '33%', height: 28}}>Brs</ToggleButton>
                        </ToggleButtonGroup>
                    </div> : null)}
                {(this.props.type.toLowerCase() == "power"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="radio" defaultValue="P" onChange={this.togglePower.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="P" style={{ width: '25%', height: 28 }}>P</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="S" style={{ width: '25%', height: 28 }}>S</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Q" style={{ width: '25%', height: 28 }}>Q</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="PF" style={{ width: '25%', height: 28 }}>PF</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}
                {(this.props.type.toLowerCase() == "impedance" ?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="radio" defaultValue="R" onChange={this.toggleImpedance.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="R" style={{ width: '33%', height: 28 }}>R</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="X" style={{ width: '33%', height: 28 }}>X</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Z" style={{ width: '33%', height: 28 }}>Z</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}

                {(this.props.type.toLowerCase() == "firstderivative" || this.props.type.toLowerCase() == "lowpassfilter" ||
                    this.props.type.toLowerCase() == "highpassfilter" || this.props.type.toLowerCase() == "symmetricalcomponents" ||
                    this.props.type.toLowerCase() == "unbalance" || this.props.type.toLowerCase() == "rectifier" ||
                    this.props.type.toLowerCase() == "clippedwaveforms" || this.props.type.toLowerCase() == "thd" ?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="radio" defaultValue="Volt" onChange={this.toggleFirstDerivative.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="Volt" style={{ width: '50%', height: 28 }}>Volt</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Cur" style={{ width: '50%', height: 28 }}>Cur</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}
                {(this.props.type.toLowerCase() == "removecurrent" || this.props.type.toLowerCase() == "missingvoltage"?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="radio" defaultValue="Pre" onChange={this.toggleRemoveCurrent.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="Pre" style={{ width: '50%', height: 28 }}>Pre</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Post" style={{ width: '50%', height: 28 }}>Post</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}

                {(this.props.type.toLowerCase() == "fft" ?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" name="radio" defaultValue="Mag" onChange={this.toggleFFT.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="Mag" style={{ width: '50%', height: 28 }}>Mag</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Ang" style={{ width: '50%', height: 28 }}>Ang</ToggleButton>
                        </ToggleButtonGroup>

                    </div> : null)}

                {(this.props.type.toLowerCase() == "specifiedharmonic" ?
                    <div className="d-flex flex-column btn-group">
                        <select defaultValue={'1'} onChange={this.handleSelected.bind(this)}>{this.samplesPerCycleOptions}</select>

                        <ToggleButtonGroup type="radio" name="radio" defaultValue="Vmag" onChange={this.toggleSpecifiedHarmonic.bind(this)}>
                            <ToggleButton type="radio" name="radio" value="Vmag" style={{ width: '25%', height: 28 }}>Vm</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Vang" style={{ width: '25%', height: 28 }}>Vph</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Imag" style={{ width: '25%', height: 28 }}>Im</ToggleButton>
                            <ToggleButton type="radio" name="radio" value="Iang" style={{ width: '25%', height: 28 }}>Iph</ToggleButton>
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
        this.props.data.forEach((row, key, map) => {
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type.indexOf("Wave") >= 0 && key.indexOf('RMS') < 0 && key.indexOf('Amplitude') < 0 && key.indexOf('Phase') < 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("RMS") >= 0 && key.indexOf('RMS') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("Amp") >= 0 && key.indexOf('Amplitude') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type.indexOf("Phase") >= 0 && key.indexOf('Phase') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    togglePower(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "P" && key.indexOf('Active') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Q" && key.indexOf('Reactive') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "S" && key.indexOf('Apparent') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "PF" && key.indexOf('Factor') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }


    toggleImpedance(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "R" && key.indexOf('Resistance') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "X" && key.indexOf('Reactance') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Z" && key.indexOf('Impedance') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }


    toggleFirstDerivative(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Volt" && key.indexOf('V') == 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Cur" && (key.indexOf('I') == 0 || key.indexOf('C') == 0)) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    toggleRemoveCurrent(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Pre" && key.indexOf('Pre') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Post" && key.indexOf('Post') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    toggleFFT(type, event) {
        var setKey = Array.from(this.props.data).find(x => x[1].enabled)[0].split(' ')[0];
        var newKey;
        this.props.data.forEach((row, key, map) => {

            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Mag" && key.indexOf('Mag') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Ang" && key.indexOf('Ang') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;
                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback(_,_, newKey);

    }


    toggleDigitals( type, event) {
        this.props.data.forEach((row, key, map) => {
            row.enabled = false;
            row.display = false;
            $('[name="' + key + '"]').prop('checked', false);


            if (type == "Breakers" && (key.toLowerCase().indexOf("status") >= 0 || key.toLowerCase().indexOf("trip coil energized") >= 0)) {
                row.enabled = true;
                row.display = true;
                $('[name="' + key + '"]').prop('checked', true);
            }
            else if(type == 'All' ){
                row.enabled = true;
                row.display = true;
                $('[name="' + key + '"]').prop('checked', true);
            }
            else if (type == 'StatusChange') {
                var flag0 = row.data.map(a => a[1]).indexOf(0) >= 0;
                var flag1 = row.data.map(a => a[1]).indexOf(1) >= 0;

                if (flag0 && flag1) {
                    row.enabled = true;
                    row.display = true;
                    $('[name="' + key + '"]').prop('checked', true);
                }
            }


        });

        this.props.callback();

    }

    toggleSpecifiedHarmonic(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Vmag" && key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Vang" && key.indexOf('V') >= 0 && key.indexOf('Ang') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Imag" && key.indexOf('I') >= 0 && key.indexOf('Mag') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Iang" && key.indexOf('I') >= 0 && key.indexOf('Ang') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    handleSelected(event) {
        this.props.data.forEach((row, key, map) => {
            row.harmonic = event.target.value;
        });

        this.props.callback(_,_,_, true);
    }

}

const Row = (props: {label: string, enabled: boolean, color: string, callback: LegendClickCallback}) => {
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
