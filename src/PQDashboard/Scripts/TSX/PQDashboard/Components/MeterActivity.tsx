//******************************************************************************************************
//  MeterActivity.tsx - Gbtc
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

import * as React from 'react';
import Table from './Table';
import PQDashboardService from './../../../TS/Services/PQDashboard';

const updateInterval = 300000;
const rowsPerPage = 7;
const autoUpdate = setInterval(
    function () {
        //buildMeterActivityTables();
    }, updateInterval);

const momentFormat = "YYYY/MM/DD HH:mm:ss";
const dateTimeFormat = "yyyy/MM/dd HH:mm:ss";

const MeterActivity: React.FunctionComponent<{}> = (props) => {

    return (
        <div id="meterActivityContainer" style={{ width: '100%', height: '100%', textAlign: 'center', backgroundColor: '#064e1b', padding: 20 }}>
            <div style={{ width: 'calc(50% - 10px)', height: 'calc(100% - 57px)', position: 'relative', float: 'left' }}>
                <div style={{ backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 15px)', padding: 15 }} className="well well-sm">
                    <MostActiveMeters />
                </div>
                <div style={{ marginTop: 20, backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 10px)', padding: 15 }} className="well well-sm">
                    <LeastActiveMeters />
                </div>
            </div>
            <div style={{  backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(100% - 57px)', width: 'calc(50% - 11px)', position: 'relative', float: 'right', padding: 15 }} className="well well-sm">
                <FilesProcessed />
            </div>
        </div>
    );

}

export default MeterActivity;

const MostActiveMeters: React.FunctionComponent<{}> = (props) => {
    const [activeMeterTable, setActiveMeterTable] = React.useState<Array<any>>([]);
    const [sortField, setSortField] = React.useState<string>('24Hours');
    var pQDashboardService = new PQDashboardService();

    React.useEffect(() => {
        createTableRows();
    }, []);


    function createTableRows() {
        pQDashboardService.getMostActiveMeterActivityData(rowsPerPage, sortField).done(data => {
            setActiveMeterTable(data);
        });
    }

    return (
        <div style={{ height: '100%'}}>
        <h3 style={{ display: 'inline' }}>Most Active Meters</h3>
        <span style={{ float: 'right', color: 'silver' }}>Click on event count to view events</span>
        <div style={{ height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
            <div style={{ backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)' }}>
                <Table
                    cols={[
                        { key: 'AssetKey', label: 'Asset Key', headerStyle: { width: '40%' } },
                        { key: '24Hours', label: 'Files(Evts) 24H', headerStyle: { width: '20%' } },
                        { key: '7Days', label: 'Files(Evts) 7D', headerStyle: { width: '20%' } },
                        { key: '30Days', label: 'Files(Evts) 30D', headerStyle: { width: '20%' } },
                    ]}
                    tableClass="table table-responsive"
                    data={activeMeterTable}
                    sortField={sortField}
                    ascending={true}
                    onSort={(data) => { setSortField(data.col)}}
                    onClick={() => { }}
                    theadStyle={{fontSize: 'smaller'}}
                />
        </div>
    </div>
    );
}

const LeastActiveMeters: React.FunctionComponent<{}> = (props) => {
    const [leastActiveMeterTable, setLeastActiveMeterTable] = React.useState<Array<JSX.Element>>([]);

    return (
        <div style={{ height: '100%' }}>
            <h3 style={{ display: 'inline' }}>Most Active Meters</h3>
            <span style={{ float: 'right', color: 'silver' }}>Click on event count to view events</span>
            <div style={{ height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
            <div style={{ backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)' }}>
                <Table
                    cols={[
                        { key: 'Name', label: 'Asset Key', headerStyle: { width: '40%' } },
                        { key: '30D', label: 'Files(Events) 30D', headerStyle: { width: '20%' } },
                        { key: '90D', label: 'Files(Events) 90D', headerStyle: { width: '20%' } },
                        { key: '180D', label: 'Files(Events) 180D', headerStyle: { width: '20%' } },
                    ]}
                    tableClass="table table-responsive"
                    data={leastActiveMeterTable}
                    sortField="30D"
                    ascending={false}
                    onSort={() => { }}
                    onClick={() => { }}
                    theadStyle={{ fontSize: 'smaller' }}

                />
            </div>
        </div>
    );
}

const FilesProcessed: React.FunctionComponent<{}> = (props) => {
    const [filesProcessedTable, setFilesProcessedTable] = React.useState<Array<JSX.Element>>([]);

    return (
        <div style={{ height: '100%' }}>
            <h3 style={{ display: 'inline' }}>FILES PROCESSED LAST 24 HOURS</h3>
            <span style={{ float: 'right', color: 'silver' }} id="files-hint">Expand row to view events</span>
            <div style={{ height: 2, width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
            <div id="meter-activity-files" style={{ backgroundColor: 'white', borderColor: 'black' }}></div>
            <Table
                cols={[
                    { key: 'Time', label: 'Time Processed', headerStyle: { width: '30%' } },
                    { key: 'FileName', label: 'File Name', headerStyle: { width: '70%' } },
                ]}
                tableClass="table table-responsive"
                data={filesProcessedTable}
                sortField="Time"
                ascending={false}
                onSort={() => { }}
                onClick={() => { }}
                theadStyle={{ fontSize: 'smaller' }}

            />
        </div>
    );
}