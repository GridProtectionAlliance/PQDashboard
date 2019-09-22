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
import PQDashboardService from './../../../../TS/Services/PQDashboard';

export interface Substation {
    LocationID: number, AssetKey: string, AssetName: string
}

export interface RelayReportNavBarProps {
    stateSetter(state): void,
    BreakerID: number
}

export default class RelayReportNavBar extends React.Component<RelayReportNavBarProps, { LocationID: number }>{
    pqDashboardService: PQDashboardService;

    constructor(props, context) {
        super(props, context);

        this.pqDashboardService = new PQDashboardService();
        this.state = {LocationID: -1};
    }

    componentDidMount() {
        this.getSubstationData();
        if ($(this.refs.SubStation).children("option:selected").val()) {
            var selected = parseInt($(this.refs.SubStation).children("option:selected").val().toString());
            this.getLineData(selected);
        }
    }

    componentWillReceiveProps(nextProps: RelayReportNavBarProps) {
    }

    getLineData(LocationID) {
        this.setState({ LocationID: LocationID });
        this.pqDashboardService.GetBreakerData(LocationID).done(results => {

            $(this.refs.Breaker).children().remove();
            console.log(results);
            for (var breaker of results) {
                $(this.refs.Breaker).append(new Option(breaker.AssetKey, breaker.LineID.toString()));
            };

            if ($(this.refs.Breaker).children("option:selected").val()) {
                var object = clone(this.props);
                object.BreakerID = parseInt($(this.refs.Breaker).children("option:selected").val().toString());
                this.props.stateSetter({ searchBarProps: object });
            }
            
        });
       
    }

    getSubstationData() {
        this.pqDashboardService.GetSubStationData().done(results => {
            $(this.refs.SubStation).children().remove();
            for (var station of results) {
                $(this.refs.SubStation).append(new Option(station.AssetName, station.LocationID.toString()));
                console.log($(this.refs.SubStation).children("option:selected").val());
                if ($(this.refs.SubStation).children("option:selected").val()) {
                    this.setState({ LocationID: parseInt($(this.refs.SubStation).children("option:selected").val().toString()) });
                }};
        });
    }

    render() {
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
                                        <select ref="SubStation" style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            this.getLineData((e.target as any).value);
                                        }} >
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
                                        <select ref="Breaker" style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }}  onChange={(e) => {
                                            var object = clone(this.props);
                                            object.BreakerID = (e.target as any).value;
                                            this.props.stateSetter({ searchBarProps: object });
                                        }} >
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
}
