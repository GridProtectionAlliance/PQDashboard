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
require("./../jquery-ui.js");
var PolarChart = (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(props) {
        return _super.call(this, props) || this;
    }
    PolarChart.prototype.componentWillReceiveProps = function (nextProps) {
        var k = 1;
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
        if (!this.props.data.hasOwnProperty('VAN RMS'))
            return;
        var dataV = [
            { mag: this.props.data['VAN RMS'].data, ang: this.props.data['VAN Phase'].data, color: this.props.data['VAN RMS'].color },
            { mag: this.props.data['VBN RMS'].data, ang: this.props.data['VBN Phase'].data, color: this.props.data['VBN RMS'].color },
            { mag: this.props.data['VCN RMS'].data, ang: this.props.data['VCN Phase'].data, color: this.props.data['VCN RMS'].color }
        ];
        var dataI = [
            { mag: this.props.data['IAN RMS'].data, ang: this.props.data['IAN Phase'].data, color: this.props.data['IAN RMS'].color },
            { mag: this.props.data['IBN RMS'].data, ang: this.props.data['IBN Phase'].data, color: this.props.data['IBN RMS'].color },
            { mag: this.props.data['ICN RMS'].data, ang: this.props.data['ICN Phase'].data, color: this.props.data['ICN RMS'].color }
        ];
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