//******************************************************************************************************
//  OpenSEENoteModal.tsx - Gbtc
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
//  03/11/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { FaTimes, FaPencilAlt } from 'react-icons/fa';
import * as moment from 'moment';
import 'bootstrap'

import OpenSEE2Service from './../../../TS/Services/OpenSEE';

export default class OpenSEENoteModal extends React.Component {
    openSEE2Service: OpenSEE2Service;
    state: { tableRows: Array<any>, note: string, count: number }
    props: { eventId: number }
    constructor(props, context) {
        super(props, context);

        this.openSEE2Service = new OpenSEE2Service();
        this.state = {
            tableRows: [],
            note: '',
            count: 0
        };

        this.handleAdd = this.handleAdd.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleShow = this.handleShow.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleEdit = this.handleEdit.bind(this)

    }

    handleClose() {
        $(this.refs.modal).hide();
    }

    handleAdd() {
        this.openSEE2Service.addNote({ ID: 0, EventID: this.props.eventId, Note: this.state.note }).done(e => {
            this.setState({note: ''});
            this.componentDidMount();
        });
    }

    handleShow() {
        $(this.refs.modal).show();
    }

    handleDelete(d) {
        this.openSEE2Service.deleteNote(d).done(() => this.componentDidMount());
    }

    handleEdit(d) {
        this.setState({ note: d.Note });
        this.openSEE2Service.deleteNote(d).done(() => this.componentDidMount());
    }

    componentDidMount() {
        this.openSEE2Service.getNotes(this.props.eventId).done(data => {
            var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
                <button className="btn btn-sm" onClick={(e) => this.handleEdit(d)}><FaPencilAlt /></button>
                <button className="btn btn-sm" onClick={(e) => this.handleDelete(d)}><FaTimes /></button>
            </td></tr>)

            this.setState({ tableRows: rows, count: rows.length });
        });
    }

    render() {
        return (
            <div>
                <button className="btn btn-link" onClick={this.handleShow}>Manage Notes{(this.state.count > 0 ? ` [${this.state.count}]`: null)}</button>

                <div className="modal fade show" ref="modal" role="dialog">
                    <div className="modal-dialog modal-xl" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Manage notes for the event.</h3>
                                <button type="button" className="close" onClick={this.handleClose}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr><td style={{ width: '50%' }}>Note</td><td>Time</td><td>User</td><td></td></tr>
                                    </thead>
                                    <tbody>
                                        {this.state.tableRows}
                                    </tbody>

                                </table>
                                <textarea className="form-control" value={this.state.note} onChange={(e) => this.setState({ note: (e.target as any).value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={this.handleClose}>Close</button>
                                <button className="btn btn-primary" onClick={this.handleAdd} disabled={this.state.note.length == 0}>Add Note</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
