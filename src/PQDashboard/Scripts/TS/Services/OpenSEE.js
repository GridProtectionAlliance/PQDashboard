"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var OpenSEEService = (function () {
    function OpenSEEService() {
    }
    OpenSEEService.prototype.getEventData = function (filters) {
        return axios_1.default
            .get("/Main/GetEventData?eventId=" + filters.eventId +
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