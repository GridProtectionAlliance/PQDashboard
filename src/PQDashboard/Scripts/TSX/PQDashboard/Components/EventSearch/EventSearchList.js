"use strict";
//******************************************************************************************************
//  EventSearchList.tsx - Gbtc
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
var ReactDOM = require("react-dom");
var Table_1 = require("./../Table");
var PQDashboard_1 = require("./../../../../TS/Services/PQDashboard");
var lodash_1 = require("lodash");
var moment = require("moment");
var EventSearchList = /** @class */ (function (_super) {
    __extends(EventSearchList, _super);
    function EventSearchList(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.pqDashboardService = new PQDashboard_1.default();
        _this.state = {
            sortField: "FileStartTime",
            ascending: false,
            data: []
        };
        _this.handleKeyPress = _this.handleKeyPress.bind(_this);
        return _this;
    }
    EventSearchList.prototype.componentDidMount = function () {
        this.getData(this.props);
        document.addEventListener("keydown", this.handleKeyPress, false);
    };
    EventSearchList.prototype.componentWillUnmount = function () {
        document.removeEventListener("keydown", this.handleKeyPress, false);
    };
    EventSearchList.prototype.componentWillReceiveProps = function (nextProps) {
        var props = lodash_1.clone(this.props.searchBarProps);
        var nextPropsClone = lodash_1.clone(nextProps.searchBarProps);
        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        if (this.props.searchText != nextProps.searchText || !lodash_1.isEqual(props, nextPropsClone))
            this.getData(nextProps);
    };
    EventSearchList.prototype.handleKeyPress = function (event) {
        if (this.state.data.length == 0)
            return;
        var index = this.state.data.map(function (a) { return a.EventID.toString(); }).indexOf(this.props.eventid.toString());
        if (event.keyCode == 40) // arrow down key
         {
            event.preventDefault();
            if (this.props.eventid == -1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else if (index == this.state.data.length - 1)
                this.props.stateSetter({ eventid: this.state.data[0].EventID });
            else
                this.props.stateSetter({ eventid: this.state.data[index + 1].EventID });
        }
        else if (event.keyCode == 38) // arrow up key
         {
            event.preventDefault();
            if (this.props.eventid == -1)
                this.props.stateSetter({ eventid: this.state.data[this.state.data.length - 1].EventID });
            else if (index == 0)
                this.props.stateSetter({ eventid: this.state.data[this.state.data.length - 1].EventID });
            else
                this.props.stateSetter({ eventid: this.state.data[index - 1].EventID });
        }
        this.setScrollBar();
    };
    EventSearchList.prototype.setScrollBar = function () {
        //var rowHeight = $(ReactDOM.findDOMNode(this)).find('tbody').children()[0].clientHeight;
        //var index = this.state.data.map(a => a.EventID.toString()).indexOf(this.props.eventid.toString());
        ////var rowHeight = tableHeight / this.state.data.length;
        //if (index == 0)
        //    $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(0);
        //else
        //    $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(index * rowHeight - 20);
        var rowHeight = $(ReactDOM.findDOMNode(this)).find('tbody').children()[0].clientHeight;
        var index = this.state.data.map(function (a) { return a.EventID.toString(); }).indexOf(this.props.eventid.toString());
        var tableHeight = this.state.data.length * rowHeight;
        var windowHeight = window.innerHeight - 314;
        var tableSectionCount = Math.ceil(tableHeight / windowHeight);
        var tableSectionHeight = Math.ceil(tableHeight / tableSectionCount);
        var rowsPerSection = tableSectionHeight / rowHeight;
        var sectionIndex = Math.floor(index / rowsPerSection);
        var scrollTop = $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop();
        if (scrollTop <= sectionIndex * tableSectionHeight || scrollTop >= (sectionIndex + 1) * tableSectionHeight - tableSectionHeight / 2)
            $(ReactDOM.findDOMNode(this)).find('tbody').scrollTop(sectionIndex * tableSectionHeight);
    };
    EventSearchList.prototype.getData = function (props) {
        var _this = this;
        this.pqDashboardService.getEventSearchData(props.searchBarProps).done(function (results) {
            var filtered = lodash_1.filter(results, function (obj) {
                return obj.AssetName.toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.AssetType.toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.EventType.toLowerCase().indexOf(props.searchText) >= 0 ||
                    moment(obj.FileStartTime).format('MM/DD/YYYY').toLowerCase().indexOf(props.searchText) >= 0 ||
                    moment(obj.FileStartTime).format('HH:mm:ss.SSSSSSS').toLowerCase().indexOf(props.searchText) >= 0 ||
                    obj.VoltageClass.toString().toLowerCase().indexOf(props.searchText) >= 0;
            });
            var ordered = lodash_1.orderBy(filtered, ["FileStartTime"], ["desc"]);
            _this.setState({ data: ordered });
            _this.props.stateSetter({ searchList: ordered });
            if (results.length !== 0)
                _this.setScrollBar();
        });
    };
    EventSearchList.prototype.render = function () {
        var _this = this;
        return (React.createElement(Table_1.default, { cols: [
                { key: 'FileStartTime', label: 'Time', headerStyle: { width: 'calc(20%)' }, rowStyle: { width: 'calc(20%)' }, content: function (item, key, style) { return React.createElement("span", null,
                        moment(item.FileStartTime).format('MM/DD/YYYY'),
                        React.createElement("br", null),
                        moment(item.FileStartTime).format('HH:mm:ss.SSSSSSS')); } },
                { key: 'AssetName', label: 'Asset', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                { key: 'AssetType', label: 'Asset Tp', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                { key: 'VoltageClass', label: 'kV', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                { key: 'EventType', label: 'Evt Cl', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                { key: 'BreakerOperation', label: 'Brkr Op', headerStyle: { width: '15%' }, rowStyle: { width: '15%' }, content: function (item, key, style) { return React.createElement("span", null,
                        React.createElement("i", { className: (item.BreakerOperation > 0 ? "fa fa-check" : '') })); } },
            ], tableClass: "table table-hover", data: this.state.data, sortField: this.state.sortField, ascending: this.state.ascending, onSort: function (d) {
                if (d.col == _this.state.sortField) {
                    var ordered = lodash_1.orderBy(_this.state.data, [d.col], [(!_this.state.ascending ? "asc" : "desc")]);
                    _this.setState({ ascending: !_this.state.ascending, data: ordered });
                }
                else {
                    var ordered = lodash_1.orderBy(_this.state.data, [d.col], ["asc"]);
                    _this.setState({ ascending: true, data: ordered, sortField: d.col });
                }
            }, onClick: function (item) { return _this.props.stateSetter({ eventid: item.row.EventID }); }, theadStyle: { fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }, tbodyStyle: { display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 314 }, rowStyle: { display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }, selected: function (item) {
                if (item.EventID == _this.props.eventid)
                    return true;
                else
                    return false;
            } }));
    };
    return EventSearchList;
}(React.Component));
exports.default = EventSearchList;
//# sourceMappingURL=EventSearchList.js.map