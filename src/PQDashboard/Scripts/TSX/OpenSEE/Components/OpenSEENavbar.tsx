//******************************************************************************************************
//  OpenSEENavbar.tsx - Gbtc
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
//  03/14/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PolarChart from './../jQueryUI Widgets/PolarChart';
import Points from './../jQueryUI Widgets/AccumulatedPoints';
import Tooltip from './../jQueryUI Widgets/Tooltip';
import ScalarStats from './../jQueryUI Widgets/ScalarStats';
import HarmonicStats from './../jQueryUI Widgets/HarmonicStats';
import TimeCorrelatedSags from './../jQueryUI Widgets/TimeCorrelatedSags';
import { Navbar, NavDropdown, Nav, Button, Form, Row} from 'react-bootstrap';

declare var homePath;

export default class OpenSEENavbar extends React.Component {
    props: {TableData: Object, PointsTable: Array<object>, eventid: number, resetZoom: any, stateSetter: Function, PostedData: any, Hover: number, nextBackLookup: any, selected: string, startDate: string, endDate: string }
    state: {}
    constructor(props, context) {
        super(props, context);


    }

    render() {
        return (
            <Navbar expand="lg" className="bg-light justify-content-between">
                <Navbar.Brand><img src='../Images/gpa-lock.png' style={{ width: '35px' }} />OpenSEE 2.0</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse>
                    <Nav className="mr-auto">
                        <NavDropdown title="Menu" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={this.showhidePoints.bind(this)}>Show Points</NavDropdown.Item>
                            <NavDropdown.Item onClick={this.showhideTooltip.bind(this)}>Show Tooltip</NavDropdown.Item>
                            <NavDropdown.Item onClick={this.showhidePhasor.bind(this)}>Show Phasor</NavDropdown.Item>
                            <NavDropdown.Item onClick={this.showhideStats.bind(this)}>Show Stats</NavDropdown.Item>
                            <NavDropdown.Item onClick={this.showhideCorrelatedSags.bind(this)}>Show Correlated Sags</NavDropdown.Item>
                            {(this.props.PostedData.postedEventName == "Snapshot" ? <NavDropdown.Item onClick={this.showhideHarmonics.bind(this)}>Show Harmonics</NavDropdown.Item> : null)}
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={this.exportData.bind(this, "csv")}>Export CSV</NavDropdown.Item>
                            <NavDropdown.Item onClick={this.exportComtrade.bind(this)}>Export COMTRADE</NavDropdown.Item>

                        </NavDropdown>
                    </Nav>
                    <Form style={{marginRight: 35}}>
                        {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item1.ID + "&navigation=system" : '#')} id="system-back" key="system-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.System.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                        {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item1.ID + "&navigation=station" : '#')} id="station-back" key="station-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Station.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item1 != null ? this.props.nextBackLookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                        {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item.ID + "&navigation=meter" : '#')} id="meter-back" key="meter-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Meter.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item1 != null ? this.props.nextBackLookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                        {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item1.ID + "&navigation=line" : '#')} id="line-back" key="line-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Line.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                        <select id="next-back-selection" value={this.props.selected} onChange={(e) => this.props.stateSetter({ navigation: e.target.value })}>
                            <option value="system">System</option>
                            <option value="station">Station</option>
                            <option value="meter">Meter</option>
                            <option value="line">Line</option>
                        </select>
                        {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item2.ID + "&navigation=system" : '#')} id="system-next" key="system-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.System.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item2 != null ? this.props.nextBackLookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                        {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item2.ID + "&navigation=station" : '#')} id="station-next" key="station-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Station.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item2 != null ? this.props.nextBackLookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                        {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item2.ID + "&navigation=meter" : '#')} id="meter-next" key="meter-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Meter.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item2 != null ? this.props.nextBackLookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                        {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item2.ID + "&navigation=line" : '#')} id="line-next" key="line-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Line.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Line.m_Item2 != null ? this.props.nextBackLookup.Line.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                    </Form>
                    <Form>
                        <Button onClick={this.props.resetZoom}>Reset Zoom</Button>
                    </Form>

                </Navbar.Collapse>
                <PolarChart data={this.props.TableData} callback={this.props.stateSetter} />
                <Points pointsTable={this.props.PointsTable} callback={this.props.stateSetter} postedData={this.props.PostedData} />
                <Tooltip data={this.props.TableData} hover={this.props.Hover} callback={this.props.stateSetter} />
                <ScalarStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <HarmonicStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <TimeCorrelatedSags eventId={this.props.eventid} callback={this.props.stateSetter} />
            </Navbar>
        );
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
        window.open( homePath + `/OpenSEECSVDownload.ashx?type=${type}&eventID=${this.props.eventid}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`);
    }

    exportComtrade(evt) {
        window.open(homePath + `/OpenSEEComtradeDownload.ashx?eventID=${this.props.eventid}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`);
    }

}