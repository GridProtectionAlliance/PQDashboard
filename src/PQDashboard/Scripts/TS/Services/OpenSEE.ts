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

import axios from 'axios';
import * as moment from 'moment'; 

export default class OpenSEEService{
    getVoltageEventData(filters) {
        return axios
            .get(`/Main/GetVoltageEventData?eventId=${filters.eventId}` + 
                    `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                    `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                    `&pixels=${filters.pixels}`)
            .then(res => {
                return res.data;
            });

    }

    getVoltageFrequencyData(filters) {
        return axios
            .get(`/Main/GetVoltageFrequencyData?eventId=${filters.eventId}` + 
                    `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                    `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                    `&pixels=${filters.pixels}`)
            .then(res => {
                return res.data;
            });

    }

    getCurrentEventData(filters) {
        return axios
            .get(`/Main/GetCurrentEventData?eventId=${filters.eventId}` + 
                    `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                    `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                    `&pixels=${filters.pixels}`+
                    `&type=${filters.type}`)
            .then(res => {
                return res.data;
            });

    }

    getCurrentFrequencyData(filters) {
    return axios
        .get(`/Main/GetEventData?eventId=${filters.eventId}` + 
                `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                `&pixels=${filters.pixels}`+
                `&type=${filters.type}`)
        .then(res => {
            return res.data;
        });

    }

    getFaultDistanceData(filters) {
        return axios
            .get(`/Main/GetFaultDistanceData?eventId=${filters.eventId}` + 
                    `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                    `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                    `&pixels=${filters.pixels}`)
            .then(res => {
                return res.data;
            });

    }

    getBreakerDigitalsData(filters) {
        return axios
            .get(`/Main/GetEventData?eventId=${filters.eventId}` + 
                    `${filters.startDate != undefined ? `&startDate=${filters.startDate}` : ``}` + 
                    `${filters.endDate != undefined ? `&endDate=${filters.endDate}` : ``}`+
                    `&pixels=${filters.pixels}`+
                    `&type=${filters.type}`)
            .then(res => {
                return res.data;
            });

    }


}