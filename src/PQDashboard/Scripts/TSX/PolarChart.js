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
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    };
    PolarChart.prototype.render = function () {
        return (React.createElement("div", null,
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