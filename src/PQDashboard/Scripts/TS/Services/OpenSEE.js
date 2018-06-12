"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OpenSEEService = (function () {
    function OpenSEEService() {
    }
    OpenSEEService.prototype.getData = function (filters, dataType) {
        return $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetData?eventId=" + filters.eventId +
                ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
                ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
                ("&pixels=" + filters.pixels) +
                ("&type=" + filters.type) +
                ("&dataType=" + dataType),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    };
    OpenSEEService.prototype.getFaultDistanceData = function (filters) {
        return $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetFaultDistanceData?eventId=" + filters.eventId +
                ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
                ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
                ("&pixels=" + filters.pixels),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    };
    OpenSEEService.prototype.getBreakerDigitalsData = function (filters) {
        return $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetBreakerData?eventId=" + filters.eventId +
                ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
                ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
                ("&pixels=" + filters.pixels) +
                ("&type=" + filters.type),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    };
    OpenSEEService.prototype.getHeaderData = function (filters) {
        return $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetHeaderData?eventId=" + filters.eventid +
                ("" + (filters.breakeroperation != undefined ? "&breakeroperation=" + filters.breakeroperation : "")),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    };
    return OpenSEEService;
}());
exports.default = OpenSEEService;
//# sourceMappingURL=OpenSEE.js.map