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

/// <reference path="./openSee.d.ts" />

import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import { Tab, Tabs, Nav } from 'react-bootstrap';

import OpenSEEService from './../../TS/Services/OpenSEE';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";

import Current from './Graphs/Current';
import Digital from './Graphs/Digital';
import FaultLocation from './Graphs/FaultLocation';
import Voltage from './Graphs/Voltage';

import OpenSEENoteModal from './Components/OpenSEENoteModal';
import MultiselectWindow, { iListObject } from './Components/MultiselectWindow';
import RadioselectWindow from './Components/RadioselectWindow';
import Impedance from './Analytics/Impedance';
import Power from './Analytics/Power';
import FirstDerivative from './Analytics/FirstDerivative';
import RemoveCurrent from './Analytics/RemoveCurrent';
import MissingVoltage from './Analytics/MissingVoltage';
import LowPassFilter from './Analytics/LowPassFilter';
import HighPassFilter from './Analytics/HighPassFilter';
import SymmetricalComponents from './Analytics/SymmetricalComponents';
import Unbalance from './Analytics/Unbalance';
import Rectifier from './Analytics/Rectifier';
import ClippedWaveforms from './Analytics/ClippedWaveforms';
import RapidVoltageChange from './Analytics/RapidVoltageChange';
import THD from './Analytics/THD';
import Frequency from './Analytics/Frequency';
import FFT from './Analytics/FFT';
import SpecifiedHarmonic from './Analytics/SpecifiedHarmonic';

import OpenSEENavbar from './Components/OpenSEENavbar';
import { TabContent, Card } from 'react-bootstrap';
import { LineChartAnaltyicalBaseProps } from './Graphs/LineChartAnalyticBase';

export class OpenSEE extends React.Component<any, any>{
    history: object;
    historyHandle: any;
    openSEEService: OpenSEEService;
    resizeId: any;
    TableData: Map<string, { data: number, color: string }>;
    state: {
        eventid: number, StartDate: string, EndDate: string, displayVolt: boolean, displayCur: boolean, faultcurves: boolean, breakerdigitals: boolean, Width: number,
        Hover: number, PointsTable: Array<any>, TableData: Map<string, { data: number, color: string }>, PostedData: iPostedData, nextBackLookup: iNextBackLookup, navigation: string, tab: string
        comparedEvents: Array<number>, overlappingEvents: Array<iListObject>, analytic: string, fftStartTime?: string, fftEndTime?: string
    }
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
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
            Width: window.innerWidth - 300,
            Hover: 0,
            PointsTable: [],
            TableData: new Map < string, { data: number, color: string }>(),
            PostedData: {},
            nextBackLookup:{
                System: {},
                Meter: {},
                Station: {},
                Line: {}
            },
            navigation: query["navigation"] != undefined ? query["navigation"] : "system",
            tab: query["tab"] != undefined ? query["tab"] : "info",
            comparedEvents: (query["comparedEvents"] != undefined ? (Array.isArray(query["comparedEvents"]) ? query["comparedEvents"].map(a => parseInt(a)) : [parseInt(query["comparedEvents"])]) : []),
            overlappingEvents: [],
            analytic: query["analytic"] != undefined ? query["analytic"] : null,
        }
        this.TableData = new Map<string, { data: number, color: string }>();
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

        this.openSEEService.getHeaderData(this.state).done(data => {
            this.setState({
                PostedData: data,
                nextBackLookup: data.nextBackLookup
            });
        });

        this.openSEEService.getOverlappingEvents(this.state.eventid, this.state.StartDate, this.state.EndDate).done(data => {           
            this.setState({
                overlappingEvents: data.map(d => new Object({ group: d.MeterName, label: d.LineName, value: d.EventID, selected: this.state.comparedEvents.indexOf(d.EventID) >= 0 }))
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
        var list = [{ value: 'One', selected: true }, { value: 'Two' }, { value: 'Three' }, { value: 'Four', label: 'Four Label' }]
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                {/* the navigation side bar*/}
                <div style={{ width: 300, height: 'inherit', backgroundColor: '#eeeeee', position: 'relative', float: 'left' }}>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto">Views:</legend>
                        <form>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayVolt: !this.state.displayVolt})} checked={this.state.displayVolt} />Volt</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayCur: !this.state.displayCur })} checked={this.state.displayCur} />Curr</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ breakerdigitals: !this.state.breakerdigitals })} checked={this.state.breakerdigitals}/>Dig</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ faultcurves: !this.state.faultcurves })} checked={this.state.faultcurves}/>Ft Loc</label>
                        </form>
                    </fieldset>

                    <br />

                    <Tab.Container id="tabSelector" activeKey={this.state.tab} onSelect={(key) => this.stateSetter({ tab: key })}>
                        <Nav variant="tabs">
                            <Nav.Item><Nav.Link eventKey="info">Info</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="compare">Compare</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="analysis">Analysis</Nav.Link></Nav.Item>
                        </Nav>
                        <Tab.Content style={{ height: 'calc(100% - 200px)' }}>
                        <Tab.Pane eventKey="info" title="Info">
                            <table className="table">
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
                                    <tr><td><button className="btn btn-link" onClick={(e) => { window.open(this.state.PostedData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.state.eventid) }}>Edit</button></td><td>{(userIsAdmin? <OpenSEENoteModal eventId={this.state.eventid} /> : null)}</td></tr>
                                </tbody>
                            </table>
                        </Tab.Pane>
                        <Tab.Pane eventKey="compare" title="Compare" style={{height: '100%'}}>
                            <MultiselectWindow comparedEvents={this.state.comparedEvents} stateSetter={this.stateSetter.bind(this)} data={this.state.overlappingEvents}/>
                        </Tab.Pane>
                        <Tab.Pane eventKey="analysis" title="Analysis" >
                                <RadioselectWindow stateSetter={this.stateSetter.bind(this)} analytic={this.state.analytic}/>
                        </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </div> 
                <div style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right' }}>
                    <OpenSEENavbar
                        eventid={this.state.eventid}
                        endDate={this.state.EndDate}
                        Hover={this.state.Hover}
                        key="navbar"
                        nextBackLookup={this.state.nextBackLookup}
                        PointsTable={this.state.PointsTable}
                        PostedData={this.state.PostedData}
                        ref="navbar"
                        resetZoom={this.resetZoom.bind(this)}
                        selected={this.state.navigation}
                        startDate={this.state.StartDate}
                        stateSetter={this.stateSetter.bind(this)}
                        TableData={this.state.TableData}
                    />
                    <div style={{ padding: '0', height: "calc(100% - 62px)", overflowY: 'auto' }}>
                        <ViewerWindow key={this.state.eventid} eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayDigitals={this.state.breakerdigitals} displayFaultCurves={this.state.faultcurves} postedData={this.state.PostedData} isCompare={(this.state.tab == "compare")} label={this.state.PostedData.postedLineName} tableSetter={this.tableUpdater.bind(this)} fftStartTime={this.state.fftStartTime} fftEndTime={this.state.fftEndTime} analytic={this.state.analytic}/>
                        {(this.state.tab == "compare" && this.state.overlappingEvents.length > 0 ? this.state.comparedEvents.map(a => <ViewerWindow key={a} eventId={a} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayDigitals={this.state.breakerdigitals} displayFaultCurves={this.state.faultcurves} postedData={this.state.PostedData} isCompare={(this.state.tab == "compare")} label={this.state.overlappingEvents.find(x => x.value == a).label} tableSetter={this.tableUpdater.bind(this)} />) : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "Impedance" ? <Impedance eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "Power" ? <Power eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "FirstDerivative" ? <FirstDerivative eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "RemoveCurrent" ? <RemoveCurrent eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "MissingVoltage" ? <MissingVoltage eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "LowPassFilter" ? <LowPassFilter eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "HighPassFilter" ? <HighPassFilter eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "SymmetricalComponents" ? <SymmetricalComponents eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "Unbalance" ? <Unbalance eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "Rectifier" ? <Rectifier eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "ClippedWaveforms" ? <ClippedWaveforms eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "RapidVoltageChange" ? <RapidVoltageChange eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "THD" ? <THD eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable}  postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "Frequency" ? <Frequency eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "FFT" ? <FFT eventId={this.state.eventid}  pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} fftStartTime={this.state.fftStartTime} fftEndTime={this.state.fftEndTime}/> : null)}
                        {(this.state.tab == "analysis" && this.state.analytic == "SpecifiedHarmonic" ? <SpecifiedHarmonic eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} /> : null)}

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
            delete prop.PostedData;
            delete prop.nextBackLookup;
            delete prop.overlappingEvents;

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

    tableUpdater(obj: Map<string, { data: number, color: string }>) {
        this.TableData = new Map([...Array.from(this.TableData), ...Array.from(obj)]);
        this.setState({ TableData: this.TableData });
    }

    resetZoom() {
        clearTimeout(this.historyHandle);
        this.history['push'](this.history['location'].pathname + '?eventid=' + this.state.eventid + (this.state.faultcurves ? '&faultcurves=1' : '') + (this.state.breakerdigitals ? '&breakerdigitals=1' : ''));
    }

    calculateHeights(obj: any) {
        if (obj.tab == "compare") return 300;
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.faultcurves) + Number(obj.breakerdigitals) + Number(obj.tab == "analysis"))
    }





}

interface ViewerWindowProps extends LineChartAnaltyicalBaseProps {
    isCompare: boolean, displayVolt: boolean, displayCur: boolean, displayDigitals: boolean, displayFaultCurves: boolean, label: string
}

const ViewerWindow = (props: ViewerWindowProps) => {
    return ( props.isCompare ? 
        <Card style={{ height: (props.isCompare ? null : '100%') }}>
            <Card.Header>{props.label}</Card.Header>
                <Card.Body style={{padding: 0}}>
                {(props.displayVolt ? <Voltage eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData}  /> : null)}
                {(props.displayCur ? <Current eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} /> : null)}
                {(props.displayDigitals ? <Digital eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} postedData={props.postedData} tableSetter={props.tableSetter} /> : null)}
                {(props.displayFaultCurves ? <FaultLocation eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} /> : null)}
                </Card.Body>
        </Card>
        :
        <>
            {(props.displayVolt ? <Voltage eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} fftStartTime={props.fftStartTime} fftEndTime={props.fftEndTime} analytic={props.analytic} /> : null)}
            {(props.displayCur ? <Current eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} fftStartTime={props.fftStartTime} fftEndTime={props.fftEndTime} analytic={props.analytic}/> : null)}
            {(props.displayDigitals ? <Digital eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} postedData={props.postedData} tableSetter={props.tableSetter} />: null)}
            {(props.displayFaultCurves ? <FaultLocation eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} />: null)}
        </>
            
        );
}

ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));

