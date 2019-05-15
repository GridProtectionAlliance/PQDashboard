//******************************************************************************************************
//  EventSearchNoteWindow.tsx - Gbtc
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as moment from 'moment';
import OpenSEEService from './../../../../TS/Services/OpenSEE';
import PQDashboardService from './../../../../TS/Services/PQDashboard';
import { orderBy, filter, clone } from 'lodash';
import { OpenXDAEvent } from './EventSearch';

interface IState {
    show: boolean,
    note: string,
    ids: Array<number>,
    notesMade: Array<{EventIds: Array<number>, Note: string, Timestamp: string, UserAccount: string}>
}
export default class EventSearchListedEventsNoteWindow extends React.Component<{ searchList: Array<OpenXDAEvent> }, IState, {}> {
    pqDashboardService: PQDashboardService;
    openSEEService: OpenSEEService;

    constructor(props, context) {
        super(props, context);

        this.pqDashboardService = new PQDashboardService();
        this.openSEEService = new OpenSEEService();

        this.state = {
            show: false,
            note: '',
            ids: this.props.searchList.map(a => a.EventID).sort(),
            notesMade: []
        };

        this.handleAdd.bind(this);

    }

    componentDidMount() {
    }
    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.ids != nextProps.searchList.map(a => a.EventID).sort())
            this.setState({ ids: nextProps.searchList.map(a => a.EventID).sort()});
    }

    getData(props) {
        //this.pqDashboardService.getEventSearchData().done(results => {
        //    var filtered = filter(results, obj => {
        //        return obj.AssetName.toLowerCase().indexOf(props.searchText) >= 0 ||
        //            obj.AssetType.toLowerCase().indexOf(props.searchText) >= 0 ||
        //            obj.EventType.toLowerCase().indexOf(props.searchText) >= 0 ||
        //            moment(obj.FileStartTime).format('MM/DD/YYYY').toLowerCase().indexOf(props.searchText) >= 0 ||
        //            moment(obj.FileStartTime).format('HH:mm:ss.SSSSSSS').toLowerCase().indexOf(props.searchText) >= 0 ||
        //            obj.VoltageClass.toString().toLowerCase().indexOf(props.searchText) >= 0

        //    });
        //    var ordered = orderBy(filtered, ["FileStartTime"], ["desc"]);
        //});

    }

    render() {
        var tableRows: Array<JSX.Element> = this.props.searchList.map((evt, index) => {
            return (
                <tr key={index} style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}>
                    <td><input type='checkbox' checked={this.state.ids.indexOf(evt.EventID) >= 0} value={evt.EventID} onChange={(e) => {
                        var selected = $(e.target).prop('checked');
                        var eventId = parseInt(e.target.value);
                        var list = clone(this.state.ids);

                        if (selected && !(list.indexOf(eventId) >= 0)) {

                            list.push(eventId);
                            this.setState({ids: list.sort()})
                        }
                        else if (!selected && (list.indexOf(eventId) >= 0)) {
                            list = list.filter(a => a != eventId);
                            this.setState({ ids: list.sort() })
                        }

                    }} /></td>
                    <td><span>{moment(evt.FileStartTime).format('MM/DD/YYYY')}<br />{moment(evt.FileStartTime).format('HH:mm:ss.SSSSSSS')}</span></td>
                    <td>{evt.AssetName}</td>
                    <td>{evt.EventType}</td>
                </tr>
            );
        });

        var madeNotes: Array<JSX.Element> = this.state.notesMade.map((noteMade, index) => {
            return (
                <tr key={index} style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}>
                    <td>{noteMade.Note}</td>
                    <td><span>{moment(noteMade.Timestamp).format('MM/DD/YYYY')}<br />{moment(noteMade.Timestamp).format('HH:mm:ss.SSSSSSS')}</span></td>
                    <td>{noteMade.UserAccount}</td>
                    <td><button className="btn btn-sm" onClick={(e) => this.handleDelete(noteMade)}><span><i className="fa fa-times"></i></span></button></td>
                </tr>
            
            )
        });

        return (
            <div>
                <button className="btn btn-primary form-control" onClick={() => { this.setState({ show: true }) }} title="Click here to add a note to all events listed below ...">Add Notes</button>

                <div className="modal fade show" style={{ display: (this.state.show ? 'block' : 'none') }} role="dialog">
                    <div className="modal-dialog" style={{maxWidth: '75%'}} role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Add notes for the following events.</h3>
                                <button type="button" className="close" onClick={() => this.setState({ show: false })}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{maxHeight: 650, height: 650}}>
                                <div style={{width: '50%', float: 'left', padding: 10}}>
                                    <table className="table">
                                        <thead style={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}>
                                            <tr><td><input type='checkbox' checked={this.props.searchList.length == this.state.ids.length} onChange={(e) => {
                                                var selected = $(e.target).prop('checked');

                                                if (selected) {
                                                    this.setState({ ids: this.props.searchList.map(a => a.EventID).sort() })
                                                }
                                                else if (!selected) {
                                                    this.setState({ ids: [] })
                                                }

                                            }} /></td><td>Time</td><td>Asset</td><td>Type</td></tr>
                                        </thead>
                                        <tbody style={{ display: 'block', overflowY: 'scroll', height: 580, maxHeight: 580 }}>
                                            {tableRows}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ width: '50%', float: 'right', padding: 10 }}>
                                    <table className="table">
                                        <thead style={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}>
                                            <tr><td>Note</td><td>Time</td><td>User</td><td></td></tr>
                                        </thead>
                                        <tbody style={{ display: 'block', overflowY: 'scroll', height: 437, maxHeight: 437}}>
                                            {madeNotes}
                                        </tbody>
                                    </table>
                                    <textarea className="form-control" value={this.state.note} rows={4} onChange={(e) => this.setState({ note: (e.target as any).value })}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => this.handleAdd()} disabled={this.state.note.length == 0}>Add Note</button>
                                <button className="btn btn-secondary" onClick={() => this.setState({ show: false })}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    createTableRows() {
        //this.openSEEService.getNotes(props.eventId).done(data => {
        //    var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
        //        <button className="btn btn-sm" onClick={(e) => this.handleEdit(d)}><span><i className="fa fa-pencil"></i></span></button>
        //        <button className="btn btn-sm" onClick={(e) => this.handleDelete(d)}><span><i className="fa fa-times"></i></span></button>
        //    </td></tr>)

        //    this.setState({ tableRows: rows });
        //});
    }

    handleAdd() {
        this.openSEEService.addMultiNote(this.state.note, this.state.ids).done(notesMade => {
            var list = clone(this.state.notesMade);
            list.push({ Note: notesMade[0].Note, Timestamp: notesMade[0].Timestamp, UserAccount: notesMade[0].UserAccount, EventIds: notesMade.map(a => a.EventID)});
            this.setState({ note: '', notesMade: list });
        });
    }

    handleDelete(noteMade) {
        this.openSEEService.deleteMultiNote(noteMade.Note, noteMade.UserAccount, noteMade.Timestamp);
        var list = clone(this.state.notesMade);
        list = list.filter(note => note != noteMade);
        this.setState({notesMade: list});
    }

    handleEdit(d) {
        this.setState({ note: d.Note });
        this.openSEEService.deleteNote(d).done(() => this.createTableRows());
    }

}
