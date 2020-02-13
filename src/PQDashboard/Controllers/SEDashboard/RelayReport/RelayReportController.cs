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
using static OpenSEE.Controller.OpenSEEController;

namespace PQDashboard.Controllers.BreakerReport
{
    [RoutePrefix("api/PQDashboard/RelayReport")]
    public class RelayReportController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #endregion

        #region [ Constructors ]
        public RelayReportController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static RelayReportController()
        {
            s_memoryCache = new MemoryCache("RelayReport");
        }
        #endregion

        #region [ Methods ]

        [Route("GetSubstationData"), HttpGet]
        public DataTable GetSubstationData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                
                
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                     SELECT	ID AS LocationID,
                        AssetKey,
                        Name AS AssetName 
                    FROM	
	                    MeterLocation
                    WHERE
	                    ( SELECT COUNT(RP.ID) FROM RelayPerformance RP LEFT JOIN
			                    Channel ON RP.ChannelID = Channel.ID LEFT JOIN
			                    Line ON Line.ID = Channel.LineID LEFT JOIN
			                    MeterLocationLine ON MeterLocationLine.LineID = Line.ID
		                    WHERE MeterLocationLine.MeterLocationID = MeterLocation.ID) > 0
                    ORDER BY AssetKey";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetLineData"), HttpGet]
        public DataTable GetLineData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int locationID = int.Parse(query["locationID"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                   SELECT Line.ID AS LineID,
                        Line.AssetKey
                    FROM	
	                    Line LEFT JOIN MeterLocationLine ON Line.ID = MeterLocationLine.LineID
                    WHERE
                        MeterLocationLine.MeterLocationID = " + locationID + @"
						AND (SELECT COUNT(RP.ID) FROM RelayPerformance RP LEFT JOIN 
								Channel ON Channel.ID = RP.ChannelID
							WHERE Channel.LineID = Line.ID ) > 0
                    ORDER BY Line.AssetKey";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetCoilData"), HttpGet]
        public DataTable GetCoilData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int lineID = int.Parse(query["lineID"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                   SELECT ID AS ChannelID,
                        Name
                    FROM Channel
                    WHERE
                        Channel.LineID = " + lineID + @"
						AND (SELECT COUNT(RP.ID) FROM RelayPerformance RP 
							WHERE RP.ChannelID = Channel.ID ) > 0
                    ORDER BY Name";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetTrend"), HttpGet]
        public JsonReturn GetData()
        {
            Dictionary<string, FlotSeries> temp;
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int breakerID;
                int channelID;
                try { channelID = int.Parse(query["channelid"]); }
                catch { channelID = -1; }

                try { breakerID = int.Parse(query["breakerid"]); }
                catch { breakerID = -1; }

               
                Line breaker = new TableOperations<Line>(connection).QueryRecordWhere("ID = {0}", breakerID);

                temp = GetStatisticsLookup(breaker.ID,channelID);

            }

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();

            foreach (string key in temp.Keys)
            {
                if (temp[key].DataPoints.Count() > 0)
                {
                    if (dict.ContainsKey(key))
                        dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                    else
                        dict.Add(key, temp[key]);
                }
            }
            if (dict.Count == 0) return null;

            JsonReturn returnDict = new JsonReturn();
            List<FlotSeries> returnList = new List<FlotSeries>();

            foreach (string key in dict.Keys)
            {
                FlotSeries series = new FlotSeries();
                series = dict[key];

                series.DataPoints = dict[key].DataPoints.OrderBy(x => x[0]).ToList();

                returnList.Add(series);
            }

            //returnDict.StartDate = evt.StartTime;
            //returnDict.EndDate = evt.EndTime;
            returnDict.Data = null;
            returnDict.CalculationTime = 0;
            returnDict.CalculationEnd = 0;

            return returnDict;
        }

        private Dictionary<string, FlotSeries> GetStatisticsLookup(int LineID, int channelID = -1)
        {
            Dictionary<string, FlotSeries> result = new Dictionary<string, FlotSeries>();

            DataTable relayHistory = RelayHistoryTable(LineID, channelID);

            DataRow[] dr = relayHistory.Select();

            List<String> RelayParamters = new List<string>()
            {
                "TripTime",
                "PickupTime",
                "TripCoilCondition",
                "Imax1",
                "Imax2",
                "TripTimeAlert",
                "PickupTimeAlert",
                "TripCoilConditionAlert",
            };

            foreach (String param in RelayParamters)
            {
                double scaling = 1.0;
                if ((param == "PickupTime") || (param == "TripTime"))
                {
                    scaling = 0.1d;

                }
                List<double[]> dataPoints = dr.Select(dataPoint => new double[] { dataPoint.ConvertField<DateTime>("TripInitiate").Subtract(m_epoch).TotalMilliseconds, dataPoint.ConvertField<double>(param) * scaling }).ToList();
                result.Add(param, new FlotSeries()
                {
                    ChannelID = 0,
                    ChannelName = param,
                    ChannelDescription = "Relay " + param,
                    MeasurementCharacteristic = param,
                    MeasurementType = param,
                    Phase = "",
                    SeriesType = "",
                    DataPoints = dataPoints,
                    ChartLabel = param
                });

            }

            return result;

        }

        private DataTable RelayHistoryTable(int relayID, int channelID=-1)
        {
            DataTable dataTable;

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                if (channelID > 0)
                {
                    dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE LineID = {0} AND TripCoilChannelID = {1}", relayID, channelID);
                }
                else
                {
                    dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE LineID = {0}", relayID);
                }
            }
            return dataTable;
        }

        [Route("GetRelayPerformance"), HttpGet]
        public DataTable GetRelayPerformance()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int lineID;
            int channelID;

            try { channelID = int.Parse(query["channelID"]); }
            catch { channelID = -1; }

            try { lineID = int.Parse(query["lineID"]); }
            catch { lineID = -1; }
            
            if (lineID <= 0) return new DataTable();
            
            return RelayHistoryTable(lineID, channelID);
            
        }

        #endregion

    }
}