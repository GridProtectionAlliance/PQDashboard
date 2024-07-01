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
import { Table } from './interfaces';
import { ReactTable } from '@gpa-gemstone/react-table';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import moment from 'moment';


declare let homePath;
declare let seBrowserInstance;
declare let openSEEInstance;

export const CommonTable = (props: Table.ITableProps<Table.ICommonData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.ICommonData>('Site');
    const [data, setData] = React.useState<Table.ICommonData[]>(props.Data);

    const Columns = React.useMemo(() => {
        if (props.Data.length === 0 || props.Data == null) return []
        return Object.keys(props.Data[0]).filter(key => key != 'Site' && key != 'EventID' && key != 'MeterID')
    }, [props.Data])

    return (
        <ReactTable.Table<Table.ICommonData>
            TableClass="table table-hover"
            TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
            TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
            RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            Data={data}
            SortKey={sortField}
            Ascending={ascending}
            OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
            KeySelector={(row, index) => index ?? -1}
        >
            <ReactTable.Column<Table.ICommonData>
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
                <ReactTable.Column<Table.ICommonData>
                    Key={`${col}-${index}`}
                    Field={`${col as keyof Table.ICommonData}`}
                >
                    {col}
                </ReactTable.Column>
            ))}
        </ReactTable.Table>
    )
}

export const FaultsTable = (props: Table.ITableProps<Table.IFaultData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.IFaultData>('AssetName');
    const [data, setData] = React.useState<Table.IFaultData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.IFaultData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.IFaultData>
                    Key={'InceptionTime'}
                    Field={'InceptionTime'}
                    Content={({ item }) => {
                        return <button className="btn btn-link" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}>{item.InceptionTime}</button>
                    }}
                >
                    Start Time
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'AssetName'}
                    Field={'AssetName'}
                >
                    Asset
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'AssetType'}
                    Field={'AssetType'}
                >
                    Asset Type
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'kV'}
                    Field={'kV'}
                />
                <ReactTable.Column<Table.IFaultData>
                    Key={'FaultType'}
                    Field={'FaultType'}
                >
                    Type
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'CalcCause'}
                    Field={'FaultType'}
                    Content={({ item }) => findFaultCause(item)}
                >
                    Calc. Cause
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'CurrentDistance'}
                    Field={'CurrentDistance'}
                >
                    Miles
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'LocationName'}
                    Field={'LocationName'}
                >
                    Location
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'openSEE'}
                    Field={'LocationName'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToOpenSEE(item.EventID, '', props.Tab)}><img src={`/Images/seeButton.png`} /></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
                    Key={'faultSpecific'}
                    Field={'LocationName'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToFaultSpecifics(item.EventID)}><img src={`/Images/faultDetailButton.png`} /></button>
                    }}
                >
                    {'\u200B'}
                </ReactTable.Column>
                <ReactTable.Column<Table.IFaultData>
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

export const CompletenessTable = (props: Table.ITableProps<Table.ICompletenessData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.ICompletenessData>('Site');
    const [data, setData] = React.useState<Table.ICompletenessData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.ICompletenessData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.ICompletenessData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<Table.ICompletenessData>
                    Key={'Expected'}
                    Field={'Expected'}
                >
                </ReactTable.Column>
                <ReactTable.Column<Table.ICompletenessData>
                    Key={'Received'}
                    Field={'Received'}
                >
                </ReactTable.Column>
                <ReactTable.Column<Table.ICompletenessData>
                    Key={'Completeness'}
                    Field={'Completeness'}
                    Content={({ item }) => {
                        return `${item.Completeness.toFixed(0)}%`
                    }}
                >
                    Complete
                </ReactTable.Column>
                <ReactTable.Column<Table.ICompletenessData>
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


export const CorrectnessTable = (props: Table.ITableProps<Table.ICorrectnessData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.ICorrectnessData>('Site');
    const [data, setData] = React.useState<Table.ICorrectnessData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.ICorrectnessData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.ICorrectnessData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<Table.ICorrectnessData>
                    Key={'Latched'}
                    Field={'Latched'}
                    Content={({ item }) => {
                        return `${item.Latched.toFixed(0)}%`
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<Table.ICorrectnessData>
                    Key={'Unreasonable'}
                    Field={'Unreasonable'}
                    Content={({ item }) => {
                        return `${item.Unreasonable.toFixed(0)}%`
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<Table.ICorrectnessData>
                    Key={'Noncongruent'}
                    Field={'Noncongruent'}
                    Content={({ item }) => {
                        return `${item.Noncongruent.toFixed(0)}%`
                    }}
                />
                <ReactTable.Column<Table.ICorrectnessData>
                    Key={'Correctness'}
                    Field={'Correctness'}
                    Content={({ item }) => {
                        return `${item.Correctness.toFixed(0)}%`
                    }}
                />
                <ReactTable.Column<Table.ICorrectnessData>
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

export const BreakersTable = (props: Table.ITableProps<Table.IBreakersData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.IBreakersData>('LineName');
    const [data, setData] = React.useState<Table.IBreakersData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.IBreakersData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.IBreakersData>
                    Key={'LineName'}
                    Field={'LineName'}
                >
                    Line
                </ReactTable.Column>
                <ReactTable.Column<Table.IBreakersData>
                    Key={'Energized'}
                    Field={'Energized'}
                    Content={({ item }) => {
                        return <button className="btn" onClick={() => openWindowToPQBrowser(item.MeterID, item.EventID, props.TimeContext, props.TargetDate)}><img src="/Images/PQBrowser" /></button>
                    }}
                >
                </ReactTable.Column>
                <ReactTable.Column<Table.IBreakersData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<Table.IBreakersData>
                    Key={'Timing'}
                    Field={'Timing'}

                />
                <ReactTable.Column<Table.IBreakersData>
                    Key={'StatusTiming'}
                    Field={'StatusTiming'}
                >
                    Status Timing
                </ReactTable.Column>
                <ReactTable.Column<Table.IBreakersData>
                    Key={'Speed'}
                    Field={'Speed'}
                />
                <ReactTable.Column<Table.IBreakersData>
                    Key={'OperationType'}
                    Field={'OperationType'}
                />
                <ReactTable.Column<Table.IBreakersData>
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


export const ExtensionsTable = (props: Table.ITableProps<Table.IExtensionsData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.IExtensionsData>('Site');
    const [data, setData] = React.useState<Table.IExtensionsData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.IExtensionsData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.IExtensionsData>
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

export const TrendingTable = (props: Table.ITableProps<Table.ITrendingData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.ITrendingData>('Site');
    const [data, setData] = React.useState<Table.ITrendingData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.ITrendingData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.ITrendingData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingData>
                    Key={'EventType'}
                    Field={'EventType'}
                >
                    Alarm Type
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingData>
                    Key={'Characteristic'}
                    Field={'Characteristic'}
                />
                <ReactTable.Column<Table.ITrendingData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingData>
                    Key={'HarmonicGroup'}
                    Field={'HarmonicGroup'}
                >
                    HG
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingData>
                    Key={'EventCount'}
                    Field={'EventCount'}
                >
                    Count
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingData>
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

export const TrendingDataTable = (props: Table.ITableProps<Table.ITrendingDataData>) => {
    const [ascending, setAscending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<keyof Table.ITrendingDataData>('Site');
    const [data, setData] = React.useState<Table.ITrendingDataData[]>(props.Data);

    return (
        <>
            <ReactTable.Table<Table.ITrendingDataData>
                TableClass="table table-hover"
                TableStyle={{ width: 'calc(100%)', height: '100%', tableLayout: 'fixed', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                TheadStyle={{ fontSize: 'auto', tableLayout: 'fixed', display: 'table', width: '100%' }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', flex: 1 }}
                RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                Data={props.Data}
                SortKey={sortField}
                Ascending={ascending}
                OnSort={d => d.colField != null ? sort(d.colField, d.ascending, ascending, sortField, setSortField, setAscending, setData, data) : null}
                KeySelector={(row, index) => index ?? -1}
            >
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'Site'}
                    Field={'Site'}
                >
                    Name
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'Characteristic'}
                    Field={'Characteristic'}
                />
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'PhaseName'}
                    Field={'PhaseName'}
                >
                    Phase
                </ReactTable.Column>
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'Minimum'}
                    Field={'Minimum'}
                />
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'Maximum'}
                    Field={'Maximum'}
                />
                <ReactTable.Column<Table.ITrendingDataData>
                    Key={'Average'}
                    Field={'Average'}
                />
                <ReactTable.Column<Table.ITrendingDataData>
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
function sort<T>(newField: keyof T, newAscend: boolean, curAscending: boolean, curSortField: keyof T, setSortField: (field: keyof T) => void, setAscending: (ascend: boolean) => void, setData: (data: T[]) => void, data: T[]) {
    const updatedAscend = curSortField === newField ? !curAscending : newAscend
    if (newField === curSortField)
        setAscending(updatedAscend);
    else
        setSortField(newField);

    setData(_.orderBy(data, newField, [updatedAscend ? "asc" : "desc"]));
}

const findFaultCause = (item: Table.IFaultData) => {
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
