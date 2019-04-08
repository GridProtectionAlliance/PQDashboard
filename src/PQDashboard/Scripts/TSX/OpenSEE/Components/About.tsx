//******************************************************************************************************
//  About.tsx - Gbtc
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
//  03/29/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';

export default function About () {
    const [show, setShow] = React.useState<boolean>(false);

    return (
        <div>
        <button className="btn btn-link" onClick={() => { setShow(true) }}>About</button>

        <div className="modal fade show" style={{ display: (show ? 'block' : 'none') }} role="dialog">
            <div className="modal-dialog" style={{maxWidth: 1200}} role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">About openSEE -- System Event Explorer</h3>
                            <button type="button" className="close" onClick={() => { setShow(false) }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body" style={{textAlign: 'left', maxHeight: 800}}>
                            

                        <p>Version 3.0</p>

                        <p>openSEE is a browser-based waveform display and analytics tool that is used to view waveforms recorded by DFRs, Power Quality meters, relays and other substation devices that are stored in the openXDA database.
                        The link in the URL window of openSEE can be embedded in emails so that recipients can quickly access the waveforms being studied.</p>

                        <p><b>General Navigation Features</b></p>

                        <p>The navigational context of openSEE is relative to the "waveform-of-focus" -- the waveform displayed in the top-most collection of charts that is displayed when openSEE is first opened --
                        typically after clicking a link to drill down into a specific waveform in the Open PQ Dashboard.
                        Tools in openSEE allow the user to dig deeper and understand more about this waveform-of-focus.
                        Tools in openSee also enable users to easily change the waveform-of-focus from the open initially loaded -- moving forward or back sententially in time.
                        </p>

                        <ul>
                            <li><u>Waveform View Check Boxes</u> - These check boxes are used to select the individual charts that are displayed for each waveform being displayed.  Options are voltages, currents, and digitals.</li>
                            <li><u>Info, Compare and Analytics Tabs</u> - These tabs are used to show summary information about the waveform of focus, select one of from 20+ analytics to perform on the waveform-of-focus, or to
	                        find additional waveforms to compare to the waveform-of-focus -- and might be interesting, for example, in the case of double-ended fault location.</li>
                            <li><u>Data Tools Menu</u> - This menu allows the user to "pop up" tools to display additional information about the waveform-of-focus.</li>
                            <li><u>Region Select Zooming</u> - The waveform initially loads with the the time-scale set to the full length of the waveform capture. With the mouse, the user can select a region of the waveform to zoom in and see more detail.</li>
	                        <li><u>Reset Zoom</u> - After zooming in, this button can be used to set the time-scale back to the full length of the waveform.</li>
                            <li><u>Forward and Back Navigation</u> - Using the collection of controls in the upper-right of the openSEE display, the user can select the basis for changing to a new waveform-of-focus.  A selection of "system" means that user can step forward or back
	                        to next event in the openXDA base globally (for all DFRs, PQ Meters, etc.),
	                        i.e., what havened immediately previously or next on the system relative to the current waveform-of-focus.  A selection of "asset" (or "line") limits this navigation to just events on this asset.
	                        A selection of "meter" limits this navigation to just events recored by this substation device.</li>
                                <li><u>Chart Trace Section</u> - To the right of each chart, the user has the ability to turn on and off individual traces.  Tabs are provided to organize these selections by data type.</li>
                        </ul>

                        <p>
                            The open-source code for openSEE can be found on GitHub as part of the openXDA Project.   See: <a href="https://github.com/GridProtectionAlliance/openXDA">https://github.com/GridProtectionAlliance/openXDA</a>
                        </p>


                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => { setShow(false) }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );

}
