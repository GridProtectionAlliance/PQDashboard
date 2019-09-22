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

export default class PQDashboardService {
    mostActiveMeterHandle: JQuery.jqXHR;
    leastActiveMeterHandle: JQuery.jqXHR;
    filesProcessedMeterHandle: JQuery.jqXHR;
    fileGroupEventsHandle: JQuery.jqXHR;
    eventSearchHandle: JQuery.jqXHR;
    eventSearchAssetVoltageDisturbancesHandle: JQuery.jqXHR;
    eventSearchAssetFaultSegmentsHandle: JQuery.jqXHR;
    eventSearchAssetHistoryHandle: JQuery.jqXHR;
    subStationRelayReportHandle: JQuery.jqXHR;
    BreakerRelayReportHandle: JQuery.jqXHR;


    constructor() {
        this.getMostActiveMeterActivityData = this.getMostActiveMeterActivityData.bind(this);
        this.getLeastActiveMeterActivityData = this.getLeastActiveMeterActivityData.bind(this);

        this.getEventSearchData = this.getEventSearchData.bind(this);
        this.getEventSearchAsssetVoltageDisturbancesData = this.getEventSearchAsssetVoltageDisturbancesData.bind(this);
        this.getEventSearchAsssetFaultSegmentsData = this.getEventSearchAsssetFaultSegmentsData.bind(this);
        this.getEventSearchAsssetHistoryData = this.getEventSearchAsssetHistoryData.bind(this);

        this.GetSubStationData = this.GetSubStationData.bind(this);
        this.GetBreakerData = this.GetBreakerData.bind(this);
    }

    getMostActiveMeterActivityData(numresults: number, column: string): JQuery.jqXHR {
        if (this.mostActiveMeterHandle !== undefined)
            this.mostActiveMeterHandle.abort();

        this.mostActiveMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/MeterActivity/GetMostActiveMeterActivityData?numresults=${numresults}` +
                `&column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.mostActiveMeterHandle;
    }

    GetSubStationData(): JQuery.jqXHR {
        if (this.subStationRelayReportHandle !== undefined)
            this.subStationRelayReportHandle.abort();

        this.subStationRelayReportHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetSubstationData`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.subStationRelayReportHandle;
    }

    GetBreakerData(substationID: number): JQuery.jqXHR {
        if (this.BreakerRelayReportHandle !== undefined)
            this.BreakerRelayReportHandle.abort();

        this.BreakerRelayReportHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetLineData?locationID=${substationID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.BreakerRelayReportHandle;
    }

    getLeastActiveMeterActivityData(numresults: number, column: string): JQuery.jqXHR {
        if (this.leastActiveMeterHandle !== undefined)
            this.leastActiveMeterHandle.abort();

        this.leastActiveMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/MeterActivity/GetLeastActiveMeterActivityData?numresults=${numresults}` +
                `&column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.leastActiveMeterHandle;
    }

    getFilesProcessedMeterActivityData(column: string): JQuery.jqXHR {
        if (this.filesProcessedMeterHandle !== undefined)
            this.filesProcessedMeterHandle.abort();

        this.filesProcessedMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/MeterActivity/GetFilesProcessedLast24Hrs?column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.filesProcessedMeterHandle;
    }

    getFileGroupEvents(fileGroupID: number): JQuery.jqXHR {
        if (this.fileGroupEventsHandle !== undefined)
            this.fileGroupEventsHandle.abort();

        this.fileGroupEventsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/MeterActivity/QueryFileGroupEvents?FileGroupID=${fileGroupID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.fileGroupEventsHandle;
    }


    getEventSearchData(params): JQuery.jqXHR {
        if (this.eventSearchHandle !== undefined)
            this.eventSearchHandle.abort();

        this.eventSearchHandle = $.ajax({
            type: "POST",
            url: `${homePath}api/PQDashboard/GetEventSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.eventSearchHandle;
    }

    getEventSearchAsssetVoltageDisturbancesData(eventID: number): JQuery.jqXHR {
        if (this.eventSearchAssetVoltageDisturbancesHandle !== undefined)
            this.eventSearchAssetVoltageDisturbancesHandle.abort();

        this.eventSearchAssetVoltageDisturbancesHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/GetEventSearchAssetVoltageDisturbances?EventID=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.eventSearchAssetVoltageDisturbancesHandle;
    }

    getEventSearchAsssetFaultSegmentsData(eventID: number): JQuery.jqXHR {
        if (this.eventSearchAssetFaultSegmentsHandle !== undefined)
            this.eventSearchAssetFaultSegmentsHandle.abort();

        this.eventSearchAssetFaultSegmentsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/GetEventSearchFaultSegments?EventID=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.eventSearchAssetFaultSegmentsHandle;
    }

    getEventSearchAsssetHistoryData(eventID: number): JQuery.jqXHR {
        if (this.eventSearchAssetHistoryHandle !== undefined)
            this.eventSearchAssetHistoryHandle.abort();

        this.eventSearchAssetHistoryHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/GetEventSearchHistory?EventID=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.eventSearchAssetHistoryHandle;
    }


}
