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
//  08/20/2019 - Christoph Lackner
//       Added Relay Performance.
//
//******************************************************************************************************
declare var homePath: string;

export type StandardAnalyticServiceFunction = (eventid: number, pixels: number, startDate?: string, endDate?: string) => JQuery.jqXHR
export type BarChartAnalyticServiceFunction = (eventid: number, startDate?: string, endDate?: string) => JQuery.jqXHR

export default class OpenSEEService{
    waveformVoltageDataHandle: JQuery.jqXHR;
    waveformCurrentDataHandle: JQuery.jqXHR;
    waveformTCEDataHandle: JQuery.jqXHR;
    relaystatisticsDataHandle: JQuery.jqXHR;
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
    clippedWaveformDataHandle: JQuery.jqXHR;
    rapidVoltageChangeDataHandle: JQuery.jqXHR;
    thdDataHandle: JQuery.jqXHR;
    freqencyAnalyticDataHandle: JQuery.jqXHR;
    fftDataHandle: JQuery.jqXHR;
    specifiedHarmonicDataHandle: JQuery.jqXHR;
    overlappingWaveformDataHandle: JQuery.jqXHR;
    harmonicSpectrumDataHandle: JQuery.jqXHR;
    lighteningDataHandle: JQuery.jqXHR;
    RelayPerformanceHandle: JQuery.jqXHR;
    relayTrendHandle: JQuery.jqXHR;
    RelayTrendPerformanceHandle: JQuery.jqXHR;

    constructor() {
        this.getWaveformVoltageData = this.getWaveformVoltageData.bind(this);
        this.getWaveformCurrentData = this.getWaveformCurrentData.bind(this);

        this.getFaultDistanceData = this.getFaultDistanceData.bind(this);
        this.getDigitalsData = this.getDigitalsData.bind(this);
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
        this.getClippedWaveformData = this.getClippedWaveformData.bind(this);
        this.getRapidVoltageChangeData = this.getRapidVoltageChangeData.bind(this);
        this.getTHDData = this.getTHDData.bind(this);
        this.getFrequencyAnalyticData = this.getFrequencyAnalyticData.bind(this);
        this.getFFTData = this.getFFTData.bind(this);
        this.getSpecifiedHarmonicData = this.getSpecifiedHarmonicData.bind(this);
        this.getOverlappingWaveformData = this.getOverlappingWaveformData.bind(this);
        this.getHarmonicSpectrumData = this.getHarmonicSpectrumData.bind(this);
        this.getStatisticData = this.getStatisticData.bind(this);
        this.getRelayTrendData = this.getRelayTrendData.bind(this);
        this.getRelayTrendPerformance = this.getRelayTrendPerformance.bind(this);
    }
    

    getWaveformVoltageData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.waveformVoltageDataHandle !== undefined)
            this.waveformVoltageDataHandle.abort();

        this.waveformVoltageDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=Voltage` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.waveformVoltageDataHandle;
    }

    getWaveformCurrentData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.waveformCurrentDataHandle !== undefined)
            this.waveformCurrentDataHandle.abort();

        this.waveformCurrentDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=Current` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.waveformCurrentDataHandle;
    }

    getWaveformTCEData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.waveformTCEDataHandle !== undefined)
            this.waveformTCEDataHandle.abort();

        this.waveformTCEDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=TripCoilCurrent` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.waveformTCEDataHandle;
    }

    getStatisticData(eventid: number, pixels: number, type: string, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.relaystatisticsDataHandle !== undefined)
            this.relaystatisticsDataHandle.abort();

        this.relaystatisticsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventid=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=${type}` +
                `&dataType=Statistics`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.relaystatisticsDataHandle;
    }

    getRelayTrendData(lineID: number, channelID: number): JQuery.jqXHR {
        if (this.relayTrendHandle !== undefined)
            this.relayTrendHandle.abort();

        this.relayTrendHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetTrend?breakerid=${lineID}&channelid=${channelID}`,                
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

        return this.relayTrendHandle;
    }


    getFrequencyData(eventid: number, pixels: number, type: string, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.frequencyDataHandle !== undefined)
            this.frequencyDataHandle.abort();

        this.frequencyDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=${type}` +
                `&dataType=Freq`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.frequencyDataHandle;
    }

    getFaultDistanceData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.faultDistanceDataHandle !== undefined)
            this.faultDistanceDataHandle.abort();

        this.faultDistanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetFaultDistanceData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.faultDistanceDataHandle;
    }

    getDigitalsData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.breakerDigitalsDataHandle !== undefined)
            this.breakerDigitalsDataHandle.abort();

        this.breakerDigitalsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetBreakerData?eventId=${eventid}` +
                 `${startDate != undefined ? `&startDate=${startDate}` : ``}` + 
                 `${endDate != undefined ? `&endDate=${endDate}` : ``}`+
                 `&pixels=${pixels}`,
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

    getRelayPerformance(breakerid): JQuery.jqXHR {
        if (this.RelayPerformanceHandle !== undefined)
            this.RelayPerformanceHandle.abort();

        this.RelayPerformanceHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/getRelayPerformance?eventId=${breakerid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.RelayPerformanceHandle;
    }

    getRelayTrendPerformance(breakerid, channelId): JQuery.jqXHR {
        if (this.RelayTrendPerformanceHandle !== undefined)
            this.RelayTrendPerformanceHandle.abort();

        this.RelayTrendPerformanceHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/getRelayPerformance?lineID=${breakerid}&channelID=${channelId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.RelayTrendPerformanceHandle;
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
            cache: false,
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
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    addMultiNote(note:string, eventIDs: Array<number>): JQuery.jqXHR {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenSEE/AddMultiNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ note: note, eventIDs: eventIDs }),
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    deleteNote(note): any {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenSEE/DeleteNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    deleteMultiNote( Note:string, UserAccount: string, Timestamp: string): any {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenSEE/DeleteMultiNote`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({Note: Note, UserAccount: UserAccount, Timestamp: Timestamp}),
            cache: false,
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

    getLowPassFilterData(eventid: number, pixels: number, filterorder: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.lowPassFilterDataHandle !== undefined)
            this.lowPassFilterDataHandle.abort();

        this.lowPassFilterDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLowPassFilterData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&filter=${filterorder}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.lowPassFilterDataHandle;
    }

    getHighPassFilterData(eventid: number, pixels: number, filterorder: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.highPassFilterDataHandle !== undefined)
            this.highPassFilterDataHandle.abort();

        this.highPassFilterDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHighPassFilterData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&filter=${filterorder}`,
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

    getRectifierData(eventid: number, pixels: number,Trc: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.rectifierDataHandle !== undefined)
            this.rectifierDataHandle.abort();

        this.rectifierDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetRectifierData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&Trc=${Trc}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.rectifierDataHandle;
    }

    getClippedWaveformData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.clippedWaveformDataHandle !== undefined)
            this.clippedWaveformDataHandle.abort();

        this.clippedWaveformDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetClippedWaveformsData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.clippedWaveformDataHandle;
    }

    getRapidVoltageChangeData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.rapidVoltageChangeDataHandle !== undefined)
            this.rapidVoltageChangeDataHandle.abort();

        this.rapidVoltageChangeDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetRapidVoltageChangeData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.rapidVoltageChangeDataHandle;
    }

    getTHDData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.thdDataHandle !== undefined)
            this.thdDataHandle.abort();

        this.thdDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetTHDData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.thdDataHandle;
    }

    getFrequencyAnalyticData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.freqencyAnalyticDataHandle !== undefined)
            this.freqencyAnalyticDataHandle.abort();

        this.freqencyAnalyticDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetFrequencyData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.freqencyAnalyticDataHandle;
    }

    getFFTData(eventid: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.fftDataHandle !== undefined)
            this.fftDataHandle.abort();

        this.fftDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetFFTData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.fftDataHandle;
    }

    getSpecifiedHarmonicData(eventid: number, pixels: number, harmonic: number,startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.specifiedHarmonicDataHandle !== undefined)
            this.specifiedHarmonicDataHandle.abort();

        this.specifiedHarmonicDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetSpecifiedHarmonicData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&specifiedHarmonic=${harmonic}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.specifiedHarmonicDataHandle;
    }

    getOverlappingWaveformData(eventid: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.overlappingWaveformDataHandle !== undefined)
            this.overlappingWaveformDataHandle.abort();

        this.overlappingWaveformDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetOverlappingWaveformData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.overlappingWaveformDataHandle;
    }

    getHarmonicSpectrumData(eventid: number, cycles: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.harmonicSpectrumDataHandle !== undefined)
            this.harmonicSpectrumDataHandle.abort();

        this.harmonicSpectrumDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHarmonicSpectrumData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&cycles=${cycles}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.harmonicSpectrumDataHandle;
    }

    getLightningParameters(eventid: number): JQuery.jqXHR {
        if (this.lighteningDataHandle !== undefined)
            this.lighteningDataHandle.abort();

        this.lighteningDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLightningParameters?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.lighteningDataHandle;

    }
}