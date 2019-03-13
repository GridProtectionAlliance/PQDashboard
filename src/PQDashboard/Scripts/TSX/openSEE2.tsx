//******************************************************************************************************
//  openSEE.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import { Table, Navbar, NavDropdown, Nav, Button, Form, FormControl,Row, Modal,Tab, Tabs } from 'react-bootstrap';

import OpenSEE2Service from './../TS/Services/OpenSEE2';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";
import WaveformViewerGraph from './WaveformViewerGraph';
import Menu from './Menu';
import PolarChart from './PolarChart';
import Points from './AccumulatedPoints';
import Tooltip from './Tooltip';
import ScalarStats from './ScalarStats';
import HarmonicStats from './HarmonicStats';
import TimeCorrelatedSags from './TimeCorrelatedSags';
import OpenSEENoteModal from './OpenSEENoteModal';

declare var homePath;

const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';

export class OpenSEE extends React.Component<any, any>{
    history: object;
    historyHandle: any;
    openSEE2Service: OpenSEE2Service;
    resizeId: any;
    TableData: object;
    state: {
        eventid: number, StartDate: string, EndDate: string, displayVolt: boolean, displayCur: boolean, faultcurves: any, breakerdigitals: any, breakeroperation: any, Width: number,
        Hover: number, pointsButtonText: string, tooltipButtonText: string, phasorButtonText: string, statButtonText: string, correlatedSagsButtonText, harmonicButtonText: string,PointsTable: Array<any>, TableData: Object, backButtons: Array<any>,
        forwardButtons: Array<any>, PostedData: any
    }
    constructor(props) {
        super(props);
        this.openSEE2Service = new OpenSEE2Service();
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);
        this.resizeId;
        this.state = {
            eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate'],
            displayVolt: true,
            displayCur: true,
            faultcurves: query['faultcurves'] == '1' || query['faultcurves'] == 'true',
            breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
            breakeroperation: (query['breakeroperation'] != undefined ? query['breakeroperation'] : undefined),
            Width: window.innerWidth - 300,
            Hover: 0,
            pointsButtonText: "Show Points",
            tooltipButtonText: "Show Tooltip",
            phasorButtonText: "Show Phasor",
            harmonicButtonText: "Show Harmonics",
            statButtonText: "Show Stats",
            correlatedSagsButtonText: "Show Correlated Sags",
            PointsTable: [],
            TableData: {},
            backButtons: [],
            forwardButtons: [],
            PostedData: {}
        }
        this.TableData = {};
        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate'],
                faultcurves: query['faultcurves'] == '1' || query['faultcurves'] == 'true',
                breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
            });
        });
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));

        this.openSEE2Service.getHeaderData(this.state).done(data => {

            var back = [];
            back.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForSystem.m_Item1, "system-back", "&navigation=system", "<"));
            back.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForMeterLocation.m_Item1, "station-back", "&navigation=station", "<"));
            back.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForMeter.m_Item1, "meter-back", "&navigation=meter", "<"));
            back.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForLine.m_Item1, "line-back", "&navigation=line", "<"));

            var forward = [];
            forward.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForSystem.m_Item2, "system-next", "&navigation=system", ">"));
            forward.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForMeterLocation.m_Item2, "station-next", "&navigation=station", ">"));
            forward.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForMeter.m_Item2, "meter-next", "&navigation=meter", ">"));
            forward.push(this.nextBackButton(data.nextBackLookup.GetPreviousAndNextEventIdsForLine.m_Item2, "line-next", "&navigation=line", ">"));

            this.setState({
                PostedData: data,
                backButtons: back,
                forwardButtons: forward
            }, () => {
                this.nextBackSelect($('#next-back-selection option:selected').val());

                $('#next-back-selection').change(() => {
                    this.nextBackSelect($('#next-back-selection option:selected').val());
                });

            });
        });
    }

    componentWillUnmount() {
        $(window).off('resize');
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.setState({
                Width: window.innerWidth,
                Height: this.calculateHeights(this.state)
            });
        }, 500);
    }

    render() {
        var height = this.calculateHeights(this.state);

        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                {/* the navigation side bar*/}
                <div style={{ width: 300, height: 'inherit', backgroundColor: '#eeeeee', position: 'relative', float: 'left' }}>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto">Views:</legend>
                        <Form>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayVolt: !this.state.displayVolt})} checked={this.state.displayVolt} />Volt</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayCur: !this.state.displayCur })} checked={this.state.displayCur} />Curr</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ breakerdigitals: !this.state.breakerdigitals })} checked={this.state.breakerdigitals}/>Dig</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ faultcurves: !this.state.faultcurves })} checked={this.state.faultcurves}/>Ft Loc</label>
                        </Form>
                    </fieldset>

                    <br />

                    <Tabs defaultActiveKey="info" id="uncontrolled-tab-example">
                        <Tab eventKey="info" title="Info">
                            <Table>
                                <tbody>
                                    <tr><td>Meter:</td><td>{this.state.PostedData.postedMeterName}</td></tr>
                                    <tr><td>Station:</td><td>{this.state.PostedData.postedStationName}</td></tr>
                                    <tr><td>Line:</td><td>{this.state.PostedData.postedLineName}</td></tr>
                                    <tr><td>Event Type:</td><td>{(this.state.PostedData.postedEventName != 'Fault' ? this.state.PostedData.postedEventName : <a href="#" title="Click for fault details" onClick={() => window.open(homePath + "FaultSpecifics.aspx?eventid=" + this.state.PostedData.postedEventId, this.state.PostedData.postedEventId + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}>Fault</a>)}</td></tr>
                                    <tr><td>Event Date:</td><td>{this.state.PostedData.postedEventDate}</td></tr>
                                    {(this.state.PostedData.postedStartTime != undefined ? <tr><td>Start Time:</td><td>{this.state.PostedData.postedStartTime}</td></tr> : null)}
                                    {(this.state.PostedData.postedPhase != undefined ? <tr><td>Phase:</td><td>{this.state.PostedData.postedPhase}</td></tr> : null)}
                                    {(this.state.PostedData.postedDurationPeriod != undefined ? <tr><td>Duration:</td><td>{this.state.PostedData.postedDurationPeriod}</td></tr> : null)}
                                    {(this.state.PostedData.postedMagnitude != undefined ? <tr><td>Magnitude:</td><td>{this.state.PostedData.postedMagnitude}</td></tr> : null)}
                                    {(this.state.PostedData.postedSagDepth != undefined ? <tr><td>Sag Depth:</td><td>{this.state.PostedData.postedSagDepth}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerNumber != undefined ? <tr><td>Breaker:</td><td>{this.state.PostedData.postedBreakerNumber}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerTiming != undefined ? <tr><td>Timing:</td><td>{this.state.PostedData.postedBreakerTiming}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerSpeed != undefined ? <tr><td>Speed:</td><td>{this.state.PostedData.postedBreakerSpeed}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerOperation != undefined ? <tr><td>Operation:</td><td>{this.state.PostedData.postedBreakerOperation}</td></tr> : null)}
                                    <tr><td><Button variant="link" onClick={(e) => { window.open(this.state.PostedData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.state.eventid) }}>Edit</Button></td><td><OpenSEENoteModal eventId={this.state.eventid} /></td></tr>
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="compare" title="Compare">
                        </Tab>
                        <Tab eventKey="analysis" title="Analysis" >
                        </Tab>
                    </Tabs>
                </div> 
                <div style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right' }}>
                    <Navbar expand="lg" className="bg-light justify-content-between">
                        <Navbar.Brand><img src='../Images/gpa-lock.png' style={{width: '35px'}} />OpenSEE 2.0</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse>
                            <Nav className="mr-auto">
                                <NavDropdown title="Menu" id="basic-nav-dropdown">
                                    <NavDropdown.Item onClick={this.showhidePoints.bind(this)}>Show Points</NavDropdown.Item>
                                    <NavDropdown.Item onClick={this.showhideTooltip.bind(this)}>Show Tooltip</NavDropdown.Item>
                                    <NavDropdown.Item onClick={this.showhidePhasor.bind(this)}>Show Phasor</NavDropdown.Item>
                                    <NavDropdown.Item onClick={this.showhideStats.bind(this)}>Show Stats</NavDropdown.Item>
                                    <NavDropdown.Item onClick={this.showhideCorrelatedSags.bind(this)}>Show Correlated Sags</NavDropdown.Item>
                                    {(this.state.PostedData.postedEventName == "Snapshot" ? <NavDropdown.Item onClick={this.showhideHarmonics.bind(this)}>Show Harmonics</NavDropdown.Item> : null)}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={this.exportData.bind(this, "csv")}>Export CSV</NavDropdown.Item>
                                    <NavDropdown.Item onClick={this.exportComtrade.bind(this)}>Export COMTRADE</NavDropdown.Item>

                                </NavDropdown>
                            </Nav>
                            <Form>
                                {this.state.backButtons}
                                <select id="next-back-selection" defaultValue="system">
                                    <option value="system">System</option>
                                    <option value="station">Station</option>
                                    <option value="meter">Meter</option>
                                    <option value="line">Line</option>
                                </select>
                                {this.state.forwardButtons}
                            </Form>
                            <Form>
                                <Button onClick={this.resetZoom.bind(this)}>Reset Zoom</Button>
                            </Form>

                        </Navbar.Collapse>
                        <PolarChart data={this.state.TableData} callback={this.stateSetter.bind(this)} />
                        <Points pointsTable={this.state.PointsTable} callback={this.stateSetter.bind(this)} postedData={this.state.PostedData} />
                        <Tooltip data={this.state.TableData} hover={this.state.Hover} callback={this.stateSetter.bind(this)} />
                        <ScalarStats eventId={this.state.eventid} callback={this.stateSetter.bind(this)} exportCallback={(type) => this.exportData(type)} />
                        <HarmonicStats eventId={this.state.eventid} callback={this.stateSetter.bind(this)} exportCallback={(type) => this.exportData(type)} />
                        <TimeCorrelatedSags eventId={this.state.eventid} callback={this.stateSetter.bind(this)} />
                    </Navbar>
                    <div style={{ padding: '0' }}>
                        

                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Voltage" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayVolt} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Current" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayCur} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="B" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.breakerdigitals} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="F" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.faultcurves} postedData={this.state.PostedData}></WaveformViewerGraph>
                    </div>
                </div>
            </div>
        );
    }

    stateSetter(obj) {
        function toQueryString(state) {
            var prop = _.clone(state);
            delete prop.Hover;
            delete prop.Width;
            delete prop.TableData;
            delete prop.phasorButtonText;
            delete prop.pointsButtonText;
            delete prop.tooltipButtonText;
            delete prop.harmonicButtonText;
            delete prop.statButtonText;
            delete prop.correlatedSagsButtonText;
            delete prop.PointsTable;
            delete prop.displayCur;
            delete prop.displayVolt;
            delete prop.backButtons;
            delete prop.forwardButtons;
            delete prop.PostedData;
            return queryString.stringify(prop, { encode: false });
        }

        var oldQueryString = toQueryString(this.state);
        var oldQuery = queryString.parse(oldQueryString);

        this.setState(obj, () => {
            var newQueryString = toQueryString(this.state);
            var newQuery = queryString.parse(newQueryString);

            if (!_.isEqual(oldQuery, newQuery)) {
                clearTimeout(this.historyHandle);
                this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            }
        });
    }

    tableUpdater(obj) {
        this.TableData = _.merge(this.TableData, obj);
        this.setState({ TableData: this.TableData });
    }

    resetZoom() {
        clearTimeout(this.historyHandle);
        this.history['push'](this.history['location'].pathname + '?eventid=' + this.state.eventid + (this.state.faultcurves ? '&faultcurves=1' : '') + (this.state.breakerdigitals ? '&breakerdigitals=1' : ''));
    }

    calculateHeights(obj: any) {
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.faultcurves) + Number(obj.breakerdigitals))
    }

    nextBackSelect(nextBackType) {
        $('.nextbackbutton').hide();
        $('#' + nextBackType + '-back').show();
        $('#' + nextBackType + '-next').show();
    }


    nextBackButton(evt, id, postedURLQueryString, text) {
        if (evt != null)
        {
            var title = evt.StartTime;
            var url = "?eventid=" + evt.ID + postedURLQueryString;
            return <a href={url} id={id} key={id} className='nextbackbutton smallbutton' title={title} style={{padding: '4px 20px'}}>{text}</a>;
        }
        else
            return <a href='#' id={id} key={id} className='nextbackbutton smallbutton-disabled' title='No event' style={{padding: '4px 20px'}}>{text}</a>;

    }

    showhidePoints(evt) {
        $('#accumulatedpoints').show();
    }

    showhideTooltip(evt) {
        $('#unifiedtooltip').show();
        $('.legendCheckbox').show();
    }

    showhidePhasor(evt) {
        $('#phasor').show();
    }

    showhideStats(evt) {
        $('#scalarstats').show();
    }

    showhideCorrelatedSags(evt) {
        $('#correlatedsags').show();
    }

    showhideHarmonics(evt) {
        $('#harmonicstats').show();
    }

    exportData(type) {
        window.open(`/OpenSEECSVDownload.ashx?type=${type}&eventID=${this.state.eventid}` +
            `${this.state.StartDate != undefined ? `&startDate=${this.state.StartDate}` : ``}` +
            `${this.state.EndDate != undefined ? `&endDate=${this.state.EndDate}` : ``}` +
            `&Meter=${this.state.PostedData.postedMeterName}` +
            `&EventType=${this.state.PostedData.postedEventName}`);
    }

    exportComtrade(evt) {
        window.open(`/OpenSEEComtradeDownload.ashx?eventID=${this.props.eventID}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.postedMeterName}` +
            `&EventType=${this.props.postedEventName}`);
    }

}


ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));

