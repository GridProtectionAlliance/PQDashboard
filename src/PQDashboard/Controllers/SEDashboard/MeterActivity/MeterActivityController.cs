//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
using FaultData.DataAnalysis;
using GSF;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.NumericalAnalysis;
using GSF.Security;
using GSF.Web;
using GSF.Web.Model;
using MathNet.Numerics.IntegralTransforms;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace PQDashboard.Controllers.BreakerReport
{
    [RoutePrefix("api/PQDashboard/MeterActivity")]
    public class MeterActivityController : ApiController
    {
        #region [ Members ]
        #endregion

        #region [ Constructors ]
        public MeterActivityController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static MeterActivityController()
        {
            s_memoryCache = new MemoryCache("MeterActivity");
        }
        #endregion

        #region [ Methods ]

        [Route("GetMostActiveMeterActivityData"), HttpGet]
        public DataTable GetMostActiveMeterActivityData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int numberOfResults = int.Parse(query["numresults"]);
                string column = query["column"];
                switch (column)
                {
                    case "24Hours": column = "[FileGroups24Hours] DESC, [Events24Hours] DESC ,[FileGroups7Days] DESC, [Events7Days] DESC, [FileGroups30Days] DESC, [Events30Days] DESC, [AssetKey]"; break;
                    case "7Days": column = "[FileGroups7Days] DESC, [Events7Days] DESC, [FileGroups24Hours] DESC, [Events24Hours] DESC , [FileGroups30Days] DESC, [Events30Days] DESC, [AssetKey]"; break;
                    case "30Days": column = "[FileGroups30Days] DESC, [Events30Days] DESC, [FileGroups24Hours] DESC, [Events24Hours] DESC ,[FileGroups7Days] DESC, [Events7Days] DESC,  [AssetKey]"; break;
                    default: column = " [AssetKey], [FileGroups24Hours] DESC, [Events24Hours] DESC ,[FileGroups7Days] DESC, [Events7Days] DESC, [FileGroups30Days] DESC, [Events30Days] DESC"; break;
                }

                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                    DECLARE @startTime DateTime2 = GetDate();

                    with cte as (
                    SELECT	Meter.Name as AssetKey, 
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS Events24Hours,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS FileGroups24Hours,
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime))  AS Events7Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime)) AS FileGroups7Days,                                                       
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime)) AS Events30Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime))AS FileGroups30Days,                                                     
                            (SELECT TOP 1 ID FROM Event WHERE MeterID = Meter.ID AND StartTime <= @StartTime ORDER BY StartTime, ID) AS FirstEventID
                    FROM	
	                    Meter
                    )
                    SELECT TOP " + numberOfResults + @"
	                    AssetKey, 
	                    Cast(FileGroups24Hours as varchar(max)) + ' ( ' +Cast(Events24Hours as varchar(max)) + ' )' as [24Hours],
	                    Cast(FileGroups7Days as varchar(max)) + ' ( ' +Cast(Events7Days as varchar(max)) + ' )' as [7Days],
	                    Cast(FileGroups30Days as varchar(max)) + ' ( ' +Cast(FileGroups7Days as varchar(max)) + ' )' as [30Days],
                        FirstEventID
                    FROM cte
                    ORDER BY " + column;

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetLeastActiveMeterActivityData"), HttpGet]
        public DataTable GetLeastActiveMeterActivityData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int numberOfResults = int.Parse(query["numresults"]);
                string column = query["column"];
                switch (column)
                {
                    case "90Days": column = "[90Days]"; break;
                    case "180Days": column = "[180Days]"; break;
                    case "30Days": column = "[30Days]"; break;
                    default: column = "AssetKey"; break;
                }

                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                    DECLARE @startTime DateTime2 = GetDate();

                    with cte as (
                    SELECT	Meter.Name as AssetKey, 
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS Events24Hours,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS FileGroups24Hours,
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime))  AS Events7Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime)) AS FileGroups7Days,                                                       
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime)) AS Events30Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime))AS FileGroups30Days,       
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-90,@StartTime)) AS Events90Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-90,@StartTime))AS FileGroups90Days,                                                     
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-180,@StartTime)) AS Events180Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-180,@StartTime))AS FileGroups180Days,                                                     
                            (SELECT TOP 1 ID FROM Event WHERE MeterID = Meter.ID AND StartTime <= @StartTime ORDER BY StartTime, ID) AS FirstEventID
                    FROM	
	                    Meter
                    )
                    SELECT TOP " + numberOfResults + @"
	                    AssetKey, 
	                    Cast(FileGroups30Days as varchar(max)) + ' ( ' +Cast(Events30Days as varchar(max)) + ' )' as [30Days],
	                    Cast(FileGroups7Days as varchar(max)) + ' ( ' +Cast(Events7Days as varchar(max)) + ' )' as [90Days],
	                    Cast(FileGroups30Days as varchar(max)) + ' ( ' +Cast(FileGroups7Days as varchar(max)) + ' )' as [180Days],
                        FirstEventID
                    FROM cte
                    ORDER BY " + column + " ASC";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetFilesProcessedLast24Hrs"), HttpGet]
        public DataTable GetFilesProcessedLast24Hrs()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                //string column = query["column"];
                //switch (column)
                //{
                //    case "FilePath": column = "FilePath"; break;
                //    default: column = "CreationTime"; break;
                //}

                DataTable table = new DataTable();

                DateTime now = DateTime.Now;
                DateTime dateTime = now.AddHours(-24);
                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                        SELECT
                            DataFile.FilePath,
                            DataFile.CreationTime,
                            DataFile.FileGroupID
                        FROM FileGroup CROSS APPLY
                        (
                            SELECT TOP 1 * 
                            FROM DataFile 
                            WHERE DataFile.FileGroupID = FileGroup.ID 
                            ORDER BY FileSize DESC, FilePath 
		                ) DataFile
                        WHERE CreationTime BETWEEN @StartDate AND @EndDate
                        ORDER BY CreationTime DESC";

                    sc.CommandType = CommandType.Text;
                    IDbDataParameter eventDateStart = sc.CreateParameter();
                    eventDateStart.ParameterName = "@StartDate";
                    eventDateStart.Value = dateTime;
                    sc.Parameters.Add(eventDateStart);
                    IDbDataParameter eventDateEnd = sc.CreateParameter();
                    eventDateEnd.ParameterName = "@EndDate";
                    eventDateEnd.Value = now;
                    sc.Parameters.Add(eventDateEnd);

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("QueryFileGroupEvents"), HttpGet]
        public DataTable QueryFileGroupEvents()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int fileGroupID = int.Parse(query["FileGroupID"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                return connection.RetrieveData("SELECT * FROM EventView WHERE FileGroupID = {0}", fileGroupID);
            }

        }

        #endregion

    }
}