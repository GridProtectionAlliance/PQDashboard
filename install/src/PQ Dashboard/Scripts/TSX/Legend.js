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
var Legend = (function (_super) {
    __extends(Legend, _super);
    function Legend(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.data,
            callback: props.callback
        };
        return _this;
    }
    Legend.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    };
    Legend.prototype.render = function () {
        var _this = this;
        if (this.state.data == null)
            return null;
        var rows = this.state.data.map(function (row) {
            return React.createElement(Row, { key: row.label, label: row.label, color: row.color, enabled: row.enabled, callback: function () {
                    row.enabled = !row.enabled;
                    _this.setState({ data: _this.state.data });
                    _this.state.callback();
                } });
        });
        return (React.createElement("table", null,
            React.createElement("tbody", null, rows)));
    };
    return Legend;
}(React.Component));
exports.default = Legend;
var Row = function (props) {
    return (React.createElement("tr", null,
        React.createElement("td", null,
            React.createElement("button", { className: "btn-link", onClick: props.callback },
                React.createElement("div", { style: { border: '1px solid #ccc', padding: '1px' } },
                    React.createElement("div", { style: { width: ' 4px', height: 0, border: '5px solid ' + props.color + (props.enabled ? 'FF' : '60'), overflow: 'hidden' } })))),
        React.createElement("td", null,
            React.createElement("span", null, props.label))));
};
//# sourceMappingURL=Legend.js.map