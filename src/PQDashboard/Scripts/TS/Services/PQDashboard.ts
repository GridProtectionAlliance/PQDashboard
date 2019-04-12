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
    eventSearchHandle: JQuery.jqXHR;

    constructor() {
        this.getMostActiveMeterActivityData = this.getMostActiveMeterActivityData.bind(this);
        this.getEventSearchData = this.getEventSearchData.bind(this);

    }

    getMostActiveMeterActivityData(numresults: number, column: string): JQuery.jqXHR {
        if (this.mostActiveMeterHandle !== undefined)
            this.mostActiveMeterHandle.abort();

        this.mostActiveMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/GetMostActiveMeterActivityData?numresults=${numresults}` +
                `&column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.mostActiveMeterHandle;
    }
    getEventSearchData(): JQuery.jqXHR {
        if (this.eventSearchHandle !== undefined)
            this.eventSearchHandle.abort();

        this.eventSearchHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/GetEventSearchData`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.eventSearchHandle;
    }

}
