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
//*****************************************************************************************************
import * as React from 'react';
import { FaTimes, FaPencilAlt } from 'react-icons/fa';
import * as moment from 'moment';

import OpenSEE2Service from './../../../TS/Services/OpenSEE';

export default function OpenSEENoteModal (props: { eventId: number }): JSX.Element{

        var openSEE2Service = new OpenSEE2Service();

        const [tableRows, setTableRows] = React.useState<Array<JSX.Element>>([]);
        const [note, setNote] = React.useState<string>('');
        const [count, setCount] = React.useState<number>(0);
        const [show, setShow] = React.useState<boolean>(false);

        React.useEffect(() => {
            createTableRows();
        }, []);

        function createTableRows() {
            openSEE2Service.getNotes(props.eventId).done(data => {
                var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
                    <button className="btn btn-sm" onClick={(e) => handleEdit(d)}><FaPencilAlt /></button>
                    <button className="btn btn-sm" onClick={(e) => handleDelete(d)}><FaTimes /></button>
                </td></tr>)

                setTableRows(rows);
                setCount(rows.length);
            });
        }

        function handleAdd() {
            openSEE2Service.addNote({ ID: 0, EventID: props.eventId, Note: note }).done(e => {
                setNote('');
                createTableRows();
            });
        }

        function handleDelete(d) {
            openSEE2Service.deleteNote(d).done(() => createTableRows());
        }

        function handleEdit(d) {
            setNote(d.Note);
            openSEE2Service.deleteNote(d).done(() => createTableRows());
        }

        return (
            <div>
                <button className="btn btn-link" onClick={() => { setShow(true) }}>Manage Notes{(count > 0 ? ` [${count}]`: null)}</button>

                <div className="modal fade show" style={{display: (show ? 'block': 'none' )}} role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Manage notes for the event.</h3>
                                <button type="button" className="close" onClick={() => setShow(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr><td style={{ width: '50%' }}>Note</td><td>Time</td><td>User</td><td></td></tr>
                                    </thead>
                                    <tbody>
                                        {tableRows}
                                    </tbody>

                                </table>
                                <textarea className="form-control" value={note} onChange={(e) => setNote((e.target as any).value)}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
                                <button className="btn btn-primary" onClick={handleAdd} disabled={note.length == 0}>Add Note</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
}
