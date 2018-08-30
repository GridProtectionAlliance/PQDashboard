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
import * as _ from "lodash";
import './../jquery-ui.js';
import 'flot';
import './../flot/jquery.flot.time.min.js';

export default class Tooltip extends React.Component<any, any>{
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var ctrl = this;
        ($("#unifiedtooltip") as any).draggable({ scroll: false, handle: '#unifiedtooltiphandle' });
    }

    render() {
        var subsecond = ("0000000" + (this.props.hover * 10000 % 10000000)).slice(-7);
        var format = ($.plot as any).formatDate(($.plot as any).dateGenerator(this.props.hover, { timezone: "utc" }), "%Y-%m-%d %H:%M:%S") + "." + subsecond;
        var rows = [];

        _.each(this.props.data, (data, index) => {
            if (index.indexOf('V') == 0 &&$('.legendCheckbox:checked').toArray().map(x => (x as any).name).indexOf(index) >= 0 )
                rows.push(Row({label: index, data: data.data, color: data.color}));
        });

        _.each(this.props.data, (data, index) => {
            if (index.indexOf('I') == 0 && $('.legendCheckbox:checked').toArray().map(x => (x as any).name).indexOf(index) >= 0)
                rows.push(Row({ label: index, data: data.data, color: data.color }));
        });

        _.each(this.props.data, (data, index) => {
            if (index.indexOf('V') != 0 && index.indexOf('I') != 0 && $('.legendCheckbox:checked').toArray().map(x => (x as any).name).indexOf(index) >= 0)
                rows.push(Row({ label: index, data: data.data, color: data.color }));
        });


        return (
            <div id="unifiedtooltip" className="ui-widget-content" style={{ position: 'absolute', top: '0', display: 'none' }}>
                <div id="unifiedtooltiphandle"></div>
                <div id="unifiedtooltipcontent">
                    <div style={{textAlign: 'center'}}>
                        <b>{format}</b>
                        <br />
                        <table className="table">
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
                <button className="CloseButton" onClick={() => {
                    this.props.callback({ tooltipButtonText: "Show Tooltip" });
                    $('#unifiedtooltip').hide();
                    $('.legendCheckbox').hide();
                }}>X</button>
            </div>
        );
    }
}

const Row = (row) => {
    return (
        <tr key={row.label}>
            <td className="dot" style={{ background: row.color, width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
            <td style={{ textAlign: 'left' }}><b>{row.label}</b></td>
            <td style={{ textAlign: "right" }}><b>{row.data.toFixed(2)}</b></td>
        </tr>
    );
}

