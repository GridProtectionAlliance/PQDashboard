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

using System.Web.Http;

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Completeness/TableData")]
    public class CompletenessTableDataController : TableDataController<CompletenessBarChart>
    {
        public CompletenessTableDataController()
        {
            Query =
                "DECLARE @eventDate DATETIME = {0} " +
                "DECLARE @meterList AS varchar(max) = {1} " +
                "DECLARE @context as nvarchar(20) = {2} " +
                "" +
                "SELECT * INTO #MeterSelection FROM dbo.String_to_int_table(@meterList, ',') " +
                "" +
                "SELECT " +
                "	FirstSummary.ID EventID, " +
                "	Meter.ID MeterID, " +
                "	Meter.Name Site, " +
                "	MeterDataQualitySummary.ExpectedPoints Expected, " +
                "	DailyTrendingSummary.ValidCount + DailyTrendingSummary.InvalidCount Received, " +
                "	CONVERT(FLOAT, DailyTrendingSummary.ValidCount + DailyTrendingSummary.InvalidCount) / MeterDataQualitySummary.ExpectedPoints * 100 Completeness " +
                "FROM " +
                "	Meter JOIN " +
                "	MeterDataQualitySummary ON " +
                "		MeterDataQualitySummary.MeterID = Meter.ID AND " +
                "		MeterDataQualitySummary.Date = @eventDate JOIN " +
                "	( " +
                "		SELECT " +
                "			Channel.MeterID, " +
                "			DailyTrendingSummary.Date, " +
                "			SUM(DailyTrendingSummary.ValidCount) ValidCount, " +
                "			SUM(DailyTrendingSummary.InvalidCount) InvalidCount " +
                "		FROM " +
                "			DailyTrendingSummary JOIN " +
                "			Channel ON DailyTrendingSummary.ChannelID = Channel.ID " +
                "		GROUP BY " +
                "			Channel.MeterID, " +
                "			DailyTrendingSummary.Date " +
                "	) DailyTrendingSummary ON " +
                "		DailyTrendingSummary.MeterID = Meter.ID AND " +
                "		DailyTrendingSummary.Date = MeterDataQualitySummary.Date CROSS APPLY " +
                "	( " +
                "		SELECT TOP 1 FirstSummary.ID " +
                "		FROM MeterDataQualitySummary FirstSummary " +
                "		WHERE " +
                "			FirstSummary.MeterID = Meter.ID AND " +
                "			FirstSummary.Date = MeterDataQualitySummary.Date " +
                "	) FirstSummary " +
                "WHERE Meter.ID IN (SELECT * FROM  #MeterSelection)";

            Tab = "Completeness";
        }
    }
}