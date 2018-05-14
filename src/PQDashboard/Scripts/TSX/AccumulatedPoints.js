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
require("./../PrimeUI/primeui.js");
var Points = (function (_super) {
    __extends(Points, _super);
    function Points(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.pointsTable,
            callback: props.callback,
            selectedPoint: -1
        };
        return _this;
    }
    Points.prototype.componentDidMount = function () {
        var ctrl = this;
        $("#accumulatedpoints").draggable({ scroll: false, handle: '#accumulatedpointshandle' });
        this.buildTable();
    };
    Points.prototype.buildTable = function () {
        var ctrl = this;
        $('#accumulatedpointscontent').puidatatable({
            stickyHeader: false,
            selectionMode: 'single',
            rowSelect: function (event, data) {
                ctrl.setState({ selectedPoint: data.arrayIndex });
            },
            columns: [
                { field: 'theseries', headerText: 'Series' },
                { field: 'thetime', headerText: 'Time', content: function (data) { return ctrl.showTime(data); } },
                { field: 'thevalue', headerText: 'Value' },
                { field: 'deltatime', headerText: 'Delta Time', content: function (data) { return ctrl.showDeltaTime(data); } },
                { field: 'deltavalue', headerText: 'Delta Value' }
            ],
            datasource: ctrl.state.data
        });
    };
    Points.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        if (!(_.isEqual(this.state.data, nextProps.pointsTable))) {
            this.setState({ data: nextProps.pointsTable }, function () {
                $('#accumulatedpointscontent').puidatatable('reset');
                _this.buildTable();
            });
        }
    };
    Points.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { id: "accumulatedpoints", className: "ui-widget-content", style: { position: 'absolute', top: '0', width: '520px', height: '260px', display: 'none' } },
            React.createElement("div", { style: { border: 'black solid 2px' } },
                React.createElement("div", { id: "accumulatedpointshandle" }),
                React.createElement("div", { style: { overflowY: 'scroll', height: '200px' } },
                    React.createElement("div", { id: "accumulatedpointscontent", style: { height: '100%' } })),
                React.createElement("div", { style: { margin: '5px', textAlign: 'right' } },
                    React.createElement("input", { className: "smallbutton", type: "button", value: "Remove", onClick: function () { return _this.removePoint(); } }),
                    React.createElement("input", { className: "smallbutton", type: "button", value: "Pop", onClick: function () { return _this.popAccumulatedPoints(); } }),
                    React.createElement("input", { className: "smallbutton", type: "button", value: "Clear", onClick: function () { return _this.clearAccumulatedPoints(); } })),
                React.createElement("button", { className: "CloseButton", style: { top: '2px', right: '2px' }, onClick: function () {
                        $('#accumulatedpoints').hide();
                        $('#showpoints').val('Show Points');
                    } }, "X"))));
    };
    Points.prototype.removePoint = function () {
        var data = _.clone(this.state.data);
        var selectedPoint = this.state.selectedPoint;
        if (selectedPoint === data.length - 1) {
            data.pop();
        }
        else if (this.state.selectedPoint == 0) {
            data[1].deltatime = 0;
            data[1].deltavalue = (0.0).toFixed(3);
            for (var i = selectedPoint + 1; i < data.length; ++i)
                data[i].arrayIndex--;
            data.splice(selectedPoint, 1);
        }
        else if (selectedPoint === -1) {
        }
        else {
            data[selectedPoint + 1].deltatime = data[selectedPoint + 1].thetime - data[selectedPoint - 1].thetime;
            data[selectedPoint + 1].deltavalue = (data[selectedPoint + 1].thevalue - data[selectedPoint - 1].thevalue).toFixed(3);
            for (var i = selectedPoint + 1; i < data.length; ++i)
                data[i].arrayIndex--;
            data.splice(selectedPoint, 1);
        }
        selectedPoint = -1;
        this.state.callback({
            PointsTable: data
        });
        this.setState({ selectedPoint: selectedPoint });
    };
    Points.prototype.popAccumulatedPoints = function () {
        var data = _.clone(this.state.data);
        if (data.length > 0)
            data.pop();
        this.state.callback({
            PointsTable: data
        });
    };
    Points.prototype.clearAccumulatedPoints = function () {
        this.state.callback({
            PointsTable: []
        });
    };
    Points.prototype.showTime = function (rowdata) {
        var html = rowdata.thetime.toFixed(7) + " sec<br>" + (rowdata.thetime * postedSystemFrequency).toFixed(2) + " cycles";
        return html;
    };
    Points.prototype.showDeltaTime = function (rowdata) {
        var html = rowdata.deltatime.toFixed(7) + " sec<br>" + (rowdata.deltatime * postedSystemFrequency).toFixed(2) + " cycles";
        return html;
    };
    return Points;
}(React.Component));
exports.default = Points;
//# sourceMappingURL=AccumulatedPoints.js.map