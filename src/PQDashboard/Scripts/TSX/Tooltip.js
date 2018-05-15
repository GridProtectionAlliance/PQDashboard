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
require("flot");
require("./../flot/jquery.flot.time.min.js");
var Tooltip = (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip(props) {
        return _super.call(this, props) || this;
    }
    Tooltip.prototype.componentDidMount = function () {
        var ctrl = this;
        $("#unifiedtooltip").draggable({ scroll: false, handle: '#unifiedtooltiphandle' });
    };
    Tooltip.prototype.render = function () {
        var subsecond = ("0000000" + (this.props.hover * 10000 % 10000000)).slice(-7);
        var format = $.plot.formatDate($.plot.dateGenerator(this.props.hover, { timezone: "utc" }), "%Y-%m-%d %H:%M:%S") + "." + subsecond;
        var rows = [];
        _.each(this.props.data, function (data, index) {
            if (index.indexOf('V') == 0 && $('.legendCheckbox:checked').toArray().map(function (x) { return x.name; }).indexOf(index) >= 0)
                rows.push(Row({ label: index, data: data.data, color: data.color }));
        });
        _.each(this.props.data, function (data, index) {
            if (index.indexOf('I') == 0 && $('.legendCheckbox:checked').toArray().map(function (x) { return x.name; }).indexOf(index) >= 0)
                rows.push(Row({ label: index, data: data.data, color: data.color }));
        });
        _.each(this.props.data, function (data, index) {
            if (index.indexOf('V') != 0 && index.indexOf('I') != 0 && $('.legendCheckbox:checked').toArray().map(function (x) { return x.name; }).indexOf(index) >= 0)
                rows.push(Row({ label: index, data: data.data, color: data.color }));
        });
        return (React.createElement("div", { id: "unifiedtooltip", className: "ui-widget-content", style: { position: 'absolute', top: '0', display: 'none' } },
            React.createElement("div", { id: "unifiedtooltiphandle" }),
            React.createElement("div", { id: "unifiedtooltipcontent" },
                React.createElement("div", { style: { textAlign: 'center' } },
                    React.createElement("b", null, format),
                    React.createElement("br", null),
                    React.createElement("table", { className: "table" },
                        React.createElement("tbody", null, rows)))),
            React.createElement("button", { className: "CloseButton", onClick: function () {
                    $('#unifiedtooltip').hide();
                    $('.legendCheckbox').hide();
                    $('#showtooltip').val('Show Tooltip');
                } }, "X")));
    };
    return Tooltip;
}(React.Component));
exports.default = Tooltip;
var Row = function (row) {
    return (React.createElement("tr", { key: row.label },
        React.createElement("td", { className: "dot", style: { background: row.color, width: '12px' } }, "\u00A0\u00A0\u00A0"),
        React.createElement("td", { style: { textAlign: 'left' } },
            React.createElement("b", null, row.label)),
        React.createElement("td", { style: { textAlign: "right" } },
            React.createElement("b", null, row.data.toFixed(2)))));
};
//# sourceMappingURL=Tooltip.js.map