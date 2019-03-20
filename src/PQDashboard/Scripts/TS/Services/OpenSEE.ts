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
    waveformDataHandle: JQuery.jqXHR ;
    frequencyDataHandle: JQuery.jqXHR ;
    faultDistanceDataHandle: JQuery.jqXHR ;
    breakerDigitalsDataHandle: JQuery.jqXHR ;
    headerDataHandle: JQuery.jqXHR ;
    scalarStatHandle: JQuery.jqXHR ;
    harmonicStatHandle: JQuery.jqXHR ;
    correlatedSagsHandle: JQuery.jqXHR ;
    noteHandle: JQuery.jqXHR ;
    overlappingEventsHandle: JQuery.jqXHR;
    impedanceDataHandle: JQuery.jqXHR;
    powerDataHandle: JQuery.jqXHR;
    derivativeDataHandle: JQuery.jqXHR;
    removeCurrentDataHandle: JQuery.jqXHR;
    missingVoltageDataHandle: JQuery.jqXHR;
    lowPassFilterDataHandle: JQuery.jqXHR;
    highPassFilterDataHandle: JQuery.jqXHR;
    symmetricalComponentsDataHandle: JQuery.jqXHR;
    unbalanceDataHandle: JQuery.jqXHR;
    rectifierDataHandle: JQuery.jqXHR;


    constructor() {
        this.getWaveformData = this.getWaveformData.bind(this);
        this.getRemoveCurrentData = this.getRemoveCurrentData.bind(this);
        this.getHighPassFilterData = this.getHighPassFilterData.bind(this);
        this.getSymmetricalComponentsData = this.getSymmetricalComponentsData.bind(this);
        this.getUnbalanceData = this.getUnbalanceData.bind(this);
        this.getRectifierData = this.getRectifierData.bind(this);
        this.getPowerData = this.getPowerData.bind(this);
        this.getMissingVoltageData = this.getMissingVoltageData.bind(this);
        this.getLowPassFilterData = this.getLowPassFilterData.bind(this);
        this.getImpedanceData = this.getImpedanceData.bind(this);
        this.getFirstDerivativeData = this.getFirstDerivativeData.bind(this);

    }

    getWaveformData(filters): JQuery.jqXHR{
        if (this.waveformDataHandle !== undefined)
            this.waveformDataHandle.abort();

        this.waveformDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${filters.eventId}` +
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

    getFrequencyData(filters): JQuery.jqXHR{
        if (this.frequencyDataHandle !== undefined)
            this.frequencyDataHandle.abort();

        this.frequencyDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${filters.eventId}` +
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

    getFaultDistanceData(filters): JQuery.jqXHR{
        if (this.faultDistanceDataHandle !== undefined)
            this.faultDistanceDataHandle.abort();

        this.faultDistanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetFaultDistanceData?eventId=${filters.eventId}` +
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

    getBreakerDigitalsData(filters): JQuery.jqXHR{
        if (this.breakerDigitalsDataHandle !== undefined)
            this.breakerDigitalsDataHandle.abort();

        this.breakerDigitalsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetBreakerData?eventId=${filters.eventId}` +
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

    getHeaderData(filters): JQuery.jqXHR {
        if (this.headerDataHandle !== undefined)
            this.headerDataHandle.abort();

        this.headerDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${filters.eventid}` +
                `${filters.breakeroperation != undefined ? `&breakeroperation=${filters.breakeroperation}` : ``}` ,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.headerDataHandle;
    }

    getScalarStats(eventid): JQuery.jqXHR {
        if (this.scalarStatHandle !== undefined)
            this.scalarStatHandle.abort();

        this.scalarStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetScalarStats?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.scalarStatHandle;
    }

    getHarmonicStats(eventid): JQuery.jqXHR {
        if (this.harmonicStatHandle !== undefined)
            this.harmonicStatHandle.abort();

        this.harmonicStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHarmonics?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.harmonicStatHandle;
    }

    getTimeCorrelatedSags(eventid): JQuery.jqXHR{
        if (this.correlatedSagsHandle !== undefined)
            this.correlatedSagsHandle.abort();

        this.correlatedSagsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetTimeCorrelatedSags?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.correlatedSagsHandle;
    }

    getNotes(eventid): JQuery.jqXHR {
        if (this.noteHandle !== undefined)
            this.noteHandle.abort();

        this.noteHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetNotes?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.noteHandle;

    }

    addNote(note): JQuery.jqXHR{
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenSEE/AddNote`,
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

    deleteNote(note): JQuery.jqXHR {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenSEE/DeleteNote`,
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

    updateNote(note): JQuery.jqXHR{
        return $.ajax({
            type: "PATCH",
            url: `${homePath}api/OpenSEE/UpdateNote`,
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

    getOverlappingEvents(eventid: number, startDate?: string, endDate?: string): JQuery.jqXHR  {
        if (this.overlappingEventsHandle !== undefined)
            this.overlappingEventsHandle.abort();

        this.overlappingEventsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetOverlappingEvents?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.overlappingEventsHandle;

    }

    getImpedanceData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.impedanceDataHandle !== undefined)
            this.impedanceDataHandle.abort();

        this.impedanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetImpedanceData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.impedanceDataHandle;
    }

    getPowerData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.powerDataHandle !== undefined)
            this.powerDataHandle.abort();

        this.powerDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetPowerData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.powerDataHandle;
    }

    getFirstDerivativeData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.derivativeDataHandle !== undefined)
            this.derivativeDataHandle.abort();

        this.derivativeDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetFirstDerivativeData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.derivativeDataHandle;
    }

    getRemoveCurrentData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.removeCurrentDataHandle !== undefined)
            this.removeCurrentDataHandle.abort();

        this.removeCurrentDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetRemoveCurrentData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.removeCurrentDataHandle;
    }

    getMissingVoltageData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.missingVoltageDataHandle !== undefined)
            this.missingVoltageDataHandle.abort();

        this.missingVoltageDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetMissingVoltageData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.missingVoltageDataHandle;
    }

    getLowPassFilterData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.lowPassFilterDataHandle !== undefined)
            this.lowPassFilterDataHandle.abort();

        this.lowPassFilterDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLowPassFilterData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.lowPassFilterDataHandle;
    }

    getHighPassFilterData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.highPassFilterDataHandle !== undefined)
            this.highPassFilterDataHandle.abort();

        this.highPassFilterDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHighPassFilterData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.highPassFilterDataHandle;
    }

    getSymmetricalComponentsData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.symmetricalComponentsDataHandle !== undefined)
            this.symmetricalComponentsDataHandle.abort();

        this.symmetricalComponentsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetSymmetricalComponentsData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.symmetricalComponentsDataHandle;
    }

    getUnbalanceData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.unbalanceDataHandle !== undefined)
            this.unbalanceDataHandle.abort();

        this.unbalanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetUnbalanceData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.unbalanceDataHandle;
    }

    getRectifierData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.rectifierDataHandle !== undefined)
            this.rectifierDataHandle.abort();

        this.rectifierDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetRectifierData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.rectifierDataHandle;
    }

}