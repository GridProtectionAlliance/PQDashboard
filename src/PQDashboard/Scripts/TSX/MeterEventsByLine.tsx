//******************************************************************************************************
//  MeterEventsByLine.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  03/31/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import Table from './Table';

declare var meterName: string;
declare var date: string;
declare var xdaInstance: string;
declare var context: string;
declare var eventID: number;
declare var homePath: string;

interface EventData {
    StartTime: string,
    EventType: string,
    AssetName: string,
    KV: number,
    FaultType: string,
    Distance: number,
    EventID: number,
    UpdatedBy: string,
    ModalRow: any,
    OpenSEERow: any
}
class MeterEventByLine extends React.Component<{}, { Data: Array<EventData>, SortField: keyof(EventData), Ascending: boolean }, {}>{
    constructor(props, context) {
        super(props, context);
        this.state = {
            Data: [],
            SortField: 'StartTime',
            Ascending: true
        }
    }

    componentDidMount() {
        $.ajax({
            type: "GET",
            url: `${homePath}api/Events/DetailsByDate/${eventID}/${context}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: Array<EventData>) => {
            var ordered = _.orderBy(data, [this.state.SortField], [(this.state.Ascending ? "asc" : "desc")]);
            this.setState({ Data: ordered});

            ($(this.refs.dataTable) as any).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                columns: [
                    {
                        field: 'StartTime', headerText: 'Start Time', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true, content:
                            (row) => `<a href="${xdaInstance}/Workbench/Event.cshtml?EventID=${row.EventID}" style="color: blue; background-color: ${(row.UpdatedBy ? 'yellow' : null)}" target='_blank' title=${(row.UpdatedBy ? 'This event has been edited.' : "")}>${row.StartTime}</a>`
                    },
                    { field: 'EventType', headerText: 'Event Type', headerStyle: 'width: 20%', bodyStyle: 'width: 20%; height: 20px', sortable: true },
                    { field: 'AssetName', headerText: 'Asset Name', headerStyle: 'width: 20%', bodyStyle: 'width:  20%; height: 20px', sortable: true },
                    { field: 'KV', headerText: 'KV', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'FaultType', headerText: 'Phase', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'Distance', headerText: 'Distance', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
                    { headerStyle: 'width: 60px', content: function (data) { return /*makeOpenSEEButton_html(data);*/ null } },
                    { headerText: '', headerStyle: 'width: 50px', content: (row) => `<button style="height: 30px" onclick="openResultsModal('${JSON.stringify(row).replace(/"/g, '\\\'')}')"><span class="glyphicon glyphicon-option-horizontal" title=""></span><span id="${row.EventID}asterisk" style="color: green; position: sticky; bottom: 0">${(this.testForAllStuff(row) ? '*' : '')}</span></button>`
                    }
                ],
                datasource: data
            });

        })
    }


    testForAllStuff(data) {
        if (data.UpdatedBy !== null) return true;
        if (data.Note > 0) return true;
        if (data.pqiexists > 0) return true;
        $.each(data.ServiceList.split(','), function (i, k) {
            if (data[k] !== null)
                return true;
        });

        return false;
    }

    openResultsModal(row) {

    }

    render() {
        return (
            <>
                <div className="gridheader" style={{textAlign: 'center'}}>Events for {meterName} for {date}(<a href={`${xdaInstance}/Workbench/MeterEventsByLine.cshtml?EventID=${eventID}&context=${context}`} target="_blank">View in OpenXDA</a>)
                </div >


                <div style={{ height: 'calc(100% - 23px)', width: '100%' }}>
                    <Table<EventData>
                        cols={[
                            { key: 'StartTime', label: 'Start Time', headerStyle: { width: '30%' }, rowStyle: { width: '30%' }, content: (item, key, style) => <a href={`${xdaInstance}/Workbench/Event.cshtml?EventID=${item.EventID}`} style={{ color: 'blue', backgroundColor: (item.UpdatedBy ? 'yellow' : null) }} target='_blank' title={(item.UpdatedBy ? 'This event has been edited.' : "")}>{item.StartTime}</a> },
                            { key: 'EventType', label: 'Event Type', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                            { key: 'AssetName', label: 'Asset', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                            { key: 'KV', label: 'KV', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                            { key: 'FaultType', label: 'Fault Type', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                            { key: 'Distance', label: 'Distance', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                            { key: "OpenSEERow", label: '', headerStyle: { width: 60 }, rowStyle: { width: 60 }, content: (item, key, style) => <button onClick={(evt) => { window.open(`${homePath}Main/OpenSEE?eventid=${item.EventID}&faultcurves=1`, item.EventID + "openSEE") }} title="Launch OpenSEE Waveform Viewer"><img src={`${homePath}Images/seeButton.png`} /></button> },
                            { key: "ModalRow", label: '', headerStyle: { width: 50 }, rowStyle: { width: 50 }, content: (item, key, style) => <button style={{ height: 30, width: 30, padding: 0 }} onClick={(evt) => this.openResultsModal(item)}><span style={{ position: 'relative', top: -2, left: 2 }} className="glyphicon glyphicon-option-horizontal" title=""></span><span id={`${item.EventID}asterisk`} style={{ color: 'green', position: 'relative', bottom: -5, left: -4 }}>{(this.testForAllStuff(item) ? '*' : '')}</span></button> },   
                            { key: null, label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
                        ]}
                        tableClass="table table-hover"
                        data={this.state.Data}
                        sortField={this.state.SortField}
                        ascending={this.state.Ascending}
                        onSort={(d) => {
                            if (d.col == this.state.SortField) {
                                var ordered = _.orderBy(this.state.Data, [d.col], [(!this.state.Ascending ? "asc" : "desc")]);
                                this.setState({ Data: ordered, Ascending: !this.state.Ascending });
                            }
                            else {
                                var ordered = _.orderBy(this.state.Data, [d.col], ["asc"]);
                                this.setState({ Data: ordered, SortField: d.col });
                            }

                        }}
                        onClick={(data) => { }}
                        theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 300, width: '100%' }}
                        rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        selected={(item) => false}
                    />

                    {/*<div style={{ height: '100%', display: 'inline-block' }} ref="dataTable"></div>*/}
                </div>
            </>
        )
    }
}

ReactDOM.render(<MeterEventByLine />, document.getElementById('pageBody'));
