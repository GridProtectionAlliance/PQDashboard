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
        return _super.call(this, props) || this;
    }
    Legend.prototype.render = function () {
        var _this = this;
        if (this.props.data == null || Object.keys(this.props.data).length == 0)
            return null;
        var rows = Object.keys(this.props.data).sort().map(function (row) {
            return React.createElement(Row, { key: row, label: row, color: _this.props.data[row].color, enabled: _this.props.data[row].enabled, callback: function () {
                    _this.props.data[row].enabled = !_this.props.data[row].enabled;
                    _this.props.callback();
                } });
        });
        return (React.createElement("div", null,
            (Object.keys(this.props.data)[0].indexOf('V') == 0 || Object.keys(this.props.data)[0].indexOf('I') == 0 ?
                React.createElement("div", { className: "btn-group", style: { width: '100%' } },
                    React.createElement("button", { className: 'active', style: { width: '25%' }, onClick: this.toggleWave.bind(this) }, "Wave"),
                    React.createElement("button", { style: { width: '25%' }, onClick: this.toggleAll.bind(this, 'Amplitude') }, "Amp"),
                    React.createElement("button", { style: { width: '25%' }, onClick: this.toggleAll.bind(this, 'Phase') }, "Phase"),
                    React.createElement("button", { style: { width: '25%' }, onClick: this.toggleAll.bind(this, 'RMS') }, "RMS")) : null),
            React.createElement("table", null,
                React.createElement("tbody", null, rows))));
    };
    Legend.prototype.toggleWave = function (event) {
        var data = this.props.data;
        var flag = false;
        _.each(Object.keys(data).filter(function (d) { return d.indexOf('RMS') < 0 && d.indexOf('Amplitude') < 0 && d.indexOf('Phase') < 0; }), function (key, i) {
            if (i == 0)
                flag = !data[key].enabled;
            data[key].enabled = flag;
            $('[name="' + key + '"]').prop('checked', flag);
        });
        if (flag)
            event.target.className = "active";
        else
            event.target.className = "";
        this.props.callback();
    };
    Legend.prototype.toggleAll = function (type, event) {
        var data = this.props.data;
        var flag = false;
        _.each(Object.keys(data).filter(function (d) { return d.indexOf(type) >= 0; }), function (key, i) {
            if (i == 0)
                flag = !data[key].enabled;
            data[key].enabled = flag;
            $('[name="' + key + '"]').prop('checked', flag);
        });
        if (flag)
            event.target.className = "active";
        else
            event.target.className = "";
        this.props.callback();
    };
    return Legend;
}(React.Component));
exports.default = Legend;
var Row = function (props) {
    return (React.createElement("tr", null,
        React.createElement("td", null,
            React.createElement("input", { name: props.label, className: 'legendCheckbox', type: "checkbox", style: { display: 'none' }, defaultChecked: props.enabled })),
        React.createElement("td", null,
            React.createElement("div", { style: { border: '1px solid #ccc', padding: '1px' } },
                React.createElement("div", { style: { width: ' 4px', height: 0, border: '5px solid ' + props.color + (props.enabled ? 'FF' : '60'), overflow: 'hidden' }, onClick: props.callback }))),
        React.createElement("td", null,
            React.createElement("span", { style: { color: props.color, fontSize: 'smaller', fontWeight: 'bold', whiteSpace: 'nowrap' } }, props.label))));
};
//# sourceMappingURL=Legend.js.map