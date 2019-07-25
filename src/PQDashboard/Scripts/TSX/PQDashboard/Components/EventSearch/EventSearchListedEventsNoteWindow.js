"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var moment = require("moment");
var OpenSEE_1 = require("./../../../../TS/Services/OpenSEE");
var PQDashboard_1 = require("./../../../../TS/Services/PQDashboard");
var lodash_1 = require("lodash");
var EventSearchListedEventsNoteWindow = /** @class */ (function (_super) {
    __extends(EventSearchListedEventsNoteWindow, _super);
    function EventSearchListedEventsNoteWindow(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.pqDashboardService = new PQDashboard_1.default();
        _this.openSEEService = new OpenSEE_1.default();
        _this.state = {
            show: false,
            note: '',
            ids: _this.props.searchList.map(function (a) { return a.EventID; }).sort(),
            notesMade: []
        };
        _this.handleAdd.bind(_this);
        return _this;
    }
    EventSearchListedEventsNoteWindow.prototype.componentDidMount = function () {
    };
    EventSearchListedEventsNoteWindow.prototype.componentWillUnmount = function () {
    };
    EventSearchListedEventsNoteWindow.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.state.ids != nextProps.searchList.map(function (a) { return a.EventID; }).sort())
            this.setState({ ids: nextProps.searchList.map(function (a) { return a.EventID; }).sort() });
    };
    EventSearchListedEventsNoteWindow.prototype.getData = function (props) {
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
    };
    EventSearchListedEventsNoteWindow.prototype.render = function () {
        var _this = this;
        var tableRows = this.props.searchList.map(function (evt, index) {
            return (React.createElement("tr", { key: index, style: { display: 'table', tableLayout: 'fixed', width: 'calc(100%)' } },
                React.createElement("td", null,
                    React.createElement("input", { type: 'checkbox', checked: _this.state.ids.indexOf(evt.EventID) >= 0, value: evt.EventID, onChange: function (e) {
                            var selected = $(e.target).prop('checked');
                            var eventId = parseInt(e.target.value);
                            var list = lodash_1.clone(_this.state.ids);
                            if (selected && !(list.indexOf(eventId) >= 0)) {
                                list.push(eventId);
                                _this.setState({ ids: list.sort() });
                            }
                            else if (!selected && (list.indexOf(eventId) >= 0)) {
                                list = list.filter(function (a) { return a != eventId; });
                                _this.setState({ ids: list.sort() });
                            }
                        } })),
                React.createElement("td", null,
                    React.createElement("span", null,
                        moment(evt.FileStartTime).format('MM/DD/YYYY'),
                        React.createElement("br", null),
                        moment(evt.FileStartTime).format('HH:mm:ss.SSSSSSS'))),
                React.createElement("td", null, evt.AssetName),
                React.createElement("td", null, evt.EventType)));
        });
        var madeNotes = this.state.notesMade.map(function (noteMade, index) {
            return (React.createElement("tr", { key: index, style: { display: 'table', tableLayout: 'fixed', width: 'calc(100%)' } },
                React.createElement("td", null, noteMade.Note),
                React.createElement("td", null,
                    React.createElement("span", null,
                        moment(noteMade.Timestamp).format('MM/DD/YYYY'),
                        React.createElement("br", null),
                        moment(noteMade.Timestamp).format('HH:mm:ss.SSSSSSS'))),
                React.createElement("td", null, noteMade.UserAccount),
                React.createElement("td", null,
                    React.createElement("button", { className: "btn btn-sm", onClick: function (e) { return _this.handleDelete(noteMade); } },
                        React.createElement("span", null,
                            React.createElement("i", { className: "fa fa-times" }))))));
        });
        return (React.createElement("div", null,
            React.createElement("button", { className: "btn btn-primary form-control", onClick: function () { _this.setState({ show: true }); }, title: "Click here to add a note to all events listed below ..." }, "Add Notes"),
            React.createElement("div", { className: "modal fade show", style: { display: (this.state.show ? 'block' : 'none') }, role: "dialog" },
                React.createElement("div", { className: "modal-dialog", style: { maxWidth: '75%' }, role: "document" },
                    React.createElement("div", { className: "modal-content" },
                        React.createElement("div", { className: "modal-header" },
                            React.createElement("h3", { className: "modal-title" }, "Add notes for the following events."),
                            React.createElement("button", { type: "button", className: "close", onClick: function () { return _this.setState({ show: false }); } },
                                React.createElement("span", { "aria-hidden": "true" }, "\u00D7"))),
                        React.createElement("div", { className: "modal-body", style: { maxHeight: 650, height: 650 } },
                            React.createElement("div", { style: { width: '50%', float: 'left', padding: 10 } },
                                React.createElement("table", { className: "table" },
                                    React.createElement("thead", { style: { fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' } },
                                        React.createElement("tr", null,
                                            React.createElement("td", null,
                                                React.createElement("input", { type: 'checkbox', checked: this.props.searchList.length == this.state.ids.length, onChange: function (e) {
                                                        var selected = $(e.target).prop('checked');
                                                        if (selected) {
                                                            _this.setState({ ids: _this.props.searchList.map(function (a) { return a.EventID; }).sort() });
                                                        }
                                                        else if (!selected) {
                                                            _this.setState({ ids: [] });
                                                        }
                                                    } })),
                                            React.createElement("td", null, "Time"),
                                            React.createElement("td", null, "Asset"),
                                            React.createElement("td", null, "Type"))),
                                    React.createElement("tbody", { style: { display: 'block', overflowY: 'scroll', height: 580, maxHeight: 580 } }, tableRows))),
                            React.createElement("div", { style: { width: '50%', float: 'right', padding: 10 } },
                                React.createElement("table", { className: "table" },
                                    React.createElement("thead", { style: { fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' } },
                                        React.createElement("tr", null,
                                            React.createElement("td", null, "Note"),
                                            React.createElement("td", null, "Time"),
                                            React.createElement("td", null, "User"),
                                            React.createElement("td", null))),
                                    React.createElement("tbody", { style: { display: 'block', overflowY: 'scroll', height: 437, maxHeight: 437 } }, madeNotes)),
                                React.createElement("textarea", { className: "form-control", value: this.state.note, rows: 4, onChange: function (e) { return _this.setState({ note: e.target.value }); } }))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { className: "btn btn-primary", onClick: function () { return _this.handleAdd(); }, disabled: this.state.note.length == 0 }, "Add Note"),
                            React.createElement("button", { className: "btn btn-secondary", onClick: function () { return _this.setState({ show: false }); } }, "Close")))))));
    };
    EventSearchListedEventsNoteWindow.prototype.createTableRows = function () {
        //this.openSEEService.getNotes(props.eventId).done(data => {
        //    var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
        //        <button className="btn btn-sm" onClick={(e) => this.handleEdit(d)}><span><i className="fa fa-pencil"></i></span></button>
        //        <button className="btn btn-sm" onClick={(e) => this.handleDelete(d)}><span><i className="fa fa-times"></i></span></button>
        //    </td></tr>)
        //    this.setState({ tableRows: rows });
        //});
    };
    EventSearchListedEventsNoteWindow.prototype.handleAdd = function () {
        var _this = this;
        this.openSEEService.addMultiNote(this.state.note, this.state.ids).done(function (notesMade) {
            var list = lodash_1.clone(_this.state.notesMade);
            list.push({ Note: notesMade[0].Note, Timestamp: notesMade[0].Timestamp, UserAccount: notesMade[0].UserAccount, EventIds: notesMade.map(function (a) { return a.EventID; }) });
            _this.setState({ note: '', notesMade: list });
        });
    };
    EventSearchListedEventsNoteWindow.prototype.handleDelete = function (noteMade) {
        this.openSEEService.deleteMultiNote(noteMade.Note, noteMade.UserAccount, noteMade.Timestamp);
        var list = lodash_1.clone(this.state.notesMade);
        list = list.filter(function (note) { return note != noteMade; });
        this.setState({ notesMade: list });
    };
    EventSearchListedEventsNoteWindow.prototype.handleEdit = function (d) {
        var _this = this;
        this.setState({ note: d.Note });
        this.openSEEService.deleteNote(d).done(function () { return _this.createTableRows(); });
    };
    return EventSearchListedEventsNoteWindow;
}(React.Component));
exports.default = EventSearchListedEventsNoteWindow;
//# sourceMappingURL=EventSearchListedEventsNoteWindow.js.map