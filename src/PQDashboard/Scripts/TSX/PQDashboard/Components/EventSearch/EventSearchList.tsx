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
import { orderBy, filter, clone, isEqual } from 'lodash';
import * as moment from 'moment';
import { EventSearchNavbarProps } from './EventSearchNavbar';

interface IProps { eventid: number, searchText: string, stateSetter(obj): void, searchBarProps: EventSearchNavbarProps }
export default class EventSearchList extends React.Component<IProps, { sortField: string, ascending: boolean, data: Array<any> }> {
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
        this.getData(this.props);
        document.addEventListener("keydown", this.handleKeyPress, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
    }

    componentWillReceiveProps(nextProps: IProps) {
        var props = clone(this.props.searchBarProps);
        var nextPropsClone = clone(nextProps.searchBarProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;

        if(this.props.searchText != nextProps.searchText || !isEqual(props, nextPropsClone))
            this.getData(nextProps);
    }

    handleKeyPress(event) {
        if (this.state.data.length == 0) return;

        var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());

        if (event.keyCode == 40) // arrow down key
        {
            event.preventDefault();

            if (this.props.eventid == -1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else if (index == this.state.data.length - 1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else
                this.props.stateSetter({ eventid: this.state.data[index + 1].EventID });

        }
        else if (event.keyCode == 38)  // arrow up key
        {
            event.preventDefault();

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
        //var rowHeight = $(ReactDOM.findDOMNode(this)).find('tbody').children()[0].clientHeight;
        //var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());
        ////var rowHeight = tableHeight / this.state.data.length;
        //if (index == 0)
        //    $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(0);
        //else
        //    $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(index * rowHeight - 20);

        var rowHeight = $(ReactDOM.findDOMNode(this)).find('tbody').children()[0].clientHeight;
        var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());
        var tableHeight = this.state.data.length * rowHeight;
        var windowHeight = window.innerHeight - 314;
        var tableSectionCount = Math.ceil(tableHeight / windowHeight);
        var tableSectionHeight = Math.ceil(tableHeight / tableSectionCount);
        var rowsPerSection = tableSectionHeight / rowHeight;
        var sectionIndex = Math.floor(index / rowsPerSection);
        var scrollTop = $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop();

        if(scrollTop <= sectionIndex * tableSectionHeight || scrollTop >= (sectionIndex + 1) * tableSectionHeight - tableSectionHeight/2)
            $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(sectionIndex * tableSectionHeight);

    }

    getData(props) {
        this.pqDashboardService.getEventSearchData(props.searchBarProps).done(results => {
            var filtered = filter(results, obj => {
                return obj.AssetName.toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.AssetType.toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.EventType.toLowerCase().indexOf(props.searchText) >= 0 ||
                    moment(obj.FileStartTime).format('MM/DD/YYYY').toLowerCase().indexOf(props.searchText) >= 0 ||
                    moment(obj.FileStartTime).format('HH:mm:ss.SSSSSSS').toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.VoltageClass.toString().toLowerCase().indexOf(props.searchText) >= 0 

            });
            var ordered = orderBy(filtered, ["FileStartTime"], ["desc"]);
            this.setState({ data: ordered });
            this.props.stateSetter({ searchList: ordered });

            if (results.length !== 0)
                this.setScrollBar();
        });
    }

    render() {
        return (
            <div style={{width: '100%', maxHeight: window.innerHeight - 314, overflowY:"scroll"}}>
            <Table
                cols={[
                    { key: 'FileStartTime', label: 'Time', headerStyle: { width: 'calc(20%)' }, colStyle: { width: 'calc(20%)' }, content: (item, key, style) => <span>{moment(item.FileStartTime).format('MM/DD/YYYY')}<br />{moment(item.FileStartTime).format('HH:mm:ss.SSSSSSS')}</span> },
                    { key: 'AssetName', label: 'Asset', headerStyle: { width: '20%' }, colStyle: { width: '20%' } },
                    { key: 'AssetType', label: 'Asset Tp', headerStyle: { width: '15%' }, colStyle: { width: '15%' } },
                    { key: 'VoltageClass', label: 'kV', headerStyle: { width: '15%' }, colStyle: { width: '15%' }, content: (item, key, style) => item[key].toString().split('.')[1] != undefined && item[key].toString().split('.')[1].length > 3 ? item[key].toFixed(3) : item[key] },
                    { key: 'EventType', label: 'Evt Cl', headerStyle: { width: '15%' }, colStyle: { width: '15%' } },
                    { key: 'BreakerOperation', label: 'Brkr Op', headerStyle: { width: '15%' }, colStyle: { width: '15%' }, content: (item, key, style) => <span><i className={(item.BreakerOperation > 0 ? "fa fa-check" : '')}></i></span> },

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
                //theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                //tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 314 }}
                rowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)'}}
                selected={(item) => {
                    if (item.EventID == this.props.eventid) return true;
                    else return false;
                }}
                />
            </div>
        );
    }
}
