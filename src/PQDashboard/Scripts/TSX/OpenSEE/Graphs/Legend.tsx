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
import * as React from 'react';
import * as _ from 'lodash';
import { LegendClickCallback } from './LineChartAnalyticBase';

export interface iLegendData {
    color: string,
    display: boolean,
    enabled: boolean,
    data: Array<Array<number>>
}

export interface iLegendProps {
    type: string,
    data: Map<string, iLegendData>,
    callback: LegendClickCallback,
    height: number,
    harmonicSetter: (obj: number, callback?: any) => void,
    harmonic: number,
    showTable?: (callback?: any) => void,
    exportTable?: (callback?: any) => void,
    setUnits?: (obj: number) => void
}

declare var samplesPerCycle: number;
declare var cycles: number;

export default class Legend extends React.Component<any, any>{
    props: iLegendProps;
    samplesPerCycleOptions: any[];

    constructor(props) {
        super(props);
        this.samplesPerCycleOptions = [];

        for (var i = 0; i <= samplesPerCycle / 2; ++i)
            this.samplesPerCycleOptions.push(<option key={i} value={i.toString()}>{i}</option>);



    }

    componentWillReceiveProps(nextProps: iLegendProps) {
        if (nextProps.harmonic != this.props.harmonic)
        {
            this.handleSelected(nextProps.harmonic);
        }

    }

    render() {
        if (this.props.data == null || this.props.data.size == 0) return null;

        let rows: Array<JSX.Element> = [];
        this.props.data.forEach((row, key, map) => {
            if (row.display)
                rows.push( <Row key={key} label={key} color={row.color} enabled={row.enabled} callback={(e) => this.props.callback(e, row, key)} />)
        });

        return (
            <div ref="legend" id={this.props.type + '-legend'} className='legend' style={{ float: 'right', width: '200px', height: this.props.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'hidden' }}>
                {(this.props.type == "Voltage" ?
                    <>
                        <ToggleButtonGroup type="radio" defaultValue="LN" buttons={[{ label: 'L-N', value: 'LN', active: true }, { label: 'L-L', value: 'L-L', active: false }]} onChange={this.toggleVoltage.bind(this)} />
                        <ToggleButtonGroup type="checkbox" defaultValue="Wave" buttons={[{ label: 'W', value: 'Wave', active: true }, { label: 'R', value: 'RMS', active: false }, { label: 'A', value: 'Amp', active: false }, { label: 'Ph', value: 'Phase', active: false }]} onChange={this.toggleVoltage.bind(this)} />
                    </>
                    : null)}
                {( this.props.type == "Current" ?
                        <ToggleButtonGroup type="checkbox" defaultValue="Wave" buttons={[{ label: 'W', value: 'Wave', active: true }, { label: 'R', value: 'RMS', active: false }, { label: 'A', value: 'Amp', active: false }, { label: 'Ph', value: 'Phase', active: false }]} onChange={this.toggleAll.bind(this)} />
                    : null)}

                {(this.props.type.toLowerCase() == "digital" ?
                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'All', value: 'All', active: true }, { label: 'Chng', value: 'StatusChange', active: false }, { label: 'Brs', value: 'Breakers', active: false }]} onChange={this.toggleDigitals.bind(this)} />
                : null)}
                {(this.props.type.toLowerCase() == "power" ?
                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'P', value: 'P', active: true }, { label: 'S', value: 'S', active: false }, { label: 'Q', value: 'Q', active: false }, { label: 'PF', value: 'PF', active: false }]} onChange={this.togglePower.bind(this)} />
                : null)}
                {(this.props.type.toLowerCase() == "impedance" ?
                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'R', value: 'R', active: true }, { label: 'X', value: 'X', active: false }, { label: 'Z', value: 'Z', active: false }]} onChange={this.toggleImpedance.bind(this)} />
                    : null)}
                {(this.props.type.toLowerCase() == "rapidvoltagechange" ?
                    <ToggleButtonGroup type="radio" defaultValue="LN" buttons={[{ label: 'L-N', value: 'LN', active: true }, { label: 'L-L', value: 'LL', active: false }]} onChange={this.toggleRapidVoltageChange.bind(this)} />
                    : null)}

                {(this.props.type.toLowerCase() == "firstderivative" ?
                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'V', value: 'V', active: true }, { label: 'VR', value: 'VRMS', active: false }, { label: 'I', value: 'I', active: false },{ label: 'IR', value: 'IRMS', active: false }]} onChange={this.toggleFirstDerivative.bind(this)} />
                    : null)}
                {( this.props.type.toLowerCase() == "lowpassfilter" ||
                    this.props.type.toLowerCase() == "highpassfilter" || this.props.type.toLowerCase() == "symmetricalcomponents" ||
                    this.props.type.toLowerCase() == "unbalance" || this.props.type.toLowerCase() == "rectifier" ||
                    this.props.type.toLowerCase() == "clippedwaveforms" || this.props.type.toLowerCase() == "thd" || this.props.type.toLowerCase() == "overlappingwaveform" ?

                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'Volt', value: 'Volt', active: true }, { label: 'Cur', value: 'Cur', active: false }]} onChange={this.toggleLowPass.bind(this)} />
                    : null)}
                {(this.props.type.toLowerCase() == "removecurrent" || this.props.type.toLowerCase() == "missingvoltage" ?
                    <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'Pre', value: 'Pre', active: true }, { label: 'Post', value: 'Post', active: false }]} onChange={this.toggleRemoveCurrent.bind(this)} />
                : null)}

                {(this.props.type.toLowerCase() == "fft" || this.props.type.toLowerCase() == "harmonicspectrum"?
                    <div className="d-flex flex-column">
                        <div className="btn-group">
                            <button style={{width: '50%'}} onClick={() => this.props.showTable()}>Table</button>
                            <button style={{width: '50%'}} onClick={() => this.props.exportTable()}>CSV</button>
                        </div>
                         <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'Vm', value: 'Vmag', active: true }, { label: 'Vph', value: 'Vang', active: false }, { label: 'Im', value: 'Imag', active: false }, { label: 'Iph', value: 'Iang', active: false }]} onChange={this.toggleFFT.bind(this)} />
                    </div> : null)}

                {(this.props.type.toLowerCase() == "specifiedharmonic" ?
                    <div className="d-flex flex-column btn-group">
                        <ToggleButtonGroup type="radio" defaultValue="Wave" buttons={[{ label: 'Vm', value: 'Vmag', active: true }, { label: 'Vph', value: 'Vang', active: false }, { label: 'Im', value: 'Imag', active: false }, { label: 'Iph', value: 'Iang', active: false }]} onChange={this.toggleSpecifiedHarmonic.bind(this)} />
                    </div> : null)}


                <table ref="table" style={{ maxHeight: 'calc(100% - ' + (this.props.type == 'Voltage' ? '70' : '35') + 'px)', overflowY: 'auto', display: 'block' }}>
                <tbody >
                    {rows}
                </tbody>
                </table>
            </div>
        );
    }

    toggleVoltage(type) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if ($(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("L-N") >= 0 && key[2] == 'N') {
                row.display = true;
            }
            else if ($(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("L-L") >= 0 && key[2] != 'N') {
                row.display = true;
            }


            if (row.display && $(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("W") >= 0 && key.indexOf('RMS') < 0 && key.indexOf('Amplitude') < 0 && key.indexOf('Phase') < 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (row.display && $(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("R") >= 0 && key.indexOf('RMS') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (row.display && $(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("A") >= 0 && key.indexOf('Amplitude') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (row.display && $(this.refs.legend).find('label.active').toArray().map(x => $(x).text()).indexOf("Ph") >= 0 && key.indexOf('Phase') >= 0) {
                row.enabled = true;
                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    toggleAll(type) {
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


    toggleRapidVoltageChange(type, event) {
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "LN" && key.indexOf('AN') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "LN" && key.indexOf('BN') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "LN" && key.indexOf('CN') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "LL" && key.indexOf('AB') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }
            if (type == "LL" && key.indexOf('BC') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }
            if (type == "LL" && key.indexOf('CA') >= 0) {
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

            if (type == "V" && key.indexOf('V') == 0 && key.indexOf('RMS') < 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }
            else if (type == "VRMS" && key.indexOf('V') == 0 && key.indexOf('RMS') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }
            else if (type == "I" && key.indexOf('I') == 0 && key.indexOf('RMS') < 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }
            else if (type == "IRMS" && key.indexOf('I') == 0 && key.indexOf('RMS') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    toggleLowPass(type, event) {
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
        var setKey = Array.from(this.props.data).find(x => x[1].enabled)[0].split(' ')[0].slice(1, 3);
        var newKey;
        this.props.data.forEach((row, key, map) => {

            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);


            if (type == "Vmag" && key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Vang" && key.indexOf('V') >= 0 && key.indexOf('Ang') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;
                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Imag" && key.indexOf('I') >= 0 && key.indexOf('Mag') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Iang" && key.indexOf('I') >= 0 && key.indexOf('Ang') >= 0) {
                row.enabled = key.indexOf(setKey) >= 0;
                row.display = true;

                if (row.enabled) newKey = key;

                $('[name="' + key + '"]').prop('checked', true);
            }


        });

        this.props.callback(undefined, undefined, newKey);

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

            if (type == "Vmag" && key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0 && key.indexOf('['+this.props.harmonic+']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Vang" && key.indexOf('V') >= 0 && key.indexOf('Ang') >= 0 && key.indexOf('[' + this.props.harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Imag" && key.indexOf('I') >= 0 && key.indexOf('Mag') >= 0 && key.indexOf('[' + this.props.harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Iang" && key.indexOf('I') >= 0 && key.indexOf('Ang') >= 0 && key.indexOf('[' + this.props.harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

        this.props.callback();

    }

    handleSelected(harmonic: number) {
        var type = $($(this.refs.legend).find('label.active')[0]).text()
        this.props.data.forEach((row, key, map) => {
            row.display = false;
            row.enabled = false;
            $('[name="' + key + '"]').prop('checked', false);

            if (type == "Vm" && key.indexOf('V') >= 0 && key.indexOf('Mag') >= 0 && key.indexOf('[' + harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Vph" && key.indexOf('V') >= 0 && key.indexOf('Ang') >= 0 && key.indexOf('[' + harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Im" && key.indexOf('I') >= 0 && key.indexOf('Mag') >= 0 && key.indexOf('[' + harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

            if (type == "Iph" && key.indexOf('I') >= 0 && key.indexOf('Ang') >= 0 && key.indexOf('[' + harmonic + ']') >= 0) {
                row.enabled = true;
                row.display = true;

                $('[name="' + key + '"]').prop('checked', true);
            }

        });

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

class ToggleButtonGroup extends React.Component {
    props: { type: "radio" | "checkbox", buttons: { label: string, value: string, active: boolean }[], onChange: Function, defaultValue: string }
    state: { buttons: { label: string, value: string, active: boolean }[]}
    constructor(props, context) {
        super(props, context);

        this.state = {
            buttons: this.props.buttons
        }

    }

    handleToggle(value: string): void {
        if (this.props.type == "checkbox") {
            var buttons = JSON.parse(JSON.stringify(this.state.buttons)) as { label: string, value: string, active: boolean }[];
            var button = buttons.find(x => x.value == value);
            button.active = !button.active;
            this.setState({buttons: buttons}, () => this.props.onChange(this.state.buttons.filter(x=> x.active).map(x=> x.value)));
        }
        else {
            var buttons = JSON.parse(JSON.stringify(this.state.buttons)) as { label: string, value: string, active: boolean }[];
            buttons.forEach(x => x.active = false);
            var button = buttons.find(x => x.value == value);
            button.active = true;
            this.setState({ buttons: buttons }, () => this.props.onChange(this.state.buttons.filter(x => x.active).map(x => x.value)));
        }
    }

    render() {
        let rows = this.state.buttons.map(x => <ToggleButton key={x.value} active={x.active} value={x.value} style={{ width: 100 / this.props.buttons.length + '%', height: 35 }} label={x.label} onChange={(value) => this.handleToggle(value)}/>);
        return (
            <div className="btn-group btn-group-toggle" style={{ width: '100%' }}>{rows}</div>
        );
    }

}

class ToggleButton extends React.Component {
    props: { active: boolean, value: string, style: React.CSSProperties, label: string, onChange: Function}
    constructor(props, context) {
        super(props, context);

    }

    render() {
        return <label className={"btn btn-primary" + (this.props.active ? ' active' : '')} style={this.props.style}><input className="toggleButton" type="checkbox" name="checkbox" value={this.props.value}  onChange={(e) => this.props.onChange(this.props.value)} />{this.props.label}</label>;
    }
}
