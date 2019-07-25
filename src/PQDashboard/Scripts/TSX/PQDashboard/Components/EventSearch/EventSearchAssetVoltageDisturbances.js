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
var EventSearchAssetVoltageDisturbances = /** @class */ (function (_super) {
    __extends(EventSearchAssetVoltageDisturbances, _super);
    function EventSearchAssetVoltageDisturbances(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.pqDashboardService = new PQDashboard_1.default();
        _this.state = {
            tableRows: []
        };
        return _this;
    }
    EventSearchAssetVoltageDisturbances.prototype.componentDidMount = function () {
        if (this.props.eventId >= 0)
            this.createTableRows(this.props.eventId);
    };
    EventSearchAssetVoltageDisturbances.prototype.componentWillUnmount = function () {
    };
    EventSearchAssetVoltageDisturbances.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.eventId >= 0)
            this.createTableRows(nextProps.eventId);
    };
    EventSearchAssetVoltageDisturbances.prototype.createTableRows = function (eventID) {
        var _this = this;
        this.pqDashboardService.getEventSearchAsssetVoltageDisturbancesData(eventID).done(function (data) {
            var rows = data.map(function (d, i) {
                return React.createElement("tr", { key: i },
                    React.createElement("td", null, d.EventType),
                    React.createElement("td", null, d.Phase),
                    React.createElement("td", null, d.PerUnitMagnitude.toFixed(3)),
                    React.createElement("td", null, d.DurationSeconds.toFixed(3)),
                    React.createElement("td", null, moment(d.StartTime).format('mm:ss.SSS')));
            });
            _this.setState({ tableRows: rows });
        });
    };
    EventSearchAssetVoltageDisturbances.prototype.render = function () {
        return (React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-header" }, "Voltage Disturbance in Waveform:"),
            React.createElement("div", { className: "card-body" },
                React.createElement("table", { className: "table" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", null, "Distrubance Type"),
                            React.createElement("th", null, "Phase"),
                            React.createElement("th", null, "Magnitude"),
                            React.createElement("th", null, "Duration"),
                            React.createElement("th", null, "Start Time"))),
                    React.createElement("tbody", null, this.state.tableRows)))));
    };
    return EventSearchAssetVoltageDisturbances;
}(React.Component));
exports.default = EventSearchAssetVoltageDisturbances;
//# sourceMappingURL=EventSearchAssetVoltageDisturbances.js.map