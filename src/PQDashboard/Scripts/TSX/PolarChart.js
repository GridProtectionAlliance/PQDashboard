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
var _ = require("lodash");
require("./../jquery-ui.js");
var PolarChart = (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.data,
            callback: props.callback
        };
        return _this;
    }
    PolarChart.prototype.componentWillReceiveProps = function (nextProps) {
        var k = 1;
        if (!(_.isEqual(this.state.data, nextProps.data))) {
            console.log(nextProps.data);
            this.setState({ data: nextProps.data });
        }
        this.updatePhasorChart();
    };
    PolarChart.prototype.componentDidMount = function () {
        var ctrl = this;
        $("#phasor").draggable({ scroll: false, handle: '#phasorhandle' });
        this.updatePhasorChart();
    };
    PolarChart.prototype.updatePhasorChart = function () {
        var canvas = $("#phasorCanvas");
        var context = canvas[0].getContext("2d");
        var padding = 10;
        var center = { x: canvas.width() / 2, y: canvas.height() / 2 };
        var chartRadius = Math.min(center.x, center.y) - padding;
        if (canvas.is(":hidden"))
            return;
        context.clearRect(0, 0, canvas.width(), canvas.height());
        this.drawGrid(context, center, chartRadius);
        this.drawPhasors(context, center, chartRadius);
    };
    PolarChart.prototype.drawPhasors = function (context, center, chartRadius) {
        var vMax = 0;
        var iMax = 0;
        var ctrl = this;
        context.lineWidth = 3;
        var dataV = [{ mag: this.state.data['VAN RMS'], ang: this.state.data['VAN Phase'], color: '#A30000' }, { mag: this.state.data['VBN RMS'], ang: this.state.data['VBN Phase'], color: '#0029A3' }, { mag: this.state.data['VCN RMS'], ang: this.state.data['VCN Phase'], color: '#007A29' }];
        var dataI = [{ mag: this.state.data['IAN RMS'], ang: this.state.data['IAN Phase'], color: '#FF0000' }, { mag: this.state.data['IBN RMS'], ang: this.state.data['IBN Phase'], color: '#0066CC' }, { mag: this.state.data['ICN RMS'], ang: this.state.data['ICN Phase'], color: '#33CC33' }];
        $.each(dataV, function (key, series) {
            if (series.mag > vMax)
                vMax = series.mag;
        });
        $.each(dataI, function (key, series) {
            if (series.mag > iMax)
                iMax = series.mag;
        });
        $.each(dataV, function (index, series) {
            var scale = 0.9 * chartRadius / vMax;
            context.strokeStyle = series.color;
            ctrl.drawVector(context, center, series.mag * scale, series.ang);
            context.setLineDash([]);
        });
        $.each(dataI, function (index, series) {
            var scale = 0.9 * chartRadius / iMax;
            context.setLineDash([10, 5]);
            context.strokeStyle = series.color;
            ctrl.drawVector(context, center, series.mag * scale, series.ang);
            context.setLineDash([]);
        });
    };
    PolarChart.prototype.drawGrid = function (context, center, chartRadius) {
        context.lineWidth = 1;
        context.strokeStyle = "#BBB";
        for (var i = 0; i < 4; i++)
            this.drawVector(context, center, chartRadius, i * Math.PI / 2);
        context.strokeStyle = "#DDD";
        this.drawCircle(context, center, 0.9 * chartRadius / 2);
        this.drawCircle(context, center, 0.9 * chartRadius);
    };
    PolarChart.prototype.drawVector = function (context, center, r, t) {
        var x = r * Math.cos(t);
        var y = r * Math.sin(t);
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(center.x + x, center.y - y);
        context.stroke();
    };
    PolarChart.prototype.drawCircle = function (context, center, r) {
        context.beginPath();
        context.arc(center.x, center.y, r, 0, 2 * Math.PI);
        context.stroke();
    };
    PolarChart.prototype.render = function () {
        return (React.createElement("div", { id: "phasor", className: "ui-widget-content", style: { position: 'absolute', top: '0', width: '300px', height: '320px', display: 'none' } },
            React.createElement("div", { id: "phasorhandle" }),
            React.createElement("div", { id: "phasorchart", style: { width: '300px', height: '300px', zIndex: 1001 } },
                React.createElement("canvas", { id: "phasorCanvas", width: "300", height: "300", style: { display: 'block' } })),
            React.createElement("button", { className: "CloseButton", onClick: function () {
                    $('#phasor').hide();
                    $('#showphasor').val('Show Phasor');
                } }, "X")));
    };
    return PolarChart;
}(React.Component));
exports.default = PolarChart;
//# sourceMappingURL=PolarChart.js.map