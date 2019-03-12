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
declare var homePath: string;

export default class OpenSEEService{
    waveformDataHandle: any;
    frequencyDataHandle: any;
    faultDistanceDataHandle: any;
    breakerDigitalsDataHandle: any;
    headerDataHandle: any;
    scalarStatHandle: any;
    harmonicStatHandle: any;
    correlatedSagsHandle: any;
    noteHandle: any;

    getWaveformData(filters) {
        if (this.waveformDataHandle !== undefined)
            this.waveformDataHandle.abort();

        this.waveformDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetData?eventId=${filters.eventId}` +
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` +
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}` +
                `&pixels=${filters.pixels}` +
                `&type=${filters.type}` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.waveformDataHandle;
    }

    getFrequencyData(filters) {
        if (this.frequencyDataHandle !== undefined)
            this.frequencyDataHandle.abort();

        this.frequencyDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetData?eventId=${filters.eventId}` +
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` +
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}` +
                `&pixels=${filters.pixels}` +
                `&type=${filters.type}` +
                `&dataType=Freq`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.frequencyDataHandle;
    }

    getFaultDistanceData(filters) {
        if (this.faultDistanceDataHandle !== undefined)
            this.faultDistanceDataHandle.abort();

        this.faultDistanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetFaultDistanceData?eventId=${filters.eventId}` +
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` +
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}` +
                `&pixels=${filters.pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.faultDistanceDataHandle;
    }

    getBreakerDigitalsData(filters) {
        if (this.breakerDigitalsDataHandle !== undefined)
            this.breakerDigitalsDataHandle.abort();

        this.breakerDigitalsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetBreakerData?eventId=${filters.eventId}` +
                 `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                 `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                 `&pixels=${filters.pixels}`+
                 `&type=${filters.type}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.breakerDigitalsDataHandle;
    }

    getHeaderData(filters) {
        if (this.headerDataHandle !== undefined)
            this.headerDataHandle.abort();

        this.headerDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetHeaderData?eventId=${filters.eventid}` +
                `${filters.breakeroperation != undefined ? `&breakeroperation=${filters.breakeroperation}` : ``}` ,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.headerDataHandle;
    }

    getScalarStats(eventid) {
        if (this.scalarStatHandle !== undefined)
            this.scalarStatHandle.abort();

        this.scalarStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetScalarStats?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.scalarStatHandle;
    }

    getHarmonicStats(eventid) {
        if (this.harmonicStatHandle !== undefined)
            this.harmonicStatHandle.abort();

        this.harmonicStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetHarmonics?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.harmonicStatHandle;
    }

    getTimeCorrelatedSags(eventid) {
        if (this.correlatedSagsHandle !== undefined)
            this.correlatedSagsHandle.abort();

        this.correlatedSagsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetTimeCorrelatedSags?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.correlatedSagsHandle;
    }

    getNotes(eventid) {
        if (this.noteHandle !== undefined)
            this.noteHandle.abort();

        this.noteHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE2/GetNotes?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.noteHandle;

    }

    addNote(note) {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenSEE2/AddNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            cache: true,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    deleteNote(note) {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenSEE2/DeleteNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            cache: true,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    updateNote(note) {
        return $.ajax({
            type: "PATCH",
            url: `${homePath}api/OpenSEE2/UpdateNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            cache: true,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }


}