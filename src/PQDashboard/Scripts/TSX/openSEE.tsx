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

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OpenSEEService from './../TS/Services/OpenSEE';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";
import WaveformViewerGraph from './WaveformViewerGraph';
import PolarChart from './PolarChart';
import Points from './AccumulatedPoints';
import Tooltip from './Tooltip';

export class OpenSEE extends React.Component<any, any>{
    history: object;
    openSEEService: OpenSEEService;
    resizeId: any;
    TableData: object;

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
            breakeroperation: (query['breakeroperation'] != undefined ? query['breakeroperation'] : undefined),
            Width: window.innerWidth,
            Hover: 0,
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
        this.openSEEService.getHeaderData(this.state).done(data => {
            this.showData(data);

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
            <div>
                    <div id="pageHeader" style={{ width: '100%' }}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'left', width: '10%' }}><img src={'../Images/GPA-Logo---30-pix(on-white).png'} /></td>
                                    <td style={{ textAlign: 'center', width: '80%' }}><img src={'../Images/openSEET.png'} /></td>
                                    <td style={{ textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', width: '10%' }}><img alt="" src="../Images/GPA-Logo.png" style={{ display: 'none' }} /></td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center' }}>
                                        <div><span id="TitleData"></span>&nbsp;&nbsp;&nbsp;<a type="button" target="_blank" id="editButton" >edit</a></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="DockWaveformHeader">
                        <table style={{ width: '75%', margin: '0 auto' }}>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center' }}><button className="smallbutton" onClick={() => this.resetZoom()}>Reset Zoom</button></td>
                                    <td style={{ textAlign: 'center' }}><input className="smallbutton" type="button" value="Show Points" onClick={() => this.showhidePoints()} id="showpoints" /></td>

                                    <td style={{ textAlign: 'center' }}>
                                        {this.state.backButtons}
                                        <select id="next-back-selection" defaultValue="system">
                                            <option value="system">System</option>
                                            <option value="station">Station</option>
                                            <option value="meter">Meter</option>
                                            <option value="line">Line</option>
                                        </select>
                                        {this.state.forwardButtons}
                                    </td>

                                    <td style={{ textAlign: 'center' }}><input className="smallbutton" type="button" value="Show Tooltip" onClick={() => this.showhideTooltip()} id="showtooltip" /></td>
                                    <td style={{ textAlign: 'center' }}><input className="smallbutton" type="button" value="Show Phasor" onClick={() => this.showhidePhasor()} id="showphasor" /></td>
                                    <td style={{ textAlign: 'center', display: 'none' }}><input className="smallbutton" type="button" value="Export Data" onClick={() => { }} id="exportdata" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <PolarChart data={this.state.TableData} callback={this.stateSetter.bind(this)} />
                        <Points pointsTable={this.state.PointsTable} callback={this.stateSetter.bind(this)} postedData={this.state.PostedData} />
                        <Tooltip data={this.state.TableData} hover={this.state.Hover} />

                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Voltage" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayVolt} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="Current" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.displayCur} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="F" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.faultcurves} postedData={this.state.PostedData}></WaveformViewerGraph>
                        <WaveformViewerGraph eventId={this.state.eventid} startDate={this.state.StartDate} endDate={this.state.EndDate} type="B" pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} tableData={this.TableData} pointsTable={this.state.PointsTable} tableSetter={this.tableUpdater.bind(this)} display={this.state.breakerdigitals} postedData={this.state.PostedData}></WaveformViewerGraph>
                    </div>
            </div>
        );
    }

    stateSetter(obj) {
        this.setState(obj, () => {
            var prop = _.clone(this.state);
            delete prop.Hover;
            delete prop.Width;
            delete prop.TableData;
            delete prop.PointsTable;
            delete prop.displayCur;
            delete prop.displayVolt;
            delete prop.backButtons;
            delete prop.forwardButtons;
            delete prop.PostedData;

            var qs = queryString.parse(queryString.stringify(prop, { encode: false }));
            var hqs = queryString.parse(this.history['location'].search);

            if(!_.isEqual(qs, hqs))
                this.history['push'](this.history['location'].pathname+ '?' + queryString.stringify(prop, { encode: false }));
        });
    }

    tableUpdater(obj) {
        this.TableData = _.merge(this.TableData, obj);
        this.setState({ TableData: this.TableData });
    }

    resetZoom() {
        this.history['push'](this.history['location'].pathname + '?eventid=' + this.state.eventid + (this.state.faultcurves ? '&faultcurves=1' : '') + (this.state.breakerdigitals ? '&breakerdigitals=1': ''));
    }

    calculateHeights(obj: any) {
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.faultcurves) + Number(obj.breakerdigitals))
    }

    nextBackSelect(nextBackType) {
        $('.nextbackbutton').hide();
        $('#' + nextBackType + '-back').show();
        $('#' + nextBackType + '-next').show();
    }

    showhidePoints() {
        if ($('#showpoints').val() == "Show Points") {
            $('#showpoints').val("Hide Points");
            $('#accumulatedpoints').show();

        } else {
            $('#showpoints').val("Show Points");
            $('#accumulatedpoints').hide();

        }
    }

    showhideTooltip() {
        if ($('#showtooltip').val()  == "Show Tooltip") {
            $('#showtooltip').val("Hide Tooltip");
            $('#unifiedtooltip').show();
            $('.legendCheckbox').show();

        } else {
            $('#showtooltip').val("Show Tooltip");
            $('#unifiedtooltip').hide();
            $('.legendCheckbox').hide();
        }
    }

    showhidePhasor() {
        if ($('#showphasor').val() == "Show Phasor") {
            $('#showphasor').val("Hide Phasor");
            $('#phasor').show();
        } else {
            $('#showphasor').val("Show Phasor");
            $('#phasor').hide();
        }
    }

    showData(data) {
        // If all exist, then let's act
        if (data.postedEventName != undefined) {
            // Lets build a label for this chart
            var label = "";
            var details = "";
            var separator = "&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;";
            var faultLink = '<a href="#" title="Click for fault details" onClick="showdetails(this);">Fault</a>';

            label += "Station: " + data.postedStationName;
            label += separator + "Meter: " + data.postedMeterName;
            label += separator + "Line: " + data.postedLineName;
            label += "<br />";

            if (data.postedEventName != "Fault")
                label += "Event Type: " + data.postedEventName;
            else
                label += "Event Type: " + faultLink;

            label += separator + "Event Time: " + data.postedEventDate;

            if (data.postedStartTime != undefined)
                details += "Start: " + data.postedStartTime;

            if (data.postedPhase != undefined) {
                if (details != "")
                    details += separator;

                details += "Phase: " + data.postedPhase;
            }

            if (data.postedDurationPeriod != undefined) {
                if (details != "")
                    details += separator;

                details += "Duration: " + data.postedDurationPeriod;
            }

            if (data.postedMagnitude != undefined) {
                if (details != "")
                    details += separator;

                details += "Magnitude: " + data.postedMagnitude;
            }

            if (details != "")
                label += "<br />" + details;

            details = "";

            if (data.postedBreakerNumber != undefined)
                details += "Breaker: " + data.postedBreakerNumber;

            if (data.postedBreakerPhase != undefined) {
                if (details != "")
                    details += separator;

                details += "Phase: " + data.postedBreakerPhase;
            }

            if (data.postedBreakerTiming != undefined) {
                if (details != "")
                    details += separator;

                details += "Timing: " + data.postedBreakerTiming;
            }

            if (data.postedBreakerSpeed != undefined) {
                if (details != "")
                    details += separator;

                details += "Speed: " + data.postedBreakerSpeed;
            }

            if (data.postedBreakerOperation != undefined) {
                if (details != "")
                    details += separator;

                details += "Operation: " + data.postedBreakerOperation;
            }

            if (details != "")
                label += "<br />" + details;

            document.getElementById('TitleData').innerHTML = label;

            if (data.xdaInstance != undefined)
                $('#editButton').prop('href', data.xdaInstance + "/Workbench/Event.cshtml?EventID=" + this.state.eventid);
        }
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
}

ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));
