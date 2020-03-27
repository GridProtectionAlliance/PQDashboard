//******************************************************************************************************
//  eventService.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  05/02/2014 - Jeff Walker
//       Generated original version of source code.
//  12/03/2014 - Jeff Walker
//      Optimizations
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web.Services;
using System.Web.Script.Serialization;
using GSF.Configuration;
using GSF.Data;
using GSF.Collections;
using GSF.Data.Model;
using GSF.Web.Model;
using openHistorian.XDALink;
using PQDashboard.Model;


/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 

[System.Web.Script.Services.ScriptService]
public class eventService : System.Web.Services.WebService {

    private string connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    public class eventSet
    {
        public string[] xAxis;
        public eventDetail[] data;
    }

    public class eventDetail
    {
        public string name;
        public string type;
        public double[] data;
    }

    public class eventSummarySite
    {
        public string siteName;
        public string siteID;
        public List<int> data;
    }

    public class eventSummarySiteNullDoubles
    {
        public string siteName;
        public string siteID;
        public List<double?> data;
    }

    public class SiteTrendingData
    {
        public int siteID;
        public string siteName;
        public double? Minimum;
        public double? Maximum;
        public double? Average;
    }

    public eventService ()
    {
        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }


    /// <summary>
    /// getSiteChannelDataQualityDetailsByDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public string getSiteChannelDataQualityDetailsByDate(string siteID, string targetDate)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSiteChannelDataQualityDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(rdr);
            thedata = DataTable2JSON(dt);
            dt.Dispose();
        }
        finally
        {
            if (conn != null)
            {
                conn.Close();
            }
            if (rdr != null)
            {
                rdr.Close();
            }
        }

        return thedata;
    }

    /// <summary>
    /// getSiteChannelCompletenessDetailsByDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public String getSiteChannelCompletenessDetailsByDate(string siteID, string targetDate)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSiteChannelCompletenessDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(rdr);
            thedata = DataTable2JSON(dt);
            dt.Dispose();
        }
        finally
        {
            if (conn != null)
            {
                conn.Close();
            }
            if (rdr != null)
            {
                rdr.Close();
            }
        }

        return thedata;
    }

    /// <summary>
    /// getPQIDetailsByEventID
    /// </summary>
    /// <param name="eventID"></param>
    /// <returns></returns>
    [WebMethod]
    public String getPQIDetailsByEventID(string eventID)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.GetAllImpactedComponents", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@eventID", eventID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(rdr);
            thedata = DataTable2JSON(dt);
            dt.Dispose();
        }
        finally
        {
            if (conn != null)
            {
                conn.Close();
            }
            if (rdr != null)
            {
                rdr.Close();
            }
        }

        return thedata;
    }



    /// <summary>
    /// DataTable2JSON
    /// </summary>
    /// <param name="dt"></param>
    /// <returns></returns>
    public string DataTable2JSON(DataTable dt)
    {
        List<Object> RowList = new List<Object>();
        foreach (DataRow dr in dt.Rows)
        {
            Dictionary<Object, Object> ColList = new Dictionary<Object, Object>();
            foreach (DataColumn dc in dt.Columns)
            {
                string t = (string)((string.Empty == dr[dc].ToString()) ? null : dr[dc].ToString());

                ColList.Add(dc.ColumnName, t);
            }
            RowList.Add(ColList);
        }
        JavaScriptSerializer js = new JavaScriptSerializer();
        string JSON = js.Serialize(RowList);
        return JSON;
    }



    private static DateTime Round(DateTime dateTime, TimeSpan interval)
    {
        var halfIntervelTicks = (interval.Ticks + 1) >> 1;

        return dateTime.AddTicks(halfIntervelTicks - ((dateTime.Ticks + halfIntervelTicks) % interval.Ticks));
    }

    public class TrendingDataSet
    {
        public List<eventService.TrendingDataDatum> ChannelData;
        public List<TrendingAlarmLimit> AlarmLimits;
        public List<TrendingAlarmLimit> OffNormalLimits;

        public TrendingDataSet()
        {
            ChannelData = new List<eventService.TrendingDataDatum>();
            AlarmLimits = new List<TrendingAlarmLimit>();
            OffNormalLimits = new List<TrendingAlarmLimit>();
        }
    }

    public class TrendingDataDatum
    {
        public double Time;
        public double Maximum;
        public double Minimum;
        public double Average;
    }

    public class TrendingAlarmLimit
    {
        public double TimeStart;
        public double TimeEnd;
        public double? High;
        public double? Low;
    }

    /// <summary>
    /// getTrendsforChannelIDDate
    /// </summary>
    /// <param name="ChannelID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public TrendingDataSet getTrendsforChannelIDDate(string ChannelID, string targetDate)
    {
        string historianServer;
        string historianInstance;
        IEnumerable<int> channelIDs = new List<int>() { Convert.ToInt32(ChannelID) };
        DateTime startDate = Convert.ToDateTime(targetDate);
        DateTime endDate = startDate.AddDays(1);
        TrendingDataSet trendingDataSet = new TrendingDataSet();
        DateTime epoch = new DateTime(1970, 1, 1);

        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            historianServer = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Server'") ?? "127.0.0.1";
            historianInstance = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.InstanceName'") ?? "XDA";

            using (Historian historian = new Historian(historianServer, historianInstance))
            {
                foreach (openHistorian.XDALink.TrendingDataPoint point in historian.Read(channelIDs, startDate, endDate))
                {
                    if (!trendingDataSet.ChannelData.Exists(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds))
                    {
                        trendingDataSet.ChannelData.Add(new TrendingDataDatum());
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.Count - 1].Time = point.Timestamp.Subtract(epoch).TotalMilliseconds;
                    }

                    if (point.SeriesID.ToString() == "Average")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Average = point.Value;
                    else if (point.SeriesID.ToString() == "Minimum")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Minimum = point.Value;
                    else if (point.SeriesID.ToString() == "Maximum")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Maximum = point.Value;

                }
            }
            IEnumerable<DataRow> table = Enumerable.Empty<DataRow>();

            table = connection.RetrieveData(" Select {0} AS thedatefrom, " +
                                                        "        DATEADD(DAY, 1, {0}) AS thedateto, " +
                                                        "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.High * PerUnitValue ELSE AlarmRangeLimit.High END AS alarmlimithigh," +
                                                        "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.Low * PerUnitValue ELSE AlarmRangeLimit.Low END AS alarmlimitlow " +
                                                        " FROM   AlarmRangeLimit JOIN " +
                                                        "        Channel ON AlarmRangeLimit.ChannelID = Channel.ID " +
                                                        "WHERE   AlarmRangeLimit.AlarmTypeID = (SELECT ID FROM AlarmType where Name = 'Alarm') AND " +
                                                        "        AlarmRangeLimit.ChannelID = {1}", startDate, Convert.ToInt32(ChannelID)).Select();

            foreach (DataRow row in table)
            {
                trendingDataSet.AlarmLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("alarmlimithigh"), Low = row.Field<double?>("alarmlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
            }

            table = Enumerable.Empty<DataRow>();

            table = connection.RetrieveData(" DECLARE @dayOfWeek INT = DATEPART(DW, {0}) - 1 " +
                                                        " DECLARE @hourOfWeek INT = @dayOfWeek * 24 " +
                                                        " ; WITH HourlyIndex AS" +
                                                        " ( " +
                                                        "   SELECT @hourOfWeek AS HourOfWeek " +
                                                        "   UNION ALL " +
                                                        "   SELECT HourOfWeek + 1 " +
                                                        "   FROM HourlyIndex" +
                                                        "   WHERE (HourOfWeek + 1) < @hourOfWeek + 24" +
                                                        " ) " +
                                                        " SELECT " +
                                                        "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek, {0}) AS thedatefrom, " +
                                                        "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek + 1, {0}) AS thedateto, " +
                                                        "        HourOfWeekLimit.High AS offlimithigh, " +
                                                        "        HourOfWeekLimit.Low AS offlimitlow " +
                                                        " FROM " +
                                                        "        HourlyIndex LEFT OUTER JOIN " +
                                                        "        HourOfWeekLimit ON HourOfWeekLimit.HourOfWeek = HourlyIndex.HourOfWeek " +
                                                        " WHERE " +
                                                        "        HourOfWeekLimit.ChannelID IS NULL OR " +
                                                        "        HourOfWeekLimit.ChannelID = {1} ", startDate, Convert.ToInt32(ChannelID)).Select();

            foreach (DataRow row in table)
            {
                trendingDataSet.OffNormalLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("offlimithigh"), Low = row.Field<double?>("offlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
            }

        }


        return trendingDataSet;
    }
}
