"use strict";
//******************************************************************************************************
//  MeterActivity.tsx - Gbtc
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
//  04/08/2019 - Billy Ernest
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
var Table_1 = require("./Table");
var PQDashboard_1 = require("./../../../TS/Services/PQDashboard");
var moment = require("moment");
var updateInterval = 300000;
var rowsPerPage = 7;
//const autoUpdate = setInterval(
//    function () {
//        //buildMeterActivityTables();
//    }, updateInterval);
var momentFormat = "YYYY/MM/DD HH:mm:ss";
var dateTimeFormat = "yyyy/MM/dd HH:mm:ss";
var MeterActivity = function (props) {
    return (React.createElement("div", { id: "meterActivityContainer", style: { width: '100%', height: '100%', textAlign: 'center', backgroundColor: '#064e1b', padding: 20 } },
        React.createElement("div", { style: { width: 'calc(50% - 10px)', height: 'calc(100% - 57px)', position: 'relative', float: 'left' } },
            React.createElement("div", { style: { backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 15px)', padding: 15 }, className: "well well-sm" },
                React.createElement(MostActiveMeters, null)),
            React.createElement("div", { style: { marginTop: 20, backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 10px)', padding: 15 }, className: "well well-sm" },
                React.createElement(LeastActiveMeters, null))),
        React.createElement("div", { style: { backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(100% - 57px)', width: 'calc(50% - 11px)', position: 'relative', float: 'right', padding: 15 }, className: "well well-sm" },
            React.createElement(FilesProcessed, null))));
};
exports.default = MeterActivity;
var MostActiveMeters = /** @class */ (function (_super) {
    __extends(MostActiveMeters, _super);
    function MostActiveMeters(props) {
        var _this = _super.call(this, props) || this;
        _this.pQDashboardService = new PQDashboard_1.default();
        _this.state = {
            meterTable: [],
            sortField: '24Hours',
            rowsPerPage: 7
        };
        return _this;
    }
    MostActiveMeters.prototype.componentDidMount = function () {
        var _this = this;
        $(window).on('resize', function () { return _this.resize(); });
        this.resize();
    };
    MostActiveMeters.prototype.componentWillUnmount = function () {
        $(window).off('resize');
    };
    MostActiveMeters.prototype.createTableRows = function () {
        var _this = this;
        this.pQDashboardService.getMostActiveMeterActivityData(this.state.rowsPerPage, this.state.sortField).done(function (data) {
            _this.setState({ meterTable: data });
        });
    };
    MostActiveMeters.prototype.resize = function () {
        var _this = this;
        var headerHeight = $(this.refs.divElement).find('th').innerHeight();
        if (headerHeight == headerHeight)
            rowHeight = 43;
        var height = $(this.refs.divElement).height() - headerHeight;
        var rowHeight = $(this.refs.divElement).find('td').innerHeight();
        if (rowHeight == undefined)
            rowHeight = 48;
        this.setState({ rowsPerPage: Math.floor(height / rowHeight) }, function () { return _this.createTableRows(); });
    };
    MostActiveMeters.prototype.createContent = function (item, key) {
        var _this = this;
        var context = '';
        if (key == '24Hours') {
            context = '24h';
        }
        else if (key == '7Days') {
            context = '7d';
        }
        else if (key == '30Days') {
            context = '30d';
        }
        else {
            context = '24h';
        }
        if (item[key] != '0 ( 0 )') {
            return React.createElement("a", { onClick: function () { return _this.openWindowToMeterEventsByLine(item.FirstEventID, context, moment().format(momentFormat)); }, style: { color: 'blue' } }, item[key]);
        }
        else {
            return React.createElement("span", null, item[key]);
        }
    };
    MostActiveMeters.prototype.openWindowToMeterEventsByLine = function (id, context, sourcedate) {
        window.open(homePath + "Main/MeterEventsByLine?eventid=" + id + "&context=" + context + "&posteddate=" + sourcedate, id + "MeterEventsByLine");
        return false;
    };
    MostActiveMeters.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { height: '100%' } },
            React.createElement("h3", { style: { display: 'inline' } }, "Most Active Meters"),
            React.createElement("span", { style: { float: 'right', color: 'silver' } }),
            React.createElement("div", { style: { height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' } }),
            React.createElement("div", { style: { backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)' }, ref: 'divElement' },
                React.createElement(Table_1.default, { cols: [
                        { key: 'AssetKey', label: 'Asset Key', headerStyle: { width: 'calc(40%)' } },
                        { key: '24Hours', label: 'Files(Evts) 24H', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                        { key: '7Days', label: 'Files(Evts) 7D', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                        { key: '30Days', label: 'Files(Evts) 30D', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                    ], tableClass: "table", data: this.state.meterTable, sortField: this.state.sortField, ascending: true, onSort: function (data) { _this.setState({ sortField: data.col }, function () { return _this.createTableRows(); }); }, onClick: function () { }, theadStyle: { fontSize: 'smaller' } }))));
    };
    return MostActiveMeters;
}(React.Component));
var LeastActiveMeters = /** @class */ (function (_super) {
    __extends(LeastActiveMeters, _super);
    function LeastActiveMeters(props) {
        var _this = _super.call(this, props) || this;
        _this.pQDashboardService = new PQDashboard_1.default();
        _this.state = {
            meterTable: [],
            sortField: '30Days',
            rowsPerPage: 7
        };
        return _this;
    }
    LeastActiveMeters.prototype.componentDidMount = function () {
        var _this = this;
        $(window).on('resize', function () { return _this.resize(); });
        this.resize();
    };
    LeastActiveMeters.prototype.componentWillUnmount = function () {
        $(window).off('resize');
    };
    LeastActiveMeters.prototype.resize = function () {
        var _this = this;
        var headerHeight = $(this.refs.divElement).find('th').innerHeight();
        if (headerHeight == headerHeight)
            rowHeight = 43;
        var height = $(this.refs.divElement).height() - headerHeight;
        var rowHeight = $(this.refs.divElement).find('td').innerHeight();
        if (rowHeight == undefined)
            rowHeight = 48;
        this.setState({ rowsPerPage: Math.floor(height / rowHeight) }, function () { return _this.createTableRows(); });
    };
    LeastActiveMeters.prototype.createTableRows = function () {
        var _this = this;
        this.pQDashboardService.getLeastActiveMeterActivityData(this.state.rowsPerPage, this.state.sortField).done(function (data) {
            _this.setState({ meterTable: data });
        });
    };
    LeastActiveMeters.prototype.createContent = function (item, key) {
        var _this = this;
        var context = '';
        if (key == '180Days') {
            context = '180d';
        }
        else if (key == '90Days') {
            context = '90d';
        }
        else {
            context = '30d';
        }
        if (item[key] != '0 ( 0 )') {
            return React.createElement("a", { onClick: function () { return _this.openWindowToMeterEventsByLine(item.FirstEventID, context, moment().format(momentFormat)); }, style: { color: 'blue' } }, item[key]);
        }
        else {
            return React.createElement("span", null, item[key]);
        }
    };
    LeastActiveMeters.prototype.openWindowToMeterEventsByLine = function (id, context, sourcedate) {
        window.open(homePath + "Main/MeterEventsByLine?eventid=" + id + "&context=" + context + "&posteddate=" + sourcedate, id + "MeterEventsByLine");
        return false;
    };
    LeastActiveMeters.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { height: '100%' } },
            React.createElement("h3", { style: { display: 'inline' } }, "Least Active Meters"),
            React.createElement("span", { style: { float: 'right', color: 'silver' } }),
            React.createElement("div", { style: { height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' } }),
            React.createElement("div", { style: { backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)' }, ref: 'divElement' },
                React.createElement(Table_1.default, { cols: [
                        { key: 'AssetKey', label: 'Asset Key', headerStyle: { width: 'calc(40%)' } },
                        { key: '30Days', label: 'Files(Events) 30D', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                        { key: '90Days', label: 'Files(Events) 90D', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                        { key: '180Days', label: 'Files(Events) 180D', headerStyle: { width: '20%' }, content: function (item, key, style) { return _this.createContent(item, key); } },
                    ], tableClass: "table", data: this.state.meterTable, sortField: this.state.sortField, ascending: true, onSort: function (data) { _this.setState({ sortField: data.col }, function () { return _this.createTableRows(); }); }, onClick: function () { }, theadStyle: { fontSize: 'smaller' } }))));
    };
    return LeastActiveMeters;
}(React.Component));
var FilesProcessed = /** @class */ (function (_super) {
    __extends(FilesProcessed, _super);
    function FilesProcessed(props) {
        var _this = _super.call(this, props) || this;
        _this.pQDashboardService = new PQDashboard_1.default();
        _this.state = {
            meterTable: [],
            sortField: 'CreationTime',
        };
        return _this;
    }
    FilesProcessed.prototype.componentDidMount = function () {
        this.createTableRows();
    };
    FilesProcessed.prototype.createTableRows = function () {
        var _this = this;
        this.pQDashboardService.getFilesProcessedMeterActivityData(this.state.sortField).done(function (data) {
            _this.setState({
                meterTable: data.map(function (x, i) { return React.createElement(ListItem, { key: x.FilePath, CreationTime: x.CreationTime, FilePath: x.FilePath, FileGroupID: x.FileGroupID }); })
            });
        });
    };
    FilesProcessed.prototype.render = function () {
        return (React.createElement("div", { style: { height: '100%', maxHeight: 'calc(100%)', overflowY: 'auto', overflowX: 'hidden' } },
            React.createElement("h3", { style: { display: 'inline' } }, "FILES PROCESSED LAST 24 HOURS"),
            React.createElement("span", { style: { float: 'right', color: 'silver' }, id: "files-hint" }, "Expand row to view events"),
            React.createElement("div", { style: { height: 2, width: '100%', display: 'inline-block', backgroundColor: 'black' } }),
            React.createElement("div", { id: "meter-activity-files", style: { backgroundColor: 'white', borderColor: 'black' } }),
            React.createElement("ul", { style: { listStyleType: 'none', padding: 0 } },
                React.createElement("li", { key: 'header', style: { width: '100%', borderTop: '1px solid #dee2e6' } },
                    React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 50, fontSize: 'smaller' } }),
                    React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(30% - 50px)', fontSize: 'smaller' } }, "Time Processed"),
                    React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(70%)', fontSize: 'smaller' } }, "File")),
                this.state.meterTable)));
    };
    return FilesProcessed;
}(React.Component));
var ListItem = function (props) {
    var _a = React.useState(false), isOpen = _a[0], setOpen = _a[1];
    var _b = React.useState([]), eventTable = _b[0], setEventTable = _b[1];
    var pqDashboardService = new PQDashboard_1.default();
    React.useEffect(function () {
        pqDashboardService.getFileGroupEvents(props.FileGroupID).done(function (data) {
            var arr = data.map(function (x) { return React.createElement("tr", { key: x.ID },
                React.createElement("td", null,
                    React.createElement("a", { style: { color: 'blue' }, href: homePath + 'Main/OpenSEE?eventid=' + x.ID, target: "_blank" }, x.LineName)),
                React.createElement("td", null, moment.utc(x.StartTime).format('MM/DD/YY HH:mm:ss')),
                React.createElement("td", null, x.EventTypeName)); });
            setEventTable(arr);
        });
    }, []);
    function buildFileGroupContent(row) {
        var filepathParts = row.FilePath.split('\\');
        var fullFilename = filepathParts[filepathParts.length - 1];
        var filenameParts = fullFilename.split('.');
        var filenameWithoutExtension = filenameParts.splice(0, filenameParts.length - 1).join('.');
        var filenameParts = filenameWithoutExtension.split(',');
        var shortFilename = "";
        // This is to eliminate the timestamp in the fullFilename for the shortFilename
        var inTimestamp = true;
        for (var i = 0; i < filenameParts.length; i++) {
            if (inTimestamp) {
                if (!(/^-?\d/.test(filenameParts[i]))) {
                    inTimestamp = false;
                    shortFilename += filenameParts[i];
                }
            }
            else {
                shortFilename += ',' + filenameParts[i];
            }
        }
        if (shortFilename == "") {
            shortFilename = filenameWithoutExtension;
        }
        var html = React.createElement("a", { href: xdaInstance + '/Workbench/DataFiles.cshtml', title: fullFilename, style: { color: 'blue' }, target: "_blank" }, shortFilename);
        return html;
    }
    return (React.createElement("li", { style: { width: '100%', borderTop: '1px solid #dee2e6' } },
        React.createElement("div", { className: "row" },
            React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', textAlign: 'inherit', padding: '.75em', width: 50 } },
                React.createElement("button", { className: "btn", onClick: function () { return setOpen(!isOpen); } },
                    React.createElement("span", { className: 'fa fa-arrow-circle-' + (isOpen ? 'down' : 'right') }))),
            React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(30% - 50px)', fontSize: 'smaller' } },
                React.createElement("span", null,
                    moment(props.CreationTime).format('MM/DD/YYYY'),
                    React.createElement("br", null),
                    moment(props.CreationTime).format('HH:mm:ss.SSSSSSS'))),
            React.createElement("div", { style: { display: 'table-cell', verticalAlign: 'inherit', textAlign: 'inherit', padding: '.75em', width: 'calc(70%)' } }, buildFileGroupContent(props))),
        React.createElement("div", { className: "row", style: { display: (isOpen ? 'block' : 'none'), padding: '5px 20px' } },
            React.createElement("table", { className: 'table' },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Line"),
                        React.createElement("th", null, "Start Time"),
                        React.createElement("th", null, "Type"))),
                React.createElement("tbody", null, eventTable)))));
};
//# sourceMappingURL=MeterActivity.js.map