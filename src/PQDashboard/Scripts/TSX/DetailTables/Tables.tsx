//******************************************************************************************************
//  TimeDetailTable.tsx - Gbtc
//
//  Copyright © 2024, Grid Protection Alliance.  All Rights Reserved.
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
//  06/17/2024 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import _ from 'lodash';
import { PQDashboard } from '../global';
import { ReactTable } from '@gpa-gemstone/react-table';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import moment from 'moment';

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
    TreeFaultResistance: any //retype 
    LightningMilliseconds: any //retype,
    InceptionDistanceFromPeak: any,//retype 
    PrefaultThirdHarmonic: any,//retype 
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
    BreakerNumber: any,
    PhaseName: any,
    Timing: number,
    StatusTiming: number,
    Speed: any,
    Chatter: any,
    DcOffset: any,
    OperationType: any,
    notecount: any
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

declare let homePath;
declare let seBrowserInstance;
declare let openSEEInstance;


export const CommonTable = (props: ITableProps<ICommonData>) => {
    const Columns = React.useMemo(() => {
        if (props.Data.length === 0 || props.Data == null) return []
        return Object.keys(props.Data[0]).filter(key => key != 'Site' && key != 'EventID' && key != 'MeterID')
    }, [props.Data])

    return (
        <ReactTable.Table<ICommonData>
            TableClass="table table-hover"
            TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
            TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
            RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            Data={props.Data}
            SortKey=''
            Ascending={false}
            OnSort={() => { }}
            KeySelector={(row, index) => index ?? -1}
        >
            <ReactTable.Column<ICommonData>
                Key={'Site'}
                Field={'Site'}
                Content={({ item }) => {
                    if (props.Tab === 'Events')
                        return <button className="btn btn-link" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}>{item.Site}</button>
                    if (props.Tab === 'Disturbances')
                        return <button className="btn btn-link" onClick={() => openWindowToMeterDisturbancesByLine(item.EventID, props.TimeContext)}>{item.Site}</button>
                    else
                        return item.Site
                }}
            >
                Name
            </ReactTable.Column>
            {Columns.map((col, index) => (
                <ReactTable.Column<ICommonData>
                    Key={`${col}-${index}`}
                    Field={`${col as keyof ICommonData}`}
                >
                    {col}
                </ReactTable.Column>
            ))}

        </ReactTable.Table>
    )
}

export const FaultsTable = (props: ITableProps<IFaultData>) => {
    return (
        <>
            <ReactTable.Table
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<IFaultData>
                    Key={'InceptionTime'}
                    Field={'InceptionTime'}
                    Content={({ item }) => {
                        return <button className="btn btn-link" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}>{item.InceptionTime}</button>
                    }}
                >
                    Start Time
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'AssetName'}
                    Field={'AssetName'}
                >
                    Asset
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'AssetType'}
                    Field={'AssetType'}
                >
                    Asset Type
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'kV'}
                    Field={'kV'}
                />
                <ReactTable.Column<IFaultData>
                    Key={'FaultType'}
                    Field={'FaultType'}
                >
                    Type
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'CalcCause'}
                    Field={'FaultType'}
                    Content={({ item }) => findFaultCause(item)}
                >
                    Calc. Cause
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'CurrentDistance'}
                    Field={'CurrentDistance'}
                >
                    Miles
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'LocationName'}
                    Field={'LocationName'}
                >
                    Location
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'openSEE'}
                    Field={'LocationName'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToOpenSEE(item.EventID, '', props.Tab)}><img src={`/Images/seeButton.png`} /></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'faultSpecific'}
                    Field={'LocationName'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToFaultSpecifics(item.EventID)}><img src={`/Images/faultDetailButton.png`} /></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
                <ReactTable.Column<IFaultData>
                    Key={'Notes'}
                    Field={'LocationName'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}><ReactIcons.Pencil /></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}

export const CompletenessTable = (props: ITableProps<ICompletenessData>) => {
    return (
        <>
            <ReactTable.Table<ICompletenessData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<ICompletenessData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<ICompletenessData>
                    Key={'Expected'}
                    Field={'Expected'}
                >
                </ReactTable.Column>
                <ReactTable.Column<ICompletenessData>
                    Key={'Received'}
                    Field={'Received'}
                >
                </ReactTable.Column>
                <ReactTable.Column<ICompletenessData>
                    Key={'Completeness'}
                    Field={'Completeness'}
                    Content={({ item }) => {
                        return `${item.Completeness.toFixed(0)}%`
                    }}
                >
                    Complete
                </ReactTable.Column>
                <ReactTable.Column<ICompletenessData>
                    Key={'CompletenessTable'}
                    Field={'Completeness'}
                    Content={({ item }) => {
                        return <button className='btn' onClick={() => openWindowToCompletenessTable(item.EventID)}><img src="/Images/dcDetailButton.png"></img></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}


export const CorrectnessTable = (props: ITableProps<ICorrectnessData>) => {
    return (
        <>
            <ReactTable.Table<ICorrectnessData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<ICorrectnessData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<ICorrectnessData>
                    Key={'Latched'}
                    Field={'Latched'}
                    Content={({ item }) => {
                        return `${item.Latched.toFixed(0)}%`
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<ICorrectnessData>
                    Key={'Unreasonable'}
                    Field={'Unreasonable'}
                    Content={({ item }) => {
                        return `${item.Unreasonable.toFixed(0)}%`
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<ICorrectnessData>
                    Key={'Noncongruent'}
                    Field={'Noncongruent'}
                    Content={({ item }) => {
                        return `${item.Noncongruent.toFixed(0)}%`
                    }}
                />
                <ReactTable.Column<ICorrectnessData>
                    Key={'Correctness'}
                    Field={'Correctness'}
                    Content={({ item }) => {
                        return `${item.Correctness.toFixed(0)}%`
                    }}
                />
                <ReactTable.Column<ICorrectnessData>
                    Key={'CorrectnessTable'}
                    Field={'Correctness'}
                    Content={({ item }) => {
                        return <button className='btn' onClick={() => openWindowToCorrectnessTable(item.EventID)}><img src="/Images/dqDetailButton.png"></img></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}

export const BreakersTable = (props: ITableProps<IBreakersData>) => {
    return (
        <>
            <ReactTable.Table<IBreakersData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<IBreakersData>
                    Key={'LineName'}
                    Field={'LineName'}
                >
                    Line
                </ReactTable.Column>
                <ReactTable.Column<IBreakersData>
                    Key={'Energized'}
                    Field={'Energized'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}><img src="/Images/PQBrowser" /></button>
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<IBreakersData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<IBreakersData>
                    Key={'Timing'}
                    Field={'Timing'}

                />
                <ReactTable.Column<IBreakersData>
                    Key={'StatusTiming'}
                    Field={'StatusTiming'}
                >
                    Status Timing
                </ReactTable.Column>
                <ReactTable.Column<IBreakersData>
                    Key={'Speed'}
                    Field={'Speed'}
                />
                <ReactTable.Column<IBreakersData>
                    Key={'OperationType'}
                    Field={'OperationType'}
                />
                <ReactTable.Column<IBreakersData>
                    Key={'notecount'}
                    Field={'notecount'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}><ReactIcons.Pencil /></button>
                    }}
                />
            </ReactTable.Table>
        </>
    )
}


export const ExtensionsTable = (props: ITableProps<IExtensionsData>) => {
    return (
        <>
            <ReactTable.Table<IExtensionsData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<IExtensionsData>
                    Key={'Site'}
                    Field={'Site'}
                    Content={({ item }) => {
                        return <button className="btn btn-link" onClick={() => openWindowToMeterExtensionsByLine(item.EventID, props.TimeContext)}></button>
                    }}
                >
                    Name
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}

export const TrendingTable = (props: ITableProps<ITrendingData>) => {
    return (
        <>
            <ReactTable.Table<ITrendingData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<ITrendingData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<ITrendingData>
                    Key={'EventType'}
                    Field={'EventType'}
                >
                    Alarm Type
                </ReactTable.Column>
                <ReactTable.Column<ITrendingData>
                    Key={'Characteristic'}
                    Field={'Characteristic'}
                />
                <ReactTable.Column<ITrendingData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<ITrendingData>
                    Key={'HarmonicGroup'}
                    Field={'HarmonicGroup'}
                >
                    HG
                </ReactTable.Column>
                <ReactTable.Column<ITrendingData>
                    Key={'EventCount'}
                    Field={'EventCount'}
                >
                    Count
                </ReactTable.Column>
                <ReactTable.Column<ITrendingData>
                    Key={'openSTE'}
                    Field={'EventCount'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToOpenSTE(item.ChannelID, item.Date, item.MeterID, item.MeasurementType, item.Characteristic, item.PhaseName)}><img src="/Images/steButton.png"></img></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}

export const TrendingDataTable = (props: ITableProps<ITrendingDataData>) => {
    return (
        <>
            <ReactTable.Table<ITrendingDataData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey=''
                Ascending={false}
                OnSort={() => { }}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<ITrendingDataData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<ITrendingDataData>
                    Key={'Characteristic'}
                    Field={'Characteristic'}
                />
                <ReactTable.Column<ITrendingDataData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<ITrendingDataData>
                    Key={'Minimum'}
                    Field={'Minimum'}
                />
                <ReactTable.Column<ITrendingDataData>
                    Key={'Maximum'}
                    Field={'Maximum'}
                />
                <ReactTable.Column<ITrendingDataData>
                    Key={'Average'}
                    Field={'Average'}
                />
                <ReactTable.Column<ITrendingDataData>
                    Key={'openSTE'}
                    Field={'Average'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToOpenSTE(item.ChannelID, item.Date, item.MeterID, item.MeasurementType, item.Characteristic, item.PhaseName)}><img src="/Images/steButton.png"></img></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
            </ReactTable.Table>
        </>
    )
}

//Helper Functions
const findFaultCause = (item: IFaultData) => {
    let cause = "unknown";
    let highFound = false;
    let medFound = false;

    if (item.LowPrefaultCurrentRatio != undefined) {
        if (item.LowPrefaultCurrentRatio <= 0.1) {
            highFound = true;
            cause = "Break";
        } else if (item.LowPrefaultCurrentRatio <= 0.5) {
            medFound = true;
            cause = "Break??";
        }
    }
    if (item.LightningMilliseconds != undefined) {
        if (item.LightningMilliseconds <= 2) {
            if (highFound)
                return cause + "?";
            highFound = true;
            cause = "Lightning";
        } else if (!highFound && !medFound) {
            medFound = true;
            cause = "Lightning??";
        }
    }
    if (item.TreeFaultResistance != undefined) {
        if (item.TreeFaultResistance > 20) {
            if (highFound)
                return cause + "?";
            highFound = true;
            cause = "Tree";
        } else if (item.TreeFaultResistance > 10 && !highFound && !medFound) {
            medFound = true;
            cause = "Tree??";
        }
    }
    if (item.GroundCurrentRatio != undefined) {
        if (item.GroundCurrentRatio <= 0.1) {
            if (highFound)
                return cause + "?";
            highFound = true;
            cause = "Slap/Debris";
        } else if (item.GroundCurrentRatio <= 0.5 && !highFound && !medFound) {
            medFound = true;
            cause = "Slap/Debris??";
        }
    }
    if (item.PrefaultThirdHarmonic != undefined) {
        if (item.PrefaultThirdHarmonic > 0.3) {
            if (highFound)
                return cause + "?";
            highFound = true;
            cause = "Arrester";
        } else if (item.PrefaultThirdHarmonic > 0.2 && !highFound && !medFound) {
            medFound = true;
            cause = "Arrester??";
        }
    }
    if (item.InceptionDistanceFromPeak != undefined) {
        if (item.InceptionDistanceFromPeak <= 15) {
            if (highFound)
                return cause + "?";
            highFound = true;
            cause = "Insulator";
        } else if (item.InceptionDistanceFromPeak <= 30 && !highFound && !medFound) {
            medFound = true;
            cause = "Insulator??";
        }
    }

    return cause;
}

const openWindowToPQBrowser = (meterID, eventID, timeContext, startTime) => {
    const eventDateFormat = "YYYY-MM-DD HH:mm:ss.fffffff";
    const dateFormat = "MM/DD/YYYY";
    const timeFormat = "HH:mm:ss.SSS";
    const units = { 'day': 3, 'hour': 2, 'minute': 1, 'second': 0 };
    const sizes = { 'day': 12, 'hour': 30, 'minute': 30, 'second': 500 };
    const adjustments = { 'day': 43200000, 'hour': 1800000, 'minute': 30000, 'second': 500 };

    const windowUnits = units[timeContext];
    const windowSize = sizes[timeContext];

    const dateAdjusted = new Date(new Date(startTime).valueOf() + adjustments[timeContext]);
    const date = moment.utc(dateAdjusted, eventDateFormat).format(dateFormat);
    const time = moment.utc(dateAdjusted, eventDateFormat).format(timeFormat);

    window.open(`${seBrowserInstance.replace(/\/$/, "")}/EventSearch?meters0=${meterID}&eventid=${eventID}&date=${date}&time=${time}&windowSize=${windowSize.toString()}&timeWindowUnits=${windowUnits.toString()}`);
}

const openWindowToMeterDisturbancesByLine = (id, timeContext) => {
    const origin = _.cloneDeep(window.location.origin)
    window.open(`${origin}${homePath}Main/MeterDisturbancesByLine?eventid=${id}&context=${timeContext}`)
}

const openWindowToOpenSEE = (eventID, breaker, tab) => {
    let url = openSEEInstance + "?eventid=" + eventID;
    if (tab === "Breakers")
        url += "&breakeroperation=" + breaker + "&breakerdigitals=1";

    window.open(url, eventID + "openSEE");
}

const openWindowToFaultSpecifics = (eventID) => {
    window.open(`${window.location.origin}${homePath}FaultSpecifics.aspx?eventid=${eventID}`)
}

const openWindowToCompletenessTable = (eventID) => {
    window.open(`${window.location.origin}${homePath}ChannelDataCompleteness.aspx?summaryid=${eventID}`)
}

const openWindowToCorrectnessTable = (eventID) => {
    window.open(`${window.location.origin}${homePath}ChannelDataQuality.aspx?summaryid=${eventID}`)
}

function openWindowToMeterExtensionsByLine(eventID, context) {
    window.open(`${window.location.origin}${homePath}Main/MeterExtensionsByLine?eventid=${eventID}&context=${context}`)
}

function openWindowToOpenSTE(channelID, date, meterID, measurementType, characteristic, phaseName) {
    window.open(`${window.location.origin}${homePath}Main/openSTE?channelid=${channelID}&date=${date}&meterid=${meterID}&measurementtype=${measurementType}&characteristic=${characteristic}&phasename=${phaseName}`);
}
