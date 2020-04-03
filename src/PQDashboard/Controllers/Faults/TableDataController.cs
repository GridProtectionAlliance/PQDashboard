//******************************************************************************************************
//  TableDataController.cs - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  03/30/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using GSF.Data;
using GSF.Data.Model;
using GSF.Collections;
using openXDA.Model;

namespace PQDashboard.Controllers.Faults
{
    public class DetailtsForSitesForm
    {
        public string siteId { get; set; }
        public string targetDate { get; set; }
        public string colorScale { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/Faults/TableData")]
    public class FaultsTableDataController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DetailtsForSitesForm form)
        {
            try
            {
                string tab = "Faults";
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
                    DateTime date = DateTime.Parse(form.targetDate).ToUniversalTime();
                    Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                    foreach (DashSettings setting in dashSettings)
                    {
                        if (!disabledFileds.ContainsKey(setting.Value))
                            disabledFileds.Add(setting.Value, setting.Enabled);
                    }

                    DataTable table = connection.RetrieveData(@"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}
                        DECLARE @startDate DateTime = @EventDate
                        DECLARE @endDate DateTime

                        if @context = 'day'
                            SET @endDate = DATEADD(DAY, 1, @startDate);
                        if @context = 'hour'
                            SET @endDate = DATEADD(HOUR, 1, @startDate);
                        if @context = 'minute'
                            SET @endDate = DATEADD(MINUTE, 1, @startDate);
                        if @context = 'second'
                            SET @endDate = DATEADD(SECOND, 1, @startDate);

                        SELECT *
                        INTO #meterSelections
                        FROM String_to_int_table(@MeterID, ',')

                        ; WITH FaultDetail AS
                        (
                            SELECT
                                FaultSummary.ID AS thefaultid,
                                Meter.Name AS thesite,
                                Meter.ShortName AS theshortsite,
                                Location.ShortName AS locationname,
                                Meter.ID AS themeterid,
                                Asset.ID AS thelineid,
                                Event.ID AS theeventid,
                                Asset.AssetName AS AssetName,
			                    AssetType.Name AS AssetType,
                                Asset.VoltageKV AS voltage,
                                CAST(CAST(Event.StartTime AS TIME) AS NVARCHAR(100)) AS theinceptiontime,
                                FaultSummary.FaultType AS thefaulttype,
                                CASE WHEN FaultSummary.Distance = '-1E308' THEN 'NaN' ELSE CAST(CAST(FaultSummary.Distance AS DECIMAL(16,2)) AS NVARCHAR(19)) END AS thecurrentdistance,
                                (SELECT COUNT(*) FROM FaultNote WHERE FaultSummary.ID = FaultNote.FaultSummaryID) as notecount,
                                ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY FaultSummary.IsSuppressed, FaultSummary.IsSelectedAlgorithm DESC, FaultSummary.Inception) AS rk
                            FROM
                                FaultSummary JOIN
                                Event ON FaultSummary.EventID = Event.ID JOIN
                                EventType ON Event.EventTypeID = EventType.ID JOIN
                                Meter ON Event.MeterID = Meter.ID JOIN
                                Location ON Meter.LocationID = Location.ID JOIN
                                Asset ON Event.AssetID = Asset.ID JOIN
                                MeterAsset ON MeterAsset.MeterID = Meter.ID AND MeterAsset.AssetID = Asset.ID JOIN
			                    AssetType ON Asset.AssetTypeID = AssetType.ID
                            WHERE
                                EventType.Name = 'Fault' AND
                                Event.StartTime >= @startDate AND Event.StartTime < @endDate AND
                                Meter.ID IN (SELECT * FROM #meterSelections)
                        )
                        SELECT *
                        FROM FaultDetail
                        WHERE rk = 1

                    ", date, form.siteId, form.context, form.colorScale);


                    List<string> skipColumns;
                    if (tab == "Events" || tab == "Disturbances") skipColumns = new List<string>() { "EventID", "MeterID", "Site" };
                    else skipColumns = table.Columns.Cast<DataColumn>().Select(x => x.ColumnName).ToList();


                    List<string> columnsToRemove = new List<string>();
                    foreach (DataColumn column in table.Columns)
                    {
                        if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                        {
                            disabledFileds.Add(column.ColumnName, true);
                            new TableOperations<DashSettings>(connection).GetOrAdd(tab + "Chart", column.ColumnName, true);
                        }


                        if (!skipColumns.Contains(column.ColumnName) && !disabledFileds[column.ColumnName])
                        {
                            columnsToRemove.Add(column.ColumnName);
                        }

                    }
                    foreach (string columnName in columnsToRemove)
                    {
                        table.Columns.Remove(columnName);
                    }


                    return Ok(table);

                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}