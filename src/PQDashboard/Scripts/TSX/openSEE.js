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
var WaveformViewerGraph_1 = require("./WaveformViewerGraph");
var OpenSEE = (function (_super) {
    __extends(OpenSEE, _super);
    function OpenSEE(props) {
        var _this = _super.call(this, props) || this;
        _this.openSEEService = new OpenSEE_1.default();
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.resizeId;
        _this.state = {
            EventId: (query['eventid'] != undefined ? query['eventid'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate'],
            FaultCurves: Boolean(query['faultcurves']),
            BreakerDigitals: Boolean(query['breakerdigitals']),
            Height: (window.innerHeight - 90) / (2 + Number(Boolean(query['faultcurves'])) + Number(Boolean(query['breakerdigitals']))),
            Width: window.innerWidth
        };
        _this.history['listen'](function (location, action) {
            var query = queryString.parse(_this.history['location'].search);
            _this.setState({
                EventID: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate']
            });
        });
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
                Height: (window.innerHeight - 90) / (2 + Number(_this.state.FaultCurves) + Number(_this.state.BreakerDigitals))
            });
        }, 500);
    };
    OpenSEE.prototype.render = function () {
        return (React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.EventId, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Voltage", pixels: this.state.Width, stateSetter: this.stateSetter, showXAxis: true, height: this.state.Height }),
            React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.EventId, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Current", pixels: this.state.Width, stateSetter: this.stateSetter, showXAxis: true, height: this.state.Height }),
            (this.state.FaultCurves ? React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.EventId, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "F", pixels: this.state.Width, stateSetter: this.stateSetter, showXAxis: true, height: this.state.Height }) : ''),
            (this.state.BreakerDigitals ? React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.EventId, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "B", pixels: this.state.Width, stateSetter: this.stateSetter, showXAxis: true, height: this.state.Height }) : '')));
    };
    OpenSEE.prototype.stateSetter = function (obj) {
        this.setState(obj);
    };
    return OpenSEE;
}(React.Component));
exports.OpenSEE = OpenSEE;
ReactDOM.render(React.createElement(OpenSEE, null), document.getElementById('DockCharts'));
//# sourceMappingURL=openSEE.js.map