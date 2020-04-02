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
//  08/22/2019 - Christoph Lackner
//       Added TCE Plot.
//
//******************************************************************************************************

/// <reference path="openSee.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import OpenSEEService from '../../TS/Services/OpenSEE';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import { clone, isEqual} from "lodash";

import Current from './Graphs/Current';
import TripCoilCurrent from './Graphs/TCE';
import Digital from './Graphs/Digital';
import Voltage from './Graphs/Voltage';

import OpenSEENoteModal from './Components/OpenSEENoteModal';
import MultiselectWindow from './Components/MultiselectWindow';
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
import FaultLocation from './Analytics/FaultLocation';
import FFT from './Analytics/FFT';
import SpecifiedHarmonic from './Analytics/SpecifiedHarmonic';
import OverlappingWaveform from './Analytics/OverlappingWaveform';
import HarmonicSpectrum from './Analytics/HarmonicSpectrum';

import OpenSEENavbar from './Components/OpenSEENavbar';
import About from './Components/About';

import { LineChartAnaltyicalBaseProps } from './Graphs/LineChartAnalyticBase';


export class OpenSEE extends React.Component<{}, OpenSEEState>{
    history: object;
    historyHandle: any;
    openSEEService: OpenSEEService;
    resizeId: any;
    TableData: Map<string, { data: number, color: string }>;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);
        this.resizeId;
        this.state = {
            eventid: (query['eventid'] != undefined ? query['eventid'] : eventID),
            StartDate: (query['StartDate'] != undefined ? query['StartDate'] : eventStartTime),
            EndDate: (query['EndDate'] != undefined ? query['EndDate'] : eventEndTime),
            displayVolt: true,
            displayCur: true,
            displayTCE: query['displayTCE'] == 'true',
            breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
            Width: window.innerWidth - 300,
            Hover: 0,
            PointsTable: [],
            TableData: new Map < string, { data: number, color: string }>(),
            PostedData: {},
            nextBackLookup:{
                Meter: {},
                System: {},
                Station: {},
                Line: {}
            },
            navigation: query["navigation"] != undefined ? query["navigation"] : "system",
            tab: query["tab"] != undefined ? query["tab"] : "Info",
            comparedEvents: (query["comparedEvents"] != undefined ? (Array.isArray(query["comparedEvents"]) ? query["comparedEvents"].map(a => parseInt(a)) : [parseInt(query["comparedEvents"])]) : []),
            overlappingEvents: [],
            analytic: query["analytic"] != undefined ? query["analytic"] : null,
            TooltipWithDeltaTable: new Map<string, Map<string, { data: number, color: string }>>(),
            AnalyticSettings: {harmonic: 5, order: 1, Trc: 100}
        }
        this.TableData = new Map<string, { data: number, color: string }>();
        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: (query['StartDate'] != undefined ? query['StartDate'] : eventStartTime),
                EndDate: (query['EndDate'] != undefined ? query['EndDate'] : eventEndTime),
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

    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.setState({
                Width: window.innerWidth - 300,
                Height: this.calculateHeights(this.state)
            });
        }, 500);
    }

    render() {
        var height = this.calculateHeights(this.state);
        var windowHeight = window.innerHeight;

        return (
            <div style={{ position: 'absolute', width: '100%', height: windowHeight, overflow: 'hidden' }}>
                {/* the navigation side bar*/}
                <div style={{ width: 300, height: windowHeight, backgroundColor: '#eeeeee', position: 'relative', float: 'left', overflow: 'hidden' }}>
                    <a href="https://www.gridprotectionalliance.org"><img style={{width: 280, margin: 10}} src="../Images/2-Line - 500.png"/></a>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Waveform Views:</legend>
                        <form>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayVolt: !this.state.displayVolt})} checked={this.state.displayVolt} />Voltage</label>
                            <label style={{ marginLeft: '15px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayCur: !this.state.displayCur })} checked={this.state.displayCur} />Current</label>
                            <label style={{ marginLeft: '15px' }}><input type="checkbox" onChange={() => this.stateSetter({ breakerdigitals: !this.state.breakerdigitals })} checked={this.state.breakerdigitals} />Digitals</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayTCE: !this.state.displayTCE })} checked={this.state.displayTCE} />TCE</label>
                        </form>
                    </fieldset>

                    <br />

                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Info" ?  " active" : '') } id="home-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Info</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Compare" ? " active" : '')} id="profile-tab" data-toggle="tab" href="#compare" role="tab" aria-controls="compare" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Compare</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Analytics" ? " active" : '')} id="contact-tab" data-toggle="tab" href="#analysis" role="tab" aria-controls="analysis" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Analytics</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent" style={{ maxHeight: windowHeight - 325, display: 'block', overflowY: 'auto' }}>
                        <div className={"tab-pane fade" + (this.state.tab == "Info" ? " show active" : '') } id="info" role="tabpanel" aria-labelledby="home-tab">
                            <table className="table">
                                <tbody style={{ display: 'block'}}>
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
                                    <tr><td><button className="btn btn-link" onClick={(e) => { window.open(this.state.PostedData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.state.eventid) }}>Edit</button></td><td>{(userIsAdmin ? <OpenSEENoteModal eventId={this.state.eventid} /> : null)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={"tab-pane fade" + (this.state.tab == "Compare" ? " show active" : '')} id="compare" role="tabpanel" aria-labelledby="profile-tab">
                            <MultiselectWindow comparedEvents={this.state.comparedEvents} stateSetter={this.stateSetter.bind(this)} data={this.state.overlappingEvents} />
                        </div>
                        <div className={"tab-pane fade" + (this.state.tab == "Analytics" ? " show active" : '')} id="analysis" role="tabpanel" aria-labelledby="contact-tab">
                            <RadioselectWindow stateSetter={this.stateSetter.bind(this)} analytic={this.state.analytic} analyticSettings={this.state.AnalyticSettings} />
                        </div>
                    </div>
                    <div style={{width: '100%', textAlign: 'center', position: 'absolute', bottom: 20}}>
                        <span>Version 3.0</span>
                        <br/>
                        <span><About/></span>
                    </div>
                </div> 
                <div id="chartpanel" style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right', overflow: 'hidden' }}>
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
                        TooltipWithDeltaTable={this.state.TooltipWithDeltaTable}
                    />
                    <div style={{ padding: '0', height: "calc(100% - 62px)", overflowY: 'auto' }}>
                        <ViewerWindow key={this.state.eventid} eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayTCE={this.state.displayTCE} displayDigitals={this.state.breakerdigitals} postedData={this.state.PostedData} isCompare={(this.state.tab == "Compare")} label={this.state.PostedData.postedLineName} tableSetter={this.tableUpdater.bind(this)} fftStartTime={this.state.fftStartTime} fftEndTime={this.state.fftEndTime} analytic={this.state.analytic} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/>
                        {(this.state.tab == "Compare" && this.state.overlappingEvents.length > 0 ? this.state.comparedEvents.map(a => <ViewerWindow key={a} eventId={a} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayTCE={this.state.displayTCE} displayDigitals={this.state.breakerdigitals} postedData={this.state.PostedData} isCompare={true} label={<a target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + a}>{this.state.overlappingEvents.find(x => x.value == a).label}</a>} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/>) : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "Impedance" ? <Impedance eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "Power" ? <Power eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "FirstDerivative" ? <FirstDerivative eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "RemoveCurrent" ? <RemoveCurrent eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "MissingVoltage" ? <MissingVoltage eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "LowPassFilter" ? <LowPassFilter eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} order={this.state.AnalyticSettings.order} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "HighPassFilter" ? <HighPassFilter eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} order={this.state.AnalyticSettings.order} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "SymmetricalComponents" ? <SymmetricalComponents eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "Unbalance" ? <Unbalance eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "Rectifier" ? <Rectifier Trc={this.state.AnalyticSettings.Trc} eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "ClippedWaveforms" ? <ClippedWaveforms eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "RapidVoltageChange" ? <RapidVoltageChange eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "THD" ? <THD eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "Frequency" ? <Frequency eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "FFT" ? <FFT eventId={this.state.eventid} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} fftStartTime={this.state.fftStartTime} fftEndTime={this.state.fftEndTime} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "SpecifiedHarmonic" ? <SpecifiedHarmonic eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable} harmonic={this.state.AnalyticSettings.harmonic} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "OverlappingWaveform" ? <OverlappingWaveform eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} height={height} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "HarmonicSpectrum" ? <HarmonicSpectrum eventId={this.state.eventid} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} fftStartTime={this.state.fftStartTime} fftEndTime={this.state.fftEndTime} harmonic={this.state.AnalyticSettings.harmonic} /> : null)}
                        {(this.state.tab == "Analytics" && this.state.analytic == "FaultDistance" ? <FaultLocation eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} postedData={this.state.PostedData} tableSetter={this.tableUpdater.bind(this)} tooltipWithDeltaTable={this.state.TooltipWithDeltaTable}/> : null)}

                    </div>
                </div>
            </div>
        );
    }

    stateSetter(obj) {
        function toQueryString(state) {
            var prop = clone(state);
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
            delete prop.displaTCE;
            delete prop.PostedData;
            delete prop.nextBackLookup;
            delete prop.overlappingEvents;
            delete prop.TooltipWithDeltaTable;
            return queryString.stringify(prop, { encode: false });
        }

        var oldQueryString = toQueryString(this.state);
        var oldQuery = queryString.parse(oldQueryString);

        this.setState(obj, () => {
            var newQueryString = toQueryString(this.state);
            var newQuery = queryString.parse(newQueryString);

            if (!isEqual(oldQuery, newQuery)) {
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
        this.history['push'](this.history['location'].pathname + '?eventid=' + this.state.eventid + (this.state.breakerdigitals ? '&breakerdigitals=1' : ''));
    }

    calculateHeights(obj: any) {
        if (obj.tab == "Compare") return 300;
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.breakerdigitals) + Number(obj.displayTCE)  + Number(obj.tab == "Analytics"))
    }





}

interface ViewerWindowProps extends LineChartAnaltyicalBaseProps {
    isCompare: boolean, displayVolt: boolean, displayCur: boolean, displayTCE: boolean, displayDigitals: boolean, label: string | JSX.Element
}

const ViewerWindow = (props: ViewerWindowProps) => {
    return ( props.isCompare ? 
        <div className="card" style={{ height: (props.isCompare ? null : '100%') }}>
            <div className="card-header">{props.label}</div>
            <div className="card-body" style={{padding: 0}}>
                {(props.displayVolt ? <Voltage eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} tooltipWithDeltaTable={props.tooltipWithDeltaTable}  /> : null)}
                {(props.displayCur ? <Current eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} tooltipWithDeltaTable={props.tooltipWithDeltaTable}/> : null)}
                {(props.displayDigitals ? <Digital eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} postedData={props.postedData} tableSetter={props.tableSetter} tooltipWithDeltaTable={props.tooltipWithDeltaTable}/> : null)}
                {(props.displayTCE ? <TripCoilCurrent eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} tooltipWithDeltaTable={props.tooltipWithDeltaTable} /> : null)}
            </div>
        </div>
        :
        <div>
            {(props.displayVolt ? <Voltage eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} fftStartTime={props.fftStartTime} fftEndTime={props.fftEndTime} analytic={props.analytic} tooltipWithDeltaTable={props.tooltipWithDeltaTable}/> : null)}
            {(props.displayCur ? <Current eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} fftStartTime={props.fftStartTime} fftEndTime={props.fftEndTime} analytic={props.analytic} tooltipWithDeltaTable={props.tooltipWithDeltaTable}/> : null)}
            {(props.displayDigitals ? <Digital eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} postedData={props.postedData} tableSetter={props.tableSetter} tooltipWithDeltaTable={props.tooltipWithDeltaTable}/>: null)}
            {(props.displayTCE ? <TripCoilCurrent eventId={props.eventId} startDate={props.startDate} endDate={props.endDate} pixels={props.pixels} stateSetter={props.stateSetter} height={props.height} hover={props.hover} tableData={props.tableData} pointsTable={props.pointsTable} tableSetter={props.tableSetter} postedData={props.postedData} fftStartTime={props.fftStartTime} fftEndTime={props.fftEndTime} analytic={props.analytic} tooltipWithDeltaTable={props.tooltipWithDeltaTable} /> : null)}
        </div>
            
        );
}

ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));

