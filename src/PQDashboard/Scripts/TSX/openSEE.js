"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var OpenSEE_1 = require("./../TS/Services/OpenSEE");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var queryString = require("query-string");
var _ = require("lodash");
var WaveformViewerGraph_1 = require("./WaveformViewerGraph");
var PolarChart_1 = require("./PolarChart");
var AccumulatedPoints_1 = require("./AccumulatedPoints");
var Tooltip_1 = require("./Tooltip");
var OpenSEE = (function (_super) {
    __extends(OpenSEE, _super);
    function OpenSEE(props) {
        var _this = _super.call(this, props) || this;
        _this.openSEEService = new OpenSEE_1.default();
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.resizeId;
        _this.state = {
            eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate'],
            displayVolt: true,
            displayCur: true,
            faultcurves: Boolean(query['faultcurves']),
            breakerdigitals: Boolean(query['breakerdigitals']),
            Width: window.innerWidth,
            Hover: 0,
            PointsTable: [],
            TableData: {}
        };
        _this.TableData = {};
        _this.history['listen'](function (location, action) {
            var query = queryString.parse(_this.history['location'].search);
            _this.setState({
                eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate'],
                faultcurves: query['faultcurves'],
                breakerdigitals: query['breakerdigitals'],
            });
        });
        ReactDOM.render(React.createElement("button", { className: "smallbutton", onClick: function () { return _this.resetZoom(); } }, "Reset Zoom"), document.getElementById('resetBtn'));
        return _this;
    }
    OpenSEE.prototype.componentDidMount = function () {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
    };
    OpenSEE.prototype.componentWillUnmount = function () {
        $(window).off('resize');
    };
    OpenSEE.prototype.handleScreenSizeChange = function () {
        var _this = this;
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(function () {
            _this.setState({
                Width: window.innerWidth,
                Height: _this.calculateHeights(_this.state)
            });
        }, 500);
    };
    OpenSEE.prototype.render = function () {
        var height = this.calculateHeights(this.state);
        return (React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
            React.createElement(PolarChart_1.default, { data: this.state.TableData, callback: this.stateSetter.bind(this) }),
            React.createElement(AccumulatedPoints_1.default, { pointsTable: this.state.PointsTable, callback: this.stateSetter.bind(this) }),
            React.createElement(Tooltip_1.default, { data: this.state.TableData, hover: this.state.Hover }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Voltage", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.displayVolt }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Current", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.displayCur }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "F", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.faultcurves }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "B", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.breakerdigitals })));
    };
    OpenSEE.prototype.stateSetter = function (obj) {
        var _this = this;
        this.setState(obj, function () {
            var prop = _.clone(_this.state);
            delete prop.Hover;
            delete prop.Width;
            delete prop.TableData;
            delete prop.PointsTable;
            delete prop.displayCur;
            delete prop.displayVolt;
            var qs = queryString.parse(queryString.stringify(prop, { encode: false }));
            var hqs = queryString.parse(_this.history['location'].search);
            if (!_.isEqual(qs, hqs))
                _this.history['push']('OpenSEE?' + queryString.stringify(prop, { encode: false }));
        });
    };
    OpenSEE.prototype.tableUpdater = function (obj) {
        this.TableData = _.merge(this.TableData, obj);
        this.setState({ TableData: this.TableData });
    };
    OpenSEE.prototype.resetZoom = function () {
        this.history['push']('OpenSEE?eventid=' + this.state.eventid + (this.state.faultcurves ? '&faultcurves=1' : '') + (this.state.breakerdigitals ? '&breakerdigitals=1' : ''));
    };
    OpenSEE.prototype.calculateHeights = function (obj) {
        return (window.innerHeight - $('#pageHeader').height() - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.faultcurves) + Number(obj.breakerdigitals));
    };
    return OpenSEE;
}(React.Component));
exports.OpenSEE = OpenSEE;
ReactDOM.render(React.createElement(OpenSEE, null), document.getElementById('DockCharts'));
//# sourceMappingURL=openSEE.js.map