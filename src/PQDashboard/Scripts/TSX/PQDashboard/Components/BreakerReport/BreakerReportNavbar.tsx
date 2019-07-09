//******************************************************************************************************
//  BreakerReportNavbar.tsx - Gbtc
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
//  07/02/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { clone } from 'lodash';
import BreakerReportService from './../../../../TS/Services/SEDashboard/BreakerReport'
export interface BreakerReportNavbarProps {
    fromDate: string,
    toDate: string,
    breaker: string,
    stateSetter(state): void
}

interface State {
    breakers: Array<any>
}

const momentDateFormat = "MM/DD/YYYY";


export default class BreakerReportNavbar extends React.Component<BreakerReportNavbarProps, State> {
    breakerReportService: BreakerReportService;
    constructor(props, context) {
        super(props, context);

        this.state = {
            breakers: []
        }
        this.breakerReportService = new BreakerReportService();
    }

    componentDidMount() {
        $('#toDatePicker').datetimepicker({ format: momentDateFormat });
        $('#toDatePicker').on('dp.change', (e) => this.props.stateSetter({ toDate: (e.target as any).value }));
        $('#fromDatePicker').datetimepicker({ format: momentDateFormat });
        $('#fromDatePicker').on('dp.change', (e) => this.props.stateSetter({ fromDate: (e.target as any).value }));

        this.breakerReportService.getMaximoBreakers().done(data => {
            this.setState({ breakers: data.map((d,i) => <option key={i} value={d.AssetKey}>{d.BreakerName}</option>)});
        });
    }

    render() {

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
                                <form>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <label style={{ width: 200, position: 'relative', float: "left" }} >Date Range: </label>
                                        <div className='input-group' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                            <input id="toDatePicker" className='form-control' defaultValue={this.props.toDate} />
                                            <div className="input-group-append">
                                                <span className="input-group-text"> <i className="fa fa-calendar"></i></span>
                                            </div>
                                        </div>

                                        <div className='input-group date' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                            <input className='form-control' id='fromDatePicker' defaultValue={this.props.fromDate} />
                                            <div className="input-group-append">
                                                <span className="input-group-text"> <i className="fa fa-calendar"></i></span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <label style={{ width: 200, position: 'relative', float: "left" }}>Breaker: </label>
                                        <select style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={this.props.breaker} onChange={(e) => this.props.stateSetter({ breaker: (e.target as any).value })} >
                                            <option key={0} value="0">All</option>
                                            {this.state.breakers}
                                        </select>
                                    </div>

                                </form>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '10%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Export:</legend>
                                <form>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <a className="btn btn-primary" style={{ width: 'calc(100%)', position: 'relative', float: "right" }} href={`${homePath}BreakerReportCSVDownload.ashx?breaker=${this.props.breaker}&fromDate=${this.props.fromDate}&toDate=${this.props.toDate}`} >CSV</a>
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