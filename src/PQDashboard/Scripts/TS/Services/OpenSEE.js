"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var OpenSEEService = (function () {
    function OpenSEEService() {
    }
    OpenSEEService.prototype.getData = function (filters, dataType) {
        return axios_1.default
            .get("/Main/GetData?eventId=" + filters.eventId +
            ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
            ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
            ("&pixels=" + filters.pixels) +
            ("&type=" + filters.type) +
            ("&dataType=" + dataType))
            .then(function (res) {
            return res.data;
        });
    };
    OpenSEEService.prototype.getFaultDistanceData = function (filters) {
        return axios_1.default
            .get("/Main/GetFaultDistanceData?eventId=" + filters.eventId +
            ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
            ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
            ("&pixels=" + filters.pixels))
            .then(function (res) {
            return res.data;
        });
    };
    OpenSEEService.prototype.getBreakerDigitalsData = function (filters) {
        return axios_1.default
            .get("/Main/GetBreakerData?eventId=" + filters.eventId +
            ("" + (filters.startDate != undefined ? "&startDate=" + filters.startDate : "")) +
            ("" + (filters.endDate != undefined ? "&endDate=" + filters.endDate : "")) +
            ("&pixels=" + filters.pixels) +
            ("&type=" + filters.type))
            .then(function (res) {
            return res.data;
        });
    };
    return OpenSEEService;
}());
exports.default = OpenSEEService;
//# sourceMappingURL=OpenSEE.js.map