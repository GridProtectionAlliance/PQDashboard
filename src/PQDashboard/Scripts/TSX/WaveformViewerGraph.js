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
var OpenSEE_1 = require("./../TS/Services/OpenSEE");
var _ = require("lodash");
var moment = require("moment");
var Legend_1 = require("./Legend");
require("flot");
require("./../flot/jquery.flot.crosshair.min.js");
require("./../flot/jquery.flot.navigate.min.js");
require("./../flot/jquery.flot.selection.min.js");
require("./../flot/jquery.flot.time.min.js");
var color = {
    IRE: '#999999',
    VAN: '#A30000',
    VBN: '#0029A3',
    VCN: '#007A29',
    IAN: '#FF0000',
    IBN: '#0066CC',
    ICN: '#33CC33',
    ING: '#ffd900',
    Sim: '#996633',
    Rea: '#333300',
    Tak: '#9900FF',
    Mod: '#66CCFF',
    Nov: '#CC9900',
    Dou: '#BD9B33'
};
var WaveformViewerGraph = (function (_super) {
    __extends(WaveformViewerGraph, _super);
    function WaveformViewerGraph(props) {
        var _this = _super.call(this, props) || this;
        _this.openSEEService = new OpenSEE_1.default();
        var ctrl = _this;
        ctrl.state = {
            eventId: props.eventId,
            startDate: props.startDate,
            endDate: props.endDate,
            type: props.type,
            pixels: props.pixels,
            stateSetter: props.stateSetter,
            legendRow: [],
            dataSet: [],
            height: props.height,
            hover: props.hover
        };
        ctrl.options = {
            canvas: true,
            legend: { show: false },
            crosshair: { mode: "x" },
            selection: { mode: "x" },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true,
                markings: []
            },
            xaxis: {
                mode: "time",
                tickLength: 10,
                reserveSpace: false,
                ticks: function (axis) {
                    var ticks = [], start = ctrl.floorInBase(axis.min, axis.delta), i = 0, v = Number.NaN, prev;
                    do {
                        prev = v;
                        v = start + i * axis.delta;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                },
                tickFormatter: function (value, axis) {
                    if (axis.delta < 1) {
                        var trunc = value - ctrl.floorInBase(value, 1000);
                        return ctrl.defaultTickFormatter(trunc, axis) + " ms";
                    }
                    if (axis.delta < 1000) {
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).utc().format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: {
                labelWidth: 50,
                panRange: false,
                tickLength: 10,
                tickFormatter: function (val, axis) {
                    if (axis.delta > 1000000 && (val > 1000000 || val < -1000000))
                        return ((val / 1000000) | 0) + "M";
                    else if (axis.delta > 1000 && (val > 1000 || val < -1000))
                        return ((val / 1000) | 0) + "K";
                    else
                        return val.toFixed(axis.tickDecimals);
                }
            }
        };
        return _this;
    }
    WaveformViewerGraph.prototype.getData = function (state) {
        switch (state.type) {
            case 'F':
                this.getFaultDistanceData(state);
                break;
            case 'B':
                this.getBreakerDigitalsData(state);
                break;
            default:
                this.getEventData(state);
                break;
        }
    };
    WaveformViewerGraph.prototype.getEventData = function (state) {
        var _this = this;
        this.openSEEService.getData(state, "Time").then(function (data) {
            _this.options['grid'].markings.push(_this.highlightCycle(data));
            var legend = _this.state.legendRows;
            if (_this.state.legendRows == undefined)
                legend = _this.createLegendRows(data.Data);
            _this.createDataRows(data, legend);
            _this.setState({ dataSet: data });
            _this.openSEEService.getData(state, "Freq").then(function (d2) {
                legend = legend = _this.createLegendRows(data.Data.concat(d2.Data));
                data.Data = data.Data.concat(d2.Data);
                _this.createDataRows(data, legend);
                _this.setState({ dataSet: data });
            });
        });
    };
    WaveformViewerGraph.prototype.getFaultDistanceData = function (state) {
        var _this = this;
        this.openSEEService.getFaultDistanceData(state).then(function (data) {
            _this.options['grid'].markings.push(_this.highlightSample(data));
            var legend = _this.state.legendRows;
            if (_this.state.legendRows == undefined)
                legend = _this.createLegendRows(data.Data);
            _this.createDataRows(data, legend);
            _this.setState({ dataSet: data });
        });
    };
    WaveformViewerGraph.prototype.getBreakerDigitalsData = function (state) {
        var _this = this;
        this.openSEEService.getBreakerDigitalsData(state).then(function (data) {
            var legend = _this.state.legendRows;
            if (_this.state.legendRows == undefined)
                legend = _this.createLegendRows(data.Data);
            _this.createDataRows(data, legend);
            _this.setState({ dataSet: data });
        });
    };
    WaveformViewerGraph.prototype.componentWillReceiveProps = function (nextProps) {
        var props = _.clone(this.props);
        var nextPropsClone = _.clone(nextProps);
        delete props.hover;
        delete nextPropsClone.hover;
        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        if (!(_.isEqual(props, nextPropsClone))) {
            this.setState(nextProps);
            this.getData(nextProps);
        }
        else if (this.props.hover != nextProps.hover) {
            this.plot.setCrosshair({ x: nextProps.hover });
        }
    };
    WaveformViewerGraph.prototype.componentDidMount = function () {
        this.getData(this.state);
    };
    WaveformViewerGraph.prototype.componentWillUnmount = function () {
        $("#" + this.state.type).off("plotselected");
        $("#" + this.state.type).off("plotzoom");
        $("#" + this.state.type).off("plothover");
    };
    WaveformViewerGraph.prototype.createLegendRows = function (data) {
        var ctrl = this;
        var legend = [];
        data.sort(function (a, b) {
            var keyA = a.ChartLabel, keyB = b.ChartLabel;
            if (keyA < keyB)
                return -1;
            if (keyA > keyB)
                return 1;
            return 0;
        });
        $.each(data, function (i, key) {
            legend.push({ label: key.ChartLabel, color: color[key.ChartLabel.substring(0, 3)], enabled: (ctrl.state.type == "F" || key.ChartLabel == key.ChartLabel.substring(0, 3)) });
        });
        this.setState({ legendRows: legend });
        return legend;
    };
    WaveformViewerGraph.prototype.createDataRows = function (data, legend) {
        var startString = this.state.startDate;
        var endString = this.state.endDate;
        if (this.state.startDate == null) {
            this.setState({ startDate: moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            startString = moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        if (this.state.endDate == null) {
            this.setState({ endDate: moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS') });
            endString = moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        var newVessel = [];
        var legendKeys = legend.filter(function (x) { return x.enabled; }).map(function (x) { return x.label; });
        $.each(data.Data, function (i, key) {
            if (legendKeys.indexOf(key.ChartLabel) >= 0)
                newVessel.push({ label: key.ChartLabel, data: key.DataPoints, color: color[key.ChartLabel.substring(0, 3)] });
        });
        newVessel.push([[this.getMillisecondTime(startString), null], [this.getMillisecondTime(endString), null]]);
        this.plot = $.plot($("#" + this.state.type), newVessel, this.options);
        this.plotSelected();
        this.plotZoom();
        this.plotHover();
    };
    WaveformViewerGraph.prototype.plotZoom = function () {
        var ctrl = this;
        $("#" + this.state.type).off("plotzoom");
        $("#" + ctrl.state.type).bind("plotzoom", function (event) {
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.state.hover;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;
            var datamin = xaxis.datamin;
            var datamax = xaxis.datamax;
            var deltaMagnitude;
            var delta;
            var factor;
            if (xmin == null)
                xmin = datamin;
            if (xmax == null)
                xmax = datamax;
            if (xmin == null || xmax == null)
                return;
            xcenter = Math.max(xcenter, xmin);
            xcenter = Math.min(xcenter, xmax);
            if (event.originalEvent.wheelDelta != undefined)
                delta = event.originalEvent.wheelDelta;
            else
                delta = -event.originalEvent.detail;
            deltaMagnitude = Math.abs(delta);
            if (minDelta == null || deltaMagnitude < minDelta)
                minDelta = deltaMagnitude;
            deltaMagnitude /= minDelta;
            deltaMagnitude = Math.min(deltaMagnitude, maxDelta);
            factor = deltaMagnitude / 10;
            if (delta > 0) {
                xmin = xmin * (1 - factor) + xcenter * factor;
                xmax = xmax * (1 - factor) + xcenter * factor;
            }
            else {
                xmin = (xmin - xcenter * factor) / (1 - factor);
                xmax = (xmax - xcenter * factor) / (1 - factor);
            }
            if (xmin == xaxis.options.xmin && xmax == xaxis.options.xmax)
                return;
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(xmin), EndDate: ctrl.getDateString(xmax) });
        });
    };
    WaveformViewerGraph.prototype.plotSelected = function () {
        var ctrl = this;
        $("#" + this.state.type).off("plotselected");
        $("#" + ctrl.state.type).bind("plotselected", function (event, ranges) {
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to) });
        });
    };
    WaveformViewerGraph.prototype.plotHover = function () {
        var ctrl = this;
        $("#" + this.state.type).off("plothover");
        $("#" + ctrl.state.type).bind("plothover", function (event, pos, item) {
            ctrl.state.stateSetter({ Hover: pos.x });
        });
    };
    WaveformViewerGraph.prototype.defaultTickFormatter = function (value, axis) {
        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;
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
    WaveformViewerGraph.prototype.floorInBase = function (n, base) {
        return base * Math.floor(n / base);
    };
    WaveformViewerGraph.prototype.handleSeriesLegendClick = function () {
        this.createDataRows(this.state.dataSet, this.state.legendRows);
    };
    WaveformViewerGraph.prototype.getMillisecondTime = function (date) {
        var milliseconds = moment.utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0')) * 1000;
        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    };
    WaveformViewerGraph.prototype.getDateString = function (float) {
        var date = moment.utc(float).format('YYYY-MM-DDTHH:mm:ss.SSS');
        var millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'));
        return date + millisecondFraction.toString();
    };
    WaveformViewerGraph.prototype.highlightSample = function (series) {
        if (series.CalculationTime > 0)
            return {
                color: "#EB0",
                xaxis: {
                    from: series.CalculationTime,
                    to: series.CalculationTime
                }
            };
    };
    WaveformViewerGraph.prototype.highlightCycle = function (series) {
        if (series.CalculationTime > 0 && series.CalculationEnd > 0)
            return {
                color: "#FFA",
                xaxis: {
                    from: series.CalculationTime,
                    to: series.CalculationEnd
                }
            };
    };
    WaveformViewerGraph.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { id: this.state.type, style: { height: (this.props.showXAxis ? this.state.height : this.state.height - 20), float: 'left', width: this.state.pixels - 220 } }),
            React.createElement("div", { id: this.state.type + '-legend', style: { float: 'right', width: '200px', height: this.state.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'auto' } },
                React.createElement(Legend_1.default, { data: this.state.legendRows, callback: this.handleSeriesLegendClick.bind(this) }))));
    };
    return WaveformViewerGraph;
}(React.Component));
exports.default = WaveformViewerGraph;
//# sourceMappingURL=WaveformViewerGraph.js.map