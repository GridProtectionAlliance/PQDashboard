//******************************************************************************************************
//  EventSearchNavbar.tsx - Gbtc
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
//  09/21/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { clone } from 'lodash';

export interface RelayReportNavBarProps {
    dfr: boolean,
    pqMeter: boolean,
    g500: boolean,
    one62to500: boolean,
    seventyTo161: boolean,
    l70: boolean,
    faults: boolean,
    sags: boolean,
    swells: boolean,
    interruptions: boolean,
    breakerOps: boolean,
    transients: boolean,
    relayTCE: boolean,
    others: boolean,
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    stateSetter(state): void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";


const RelayReportNavBar: React.FunctionComponent<RelayReportNavBarProps> = (props) => {

    React.useEffect(() => {
        $('#datePicker').datetimepicker({ format: momentDateFormat });
        $('#datePicker').on('dp.change', (e) => {
            var object = clone(props);
            object.date = (e.target as any).value;
            props.stateSetter({ searchBarProps: object });

        });

        $('#timePicker').datetimepicker({ format: momentTimeFormat });
        $('#timePicker').on('dp.change', (e) => {
            var object = clone(props);
            object.time = (e.target as any).value;
            props.stateSetter({ searchBarProps: object });

        });

    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">

            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Substation:</legend>
                            <form>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Substation: </label>
                                    <select style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.timeWindowUnits} onChange={(e) => {
                                        var object = clone(props);
                                        object.timeWindowUnits = (e.target as any).value;
                                        props.stateSetter({ searchBarProps: object });
                                    }} >
                                        <option value="7">Year</option>
                                        <option value="6">Month</option>
                                        <option value="5">Week</option>
                                        <option value="4">Day</option>
                                        <option value="3">Hour</option>
                                        <option value="2">Minute</option>
                                        <option value="1">Second</option>
                                        <option value="0">Millisecond</option>
                                    </select>
                                </div>

                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Breaker:</legend>
                            <form>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Breaker: </label>
                                    <select style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.timeWindowUnits} onChange={(e) => {
                                        var object = clone(props);
                                        object.timeWindowUnits = (e.target as any).value;
                                        props.stateSetter({ searchBarProps: object });
                                    }} >
                                        <option value="7">Year</option>
                                        <option value="6">Month</option>
                                        <option value="5">Week</option>
                                        <option value="4">Day</option>
                                        <option value="3">Hour</option>
                                        <option value="2">Minute</option>
                                        <option value="1">Second</option>
                                        <option value="0">Millisecond</option>
                                    </select>
                                </div>

                            </form>
                        </fieldset>
                    </li>
                

                </ul>
            </div>
        </nav>
    );
}

export default RelayReportNavBar;