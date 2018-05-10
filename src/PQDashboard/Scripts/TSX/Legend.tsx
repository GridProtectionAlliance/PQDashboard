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

        let rows = this.state.data.map(row => {
            return <Row key={row.label} label={row.label} color={row.color} enabled={row.enabled} callback={() => {
                row.enabled = !row.enabled;
                this.setState({ data: this.state.data });
                this.state.callback();
            }} />
        });

        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }
}

const Row = (props) => {
    return (
        <tr>
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