"use strict";
//******************************************************************************************************
//  PQDashboard.tsx - Gbtc
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
/// <reference path="PQDashboard.d.ts" />
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
var react_router_dom_1 = require("react-router-dom");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var queryString = require("query-string");
var About_1 = require("./Components/About");
var MeterActivity_1 = require("./Components/MeterActivity");
var EventSearch_1 = require("./Components/EventSearch/EventSearch");
var BreakerReport_1 = require("./Components/BreakerReport/BreakerReport");
var PQDashboard = /** @class */ (function (_super) {
    __extends(PQDashboard, _super);
    function PQDashboard(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.state = {};
        return _this;
    }
    PQDashboard.prototype.render = function () {
        return (React.createElement(react_router_dom_1.BrowserRouter, null,
            React.createElement("div", { style: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' } },
                React.createElement("div", { style: { width: 300, height: 'inherit', backgroundColor: '#eeeeee', position: 'relative', float: 'left' } },
                    React.createElement("a", { href: "https://www.gridprotectionalliance.org" },
                        React.createElement("img", { style: { width: 280, margin: 10 }, src: homePath + "Images/SE Dashboard with GPA 200 high.png" })),
                    React.createElement("div", { style: { width: '100%', height: '100%', marginTop: 30 } },
                        React.createElement("div", { className: "nav flex-column nav-pills", id: "v-pills-tab", role: "tablist", "aria-orientation": "vertical", style: { height: 'calc(100% - 240px)' } },
                            React.createElement(react_router_dom_1.NavLink, { activeClassName: 'nav-link active', className: "nav-link", exact: true, to: controllerViewPath + "/" }, "Home"),
                            React.createElement(react_router_dom_1.NavLink, { activeClassName: 'nav-link active', className: "nav-link", to: controllerViewPath + "/eventsearch" }, "Event Search"),
                            React.createElement(react_router_dom_1.NavLink, { activeClassName: 'nav-link active', className: "nav-link", to: controllerViewPath + "/meteractivity" }, "Meter Activity"),
                            React.createElement(react_router_dom_1.NavLink, { activeClassName: 'nav-link active', className: "nav-link", to: controllerViewPath + "/breakerreport" }, "Breaker Report")),
                        React.createElement("div", { style: { width: '100%', textAlign: 'center' } },
                            React.createElement("span", null, "Version 1.0"),
                            React.createElement("br", null),
                            React.createElement("span", null,
                                React.createElement(About_1.default, null))))),
                React.createElement("div", { style: { width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right' } },
                    React.createElement(react_router_dom_1.Route, { path: controllerViewPath + "/eventsearch", component: EventSearch_1.default }),
                    React.createElement(react_router_dom_1.Route, { path: controllerViewPath + "/meteractivity", component: MeterActivity_1.default }),
                    React.createElement(react_router_dom_1.Route, { path: controllerViewPath + "/breakerreport", component: BreakerReport_1.default })))));
    };
    return PQDashboard;
}(React.Component));
ReactDOM.render(React.createElement(PQDashboard, null), document.getElementById('pageBody'));
//# sourceMappingURL=PQDashboard.js.map