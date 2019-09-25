//******************************************************************************************************
//  EventSearch.tsx - Gbtc
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
//  09/11/2019 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import * as moment from 'moment';
import { clone, isEqual } from 'lodash';

import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import { History } from 'history';
import RelayReportNavBar, { RelayReportNavBarProps } from './RelayReportNavBar';
import RelayReportPane from './RelayReportPane';



interface IProps { }
interface IState {
    searchBarProps: RelayReportNavBarProps,
}

export default class RelayReport extends React.Component<IProps, IState>{
    history: History<any>;
    historyHandle: any;


    constructor(props, context) {
        super(props, context);

        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
            searchBarProps: {
                stateSetter: this.stateSetter.bind(this),
                BreakerID: (query['breakerid'] != undefined ? query['breakerid'] : -1),
                ChannelID: (query['channelid'] != undefined ? query['channelid'] : -1),
            },
            
        };
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps: IProps) {
    }


    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <RelayReportNavBar {...this.state.searchBarProps}/>
                <div style={{ width: '100%', height: 'calc( 100% - 118px)' }}>
                    <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                        <RelayReportPane breakerid={this.state.searchBarProps.BreakerID} channelid={this.state.searchBarProps.ChannelID} />
                    </div>

                </div>
            </div>
        );
    }

    stateSetter(obj) {
        function toQueryString(state: IState) {
            var dataTypes = ["boolean", "number", "string"]
            var stateObject: IState = clone(state.searchBarProps);
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