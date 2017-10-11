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
    /// getDashSettings
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDashSettings(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectDashSettings", conn);
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
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

        return (thedata);
    }

    /// <summary>
    /// getSiteChannelDataQualityDetailsByDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public String getSiteChannelDataQualityDetailsByDate(string siteID, string targetDate)
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
    /// getSiteLinesDetailsByDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public String getSiteLinesDetailsByDate(string siteID, string targetDate)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        SqlConnection conn2 = null;
        SqlDataReader rdr2 = null;


        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();

            SqlCommand cmd = new SqlCommand("SELECT * FROM EASExtension", conn);
            rdr = cmd.ExecuteReader();

            StringBuilder QueryBuilder = new StringBuilder();
            while (rdr.Read())
            {
                if (QueryBuilder.Length > 0)
                {
                    QueryBuilder.Append(",");
                }
                QueryBuilder.Append("dbo.");
                QueryBuilder.Append(rdr["HasResultFunction"]);
                QueryBuilder.Append("(theeventid) AS ");
                QueryBuilder.Append(rdr["ServiceName"]);
            }
            rdr.Dispose();

            cmd = new SqlCommand("dbo.selectSiteLinesDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt;
            if (QueryBuilder.Length > 0)
            {
                conn2 = new SqlConnection(connectionstring);
                conn2.Open();

                cmd = new SqlCommand("SELECT * , " + QueryBuilder + " FROM @EventIDTable", conn2);
                cmd.Parameters.Add(new SqlParameter("@EventIDTable", rdr));
                cmd.Parameters[0].SqlDbType = SqlDbType.Structured;
                cmd.Parameters[0].TypeName = "SiteLineDetailsByDate";
                rdr2 = cmd.ExecuteReader();

                dt = new DataTable();
                dt.Load(rdr2);

            }
            else
            {
                dt = new DataTable();
                dt.Load(rdr);
            }

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
            if (conn2 != null)
            {
                conn2.Close();
            }
            if (rdr2 != null)
            {
                rdr2.Close();
            }
        }

        return thedata;
    }


    /// <summary>
    /// getSiteLinesDetailsByDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public String getSiteLinesDisturbanceDetailsByDate(string siteID, string targetDate)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        SqlConnection conn2 = null;
        SqlDataReader rdr2 = null;


        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();

            SqlCommand cmd = new SqlCommand("dbo.selectSiteLinesDisturbanceDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt;

            dt = new DataTable();
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
            if (conn2 != null)
            {
                conn2.Close();
            }
            if (rdr2 != null)
            {
                rdr2.Close();
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
            historianInstance = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Instance'") ?? "XDA";

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

    /// <summary>
    /// getTrends
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="MeasurementType"></param>
    /// <param name="MeasurementCharacteristic"></param>
    /// <param name="Phase"></param>
    /// <param name="Period"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getTrends(string siteID, string targetDate, string MeasurementType, string MeasurementCharacteristic, string Phase, string Period )
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        String theSproc = "dbo.selectTrendingData";

        List<string> thedates = new List<string>();
        List<double> minimum = new List<double>();
        List<double> maximum = new List<double>();
        List<double> average = new List<double>();

        List<double> alarmlimithigh = new List<double>();
        List<double> alarmlimitlow = new List<double>();
        List<double> offlimithigh = new List<double>();
        List<double> offlimitlow = new List<double>();

        if (Period == "Month")
        {
            theSproc = "dbo.selectTrendingDataMonthly";
        }

        if (Period == "Week")
        {
            theSproc = "dbo.selectTrendingDataWeekly";
        }

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand(theSproc, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@MeasurementCharacteristicID", MeasurementCharacteristic));
            cmd.Parameters.Add(new SqlParameter("@MeasurementTypeID", MeasurementType));
            cmd.Parameters.Add(new SqlParameter("@PhaseID", Phase));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                DateTime thetime = Round((DateTime)rdr["thedate"], new TimeSpan(0, 0, 1));
                String thetimestring = thetime.ToShortTimeString();

                if (Period == "Month")
                {
                    thetimestring = thetime.ToShortDateString();
                }

                if (Period == "Week")
                {
                    thetimestring = thetime.ToShortDateString();
                }

                thedates.Add(thetimestring);
                minimum.Add((double)rdr["theminimum"]);
                maximum.Add((double)rdr["themaximum"]);
                average.Add((double)rdr["theaverage"]);
                alarmlimithigh.Add((double)rdr["alarmlimithigh"]);

                if (rdr["alarmlimitlow"] == DBNull.Value)
                {
                    int i = 0;
                }
                else
                {
                    alarmlimitlow.Add((double)rdr["alarmlimitlow"]);
                }


                offlimithigh.Add((double)rdr["offlimithigh"]);
                offlimitlow.Add((double)rdr["offlimitlow"]);
            }

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

        theset.xAxis = thedates.ToArray();

        theset.data = new eventDetail[7];

        theset.data[0] = new eventDetail();
        theset.data[0].name = "Alarm Limit High";
        theset.data[0].type = "line";
        theset.data[0].data = alarmlimithigh.ToArray();

        theset.data[1] = new eventDetail();
        theset.data[1].name = "Off Normal High";
        theset.data[1].type = "line";
        theset.data[1].data = offlimithigh.ToArray();

        theset.data[2] = new eventDetail();
        theset.data[2].name = "Max";
        theset.data[2].type = "errorbar";
        theset.data[2].data = maximum.ToArray();

        theset.data[3] = new eventDetail();
        theset.data[3].name = "Average";
        theset.data[3].type = "line";
        theset.data[3].data = average.ToArray();

        theset.data[4] = new eventDetail();
        theset.data[4].name = "Min";
        theset.data[4].type = "line";
        theset.data[4].data = minimum.ToArray();

        theset.data[5] = new eventDetail();
        theset.data[5].name = "Off Normal Low";
        theset.data[5].type = "line";
        theset.data[5].data = offlimitlow.ToArray();

        theset.data[6] = new eventDetail();
        theset.data[6].name = "Alarm Limit Low";
        theset.data[6].type = "line";
        theset.data[6].data = alarmlimitlow.ToArray();

        return (theset);
    }

    /// <summary>
    /// getSitesStatusEvents
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusEvents(string siteID, string targetDateFrom, string targetDateTo, String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventsForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["Interruptions"]);
                currentEventSummary.data.Add((int)rdr["Faults"]);
                currentEventSummary.data.Add((int)rdr["Sags"]);
                currentEventSummary.data.Add((int)rdr["Transients"]);
                currentEventSummary.data.Add((int)rdr["Swells"]);
                currentEventSummary.data.Add((int)rdr["Others"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }


    /// <summary>
    /// getSitesStatusDisturbances
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusDisturbances(string siteID, string targetDateFrom, string targetDateTo, String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectDisturbancesForMeterIDByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["5"]);
                currentEventSummary.data.Add((int)rdr["4"]);
                currentEventSummary.data.Add((int)rdr["3"]);
                currentEventSummary.data.Add((int)rdr["2"]);
                currentEventSummary.data.Add((int)rdr["1"]);
                currentEventSummary.data.Add((int)rdr["0"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }


    /// <summary>
    /// getSitesStatusCompleteness
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusCompleteness(string siteID, string targetDateFrom, string targetDateTo, String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectCompletenessForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["ExpectedPoints"]);
                currentEventSummary.data.Add((int)rdr["GoodPoints"]);
                currentEventSummary.data.Add((int)rdr["LatchedPoints"]);
                currentEventSummary.data.Add((int)rdr["UnreasonablePoints"]);
                currentEventSummary.data.Add((int)rdr["NoncongruentPoints"]);
                currentEventSummary.data.Add((int)rdr["DuplicatePoints"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

    /// <summary>
    /// getSitesStatusCorrectness
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusCorrectness(string siteID, string targetDateFrom, string targetDateTo, String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectCorrectnessForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["ExpectedPoints"]);
                currentEventSummary.data.Add((int)rdr["GoodPoints"]);
                currentEventSummary.data.Add((int)rdr["LatchedPoints"]);
                currentEventSummary.data.Add((int)rdr["UnreasonablePoints"]);
                currentEventSummary.data.Add((int)rdr["NoncongruentPoints"]);
                currentEventSummary.data.Add((int)rdr["DuplicatePoints"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

    /// <summary>
    /// getSitesStatusFaults
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusFaults(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectFaultsForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["Faults"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

    /// <summary>
    /// getSitesStatusTrending
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusTrending(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectTrendingForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["alarm"]);
                currentEventSummary.data.Add((int)rdr["offnormal"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

    /// <summary>
    /// getSitesStatusTrendingData
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="measurementType"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySiteNullDoubles> getSitesStatusTrendingData(string siteID, string measurementType, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySiteNullDoubles> theEventSummary = new List<eventSummarySiteNullDoubles>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectTrendingDataForMeterIDsByDate" + measurementType, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@StartDate", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EndDate", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySiteNullDoubles currentEventSummary = new eventSummarySiteNullDoubles();
                currentEventSummary.siteID = ((int)rdr["ID"]).ToString();
                currentEventSummary.siteName = (string)rdr["Name"];
                currentEventSummary.data = new List<double?>();
                currentEventSummary.data.Add(rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?) null : Convert.ToDouble(rdr["Maximum"]));
                currentEventSummary.data.Add(rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : Convert.ToDouble(rdr["Minimum"]));
                currentEventSummary.data.Add(rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : Convert.ToDouble(rdr["Average"]));

                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

    /// <summary>
    /// MeasurementType
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> MeasurementType(string siteID, string targetDate)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeasurementTypes", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), (String)rdr["text"].ToString()));

            }
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
    /// MeasurementCharacteristic
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="theType"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> MeasurementCharacteristic(string siteID, string targetDate, string theType)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeasurementCharacteristic", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@Type", theType));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), (String)rdr["text"].ToString()));

            }
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
    /// Phase
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="theType"></param>
    /// <param name="theCharacteristic"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> Phase(string siteID, string targetDate, string theType, string theCharacteristic)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectPhase", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@Type", theType));
            cmd.Parameters.Add(new SqlParameter("@Characteristic", theCharacteristic));
            cmd.CommandTimeout = 300;


            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), (String)rdr["text"].ToString()));

            }
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
    /// EventInstances
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="theType"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> EventInstances(string siteID, string targetDate, string theType)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventInstance", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@Type", theType));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                String theMillisecondTime = ((System.DateTime)(rdr["text"])).TimeOfDay.ToString();
                String thelineName = (String)rdr["linename"].ToString();
                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), theMillisecondTime + " " + thelineName ));

            }
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
    /// EventTypes
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> EventTypes(string siteID, string targetDate)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventType", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), (String)rdr["text"].ToString()));

            }
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
    /// EventLinesByMeterDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> EventLinesByMeterDate(string siteID, string targetDate)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectLineNames", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), (String)rdr["text"].ToString()));

            }
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
    /// EventInstancesByMeterLineDate
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="lineID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public List<Tuple<String, String>> EventInstancesByMeterLineDate(string siteID, string lineID, string targetDate)
    {

        List<Tuple<String, String>> thedata = new List<Tuple<string, string>>();
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventInstancesByMeterLineDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@LineID", lineID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();


            while (rdr.Read())
            {

                String theMillisecondTime = ((System.DateTime)(rdr["text"])).TimeOfDay.ToString() + " - " + rdr["type"];
                thedata.Add(new Tuple<string, string>((String)rdr["value"].ToString(), theMillisecondTime));

            }
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
    /// getSitesStatusBreakers
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<eventSummarySite> getSitesStatusBreakers(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<eventSummarySite> theEventSummary = new List<eventSummarySite>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectBreakersForMeterIDsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int classcount = 0;
            while (rdr.Read())
            {
                eventSummarySite currentEventSummary = new eventSummarySite();
                currentEventSummary.siteID = ((int)rdr["siteID"]).ToString();
                currentEventSummary.siteName = (string)rdr["siteName"];
                currentEventSummary.data = new List<int>();
                currentEventSummary.data.Add((int)rdr["Normal"]);
                currentEventSummary.data.Add((int)rdr["Late"]);
                currentEventSummary.data.Add((int)rdr["Indeterminate"]);
                theEventSummary.Add(currentEventSummary);
            }
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
        return (theEventSummary);
    }

}
