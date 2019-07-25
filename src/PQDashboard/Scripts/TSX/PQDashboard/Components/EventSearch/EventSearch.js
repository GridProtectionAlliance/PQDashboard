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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var moment = require("moment");
var lodash_1 = require("lodash");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var queryString = require("query-string");
var EventSearchList_1 = require("./EventSearchList");
var EventSearchNavbar_1 = require("./EventSearchNavbar");
var EventSearchPreviewPane_1 = require("./EventSearchPreviewPane");
var EventSearchListedEventsNoteWindow_1 = require("./EventSearchListedEventsNoteWindow");
var momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
var momentDateFormat = "MM/DD/YYYY";
var momentTimeFormat = "HH:mm:ss.SSS";
var EventSearch = /** @class */ (function (_super) {
    __extends(EventSearch, _super);
    function EventSearch(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.state = {
            searchBarProps: {
                dfr: (query['dfr'] != undefined ? query['dfr'] == 'true' : true),
                pqMeter: (query['pqMeter'] != undefined ? query['pqMeter'] == 'true' : true),
                g500: (query['g500'] != undefined ? query['g500'] == 'true' : true),
                one62to500: (query['one62to500'] != undefined ? query['one62to500'] == 'true' : true),
                seventyTo161: (query['seventyTo161'] != undefined ? query['seventyTo161'] == 'true' : true),
                l70: (query['l70'] != undefined ? query['l70'] == 'true' : true),
                faults: (query['faults'] != undefined ? query['faults'] == 'true' : true),
                sags: (query['sags'] != undefined ? query['sags'] == 'true' : true),
                swells: (query['swells'] != undefined ? query['swells'] == 'true' : true),
                interruptions: (query['interruptions'] != undefined ? query['interruptions'] == 'true' : true),
                breakerOps: (query['breakerOps'] != undefined ? query['breakerOps'] == 'true' : true),
                transients: (query['transients'] != undefined ? query['transients'] == 'true' : true),
                others: (query['others'] != undefined ? query['others'] == 'true' : true),
                date: (query['date'] != undefined ? query['date'] : moment().format(momentDateFormat)),
                time: (query['time'] != undefined ? query['time'] : moment().format(momentTimeFormat)),
                windowSize: (query['windowSize'] != undefined ? query['windowSize'] : 10),
                timeWindowUnits: (query['timeWindowUnits'] != undefined ? query['timeWindowUnits'] : 2),
                stateSetter: _this.stateSetter.bind(_this),
            },
            eventid: (query['eventid'] != undefined ? query['eventid'] : -1),
            searchText: (query['searchText'] != undefined ? query['searchText'] : ''),
            searchList: []
        };
        return _this;
    }
    EventSearch.prototype.componentDidMount = function () {
    };
    EventSearch.prototype.componentWillUnmount = function () {
    };
    EventSearch.prototype.componentWillReceiveProps = function (nextProps) {
    };
    EventSearch.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { width: '100%', height: '100%' } },
            React.createElement(EventSearchNavbar_1.default, __assign({}, this.state.searchBarProps)),
            React.createElement("div", { style: { width: '100%', height: 'calc( 100% - 210px)' } },
                React.createElement("div", { style: { width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'hidden' } },
                    React.createElement("div", { style: { width: 'calc(100% - 120px)', padding: 10, float: 'left' } },
                        React.createElement("input", { className: 'form-control', type: 'text', placeholder: 'Search...', value: this.state.searchText, onChange: function (evt) { return _this.setState({ searchText: evt.target.value }); } })),
                    React.createElement("div", { style: { width: 120, float: 'right', padding: 10 } },
                        React.createElement(EventSearchListedEventsNoteWindow_1.default, { searchList: this.state.searchList })),
                    React.createElement(EventSearchList_1.default, { eventid: this.state.eventid, searchText: this.state.searchText, searchBarProps: this.state.searchBarProps, stateSetter: this.state.searchBarProps.stateSetter })),
                React.createElement("div", { style: { width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' } },
                    React.createElement(EventSearchPreviewPane_1.default, { eventid: this.state.eventid })))));
    };
    EventSearch.prototype.stateSetter = function (obj) {
        var _this = this;
        function toQueryString(state) {
            var dataTypes = ["boolean", "number", "string"];
            var stateObject = lodash_1.clone(state.searchBarProps);
            stateObject.eventid = state.eventid;
            stateObject.searchText = state.searchText;
            delete stateObject.searchList;
            $.each(Object.keys(stateObject), function (index, key) {
                if (dataTypes.indexOf(typeof (stateObject[key])) < 0)
                    delete stateObject[key];
            });
            return queryString.stringify(stateObject, { encode: false });
        }
        var oldQueryString = toQueryString(this.state);
        this.setState(obj, function () {
            var newQueryString = toQueryString(_this.state);
            if (!lodash_1.isEqual(oldQueryString, newQueryString)) {
                clearTimeout(_this.historyHandle);
                _this.historyHandle = setTimeout(function () { return _this.history['push'](_this.history['location'].pathname + '?' + newQueryString); }, 500);
            }
        });
    };
    return EventSearch;
}(React.Component));
exports.default = EventSearch;
//# sourceMappingURL=EventSearch.js.map