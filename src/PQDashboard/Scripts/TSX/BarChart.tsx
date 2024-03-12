//******************************************************************************************************
//  BarChart.tsx - Gbtc
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
//  03/04/2024 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import * as _ from 'lodash';
import moment from 'moment';

interface IProps {
    thediv,
    siteID,
    thedatefrom,
    thedateto,
    currentTab,
    globalContext,
    disabledList,
    contextfromdate,
    contexttodate
}


const BarChart = (props: IProps) => {
    return (
        <div></div>
    )

}

export function renderBarChart(thediv, siteID, thedatefrom, thedateto, currentTab, globalContext, disabledList, contextfromdate, contexttodate) {
    ReactDOM.render(<BarChart thediv={thediv} siteID={siteID} thedatefrom={thedatefrom} thedateto={thedateto} currentTab={currentTab} globalContext={globalContext}
        disabledList={disabledList} contextfromdate={contextfromdate} contexttodate={contexttodate}
    />, document.getElementById('OverviewDisturbancesMagDur'));
}
