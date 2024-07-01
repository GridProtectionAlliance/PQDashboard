//******************************************************************************************************
//  interfaces.d.ts - Gbtc
//
//  Copyright (c) 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  07/01/2024 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************s

import { PQDashboard } from '../global';

/* eslint-disable @typescript-eslint/no-unused-vars */

export namespace Table {
    interface IFaultData {
        FaultID: number,
        Site: string,
        ShortName: string,
        LocationName: string,
        MeterID: number,
        LineID: number,
        EventID: number,
        AssetName: string,
        AssetType: string,
        kV: number,
        InceptionTime: string,
        FaultType: string,
        TreeFaultResistance: number
        LightningMilliseconds: number
        InceptionDistanceFromPeak: number,
        PrefaultThirdHarmonic: number,
        GroundCurrentRatio: number,
        LowPrefaultCurrentRatio: number,
        CurrentDistance: string,
        noteCount: number,
        RK: number,
    }

    interface ICompletenessData {
        EventID: number,
        MeterID: number,
        Site: string,
        Expected: number,
        Received: number,
        Completeness: number
    }

    interface ICorrectnessData {
        EventID: number,
        MeterID: number,
        Site: string,
        Latched: number,
        Unreasonable: number,
        Noncongruent: number,
        Correctness: number
    }

    interface IBreakersData {
        EventID: number,
        MeterID: number,
        LineName: string,
        Energized: string,
        BreakerNumber: string,
        PhaseName: string,
        Timing: number,
        StatusTiming: number,
        Speed: number,
        Chatter: boolean,
        DcOffset: boolean,
        OperationType: string,
        notecount: number
    }

    interface IExtensionsData {
        EventID: number,
        Site: string
    }

    interface ITrendingData {
        MeterID: number,
        ChannelID: number,
        Site: string,
        EventType: string,
        Characteristic: string,
        MeasurementType: string,
        PhaseName: string,
        HarmonicGroup: string,
        EventCount: number,
        Date: string
    }

    interface ITrendingDataData {
        MeterID: number,
        Site: string,
        ChannelID: number,
        Date: string,
        Minimum: number,
        Maximum: number,
        Average: number,
        Characteristic: string,
        MeasurementType: string,
        PhaseName: string
    }

    interface ITableProps<T> {
        Data: T[],
        Tab: PQDashboard.Tab,
        TimeContext: PQDashboard.TimeContext,
        TargetDate: string | null,
    }

    interface ICommonData {
        MeterID: number,
        Site: string,
        EventID: number,
    }
}