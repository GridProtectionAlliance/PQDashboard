"use strict";
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
//******************************************************************************************************
//  EventSearchPreviewPane.tsx - Gbtc
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
var React = require("react");
var moment = require("moment");
var OpenSEE_1 = require("./../../../../TS/Services/OpenSEE");
var EventSearchNoteWindow_1 = require("./EventSearchNoteWindow");
var EventSearchAssetVoltageDisturbances_1 = require("./EventSearchAssetVoltageDisturbances");
var EventSearchAssetFaultSegments_1 = require("./EventSearchAssetFaultSegments");
var EventSearchAssetHistory_1 = require("./EventSearchAssetHistory");
var EventSearchCorrelatedSags_1 = require("./EventSearchCorrelatedSags");
var EventPreviewPane = /** @class */ (function (_super) {
    __extends(EventPreviewPane, _super);
    function EventPreviewPane(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.openSEEService = new OpenSEE_1.default();
        _this.optionsV = {
            canvas: true,
            legend: { show: false },
            xaxis: { show: false },
            yaxis: { show: false }
        };
        _this.optionsI = {
            canvas: true,
            legend: { show: false },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true,
                markings: [],
            },
            xaxis: {
                mode: "time",
                tickLength: 10,
                reserveSpace: false,
                ticks: function (axis) {
                    var ticks = [], delta = (axis.max - axis.min) / 11, start = _this.floorInBase(axis.min, axis.delta), i = 0, v = Number.NaN, prev;
                    //do {
                    //    prev = v;
                    //    v = start + i * axis.delta;
                    //    ticks.push(v);
                    //    ++i;
                    //} while (v < axis.max && v != prev);
                    for (var i = 1; i < 11; ++i) {
                        ticks.push(axis.min + i * delta);
                    }
                    return ticks;
                },
                tickFormatter: function (value, axis) {
                    if (axis.delta < 1) {
                        var trunc = value - _this.floorInBase(value, 1000);
                        return _this.defaultTickFormatter(trunc, axis) + " ms";
                    }
                    if (axis.delta < 1000) {
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: { show: false }
        };
        return _this;
    }
    EventPreviewPane.prototype.defaultTickFormatter = function (value, axis) {
        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;
        // If tickDecimals was specified, ensure that we have exactly that
        // much precision; otherwise default to the value's own precision.
        if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
            if (precision < axis.tickDecimals) {
                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
        }
        return formatted;
    };
    ;
    // round to nearby lower multiple of base
    EventPreviewPane.prototype.floorInBase = function (n, base) {
        return base * Math.floor(n / base);
    };
    EventPreviewPane.prototype.componentDidMount = function () {
        if (this.props.eventid >= 0)
            this.getData(this.props);
    };
    EventPreviewPane.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.eventid >= 0)
            this.getData(nextProps);
    };
    EventPreviewPane.prototype.getColor = function (label) {
        if (label.indexOf('VA') >= 0)
            return '#A30000';
        if (label.indexOf('VB') >= 0)
            return '#0029A3';
        if (label.indexOf('VC') >= 0)
            return '#007A29';
        if (label.indexOf('VN') >= 0)
            return '#c3c3c3';
        if (label.indexOf('IA') >= 0)
            return '#FF0000';
        if (label.indexOf('IB') >= 0)
            return '#0066CC';
        if (label.indexOf('IC') >= 0)
            return '#33CC33';
        if (label.indexOf('IR') >= 0)
            return '#c3c3c3';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);
            return "#" + (ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne) + (ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo) + (ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree);
        }
    };
    EventPreviewPane.prototype.getData = function (props) {
        var _this = this;
        $(this.refs.voltWindow).children().remove();
        $(this.refs.curWindow).children().remove();
        var pixels = (window.innerWidth - 300 - 40) / 2;
        this.openSEEService.getWaveformVoltageData(props.eventid, pixels).then(function (data) {
            if (data == null) {
                return;
            }
            var newVessel = [];
            $.each(data.Data, function (index, value) {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: _this.getColor(value.ChartLabel) });
            });
            $.plot($(_this.refs.voltWindow), newVessel, _this.optionsV);
        });
        this.openSEEService.getWaveformCurrentData(props.eventid, pixels).then(function (data) {
            if (data == null) {
                return;
            }
            var newVessel = [];
            $.each(data.Data, function (index, value) {
                newVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: _this.getColor(value.ChartLabel) });
            });
            $.plot($(_this.refs.curWindow), newVessel, _this.optionsI);
        });
    };
    EventPreviewPane.prototype.render = function () {
        if (this.props.eventid == -1)
            return React.createElement("div", null);
        return (React.createElement("div", null,
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-header" },
                    React.createElement("a", { href: homePath + 'Main/OpenSEE?eventid=' + this.props.eventid, target: "_blank" }, "View in OpenSEE")),
                React.createElement("div", { className: "card-body" },
                    React.createElement("div", { ref: "voltWindow", style: { height: 200, width: 'calc(100%)' /*, margin: '0x', padding: '0px'*/ } }),
                    React.createElement("div", { ref: "curWindow", style: { height: 200, width: 'calc(100%)' /*, margin: '0x', padding: '0px'*/ } }))),
            React.createElement(EventSearchAssetFaultSegments_1.default, { eventId: this.props.eventid }),
            React.createElement(EventSearchAssetVoltageDisturbances_1.default, { eventId: this.props.eventid }),
            React.createElement(EventSearchCorrelatedSags_1.default, { eventId: this.props.eventid }),
            React.createElement(EventSearchAssetHistory_1.default, { eventId: this.props.eventid }),
            React.createElement(EventSearchNoteWindow_1.default, { eventId: this.props.eventid })));
    };
    return EventPreviewPane;
}(React.Component));
exports.default = EventPreviewPane;
//# sourceMappingURL=EventSearchPreviewPane.js.map