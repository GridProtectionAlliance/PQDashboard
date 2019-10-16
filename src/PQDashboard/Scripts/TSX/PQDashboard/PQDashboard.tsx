//******************************************************************************************************
//  PQDashboard.tsx - Gbtc
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
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
/// <reference path="PQDashboard.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";

import About from './Components/About';
import MeterActivity from './Components/MeterActivity';
import EventSearch from './Components/EventSearch/EventSearch';
import BreakerReport from './Components/BreakerReport/BreakerReport';
import RelayReport from './Components/RelayReport/RelayReport';

class PQDashboard extends React.Component<{}, PQDashboardState>{
    history: object;
    historyHandle: any;

    constructor(props, context) {
        super(props, context);
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
        }
    }
    render() {
        return (
            <Router>
                <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                    <div style={{ width: 300, height: 'inherit', backgroundColor: '#eeeeee', position: 'relative', float: 'left' }}>
                        <a href="https://www.gridprotectionalliance.org"><img style={{ width: 280, margin: 10 }} src={homePath + "Images/SE Dashboard with GPA 200 high.png"} /></a>
                        <div style={{ width: '100%', height: '100%', marginTop: 30}}>
                            <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical" style={{ height: 'calc(100% - 240px)' }}>
                                {/*<NavLink activeClassName='nav-link active' className="nav-link" exact={true} to={controllerViewPath + "/"}>Home</NavLink>*/}
                                <NavLink activeClassName='nav-link active' className="nav-link" to={controllerViewPath + "/eventsearch"}>Event Search</NavLink>
                                <NavLink activeClassName='nav-link active' className="nav-link" to={controllerViewPath + "/meteractivity"}>Meter Activity</NavLink>
                                <NavLink activeClassName='nav-link active' className="nav-link" to={controllerViewPath + "/breakerreport"}>Breaker Report</NavLink>
                                <NavLink activeClassName='nav-link active' className="nav-link" to={controllerViewPath + "/relayreport"}>Relay Report</NavLink>

                            </div>
                            <div style={{ width: '100%', textAlign: 'center' }}>

                                <span>Version 1.0</span>
                                <br />
                                <span><About /></span>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right' }}>
                        <Route path={controllerViewPath + "/eventsearch"} component={EventSearch} />
                        <Route path={controllerViewPath + "/meteractivity"} component={MeterActivity} />
                        <Route path={controllerViewPath + "/breakerreport"} component={BreakerReport} />
                        <Route path={controllerViewPath + "/relayreport"} component={RelayReport} />
                    </div>
                </div>
        </Router>
        );
    }
}

ReactDOM.render(<PQDashboard />, document.getElementById('pageBody'));
