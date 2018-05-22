//******************************************************************************************************
//  OpenSEE.ts - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
export default class OpenSEEService{
    getData(filters, dataType) {
        return $.ajax({
            type: "GET",
            url: `${window.location.origin}/api/OpenSEE/GetData?eventId=${filters.eventId}` +
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` +
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}` +
                `&pixels=${filters.pixels}` +
                `&type=${filters.type}` +
                `&dataType=${dataType}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    getFaultDistanceData(filters) {
        return $.ajax({
            type: "GET",
            url: `${window.location.origin}/api/OpenSEE/GetFaultDistanceData?eventId=${filters.eventId}` +
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` +
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}` +
                `&pixels=${filters.pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    getBreakerDigitalsData(filters) {
        return $.ajax({
            type: "GET",
            url: `${window.location.origin}/api/OpenSEE/GetBreakerData?eventId=${filters.eventId}` +
                 `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                 `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                 `&pixels=${filters.pixels}`+
                 `&type=${filters.type}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    getHeaderData(filters) {
        return $.ajax({
            type: "GET",
            url: `${window.location.origin}/api/OpenSEE/GetHeaderData?eventId=${filters.eventid}` +
                `${filters.breakeroperation != undefined ? `&breakeroperation=${filters.breakeroperation}` : ``}` ,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

}