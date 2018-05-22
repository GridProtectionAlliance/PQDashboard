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
            faultcurves: query['faultcurves'] == '1' || query['faultcurves'] == 'true',
            breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
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
                faultcurves: query['faultcurves'] == '1' || query['faultcurves'] == 'true',
                breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
            });
        });
        return _this;
    }
    OpenSEE.prototype.componentDidMount = function () {
        var _this = this;
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
        this.openSEEService.getHeaderData(this.state).done(function (data) { return _this.showData(data); });
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
        return (React.createElement("div", null,
            React.createElement("div", { id: "pageHeader", style: { width: '100%' } },
                React.createElement("table", { style: { width: '100%' } },
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            React.createElement("td", { style: { textAlign: 'left', width: '10%' } },
                                React.createElement("img", { src: '../Images/GPA-Logo---30-pix(on-white).png' })),
                            React.createElement("td", { style: { textAlign: 'center', width: '80%' } },
                                React.createElement("img", { src: '../Images/openSEET.png' })),
                            React.createElement("td", { style: { textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', width: '10%' } },
                                React.createElement("img", { alt: "", src: "../Images/GPA-Logo.png", style: { display: 'none' } }))),
                        React.createElement("tr", null,
                            React.createElement("td", { colSpan: 3, style: { textAlign: 'center' } },
                                React.createElement("div", null,
                                    React.createElement("span", { id: "TitleData" }),
                                    "\u00A0\u00A0\u00A0",
                                    React.createElement("a", { type: "button", target: "_blank", href: xdaInstance + " /Workbench/Event.cshtml?EventID=" + this.state.eventid }, "edit"))))))),
            React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
                React.createElement(PolarChart_1.default, { data: this.state.TableData, callback: this.stateSetter.bind(this) }),
                React.createElement(AccumulatedPoints_1.default, { pointsTable: this.state.PointsTable, callback: this.stateSetter.bind(this) }),
                React.createElement(Tooltip_1.default, { data: this.state.TableData, hover: this.state.Hover }),
                React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Voltage", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.displayVolt }),
                React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "Current", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.displayCur }),
                React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "F", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.faultcurves }),
                React.createElement(WaveformViewerGraph_1.default, { eventId: this.state.eventid, startDate: this.state.StartDate, endDate: this.state.EndDate, type: "B", pixels: this.state.Width, stateSetter: this.stateSetter.bind(this), height: height, hover: this.state.Hover, tableData: this.TableData, pointsTable: this.state.PointsTable, tableSetter: this.tableUpdater.bind(this), display: this.state.breakerdigitals }))));
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
                _this.history['push'](_this.history['location'].pathname + '?' + queryString.stringify(prop, { encode: false }));
        });
    };
    OpenSEE.prototype.tableUpdater = function (obj) {
        this.TableData = _.merge(this.TableData, obj);
        this.setState({ TableData: this.TableData });
    };
    OpenSEE.prototype.resetZoom = function () {
        this.history['push'](this.history['location'].pathname + '?eventid=' + this.state.eventid + (this.state.faultcurves ? '&faultcurves=1' : '') + (this.state.breakerdigitals ? '&breakerdigitals=1' : ''));
    };
    OpenSEE.prototype.calculateHeights = function (obj) {
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.faultcurves) + Number(obj.breakerdigitals));
    };
    OpenSEE.prototype.nextBackSelect = function (nextBackType) {
        $('.nextbackbutton').hide();
        $('#' + nextBackType + '-back').show();
        $('#' + nextBackType + '-next').show();
    };
    OpenSEE.prototype.showhidePoints = function () {
        if ($('#showpoints').val() == "Show Points") {
            $('#showpoints').val("Hide Points");
            $('#accumulatedpoints').show();
        }
        else {
            $('#showpoints').val("Show Points");
            $('#accumulatedpoints').hide();
        }
    };
    OpenSEE.prototype.showhideTooltip = function () {
        if ($('#showtooltip').val() == "Show Tooltip") {
            $('#showtooltip').val("Hide Tooltip");
            $('#unifiedtooltip').show();
            $('.legendCheckbox').show();
        }
        else {
            $('#showtooltip').val("Show Tooltip");
            $('#unifiedtooltip').hide();
            $('.legendCheckbox').hide();
        }
    };
    OpenSEE.prototype.showhidePhasor = function () {
        if ($('#showphasor').val() == "Show Phasor") {
            $('#showphasor').val("Hide Phasor");
            $('#phasor').show();
        }
        else {
            $('#showphasor').val("Show Phasor");
            $('#phasor').hide();
        }
    };
    OpenSEE.prototype.showData = function (data) {
        if (data.postedEventName && data.postedEventId) {
            var label = "";
            var details = "";
            var separator = "&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;";
            var faultLink = '<a href="#" title="Click for fault details" onClick="showdetails(this);">Fault</a>';
            label += "Station: " + data.postedStationName;
            label += separator + "Meter: " + data.postedMeterName;
            label += separator + "Line: " + data.postedLineName;
            label += "<br />";
            if (data.postedEventName != "Fault")
                label += "Event Type: " + data.postedEventName;
            else
                label += "Event Type: " + faultLink;
            label += separator + "Event Time: " + data.postedEventDate;
            if (data.postedStartTime != "")
                details += "Start: " + data.postedStartTime;
            if (data.postedPhase != "") {
                if (details != "")
                    details += separator;
                details += "Phase: " + data.postedPhase;
            }
            if (data.postedDurationPeriod != "") {
                if (details != "")
                    details += separator;
                details += "Duration: " + data.postedDurationPeriod;
            }
            if (data.postedMagnitude != "") {
                if (details != "")
                    details += separator;
                details += "Magnitude: " + data.postedMagnitude;
            }
            if (details != "")
                label += "<br />" + details;
            details = "";
            if (data.postedBreakerNumber != "")
                details += "Breaker: " + data.postedBreakerNumber;
            if (data.postedBreakerPhase != "") {
                if (details != "")
                    details += separator;
                details += "Phase: " + data.postedBreakerPhase;
            }
            if (data.postedBreakerTiming != "") {
                if (details != "")
                    details += separator;
                details += "Timing: " + data.postedBreakerTiming;
            }
            if (data.postedBreakerSpeed != "") {
                if (details != "")
                    details += separator;
                details += "Speed: " + data.postedBreakerSpeed;
            }
            if (data.postedBreakerOperation != "") {
                if (details != "")
                    details += separator;
                details += "Operation: " + data.postedBreakerOperation;
            }
            if (details != "")
                label += "<br />" + details;
            document.getElementById('TitleData').innerHTML = label;
        }
    };
    OpenSEE.prototype.NextBackButton = function (evt, id, postedURLQueryString, text) {
        if (evt != null) {
            var title = evt.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff");
            var url = "?eventid=" + evt.ID + postedURLQueryString;
            return React.createElement("a", { href: url, id: id, className: 'nextbackbutton smallbutton', title: title, style: { padding: '4px 20px' } }, text);
        }
        else
            return React.createElement("a", { href: '#', id: id, className: 'nextbackbutton smallbutton-disabled', title: 'No event', style: { padding: '4px 20px' } }, text);
    };
    return OpenSEE;
}(React.Component));
exports.OpenSEE = OpenSEE;
ReactDOM.render(React.createElement(OpenSEE, null), document.getElementById('DockCharts'));
//# sourceMappingURL=openSEE.js.map