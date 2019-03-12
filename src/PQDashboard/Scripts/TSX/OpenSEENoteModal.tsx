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
import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import { Table, Navbar, NavDropdown, Nav, Button, Form, FormControl, Row, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import * as moment from 'moment';

import OpenSEE2Service from './../TS/Services/OpenSEE2';

export default class OpenSEENoteModal extends React.Component {
    openSEE2Service: OpenSEE2Service;
    state: { show: boolean, tableRows: Array<any>, note: string }
    props: { eventId: number }
    constructor(props, context) {
        super(props, context);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.openSEE2Service = new OpenSEE2Service();
        this.state = {
            show: false,
            tableRows: [],
            note: ''
        };

        this.handleAdd = this.handleAdd.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleShow = this.handleShow.bind(this)
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleAdd() {
        this.openSEE2Service.addNote({ ID: 0, EventID: this.props.eventId, Note: this.state.note }).done(e => {
            this.setState({note: ''});
            this.componentDidMount();
        });
    }

    handleShow() {
        this.setState({ show: true });
    }

    componentDidMount() {
        this.openSEE2Service.getNotes(this.props.eventId).done(data => {
            var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
                <Button variant="light" size="sm" onClick={(e) => {
                    this.openSEE2Service.deleteNote(d).done(() => this.componentDidMount());
                }}><FaTimes /></Button>
            </td></tr>)

            this.setState({ tableRows: rows });
        });
    }

    render() {
        return (
            <>
            <Button variant="link" onClick={this.handleShow}>Manage Notes</Button>

            <Modal show={this.state.show} onHide={this.handleClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Manage notes for the event.</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Notes:</Form.Label>
                            <Table>
                                <thead>
                                    <tr><td style={{width: '50%'}}>Note</td><td>Time</td><td>User</td><td></td></tr>
                                </thead>
                                <tbody>
                                    {this.state.tableRows}
                                </tbody>

                            </Table>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label></Form.Label>
                            <Form.Control as="textarea" value={this.state.note} onChange={(e) => this.setState({note: (e.target as any).value})}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>Close</Button>
                    <Button variant="primary" onClick={this.handleAdd} disabled={this.state.note.length == 0}>Add Note</Button>
                </Modal.Footer>
            </Modal>
            </>
        );
    }
}
