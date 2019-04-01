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
import TooltipWithDelta from './../jQueryUI Widgets/TooltipWithDelta';

import ScalarStats from './../jQueryUI Widgets/ScalarStats';
import HarmonicStats from './../jQueryUI Widgets/HarmonicStats';
import TimeCorrelatedSags from './../jQueryUI Widgets/TimeCorrelatedSags';
import LightningData from './../jQueryUI Widgets/LightningData';

import 'bootstrap';

declare var homePath;

export default class OpenSEENavbar extends React.Component {
    props: { TableData: Map<string, { data: number, color: string }>, PointsTable: Array<object>, eventid: number, resetZoom: any, stateSetter: Function, PostedData: any, Hover: number, nextBackLookup: any, selected: string, startDate: string, endDate: string, TooltipWithDeltaTable: Map<string, Map<string, { data: number, color: string }>>}
    state: {}
    constructor(props, context) {
        super(props, context);


    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item dropdown" style={{width: '150px'}}>
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Data Tools</a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a className="dropdown-item" onClick={this.showhidePoints.bind(this)}>Show Points</a>
                                <a className="dropdown-item" onClick={this.showhideTooltip.bind(this)}>Show Tooltip</a>
                                <a className="dropdown-item" onClick={this.showhideTooltipWithDelta.bind(this)}>Show Tooltip w/ Delta</a>
                                <a className="dropdown-item" onClick={this.showhidePhasor.bind(this)}>Show Phasor</a>
                                <a className="dropdown-item" onClick={this.showhideStats.bind(this)}>Show Stats</a>
                                <a className="dropdown-item" onClick={this.showhideCorrelatedSags.bind(this)}>Show Correlated Sags</a>

                                {(this.props.PostedData.enableLightningData ? <a className="dropdown-item" onClick={this.showhideLightningData.bind(this)}>Show Lightning Data</a> : null)}
                                {(this.props.PostedData.postedEventName == "Snapshot" ? <a className="dropdown-item" onClick={this.showhideHarmonics.bind(this)}>Show Harmonics</a> : null)}

                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" onClick={this.exportData.bind(this, "csv")}>Export CSV</a>
                                <a className="dropdown-item" onClick={this.exportComtrade.bind(this)}>Export COMTRADE</a>
                            </div>
                        </li>
                        <li className="nav-item" style={{ width: 'calc(100% - 450px)', textAlign: 'center' }}>
                            <img src="../Images/openSEE - Waveform Viewer Header.png"/>
                        </li>
                        <li className="nav-item" style={{ width: '150px' }}>
                            <button className="btn btn-primary" onClick={this.props.resetZoom}>Reset Zoom</button>

                        </li>
                        <li className="nav-item" style={{ width: '200px' }}>
                            {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item1.ID + "&navigation=system" : '#')} id="system-back" key="system-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.System.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&lt;</a> : null)}
                            {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item1.ID + "&navigation=station" : '#')} id="station-back" key="station-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Station.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item1 != null ? this.props.nextBackLookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&lt;</a> : null)}
                            {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item.ID + "&navigation=meter" : '#')} id="meter-back" key="meter-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Meter.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item1 != null ? this.props.nextBackLookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&lt;</a> : null)}
                            {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item1.ID + "&navigation=line" : '#')} id="line-back" key="line-back" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Line.m_Item1 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&lt;</a> : null)}

                            <select id="next-back-selection" value={this.props.selected} onChange={(e) => this.props.stateSetter({ navigation: e.target.value })}>
                                <option value="system">System</option>
                                <option value="station">Station</option>
                                <option value="meter">Meter</option>
                                <option value="line">Line</option>
                            </select>
                            {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item2.ID + "&navigation=system" : '#')} id="system-next" key="system-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.System.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.System.m_Item2 != null ? this.props.nextBackLookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&gt;</a> : null)}
                            {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item2.ID + "&navigation=station" : '#')} id="station-next" key="station-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Station.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item2 != null ? this.props.nextBackLookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&gt;</a> : null)}
                            {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item2.ID + "&navigation=meter" : '#')} id="meter-next" key="meter-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Meter.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item2 != null ? this.props.nextBackLookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&gt;</a> : null)}
                            {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item2.ID + "&navigation=line" : '#')} id="line-next" key="line-next" className={'nextbackbutton smallbutton' + (this.props.nextBackLookup.Line.m_Item2 == null ? '-disabled' : '')} title={(this.props.nextBackLookup.Line.m_Item2 != null ? this.props.nextBackLookup.Line.m_Item2.StartTime : '')} style={{ padding: '4px 20px', margin: '0px 10px' }}>&gt;</a> : null)}

                        </li>
                    </ul>
                  </div>
                <PolarChart data={this.props.TableData} callback={this.props.stateSetter} />
                <Points pointsTable={this.props.PointsTable} callback={this.props.stateSetter} postedData={this.props.PostedData} />
                <Tooltip data={this.props.TableData} hover={this.props.Hover} callback={this.props.stateSetter} />
                <TooltipWithDelta data={this.props.TooltipWithDeltaTable} />
                <ScalarStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <HarmonicStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <TimeCorrelatedSags eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <LightningData eventId={this.props.eventid} callback={this.props.stateSetter} />

            </nav>
        );
    }

    showhidePoints(evt) {
        $('#accumulatedpoints').show();
    }

    showhideTooltip(evt) {
        $('#unifiedtooltip').show();
        $('.legendCheckbox').show();
    }

    showhideTooltipWithDelta(evt) {
        $('#tooltipwithdelta').show();
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

    showhideLightningData() {
        $('#lightningquery').show();
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