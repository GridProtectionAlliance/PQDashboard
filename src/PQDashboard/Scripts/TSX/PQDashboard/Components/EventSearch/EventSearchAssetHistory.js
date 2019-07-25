"use strict";
//******************************************************************************************************
//  EventSearchAssetVoltageDisturbances.tsx - Gbtc
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
var PQDashboard_1 = require("./../../../../TS/Services/PQDashboard");
var EventSearchHistory = /** @class */ (function (_super) {
    __extends(EventSearchHistory, _super);
    function EventSearchHistory(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.pqDashboardService = new PQDashboard_1.default();
        _this.state = {
            tableRows: []
        };
        return _this;
    }
    EventSearchHistory.prototype.componentDidMount = function () {
        if (this.props.eventId >= 0)
            this.createTableRows(this.props.eventId);
    };
    EventSearchHistory.prototype.componentWillUnmount = function () {
    };
    EventSearchHistory.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.eventId >= 0)
            this.createTableRows(nextProps.eventId);
    };
    EventSearchHistory.prototype.createTableRows = function (eventID) {
        var _this = this;
        this.pqDashboardService.getEventSearchAsssetHistoryData(eventID).done(function (data) {
            var rows = data.map(function (d, i) {
                return React.createElement("tr", { key: i },
                    React.createElement("td", null, d.EventType),
                    React.createElement("td", null, moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS')),
                    React.createElement("td", null,
                        React.createElement("a", { href: homePath + 'Main/OpenSEE?eventid=' + d.ID, target: "_blank" }, "View in OpenSEE")));
            });
            _this.setState({ tableRows: rows });
        });
    };
    EventSearchHistory.prototype.render = function () {
        return (React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-header" }, "Asset History:"),
            React.createElement("div", { className: "card-body" },
                React.createElement("table", { className: "table" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", null, "Event Type"),
                            React.createElement("th", null, "Date"),
                            React.createElement("th", null))),
                    React.createElement("tbody", null, this.state.tableRows)))));
    };
    return EventSearchHistory;
}(React.Component));
exports.default = EventSearchHistory;
//# sourceMappingURL=EventSearchAssetHistory.js.map