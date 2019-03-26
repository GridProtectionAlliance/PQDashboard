//******************************************************************************************************
//  RadioselectWindow.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  03/13/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import 'react-app-polyfill/ie11';
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'

export default class RadioselectWindow extends React.Component{
    props: { style?: object, className?: string, stateSetter: Function, analytic: string}
    state: { analytics: Array<{label: string, analytic: string}>}
    constructor(props, context) {
        super(props, context);
        this.state = {
            analytics: [
                { label: 'FFT', analytic: 'FFT' },
                { label: 'First Derivative', analytic: 'FirstDerivative' },
                { label: 'Impedance, Resistance, Reactance', analytic: 'Impedance' },
                { label: 'Remove Current', analytic: 'RemoveCurrent' },
                //{ label: 'Remove Post-Event Current', analytic: 'RemovePostEventCurrent' },
                { label: 'Symmetrical Components', analytic: 'SymmetricalComponents' },
                { label: 'Unbalance', analytic: 'Unbalance' },
                { label: 'Power', analytic: 'Power' },
                { label: 'Missing Voltage', analytic: 'MissingVoltage' },
                { label: 'Show Points', analytic: 'ShowPoints' },
                { label: 'Fix Clipped Waveforms', analytic: 'ClippedWaveforms' },
                { label: 'Harmonic Spectrum', analytic: 'HarmonicSpectrum' },
                { label: 'Low Pass Filter', analytic: 'LowPassFilter' },
                { label: 'High Pass Filter', analytic: 'HighPassFilter' },
                { label: 'Overlapping Waveform', analytic: 'OverlappingWaveform' },
                { label: 'Rapid Voltage Change', analytic: 'RapidVoltageChange' },
                { label: 'Rectifier Output', analytic: 'Rectifier' },
                { label: 'Frequency', analytic: 'Frequency' },
                { label: 'THD', analytic: 'THD' },
                { label: 'Specified Harmonic', analytic: 'SpecifiedHarmonic' },
            ]
        }
    }

    handleClicks(event): void {
        this.props.stateSetter({ analytic: event.target.value });
    }

    render() {
        var formStyle = (this.props.style == undefined ? {} : this.props.style);

        if (formStyle['backgroundColor'] == undefined) formStyle['backgroundColor'] = 'white';
        if (formStyle['borderRadius'] == undefined) formStyle['borderRadius'] = '10px';
        if (formStyle['border'] == undefined) formStyle['border'] = '1px solid #000000';
        if (formStyle['padding'] == undefined) formStyle['padding'] = '10px';
        if (formStyle['width'] == undefined) formStyle['width'] = '90%';
        if (formStyle['height'] == undefined) formStyle['height'] = '100%';

        if (formStyle['marginLeft'] == undefined) formStyle['marginLeft'] = '5%';
        if (formStyle['marginRight'] == undefined) formStyle['marginRight'] = '5%';
        if (formStyle['overflow'] == undefined) formStyle['overflow'] = 'auto';

        var style = {};
        style['marginTop'] = '10px';
        style['width'] = '100%';
        style['height'] = '100%';

        return (
            <div style={style}> 
                <form style={formStyle}>
                    <ul ref="list" style={{listStyleType: 'none', padding: 0}}>
                        {this.state.analytics.map((analytic, index) => <li key={analytic.analytic}><label><input type="radio" name="radioselect" value={analytic.analytic} onChange={this.handleClicks.bind(this)} checked={this.props.analytic == analytic.analytic}/> {analytic.label}</label></li>)}
                    </ul>
                </form>
            </div>
        );
    }
}