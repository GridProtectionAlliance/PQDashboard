//******************************************************************************************************
//  BreakerReport.tsx - Gbtc
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
/// <reference path="BreakerReport.d.ts" />

import * as React from 'react';
import * as moment from 'moment';

import BreakerReportNavbar from './BreakerReportNavbar';

import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import { History } from 'history';
import { clone, isEqual } from 'lodash';

const momentDateFormat = "MM/DD/YYYY";

export default class BreakerReport extends React.Component<{}, State>{
    history: History<any>;
    historyHandle: any;
    constructor(props, context) {
        super(props, context);

        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
            fromDate: (query['fromDate'] != undefined ? query['fromDate'] : moment().subtract(30, 'days').format(momentDateFormat)),
            toDate: (query['toDate'] != undefined ? query['toDate'] : moment().format(momentDateFormat)),
            breaker: (query['breaker'] != undefined ? query['breaker'] : '0'),
        }

        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                fromDate: (query['fromDate'] != undefined ? query['fromDate'] : moment().subtract(30, 'days').format(momentDateFormat)),
                toDate: (query['toDate'] != undefined ? query['toDate'] : moment().format(momentDateFormat)),
                breaker: (query['breaker'] != undefined ? query['breaker'] : '0'),
            });
        });

        this.stateSetter = this.stateSetter.bind(this);
    }

    render() {
        var link = `${homePath}api/BreakerReport/${(this.state.breaker == '0' ? `AllBreakersReport?` : `IndividualBreakerReport?breakerId=${this.state.breaker}&`)}startDate=${this.state.fromDate}&endDate=${this.state.toDate}`;
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <BreakerReportNavbar toDate={this.state.toDate} fromDate={this.state.fromDate} breaker={this.state.breaker} stateSetter={this.stateSetter}/>
                <div style={{ width: '100%', height: 'calc( 100% - 163px)' }}>
                    <embed style={{ width: 'inherit', height: 'inherit', position: 'absolute' }} id="pdfContent" src={link} key={link} type="application/pdf"/>
                </div>
            </div>
        );
    }

    stateSetter(obj) {
        function toQueryString(state: State) {
            var dataTypes = ["boolean", "number", "string"]
            var stateObject: State = clone(state);
            $.each(Object.keys(stateObject), (index, key) => {
                if (dataTypes.indexOf(typeof (stateObject[key])) < 0)
                    delete stateObject[key];
            })
            return queryString.stringify(stateObject, { encode: false });
        }

        var oldQueryString = toQueryString(this.state);

        this.setState(obj, () => {
            var newQueryString = toQueryString(this.state);

            if (!isEqual(oldQueryString, newQueryString)) {
                clearTimeout(this.historyHandle);
                this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            }
        });
    }

}