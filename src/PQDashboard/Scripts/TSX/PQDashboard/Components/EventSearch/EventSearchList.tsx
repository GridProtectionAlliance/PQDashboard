//******************************************************************************************************
//  EventSearchList.tsx - Gbtc
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
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Table from './../Table';
import PQDashboardService from './../../../../TS/Services/PQDashboard';
import { orderBy } from 'lodash';
import * as moment from 'moment';

export default class EventSearchList extends React.Component<{ eventid: number, stateSetter(obj): void }, { sortField: string, ascending: boolean, data: Array<any> }> {
    pqDashboardService: PQDashboardService;
    constructor(props, context) {
        super(props, context);

        this.pqDashboardService = new PQDashboardService();

        this.state = {
            sortField: "FileStartTime",
            ascending: false,
            data: []
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.getData();
        document.addEventListener("keydown", this.handleKeyPress, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
    }

    handleKeyPress(event) {
        if (this.state.data.length == 0) return;

        var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());

        if (event.keyCode == 40) // arrow down key
        {
            if (this.props.eventid == -1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else if (index == this.state.data.length - 1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else
                this.props.stateSetter({ eventid: this.state.data[index + 1].EventID });

        }
        else if (event.keyCode == 38)  // arrow up key
        {
            if (this.props.eventid == -1)
                this.props.stateSetter({ eventid: this.state.data[this.state.data.length - 1].EventID });
            else if (index == 0)
                this.props.stateSetter({ eventid: this.state.data[this.state.data.length - 1].EventID });
            else
                this.props.stateSetter({ eventid: this.state.data[index - 1].EventID });
        }

        this.setScrollBar();
    }

    setScrollBar() {
        var tableHeight = $(ReactDOM.findDOMNode(this).parentElement).children()[0].clientHeight - 45;
        var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());
        $(ReactDOM.findDOMNode(this).parentElement).scrollTop(index * tableHeight / this.state.data.length - 50);
    }

    getData() {
        this.pqDashboardService.getEventSearchData().done(results => {
            var ordered = orderBy(results, ["FileStartTime"], ["desc"]);
            this.setState({ data: ordered });
            this.setScrollBar();
        });
    }

    render() {
        return (
            <Table
                cols={[
                    { key: 'FileStartTime', label: 'Time', headerStyle: { width: '20%' }, content: (item, key, style) => <span>{moment(item.FileStartTime).format('MM/DD/YYYY')}<br />{moment(item.FileStartTime).format('HH:mm:ss.SSSSSSS')}</span> },
                    { key: 'AssetName', label: 'Asset', headerStyle: { width: '20%' } },
                    { key: 'AssetType', label: 'Asset Tp', headerStyle: { width: '15%' } },
                    { key: 'VoltageClass', label: 'kV', headerStyle: { width: '15%' } },
                    { key: 'EventType', label: 'Evt Cl', headerStyle: { width: '15%' } },
                    { key: 'BreakerOperation', label: 'Brkr Op', headerStyle: { width: '15%' }, content: (item, key, style) => <span><i className={(item.BreakerOperation > 0 ? "fa fa-check" : '')}></i></span> },

                ]}
                tableClass="table table-hover"
                data={this.state.data}
                sortField={this.state.sortField}
                ascending={this.state.ascending}
                onSort={(d) => {
                    if (d.col == this.state.sortField) {
                        var ordered = orderBy(this.state.data, [d.col], [(!this.state.ascending ? "asc" : "desc")]);
                        this.setState({ ascending: !this.state.ascending, data: ordered });
                    }
                    else {
                        var ordered = orderBy(this.state.data, [d.col], ["asc"]);
                        this.setState({ ascending: true, data: ordered, sortField: d.col });
                    }
                }}
                onClick={(item) => this.props.stateSetter({ eventid: item.row.EventID })}
                theadStyle={{ fontSize: 'smaller' }}
                selected={(item) => {
                    if (item.EventID == this.props.eventid) return true;
                    else return false;
                }}
            />
        );
    }
}
