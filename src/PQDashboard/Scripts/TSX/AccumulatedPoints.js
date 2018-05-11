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
var Points = (function (_super) {
    __extends(Points, _super);
    function Points(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.data,
            callback: props.callback
        };
        return _this;
    }
    Points.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    };
    Points.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { border: 'black solid 2px' } },
            React.createElement("div", { id: "accumulatedpointshandle" }),
            React.createElement("div", { style: { overflowY: 'scroll', height: '200px' } },
                React.createElement("div", { id: "accumulatedpointscontent" })),
            React.createElement("div", { style: { margin: '5px', textAlign: 'right' } },
                React.createElement("input", { className: "smallbutton", type: "button", value: "Remove", onClick: function () { return _this.removePoint(); } }),
                React.createElement("input", { className: "smallbutton", type: "button", value: "Pop", onClick: function () { return _this.popAccumulatedPoints(); } }),
                React.createElement("input", { className: "smallbutton", type: "button", value: "Clear", onClick: function () { return _this.clearAccumulatedPoints(); } })),
            React.createElement("button", { className: "CloseButton", style: { top: '2px', right: '2px' }, onClick: function () {
                    $('#accumulatedpoints').hide();
                    $('#showpoints').val('Show Points');
                } }, "X")));
    };
    Points.prototype.removePoint = function () {
    };
    Points.prototype.popAccumulatedPoints = function () {
    };
    Points.prototype.clearAccumulatedPoints = function () {
    };
    return Points;
}(React.Component));
exports.default = Points;
//# sourceMappingURL=AccumulatedPoints.js.map