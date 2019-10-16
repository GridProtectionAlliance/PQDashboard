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
    g200: boolean,
    one00to200: boolean,
    thirty5to100: boolean,
    oneTo35: boolean,
    l1: boolean,
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
    stateSetter(obj: any): void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";


const EventSearchNavbar: React.FunctionComponent<EventSearchNavbarProps> = (props) => {

    React.useEffect(() => {
        $('#datePicker').datetimepicker({ format: momentDateFormat });
        $('#datePicker').on('dp.change', (e) => {
            props.stateSetter({ date: (e.target as any).value });
        });

        $('#timePicker').datetimepicker({ format: momentTimeFormat });
        $('#timePicker').on('dp.change', (e) => {
            props.stateSetter({ time: (e.target as any).value });
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
                                            props.stateSetter({ time: (e.target as any).value });
                                        }} />
                                        <div className="input-group-append">
                                            <span className="input-group-text"> <i className="fa fa-clock-o"></i></span>
                                        </div>
                                    </div>

                                    <div className='input-group date' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                        <input className='form-control' id='datePicker' value={props.date} onChange={(e) => {
                                            props.stateSetter({ date: (e.target as any).value });
                                        }} />
                                        <div className="input-group-append">
                                            <span className="input-group-text"> <i className="fa fa-calendar"></i></span>
                                        </div>
                                    </div>

                                </div>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Time Window Size(+/-): </label>
                                    <input style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.windowSize} onChange={(e) => {
                                        props.stateSetter({ windowSize: (e.target as any).value });
                                    }} type="number" />
                                </div>
                                <div className="form-group" style={{ height: 30 }}>
                                    <label style={{ width: 200, position: 'relative', float: "left" }}>Time Window Units: </label>
                                    <select style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.timeWindowUnits} onChange={(e) => {
                                        props.stateSetter({ timeWindowUnits: (e.target as any).value });
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
                                    <li><label><input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        var value = e.target.checked;
                                        props.stateSetter({
                                            faults: value,
                                            sags: value,
                                            swells: value,
                                            interruptions: value,
                                            breakerOps: value,
                                            transients: value,
                                            relayTCE: value,
                                            others: value 
                                        });
                                    }} defaultChecked={true} />  Select All </label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ faults: !props.faults });
                                    }} checked={props.faults} />  Faults </label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ sags: !props.sags });
                                    }} checked={props.sags} />  Sags</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ swells: !props.swells });
                                    }} checked={props.swells} />  Swells</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ interruptions: !props.interruptions });
                                    }} checked={props.interruptions} />  Interruptions</label></li>
                                </ul>
                                <ul style={{
                                    listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'
                                }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ breakerOps: !props.breakerOps });
                                    }} checked={props.breakerOps} />  Breaker Ops</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ transients: !props.transients });
                                    }} checked={props.transients} />  Transients</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ relayTCE: !props.relayTCE });
                                    }} checked={props.relayTCE} />  Breaker TCE</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ others: !props.others });
                                    }} checked={props.others} />  Others</label></li>
                                </ul>
                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Voltage Class:</legend>
                            <form>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    <li><label><input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        var value = e.target.checked;
                                        props.stateSetter({
                                            g200: value,
                                            one00to200: value,
                                            thirty5to100: value,
                                            oneTo35: value,
                                            l1: value,
                                        });
                                    }} defaultChecked={true} />  Select All </label></li>

                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ g200: !props.g200 });
                                    }} checked={props.g200} />{'EHV/Trans - >200kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ one00to200: !props.one00to200 });
                                    }} checked={props.one00to200} />{'HV/Trans - >100kV & <=200kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ thirty5to100: !props.thirty5to100 });
                                    }} checked={props.thirty5to100} />{'MV/Subtrans - >35kV & <=100kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ oneTo35: !props.oneTo35 });
                                    }} checked={props.oneTo35} />{'MV/Dist - >1kV & <=35kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ l1: !props.l1 });
                                    }} checked={props.l1} />{'LV - <=1kV'}</label></li>
                                </ul>
                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '10%' }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Meter Types:</legend>
                            <form>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    <li><label><input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        var value = e.target.checked;
                                        props.stateSetter({
                                            dfr: value,
                                            pqMeter: value,
                                        });
                                    }} defaultChecked={true} />  Select All </label></li>

                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ dfr: !props.dfr });
                                    }} checked={props.dfr} />  DFR</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        props.stateSetter({ pqMeter: !props.pqMeter });
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