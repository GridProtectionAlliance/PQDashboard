"use strict";
//******************************************************************************************************
//  PQDashboard.ts - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
Object.defineProperty(exports, "__esModule", { value: true });
var PQDashboardService = /** @class */ (function () {
    function PQDashboardService() {
        this.getMostActiveMeterActivityData = this.getMostActiveMeterActivityData.bind(this);
        this.getLeastActiveMeterActivityData = this.getLeastActiveMeterActivityData.bind(this);
        this.getEventSearchData = this.getEventSearchData.bind(this);
        this.getEventSearchAsssetVoltageDisturbancesData = this.getEventSearchAsssetVoltageDisturbancesData.bind(this);
        this.getEventSearchAsssetFaultSegmentsData = this.getEventSearchAsssetFaultSegmentsData.bind(this);
        this.getEventSearchAsssetHistoryData = this.getEventSearchAsssetHistoryData.bind(this);
    }
    PQDashboardService.prototype.getMostActiveMeterActivityData = function (numresults, column) {
        if (this.mostActiveMeterHandle !== undefined)
            this.mostActiveMeterHandle.abort();
        this.mostActiveMeterHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/MeterActivity/GetMostActiveMeterActivityData?numresults=" + numresults +
                ("&column=" + column),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.mostActiveMeterHandle;
    };
    PQDashboardService.prototype.getLeastActiveMeterActivityData = function (numresults, column) {
        if (this.leastActiveMeterHandle !== undefined)
            this.leastActiveMeterHandle.abort();
        this.leastActiveMeterHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/MeterActivity/GetLeastActiveMeterActivityData?numresults=" + numresults +
                ("&column=" + column),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.leastActiveMeterHandle;
    };
    PQDashboardService.prototype.getFilesProcessedMeterActivityData = function (column) {
        if (this.filesProcessedMeterHandle !== undefined)
            this.filesProcessedMeterHandle.abort();
        this.filesProcessedMeterHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/MeterActivity/GetFilesProcessedLast24Hrs?column=" + column,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.filesProcessedMeterHandle;
    };
    PQDashboardService.prototype.getFileGroupEvents = function (fileGroupID) {
        if (this.fileGroupEventsHandle !== undefined)
            this.fileGroupEventsHandle.abort();
        this.fileGroupEventsHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/MeterActivity/QueryFileGroupEvents?FileGroupID=" + fileGroupID,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.fileGroupEventsHandle;
    };
    PQDashboardService.prototype.getEventSearchData = function (params) {
        if (this.eventSearchHandle !== undefined)
            this.eventSearchHandle.abort();
        this.eventSearchHandle = $.ajax({
            type: "POST",
            url: homePath + "api/PQDashboard/GetEventSearchData",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.eventSearchHandle;
    };
    PQDashboardService.prototype.getEventSearchAsssetVoltageDisturbancesData = function (eventID) {
        if (this.eventSearchAssetVoltageDisturbancesHandle !== undefined)
            this.eventSearchAssetVoltageDisturbancesHandle.abort();
        this.eventSearchAssetVoltageDisturbancesHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/GetEventSearchAssetVoltageDisturbances?EventID=" + eventID,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.eventSearchAssetVoltageDisturbancesHandle;
    };
    PQDashboardService.prototype.getEventSearchAsssetFaultSegmentsData = function (eventID) {
        if (this.eventSearchAssetFaultSegmentsHandle !== undefined)
            this.eventSearchAssetFaultSegmentsHandle.abort();
        this.eventSearchAssetFaultSegmentsHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/GetEventSearchFaultSegments?EventID=" + eventID,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.eventSearchAssetFaultSegmentsHandle;
    };
    PQDashboardService.prototype.getEventSearchAsssetHistoryData = function (eventID) {
        if (this.eventSearchAssetHistoryHandle !== undefined)
            this.eventSearchAssetHistoryHandle.abort();
        this.eventSearchAssetHistoryHandle = $.ajax({
            type: "GET",
            url: homePath + "api/PQDashboard/GetEventSearchHistory?EventID=" + eventID,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.eventSearchAssetHistoryHandle;
    };
    return PQDashboardService;
}());
exports.default = PQDashboardService;
//# sourceMappingURL=PQDashboard.js.map