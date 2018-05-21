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
var WaveformViewerGraph = (function (_super) {
    __extends(WaveformViewerGraph, _super);
    function WaveformViewerGraph(props) {
        var _this = _super.call(this, props) || this;
        _this.openSEEService = new OpenSEE_1.default();
        var ctrl = _this;
        ctrl.state = {
            legendRow: [],
            dataSet: []
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
    WaveformViewerGraph.prototype.getColor = function (label, index) {
        if (label.ChartLabel.indexOf('IRES') >= 0)
            return '#999999';
        if (label.ChartLabel.indexOf('VAN') >= 0)
            return '#A30000';
        if (label.ChartLabel.indexOf('VBN') >= 0)
            return '#0029A3';
        if (label.ChartLabel.indexOf('VCN') >= 0)
            return '#007A29';
        if (label.ChartLabel.indexOf('IAN') >= 0)
            return '#FF0000';
        if (label.ChartLabel.indexOf('IBN') >= 0)
            return '#0066CC';
        if (label.ChartLabel.indexOf('ICN') >= 0)
            return '#33CC33';
        if (label.ChartLabel.indexOf('ING') >= 0)
            return '#ffd900';
        if (label.ChartLabel.indexOf('Simp') >= 0)
            return '#edc240';
        if (label.ChartLabel.indexOf('Reac') >= 0)
            return '#afd8f8';
        if (label.ChartLabel.indexOf('Modi') >= 0)
            return '#4da74d';
        if (label.ChartLabel.indexOf('Taka') >= 0)
            return '#cb4b4b';
        if (label.ChartLabel.indexOf('Novo') >= 0)
            return '#9440ed';
        if (label.ChartLabel.indexOf('Doub') >= 0)
            return '#BD9B33';
        else if (index == 0)
            return '#edc240';
        else if (index == 1)
            return '#afd8f8';
        else if (index == 2)
            return '#cb4b4b';
        else if (index == 3)
            return '#4da74d';
        else if (index == 4)
            return '#9440ed';
        else if (index == 5)
            return '#bd9b33';
        else if (index == 6)
            return '#3498db';
        else if (index == 7)
            return '#1d5987';
        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);
            return "#" + (ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne) + (ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo) + (ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree);
        }
    };
    WaveformViewerGraph.prototype.getData = function (state) {
        switch (this.props.type) {
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
            if (data.d == null) {
                if (state.display) {
                    var obj = {};
                    obj[(state.type == "Voltage" ? 'displayVolt' : 'displayCur')] = false;
                    _this.props.stateSetter(obj);
                }
                return;
            }
            _this.options['grid'].markings.push(_this.highlightCycle(data.d));
            var legend = _this.createLegendRows(data.d.Data);
            var dataSet = _this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.d.Data);
            else
                dataSet = data.d;
            _this.createDataRows(data.d, legend);
            _this.setState({ dataSet: data.d });
        });
        this.openSEEService.getData(state, "Freq").then(function (data) {
            if (data.d == null)
                return;
            var legend = _this.createLegendRows(data.d.Data);
            var dataSet = _this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.d.Data);
            else
                dataSet = data.d;
            _this.createDataRows(dataSet, legend);
            _this.setState({ dataSet: dataSet });
        });
    };
    WaveformViewerGraph.prototype.getFaultDistanceData = function (state) {
        var _this = this;
        this.openSEEService.getFaultDistanceData(state).then(function (data) {
            if (data.d == null) {
                if (state.display) {
                    var obj = {};
                    obj['faultcurves'] = false;
                    _this.props.stateSetter(obj);
                }
                return;
            }
            _this.options['grid'].markings.push(_this.highlightSample(data.d));
            var legend = _this.createLegendRows(data.d.Data);
            _this.createDataRows(data.d, legend);
            _this.setState({ dataSet: data.d });
        });
    };
    WaveformViewerGraph.prototype.getBreakerDigitalsData = function (state) {
        var _this = this;
        this.openSEEService.getBreakerDigitalsData(state).then(function (data) {
            if (data.d == null) {
                if (state.display) {
                    var obj = {};
                    obj['breakerdigitals'] = false;
                    _this.props.stateSetter(obj);
                }
                return;
            }
            _this.options['grid'].markings.push(_this.highlightSample(data.d));
            var legend = _this.createLegendRows(data.d.Data);
            _this.createDataRows(data.d, legend);
            _this.setState({ dataSet: data.d });
        });
    };
    WaveformViewerGraph.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        var props = _.clone(this.props);
        var nextPropsClone = _.clone(nextProps);
        delete props.hover;
        delete nextPropsClone.hover;
        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        delete props.tableSetter;
        delete nextPropsClone.tableSetter;
        delete props.pointsTable;
        delete nextPropsClone.pointsTable;
        delete props.tableData;
        delete nextPropsClone.tableData;
        if (!(_.isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
        }
        else if (this.props.hover != nextProps.hover) {
            if (this.plot)
                this.plot.setCrosshair({ x: nextProps.hover });
            var table = _.clone(this.props.tableData);
            _.each(this.state.dataSet.Data, function (data, i) {
                var vector = _.findLast(data.DataPoints, function (x) { return x[0] <= nextProps.hover; });
                if (vector)
                    table[data.ChartLabel] = { data: vector[1], color: _this.state.legendRows[data.ChartLabel].color };
            });
            this.props.tableSetter(table);
        }
    };
    WaveformViewerGraph.prototype.componentDidMount = function () {
        this.getData(this.props);
    };
    WaveformViewerGraph.prototype.componentWillUnmount = function () {
        $("#" + this.props.type).off("plotselected");
        $("#" + this.props.type).off("plotzoom");
        $("#" + this.props.type).off("plothover");
        $("#" + this.props.type).off("plotclick");
    };
    WaveformViewerGraph.prototype.createLegendRows = function (data) {
        var ctrl = this;
        var legend = (this.state.legendRows != undefined ? this.state.legendRows : {});
        $.each(data, function (i, key) {
            if (legend[key.ChartLabel] == undefined)
                legend[key.ChartLabel] = { color: ctrl.getColor(key, i), enabled: (ctrl.props.type == "F" || ctrl.props.type == "B" || key.ChartLabel == key.ChartLabel.substring(0, 3)), data: key.DataPoints };
            else
                legend[key.ChartLabel].data = key.DataPoints;
        });
        this.setState({ legendRows: legend });
        return legend;
    };
    WaveformViewerGraph.prototype.createDataRows = function (data, legend) {
        var ctrl = this;
        var startString = this.props.startDate;
        var endString = this.props.endDate;
        if (this.props.startDate == null) {
            startString = moment(data.StartDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        if (this.props.endDate == null) {
            endString = moment(data.EndDate).format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        }
        var newVessel = [];
        $.each(Object.keys(legend), function (i, key) {
            if (legend[key].enabled)
                newVessel.push({ label: key, data: legend[key].data, color: legend[key].color });
        });
        newVessel.push([[this.getMillisecondTime(startString), null], [this.getMillisecondTime(endString), null]]);
        this.plot = $.plot($("#" + this.props.type), newVessel, this.options);
        this.plotSelected();
        this.plotZoom();
        this.plotHover();
        this.plotClick();
    };
    WaveformViewerGraph.prototype.plotZoom = function () {
        var ctrl = this;
        $("#" + this.props.type).off("plotzoom");
        $("#" + ctrl.props.type).bind("plotzoom", function (event) {
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.props.hover;
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
            ctrl.props.stateSetter({ StartDate: ctrl.getDateString(xmin), EndDate: ctrl.getDateString(xmax) });
        });
    };
    WaveformViewerGraph.prototype.plotSelected = function () {
        var ctrl = this;
        $("#" + this.props.type).off("plotselected");
        $("#" + ctrl.props.type).bind("plotselected", function (event, ranges) {
            ctrl.props.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to) });
        });
    };
    WaveformViewerGraph.prototype.plotHover = function () {
        var ctrl = this;
        $("#" + this.props.type).off("plothover");
        $("#" + ctrl.props.type).bind("plothover", function (event, pos, item) {
            ctrl.props.stateSetter({ Hover: pos.x });
        });
    };
    WaveformViewerGraph.prototype.plotClick = function () {
        var ctrl = this;
        $("#" + this.props.type).off("plotclick");
        $("#" + ctrl.props.type).bind("plotclick", function (event, pos, item) {
            var time;
            var deltatime;
            var deltavalue;
            if (!item)
                return;
            var pointsTable = _.clone(ctrl.props.pointsTable);
            time = (item.datapoint[0] - Number(postedEventMilliseconds)) / 1000.0;
            deltatime = 0.0;
            deltavalue = 0.0;
            if (pointsTable.length > 0) {
                deltatime = time - pointsTable[pointsTable.length - 1].thetime;
                deltavalue = item.datapoint[1] - pointsTable[pointsTable.length - 1].thevalue;
            }
            pointsTable.push({
                theseries: item.series.label,
                thetime: time,
                thevalue: item.datapoint[1].toFixed(3),
                deltatime: deltatime,
                deltavalue: deltavalue.toFixed(3),
                arrayIndex: ctrl.props.pointsTable.length
            });
            ctrl.props.stateSetter({ PointsTable: pointsTable });
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
        this.setState({ legendRows: this.state.legendRows });
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
        return (React.createElement("div", { style: { display: (this.props.display ? 'block' : 'none') } },
            React.createElement("div", { id: this.props.type, style: { height: this.props.height, float: 'left', width: this.props.pixels - 220 } }),
            React.createElement("div", { id: this.props.type + '-legend', className: 'legend', style: { float: 'right', width: '200px', height: this.props.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'auto' } },
                React.createElement(Legend_1.default, { data: this.state.legendRows, callback: this.handleSeriesLegendClick.bind(this) }))));
    };
    return WaveformViewerGraph;
}(React.Component));
exports.default = WaveformViewerGraph;
//# sourceMappingURL=WaveformViewerGraph.js.map