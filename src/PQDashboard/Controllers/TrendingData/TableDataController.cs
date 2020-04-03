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

namespace PQDashboard.Controllers.TrendingData
{
    public class DetailtsForSitesForm
    {
        public string siteId { get; set; }
        public string targetDate { get; set; }
        public string colorScale { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/TrendingData/TableData")]
    public class TrendingDataTableDataController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DetailtsForSitesForm form)
        {
            try
            {
                string tab = "TrendingData";
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
                        DECLARE @MeterIDs TABLE (ID int);
                        DECLARE @Date as DateTime2;
                        SET  @Date = CAST(@EventDate AS DATE)

                        -- Create MeterIDs Table
                        INSERT INTO @MeterIDs(ID) SELECT Value FROM dbo.String_to_int_table(@MeterID, ',');

                        -- Trending Data
                        SELECT
                            Meter.ID as meterid,
                            Meter.Name as Name,
                            Channel.ID as channelid,
                            DailyTrendingSummary.Date as date,
                            MIN(Minimum/COALESCE(Channel.PerUnitValue,1)) as Minimum,
                            MAX(Maximum/COALESCE(Channel.PerUnitValue,1)) as Maximum,
                            AVG(Average/COALESCE(Channel.PerUnitValue,1)) as Average,
                            MeasurementCharacteristic.Name as characteristic,
                            MeasurementType.Name as measurementtype,
                            Phase.Name as phasename
                        FROM
                            DailyTrendingSummary JOIN
                            Channel ON DailyTrendingSummary.ChannelID = Channel.ID JOIN
                            Meter ON Meter.ID = Channel.MeterID JOIN
                            MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN
                            MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN
                            Phase ON Channel.PhaseID = Phase.ID
                        WHERE Meter.ID IN (SELECT * FROM @MeterIDs) AND Channel.ID IN (SELECT ChannelID FROM ContourChannel WHERE ContourColorScaleName = @colorScaleName) AND Date = @Date
                        GROUP BY Date, Meter.ID, Meter.Name, MeasurementCharacteristic.Name, MeasurementType.Name, Phase.Name, Channel.ID
                        ORDER BY Date

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