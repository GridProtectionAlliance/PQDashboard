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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added Filter for Events with TCE.
//
//******************************************************************************************************
import * as React from 'react';
import { clone } from 'lodash';

export interface EventSearchNavbarProps {
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


const EventSearchNavbar: React.FunctionComponent<EventSearchNavbarProps> = (props) => {

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
                    <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
                            <form>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }} >Date: </label>
                                    <div className='input-group' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                        <input id="timePicker" className='form-control' value={props.time} onChange={(e) => {
                                            var object = clone(props);
                                            object.time = (e.target as any).value;
                                            props.stateSetter({ searchBarProps: object });
                                        }} />
                                        <div className="input-group-append">
                                            <span className="input-group-text"> <i className="fa fa-clock-o"></i></span>
                                        </div>
                                    </div>

                                    <div className='input-group date' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                        <input className='form-control' id='datePicker' value={props.date} onChange={(e) => {
                                            var object = clone(props);
                                            object.date = (e.target as any).value;
                                            props.stateSetter({ searchBarProps: object });
                                        }} />
                                        <div className="input-group-append">
                                            <span className="input-group-text"> <i className="fa fa-calendar"></i></span>
                                        </div>
                                    </div>

                                </div>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Time Window Size(+/-): </label>
                                    <input style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.windowSize} onChange={(e) => {
                                        var object = clone(props);
                                        object.windowSize = (e.target as any).value;
                                        props.stateSetter({ searchBarProps: object });
                                    }} type="number" />
                                </div>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Time Window Units: </label>
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
                    <li className="nav-item" style={{ width: '30%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Event Types:</legend>
                            <form>
                                <ul style={{ listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'left' }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.faults = !props.faults;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.faults} />  Faults </label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.sags = !props.sags;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.sags} />  Sags</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.swells = !props.swells;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.swells} />  Swells</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.interruptions = !props.interruptions;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.interruptions} />  Interruptions</label></li>
                                </ul>
                                <ul style={{
                                    listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'
                                }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.breakerOps = !props.breakerOps;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.breakerOps} />  Breaker Ops</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.transients = !props.transients;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.transients} />  Transients</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.relayTCE = !props.relayTCE;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.relayTCE} />  Relay TCE</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.others = !props.others;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.others} />  Others</label></li>
                                </ul>
                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Voltage Class:</legend>
                            <form>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.g500 = !props.g500;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.g500} />{'> 500 kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.one62to500 = !props.one62to500;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.one62to500} />  162 - 500 kV</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.seventyTo161 = !props.seventyTo161;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.seventyTo161} />  70 - 161 kV</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.l70 = !props.l70;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.l70} />{'< 70 kV'}</label></li>
                                </ul>
                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '15%' }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Meter Types:</legend>
                            <form>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.dfr = !props.dfr;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.dfr} />  DFR</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.pqMeter = !props.pqMeter;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.pqMeter} />  PQMeter</label></li>
                                </ul>
                            </form>
                        </fieldset>
                    </li>

                </ul>
            </div>
        </nav>
    );
}

export default EventSearchNavbar;