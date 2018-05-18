"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OpenSEEService = (function () {
    function OpenSEEService() {
    }
    OpenSEEService.prototype.getData = function (filters, dataType) {
        return $.ajax({
            type: "POST",
            url: homePath + "signalService.asmx/GetData?eventId=" + filters.eventId +
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
            type: "POST",
            url: homePath + "signalService.asmx/GetFaultDistanceData?eventId=" + filters.eventId +
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
            type: "POST",
            url: homePath + "signalService.asmx/GetBreakerData?eventId=" + filters.eventId +
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
    return OpenSEEService;
}());
exports.default = OpenSEEService;
//# sourceMappingURL=OpenSEE.js.map