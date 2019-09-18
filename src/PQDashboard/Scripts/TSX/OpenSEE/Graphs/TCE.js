"use strict";
//******************************************************************************************************
//  TCE.tsx - Gbtc
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
//  08/20/2019 - Christoph Lackner
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
var OpenSEE_1 = require("../../../TS/Services/OpenSEE");
var LineChartAnalyticBase_1 = require("./LineChartAnalyticBase");
var TCE = /** @class */ (function (_super) {
    __extends(TCE, _super);
    function TCE(props) {
        var _this = _super.call(this, props) || this;
        _this.openSEEService = new OpenSEE_1.default();
        return _this;
    }
    TCE.prototype.componentWillUnmount = function () {
        if (this.state.eventDataHandle !== undefined && this.state.eventDataHandle.abort !== undefined) {
            this.state.eventDataHandle.abort();
            this.setState({ eventDataHandle: undefined });
        }
        if (this.state.frequencyDataHandle !== undefined && this.state.frequencyDataHandle.abort !== undefined) {
            this.state.frequencyDataHandle.abort();
            this.setState({ frequencyDataHandle: undefined });
        }
    };
    TCE.prototype.getData = function (props, baseCtrl, ctrl) {
        var _this = this;
        var eventDataHandle = ctrl.openSEEService.getWaveformTCEData(props.eventId, props.pixels, props.startDate, props.endDate).then(function (data) {
            baseCtrl.options['grid'].markings = [];
            baseCtrl.options['rangeselection'] = undefined;
            baseCtrl.options['selection'] = { mode: 'x' };
            baseCtrl.options['grid'].markings.push(baseCtrl.highlightCycle(data));
            if (props.fftStartTime != undefined) {
                baseCtrl.options['selection'] = undefined;
                baseCtrl.options['rangeselection'] = {
                    color: "#ADD8E6",
                    start: _this.props.fftStartTime,
                    end: _this.props.fftEndTime,
                    enabled: true,
                    fixedWidth: true,
                    movex: 100,
                    noOffset: true,
                    callback: function (o) { return _this.props.stateSetter({ fftStartTime: o.start, fftEndTime: o.end }); }
                };
            }
            var legend = baseCtrl.createLegendRows(data.Data);
            var dataSet = baseCtrl.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;
            baseCtrl.createDataRows(data, legend);
            baseCtrl.setState({ dataSet: data });
        });
        this.setState({ eventDataHandle: eventDataHandle });
        var frequencyDataHandle = this.openSEEService.getFrequencyData(props.eventId, props.pixels, "TripCoilCurrent", props.startDate, props.endDate).then(function (data) {
            if (data == null)
                return;
            var legend = baseCtrl.createLegendRows(data.Data);
            var dataSet = baseCtrl.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;
            baseCtrl.createDataRows(dataSet, legend);
            baseCtrl.setState({ dataSet: dataSet });
        });
        this.setState({ frequencyDataHandle: frequencyDataHandle });
    };
    TCE.prototype.getColor = function (key, index) {
        if (key.ChartLabel.indexOf('IAN') >= 0)
            return '#FF0000';
        if (key.ChartLabel.indexOf('IBN') >= 0)
            return '#0066CC';
        if (key.ChartLabel.indexOf('ICN') >= 0)
            return '#33CC33';
        if (key.ChartLabel.indexOf('ING') >= 0)
            return '#ffd900';
        if (key.ChartLabel.indexOf('IRES') >= 0)
            return '#D3D3D3';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);
            return "#" + (ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne) + (ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo) + (ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree);
        }
    };
    TCE.prototype.render = function () {
        var _this = this;
        return React.createElement(LineChartAnalyticBase_1.default, { legendDisplay: function (key) { return true; }, legendEnable: function (key) { return key.length == 3; }, legendKey: "Trip Coil Current", openSEEServiceFunction: this.openSEEService.getWaveformTCEData, getData: function (props, ctrl) { return _this.getData(props, ctrl, _this); }, getColor: this.getColor, fftStartTime: this.props.fftStartTime, fftEndTime: this.props.fftEndTime, analytic: this.props.analytic, endDate: this.props.endDate, eventId: this.props.eventId, height: this.props.height, hover: this.props.hover, pixels: this.props.pixels, pointsTable: this.props.pointsTable, postedData: this.props.postedData, startDate: this.props.startDate, stateSetter: this.props.stateSetter, tableData: this.props.tableData, tableSetter: this.props.tableSetter, tooltipWithDeltaTable: this.props.tooltipWithDeltaTable });
    };
    return TCE;
}(React.Component));
exports.default = TCE;
//# sourceMappingURL=TCE.js.map