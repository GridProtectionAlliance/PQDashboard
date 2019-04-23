//******************************************************************************************************
//  MeterActivity.tsx - Gbtc
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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Table from './Table';
import * as moment from 'moment';
import { clone, isEqual, orderBy } from 'lodash';

import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";

import PQDashboardService from './../../../TS/Services/PQDashboard';
import OpenSEEService from './../../../TS/Services/OpenSEE';

import { History } from 'history';

const updateInterval = 300000;
const rowsPerPage = 7;
const autoUpdate = setInterval(
    function () {
        //buildMeterActivityTables();
    }, updateInterval);

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

const dateTimeFormat = "yyyy/MM/dd HH:mm:ss";

interface IProps { }
interface IState {
    searchBarProps: EventSearchNavbarProps,
    eventid: number
}

export default class EventSearch extends React.Component<IProps, IState>{
    history: History<any>;
    historyHandle: any;

    constructor(props, context) {
        super(props, context);

        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
            searchBarProps: {
                dfr: (query['dfr'] != undefined ? query['dfr'] == 'true' : true),
                pqMeter: (query['pqMeter'] != undefined ? query['pqMeter'] == 'true': true),
                g500: (query['g500'] != undefined ? query['g500'] == 'true' : true),
                one62to500: (query['one62to500'] != undefined ? query['one62to500'] == 'true' : true),
                seventyTo161: (query['seventyTo161'] != undefined ? query['seventyTo161'] == 'true' : true),
                l70: (query['l70'] != undefined ? query['l70'] == 'true': true),
                faults: (query['faults'] != undefined ? query['faults'] == 'true' : true),
                sags: (query['sags'] != undefined ? query['sags'] == 'true' : true),
                swells: (query['swells'] != undefined ? query['swells'] == 'true' : true),
                interruptions: (query['interruptions'] != undefined ? query['interruptions'] == 'true' : true),
                breakerOps: (query['breakerOps'] != undefined ? query['breakerOps'] == 'true' : true),
                transients: (query['transients'] != undefined ? query['transients'] == 'true' : true),
                others: (query['others'] != undefined ? query['others'] == 'true' : true),
                date: (query['date'] != undefined ? query['date'] : moment.utc().format(momentDateFormat)),
                time: (query['time'] != undefined ? query['time'] : moment.utc().format(momentTimeFormat)),
                windowSize: (query['windowSize'] != undefined ? query['windowSize'] : 10),
                timeWindowUnits: (query['timeWindowUnits'] != undefined ? query['timeWindowUnits'] : 2),
                stateSetter: this.stateSetter.bind(this)

            },
            eventid: (query['eventid'] != undefined ? query['eventid'] : -1),

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
                <EventSearchNavbar {...this.state.searchBarProps}/>
                <div style={{ width: '100%', height: 'calc( 100% - 210px)' }}>
                    <div style={{ width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'scroll' }}>
                        <EventSearchList eventid={this.state.eventid} stateSetter={this.state.searchBarProps.stateSetter} />
                    </div>
                    <div style={{ width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                        <EventPreviewPane eventid={this.state.eventid} />
                    </div>

                </div>
            </div>
        );
    }

    stateSetter(obj) {
        function toQueryString(state: IState) {
            var dataTypes = ["boolean", "number", "string"]
            var stateObject: IState = clone(state.searchBarProps);
            stateObject.eventid = state.eventid;
            $.each(Object.keys(stateObject), (index, key) => {
                if (dataTypes.indexOf(typeof (stateObject[key])) < 0)
                    delete stateObject[key];
            })
            return queryString.stringify(stateObject, { encode: false });
        }

        var oldQueryString = toQueryString(this.state);
        var oldQuery = queryString.parse(oldQueryString);

        this.setState(obj, () => {
            var newQueryString = toQueryString(this.state);
            var newQuery = queryString.parse(newQueryString);

            if (!isEqual(oldQueryString, newQueryString)) {
                clearTimeout(this.historyHandle);
                this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            }
        });
    }


}

declare interface EventSearchNavbarProps {
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
    others: boolean,
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    stateSetter(state):void
}

const EventSearchNavbar: React.FunctionComponent<EventSearchNavbarProps> = (props) => {
        
    React.useEffect(() => {
        $('#datePicker').datetimepicker({format: momentDateFormat});
        $('#timePicker').datetimepicker({format: momentTimeFormat});

    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">

        <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
            <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                    <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
                        <form>
                            <div className="form-group" style={{height: 30}}>
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
                                    }} type="number"  />
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
                <li className="nav-item" style={{ width: '30%', paddingRight: 10}}>
                    <fieldset className="border" style={{ padding: '10px', height: '100%'  }}>
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
                                listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'}}>
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
                                        object.others = !props.others;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.others} />  Others</label></li>
                            </ul>
                        </form>
                    </fieldset>
                </li>
                <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                    <fieldset className="border" style={{ padding: '10px', height: '100%'  }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Voltage Class:</legend>
                        <form>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = clone(props);
                                        object.g500 = !props.g500;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.g500} />{ '> 500 kV'}</label></li>
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
                    <fieldset className="border" style={{ padding: '10px', height: '100%'}}>
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

class EventSearchList extends React.Component<{ eventid: number, stateSetter(obj): void }, { sortField: string, ascending: boolean, data: Array<any> }> {
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
        $(ReactDOM.findDOMNode(this).parentElement).scrollTop(index * tableHeight / this.state.data.length);
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
                        this.setState({ascending: !this.state.ascending, data: ordered});
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

class EventPreviewPane extends React.Component<{ eventid: number }, {}> {
    openSEEService: OpenSEEService;
    options: object;
    constructor(props, context) {
        super(props, context);

        this.openSEEService = new OpenSEEService();
        this.options = {
            canvas: true,
            legend: { show: false },
            xaxis: { show: false },
            yaxis: { show: false }
        };



    }

    componentDidMount() {
        if (this.props.eventid >= 0)
            this.getData(this.props);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.eventid >= 0)
            this.getData(nextProps);
    }

    getColor(label) {
        if (label.indexOf('VA') >= 0) return '#A30000';
        if (label.indexOf('VB') >= 0) return '#0029A3';
        if (label.indexOf('VC') >= 0) return '#007A29';
        if (label.indexOf('VN') >= 0) return '#c3c3c3';
        if (label.indexOf('IA') >= 0) return '#FF0000';
        if (label.indexOf('IB') >= 0) return '#0066CC';
        if (label.indexOf('IC') >= 0) return '#33CC33';
        if (label.indexOf('IR') >= 0) return '#c3c3c3';

        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }

    getData(props) {
        $(this.refs.voltWindow).children().remove();
        $(this.refs.curWindow).children().remove();
        var pixels = (window.innerWidth - 300 - 40) / 2;

        this.openSEEService.getWaveformVoltageData(props.eventid, pixels).then(data => {
            if (data == null) {
                return;
            }

            var newVessel = [];
            $.each(data.Data, (index, value) => {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) })
            });


            $.plot($(this.refs.voltWindow), newVessel, this.options);


        });

        this.openSEEService.getWaveformCurrentData(props.eventid, pixels).then(data => {
            if (data == null) {
                return;
            }

            var newVessel = [];
            $.each(data.Data, (index, value) => {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) })
            });


            $.plot($(this.refs.curWindow), newVessel, this.options);


        });


    }
    render() {
        var pixels = (window.innerWidth - 300 - 40) / 2;

        return (
            <div>
                <a href={homePath + 'Main/OpenSEE?eventid=' + this.props.eventid} target="_blank"><h5>View in OpenSEE</h5></a>
                <div ref="voltWindow" style={{ height: 200, float: 'left', width: pixels /*, margin: '0x', padding: '0px'*/ }}></div>
                <div ref="curWindow" style={{ height: 200, float: 'left', width: pixels /*, margin: '0x', padding: '0px'*/ }}></div>
            </div>
        );
    }
}