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
import * as ReactDOM from 'react-dom';
import { PQDashboard } from '../global';
import { Table } from './interfaces'
import { CommonTable, CompletenessTable, CorrectnessTable, FaultsTable, BreakersTable, ExtensionsTable, TrendingTable, TrendingDataTable } from './Tables';

interface IProps {
    TimeContext: PQDashboard.TimeContext,
    Tab: PQDashboard.Tab,
    SiteID: string,
    TargetDate: string | null,
}

declare let homePath;

const TableWrapper = (props: IProps) => {
    const [data, setData] = React.useState<unknown[]>([]);

    React.useEffect(() => {
        $.ajax({
            type: "POST",
            url: `${homePath}api/${props.Tab}/TableData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ siteId: props.SiteID, targetDate: props.TargetDate, colorScale: $('#contourColorScaleSelect').val(), context: props.TimeContext }),
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => {
            setData(data)
        })

    }, [props])

    const renderTable = React.useCallback(() => {
        if (props.Tab === "Completeness")
            return <CompletenessTable Data={data as Table.ICompletenessData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === "Faults")
            return <FaultsTable Data={data as Table.IFaultData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === 'Correctness')
            return <CorrectnessTable Data={data as Table.ICorrectnessData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === 'Breakers')
            return <BreakersTable Data={data as Table.IBreakersData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === 'Extensions')
            return <ExtensionsTable Data={data as Table.IExtensionsData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === "Trending")
            return <TrendingTable Data={data as Table.ITrendingData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
        if (props.Tab === "TrendingData")
            return <TrendingDataTable Data={data as Table.ITrendingDataData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />

        return <CommonTable Data={data as Table.ICommonData[]} Tab={props.Tab} TimeContext={props.TimeContext} TargetDate={props.TargetDate} />
    }, [props.Tab, data, props.TimeContext, props.TargetDate]);

    if (data.length === 0 || props.TargetDate == null || props.TimeContext === 'custom') return null
    return (
        <>
            {renderTable()}
        </>
    )

}


//Render Function
export function renderTableWrapper(div, siteID, targetDate, currentTab, globalContext) {
    const container = document.getElementById(div)
    if (container != null)
        ReactDOM.render(<TableWrapper SiteID={siteID} TargetDate={targetDate} Tab={currentTab} TimeContext={globalContext} />, container);
}
