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

namespace PQDashboard.Controllers.Breakers
{
    public class DetailtsForSitesForm
    {
        public string siteId { get; set; }
        public string targetDate { get; set; }
        public string colorScale { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/Breakers/TableData")]
    public class BreakersTableDataController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DetailtsForSitesForm form)
        {
            try
            {
                string tab = "Breakers";
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

                        DECLARE @startDate DateTime
                        DECLARE @endDate DateTime

                        IF @context = 'day'
                        BEGIN
                            SET @startDate = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                        END

                        if @context = 'hour'
                        BEGIN
                            SET @startDate = DATEADD(HOUR, DATEDIFF(HOUR, 0, @EventDate), 0)
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @startDate = DATEADD(MINUTE, DATEDIFF(MINUTE, 0, @EventDate), 0)
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                        END

                        if @context = 'second'
                        BEGIN
                            DECLARE @tempDate DATETIME = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @startDate = DATEADD(SECOND, DATEDIFF(SECOND, @tempDate, @EventDate), @tempDate)
                            SET @endDate = DATEADD(SECOND, 1, @startDate)
                        END

	                    SELECT * INTO #MeterSelection FROM dbo.String_to_int_table(@MeterID, ',')
                        SELECT
                            Meter.ID AS meterid,
                            Event.ID AS theeventid,
                            EventType.Name AS eventtype,
                            BreakerOperation.ID AS breakeroperationid,
                            CAST(CAST(BreakerOperation.TripCoilEnergized AS TIME) AS NVARCHAR(100)) AS energized,
                            BreakerOperation.BreakerNumber AS breakernumber,
                            Asset.AssetName AS linename,
                            Phase.Name AS phasename,
                            CAST(BreakerOperation.BreakerTiming AS DECIMAL(16,5)) AS timing,
                            CAST(BreakerOperation.StatusTiming AS DECIMAL(16,5)) AS statustiming,
                            BreakerOperation.BreakerSpeed AS speed,
                            BreakerOperation.StatusBitChatter AS chatter,
                            BreakerOperation.DcOffsetDetected AS dcoffset,
                            BreakerOperationType.Name AS operationtype,
                            (SELECT COUNT(*) FROM EventNote WHERE EventNote.EventID = Event.ID) as notecount
                        FROM
                            BreakerOperation JOIN
                            Event ON BreakerOperation.EventID = Event.ID JOIN
                            EventType ON EventType.ID = Event.EventTypeID JOIN
                            Meter ON Meter.ID = Event.MeterID JOIN
                            Asset ON Asset.ID = Event.AssetID JOIN
                            MeterAsset ON MeterAsset.AssetID = Event.AssetID AND MeterAsset.MeterID = Meter.ID JOIN
                            BreakerOperationType ON BreakerOperation.BreakerOperationTypeID = BreakerOperationType.ID JOIN
                            Phase ON BreakerOperation.PhaseID = Phase.ID
                        WHERE
                            TripCoilEnergized >= @startDate AND TripCoilEnergized < @endDate AND
                            Meter.ID IN (SELECT * FROM  #MeterSelection)

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