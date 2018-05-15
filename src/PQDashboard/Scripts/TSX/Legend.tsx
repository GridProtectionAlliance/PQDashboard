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
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";

export default class Legend extends React.Component<any, any>{
    constructor(props) {
        super(props);

        this.state = {
            data: props.data,
            callback: props.callback
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }

    }
    render() {
        if (this.state.data == null) return null;

        let rows = Object.keys(this.state.data).sort().map(row => {
            return <Row key={row} label={row} color={this.state.data[row].color} enabled={this.state.data[row].enabled} callback={() => {
                this.state.data[row].enabled = !this.state.data[row].enabled;
                this.setState({ data: this.state.data });
                this.state.callback();
            }} />
        });

        return (
            <div>
                {(Object.keys(this.state.data)[0].indexOf('V') == 0 || Object.keys(this.state.data)[0].indexOf('I') == 0 ?
                    <div className="btn-group" style={{ width: '100%' }}>
                        <button className='active' style={{ width: '25%' }} onClick={this.toggleWave.bind(this)}>Wave</button>
                        <button style={{ width: '25%' }} onClick={this.toggleAll.bind(this, 'Amplitude')}>Amp</button>
                        <button style={{ width: '25%' }} onClick={this.toggleAll.bind(this, 'Phase')}>Phase</button>
                        <button style={{ width: '25%' }} onClick={this.toggleAll.bind(this, 'RMS')}>RMS</button>
                    </div> : null)}
            <table>
                <tbody>
                    {rows}
                </tbody>
                </table>
            </div>
        );
    }

    toggleWave(event) {
        var data = this.state.data;
        var flag = false;
        _.each(Object.keys(data).filter(d => { return d.indexOf('RMS') < 0 && d.indexOf('Amplitude') < 0 && d.indexOf('Phase') < 0}), (key, i:any) => {
            if (i == 0) flag = !data[key].enabled;
            data[key].enabled = flag;
            $('[name="' + key + '"]').prop('checked', flag)
        });

        if (flag)
            event.target.className = "active";
        else
            event.target.className = "";

        this.setState({ data: data });
        this.state.callback();
    }

    toggleAll(type, event) {
        var data = this.state.data;
        var flag = false;

        _.each(Object.keys(data).filter(d => { return d.indexOf(type) >= 0 }), (key, i: any) => {
            if (i == 0) flag = !data[key].enabled;
            data[key].enabled = flag;
            $('[name="' + key + '"]').prop('checked', flag)
        });

        if (flag)
            event.target.className = "active";
        else
            event.target.className = "";

        this.setState({ data: data });
        this.state.callback();

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
                    <div style={{ width: ' 4px', height: 0, border: '5px solid ' + props.color + (props.enabled ? 'FF' : '60'), overflow: 'hidden' }} onClick={props.callback}>
                    </div>
                </div>
            </td>
            <td>
                <span style={{color: props.color, fontSize: 'smaller', fontWeight: 'bold', whiteSpace: 'nowrap'}}>{props.label}</span>
            </td>
        </tr>
    );
}