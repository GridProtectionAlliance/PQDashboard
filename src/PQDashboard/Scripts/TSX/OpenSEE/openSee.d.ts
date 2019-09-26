//******************************************************************************************************
//  openSee.d.ts - Gbtc
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
//  Type definitions for openSEE.tsx
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  03/15/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Billy Ernest
//       Added TCE Plot.
//
//******************************************************************************************************

// global variables declared in openSEE.cshtml scripts section
declare var homePath: string;
declare var userIsAdmin: boolean;
declare var eventID: number;
declare var eventStartTime: string;
declare var eventEndTime: string;

declare const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';

declare interface iXDAEvent {
    Alias?: string;
    Description?: string;
    EndTime?: string;
    EventDataID?: number;
    EventTypeID?: number;
    EventTypeName?: string;
    FileGroupID?: number;
    ID?: number;
    Length?: number;
    LineID?: number;
    LineName?: string;
    MeterID?: number;
    MeterName?: string;
    Name?: string;
    Samples?: number;
    SamplesPerCycle?: number;
    SamplesPerSecond?: number;
    ShortName?: string;
    StartTime?: string;
    StationName?: string;
    UpdateBy?: string;
}

declare interface iEventTuple {
    m_Item1?: iXDAEvent;
    m_Item2?: iXDAEvent;
}

declare interface iNextBackLookup {
    Line: iEventTuple;
    Meter: iEventTuple;
    Station: iEventTuple;
    System: iEventTuple;
}

declare interface iPostedData {
    postedBreakerNumber?: string;
    postedBreakerTiming?: string;
    postedBreakerSpeed?: string;
    postedBreakerOperation?: string;
    postedCalculationCycle?: string;
    postedDate?: string;
    postedDurationPeriod?: string;
    postedEventDate?: string;
    postedEventId?: string;
    postedEventMilliseconds?: string;
    postedEventName?: string;
    postedLineLength?: string;
    postedLineName?: string;
    postedMagnitude?: string;
    postedMeterId?: string;
    postedMeterName?: string;
    postedPhase?: string;
    postedSagDepth?: string;
    postedStartTime?: string;
    postedStationName?: string;
    postedSystemFrequency?: string;
    xdaInstance?: string;
}

declare interface OpenSEEState {
    eventid: number,
    StartDate: string,
    EndDate: string,
    displayVolt: boolean,
    displayCur: boolean,
    displayTCE: boolean,
    breakerdigitals: boolean,
    Width: number,
    Hover: number,
    PointsTable: Array<any>,
    TableData: Map<string, { data: number, color: string }>,
    PostedData: iPostedData,
    nextBackLookup: iNextBackLookup,
    navigation: string,
    tab: string,
    comparedEvents: Array<number>,
    overlappingEvents: Array<iListObject>,
    analytic: string,
    fftStartTime?: string,
    fftEndTime?: string,
    TooltipWithDeltaTable: Map<string, Map<string, { data: number, color: string }>>,
    Height?: number,
    AnalyticSettings: AnalyticParamters
}

declare interface iListObject {
    group?: string;
    label: string;
    value: number;
    selected: boolean;
}
