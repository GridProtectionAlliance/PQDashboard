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
import Table from './Table';
import * as moment from 'moment';
import * as _ from 'lodash';

import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";

import PQDashboardService from './../../../TS/Services/PQDashboard';
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

        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            var searchBarProps = {
                dfr: (query['dfr'] != undefined ? query['dfr'] == 'true' : true),
                pqMeter: (query['pqMeter'] != undefined ? query['pqMeter'] == 'true' : true),
                g500: (query['g500'] != undefined ? query['g500'] == 'true' : true),
                one62to500: (query['one62to500'] != undefined ? query['one62to500'] == 'true' : true),
                seventyTo161: (query['seventyTo161'] != undefined ? query['seventyTo161'] == 'true' : true),
                l70: (query['l70'] != undefined ? query['l70'] == 'true' : true),
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
            };

            this.setState({
                searchBarProps: searchBarProps,
                eventid: (query['eventid'] != undefined ? query['eventid'] : -1),
            });
        });

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
            var stateObject: IState = _.clone(state.searchBarProps);
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

            if (!_.isEqual(oldQueryString, newQueryString)) {
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
                                            var object = _.clone(props);
                                            object.time = (e.target as any).value;
                                            props.stateSetter({ searchBarProps: object });
                                        }} />
                                    <div className="input-group-append">
                                        <span className="input-group-text"> <i className="fa fa-clock-o"></i></span>
                                    </div>
                                </div>

                                <div className='input-group date' style={{ width: 'calc(50% - 100px)', position: 'relative', float: "right" }}>
                                        <input className='form-control' id='datePicker' value={props.date} onChange={(e) => {
                                            var object = _.clone(props);
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
                                        var object = _.clone(props);
                                        object.windowSize = (e.target as any).value;
                                        props.stateSetter({ searchBarProps: object });
                                    }} type="number"  />
                            </div>
                            <div className="form-group" style={{ height: 30 }}>
                                <label style={{ width: 200, position: 'relative', float: "left" }}>Time Window Units: </label>
                                    <select style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.timeWindowUnits} onChange={(e) => {
                                        var object = _.clone(props);
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
                                        var object = _.clone(props);
                                        object.faults = !props.faults;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.faults} />  Faults </label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.sags = !props.sags;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.sags} />  Sags</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.swells = !props.swells;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.swells} />  Swells</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.interruptions = !props.interruptions;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.interruptions} />  Interruptions</label></li>
                            </ul>
                            <ul style={{
                                listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'}}>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.breakerOps = !props.breakerOps;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.breakerOps} />  Breaker Ops</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.transients = !props.transients;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.transients} />  Transients</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
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
                                        var object = _.clone(props);
                                        object.g500 = !props.g500;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.g500} />{ '> 500 kV'}</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.one62to500 = !props.one62to500;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.one62to500} />  162 - 500 kV</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
                                        object.seventyTo161 = !props.seventyTo161;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.seventyTo161} />  70 - 161 kV</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
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
                                        var object = _.clone(props);
                                        object.dfr = !props.dfr;
                                        props.stateSetter({ searchBarProps: object });
                                    }} checked={props.dfr} />  DFR</label></li>
                                    <li><label><input type="checkbox" onChange={() => {
                                        var object = _.clone(props);
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

const EventSearchList: React.FunctionComponent<{ eventid: number, stateSetter(obj): void}> = (props) => {
    const [sortField, setSortField] = React.useState<string>("FileStartTime");
    const [ascending, setAscending] = React.useState<boolean>(false);

    const [data, setData] = React.useState<Array<any>>([]);
    var pqDashboardService = new PQDashboardService();

    React.useEffect(() => {
        pqDashboardService.getEventSearchData().done(results => {
            var ordered = _.orderBy(results, ["FileStartTime"], ["desc"]);
            setData(ordered)
        });
    }, [props]);


    return (
        <Table
            cols={[
                { key: 'FileStartTime', label: 'Time', headerStyle: { width: '20%' } },
                { key: 'AssetName', label: 'Asset', headerStyle: { width: '20%' } },
                { key: 'AssetType', label: 'Asset Tp', headerStyle: { width: '15%' } },
                { key: 'VoltageClass', label: 'Volt Cl', headerStyle: { width: '15%' } },
                { key: 'EventType', label: 'Evt Cl', headerStyle: { width: '15%' } },
                { key: 'BreakerOperation', label: 'Brkr Op', headerStyle: { width: '15%' }, content: (item, key, style) => <span><i className={( item.BreakerOperation > 0 ? "fa fa-check": '')}></i></span> },

            ]}
            tableClass="table table-hover"
            data={data}
            sortField={sortField}
            ascending={ascending}
            onSort={(d) => {
                if (d.col == sortField) {
                    var ordered = _.orderBy(data, [d.col], [(!ascending? "asc": "desc")]);
                    setAscending(!ascending);
                    setData(ordered);
                }
                else {
                    setSortField(d.col);
                    setAscending(true);
                    var ordered = _.orderBy(data, [d.col], ["asc"]);
                    setData(ordered);
                }
            }}
            onClick={(item) => props.stateSetter({ eventid: item.row.EventID })}
            theadStyle={{ fontSize: 'smaller' }}
            selected={(item) => {
                if (item.EventID == props.eventid) return true;
                else return false;
            }}
        />
    );
}

const EventPreviewPane: React.FunctionComponent<{eventid: number}> = (props) => {
    return (
        <div>{props.eventid}</div>
    );
}