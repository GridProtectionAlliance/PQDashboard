//******************************************************************************************************
//  MagDurChart.tsx - Gbtc
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
import { TabSelector }  from "@gpa-gemstone/react-interactive"
import * as ReactDOM from 'react-dom'
import * as React from 'react'

const NavBar = () => {
    const tabs = [{ Id: 'EventSearch', Label: 'Event Search' }, { Id: 'events', Label: 'Events' }, { Id: 'disturbances', Label: 'Disturbances' }, { Id: 'faults', Label: 'Faults' },
        { Id: 'trending', Label: 'Trending' }, { Id: 'completeness', Label: 'Completeness' }, { Id: 'correctness', Label: 'Correctness' }]

    const [currentTab, setCurrentTab] = React.useState('events')

    const handleTabChange = (tab) => {
        setCurrentTab(tab)
    }

    return (
        <>
            <div className='row'>
                <TabSelector
                    CurrentTab={currentTab}
                    Tabs={tabs}
                    SetTab={(t) => handleTabChange(t)}
                />
            </div>
        </>
    )
}

ReactDOM.render(<NavBar />, document.getElementById("new-tabs"));
