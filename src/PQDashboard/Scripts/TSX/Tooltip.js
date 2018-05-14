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
var Tooltip = (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.data,
            callback: props.callback
        };
        return _this;
    }
    Tooltip.prototype.componentWillReceiveProps = function (nextProps) {
        var k = 1;
        if (!(_.isEqual(this.state.data, nextProps.data))) {
            console.log(nextProps.data);
            this.setState({ data: nextProps.data });
        }
    };
    Tooltip.prototype.componentDidMount = function () {
        var ctrl = this;
        $("#unifiedtooltip").draggable({ scroll: false, handle: '#unifiedtooltiphandle' });
    };
    Tooltip.prototype.render = function () {
        return (React.createElement("div", { id: "unifiedtooltip", className: "ui-widget-content" },
            React.createElement("div", { id: "unifiedtooltiphandle" }),
            React.createElement("div", { id: "unifiedtooltipcontent" }),
            React.createElement("button", { className: "CloseButton", onClick: function () {
                    $('#unifiedtooltip').hide();
                    $('#showtooltipe').val('Show Tooltip');
                } }, "X")));
    };
    return Tooltip;
}(React.Component));
exports.default = Tooltip;
//# sourceMappingURL=Tooltip.js.map