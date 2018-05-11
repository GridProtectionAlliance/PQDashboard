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
            faultcurves: query['faultcurves'],
            breakerdigitals: query['breakerdigitals'],
            Height: (window.innerHeight - $('#pageHeader').height() - 30) / (2 + Number(Boolean(query['faultcurves'])) + Number(Boolean(query['breakerdigitals']))),
            Width: window.innerWidth,
            Hover: 0,
            TableData: {}
        };
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
        ReactDOM.render(React.createElement(PolarChart_1.default, { data: _this.state.phasorData }), document.getElementById('phasor'));
        ReactDOM.render(React.createElement(AccumulatedPoints_1.default, { data: _this.state.phasorData }), document.getElementById('accumulatedpoints'));
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
                Height: (window.innerHeight - $('#pageHeader').height() - 30) / (2 + Number(_this.state.FaultCurves) + Number(_this.state.BreakerDigitals))
            });
        }, 500);
    };
    OpenSEE.prototype.render = function () {
        return (React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Voltage", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), showXAxis: true, height: this.state.Height, hover: this.state.Hover, tableData: this.state.TableData }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Current", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), showXAxis: true, height: this.state.Height, hover: this.state.Hover, tableData: this.state.TableData }),
            (this.state.faultcurves ? React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "F", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), showXAxis: true, height: this.state.Height, hover: this.state.Hover, tableData: this.state.TableData }) : ''),
            (this.state.breakerdigitals ? React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "B", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), showXAxis: true, height: this.state.Height, hover: this.state.Hover, tableData: this.state.TableData }) : '')));
    };
    OpenSEE.prototype.stateSetter = function (obj) {
        var _this = this;
        this.setState(obj, function () {
            var prop = _.clone(_this.state);
            delete prop.Hover;
            delete prop.Height;
            delete prop.Width;
            delete prop.TableData;
            var qs = queryString.parse(queryString.stringify(prop, { encode: false }));
            var hqs = queryString.parse(_this.history['location'].search);
            if (!_.isEqual(qs, hqs))
                _this.history['push']('OpenSEE2?' + queryString.stringify(prop, { encode: false }));
        });
    };
    return OpenSEE;
}(React.Component));
exports.OpenSEE = OpenSEE;
ReactDOM.render(React.createElement(OpenSEE, null), document.getElementById('DockCharts'));
//# sourceMappingURL=openSEE.js.map