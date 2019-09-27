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
//  09/25/2019 - Christoph Lackner
//       Added Settings Form
//
//******************************************************************************************************

import * as React from 'react';
import { clone } from 'lodash';

declare var cycles: number;
declare var samplesPerCycle: number;

export interface AnalyticParamters { harmonic: number, order: number };


export default class RadioselectWindow extends React.Component{
    props: {
        style?: object,
        className?: string,
        stateSetter: Function,
        analytic: string,
        analyticSettings: AnalyticParamters
    }
    state: { analytics: Array<{ label: string, analytic: string }> }
    cyclesOptions: any[];
    samplesPerCycleOptions: any[];
    orderOptions: any[];

    constructor(props, context) {
        super(props, context);
        this.state = {
            analytics: [
                { label: 'Fault Distance', analytic: 'FaultDistance' },
                { label: 'FFT', analytic: 'FFT' },
                { label: 'First Derivative', analytic: 'FirstDerivative' },
                { label: 'Fix Clipped Waveforms', analytic: 'ClippedWaveforms' },
                { label: 'Frequency', analytic: 'Frequency' },
                { label: 'Harmonic Spectrum', analytic: 'HarmonicSpectrum' },
                { label: 'High Pass', analytic: 'HighPassFilter' },
                { label: 'Low Pass', analytic: 'LowPassFilter' },
                { label: 'Missing Voltage', analytic: 'MissingVoltage' },
                { label: 'Overlapping Waveform', analytic: 'OverlappingWaveform' },
                { label: 'Power', analytic: 'Power' },
                { label: 'R, X, Z', analytic: 'Impedance' },
                { label: 'Rapid Voltage Change', analytic: 'RapidVoltageChange' },
                { label: 'Rectifier Output', analytic: 'Rectifier' },
                { label: 'Remove Current', analytic: 'RemoveCurrent' },
                { label: 'Specified Harmonic', analytic: 'SpecifiedHarmonic' },
                { label: 'Symmetrical Components', analytic: 'SymmetricalComponents' },
                { label: 'THD', analytic: 'THD' },
                { label: 'Unbalance', analytic: 'Unbalance' },
            ]
        }

        this.cyclesOptions = [];

        for (var i = 1; i < cycles; ++i)
            this.cyclesOptions.push(<option key={i} value={i.toString()}>{i}</option>);

        this.samplesPerCycleOptions = [];

        for (var i = 1; i <= samplesPerCycle / 2; ++i)
            this.samplesPerCycleOptions.push(<option key={i} value={i.toString()}>{i}</option>);

        this.orderOptions = [];

        for (var i = 1; i <= 3; ++i)
            this.orderOptions.push(<option key={i} value={i.toString()}>{i}</option>);
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

        var optionStyle = formStyle;
        optionStyle['marginTop'] = '5%';

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
                {(this.props.analytic != null ?
                    ((this.props.analytic.toLowerCase() == "harmonicspectrum" ?
                        <form style={optionStyle}>
                            <ul ref="list" style={{ listStyleType: 'none', padding: 0 }}>
                                <li><label> Cycles: <select defaultValue={'5'} onChange={this.ChangeCycles.bind(this)}>{this.cyclesOptions}</select></label></li>
                            </ul>
                        </form> : null)
                    )
                : null)}
                {(this.props.analytic != null ?
                    ((this.props.analytic.toLowerCase() == "specifiedharmonic" ?
                        <form style={optionStyle}>
                            <ul ref="list" style={{ listStyleType: 'none', padding: 0 }}>
                                <li><label> Harmonic: <select defaultValue={'1'} onChange={this.ChangeCycles.bind(this)}>{this.samplesPerCycleOptions}</select></label></li>
                            </ul>
                        </form> : null)
                    )
                    : null)}
                {(this.props.analytic != null ?
                    (((this.props.analytic.toLowerCase() == "highpassfilter") || (this.props.analytic.toLowerCase() == "lowpassfilter") ?
                        <form style={optionStyle}>
                            <ul ref="list" style={{ listStyleType: 'none', padding: 0 }}>
                                <li><label> Order: <select defaultValue={'1'} onChange={this.ChangeOrder.bind(this)}>{this.orderOptions}</select></label></li>
                            </ul>
                        </form> : null)
                    )
                    : null)}

            </div>
        );
    }

    ChangeCycles(event) {
        var obj = clone(this.props.analyticSettings);
        obj.harmonic = event.target.value;
        this.props.stateSetter({ AnalyticSettings: obj });
    }

    ChangeOrder(event) {
        var obj = clone(this.props.analyticSettings);
        obj.order = event.target.value;
        this.props.stateSetter({ AnalyticSettings: obj });
    }
}