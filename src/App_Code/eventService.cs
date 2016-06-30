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

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 

[System.Web.Script.Services.ScriptService]
public class eventService : System.Web.Services.WebService {

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

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
    /// getBreakersForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getBreakersForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectBreakersForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[3];
                //theset.xAxis = new string[duration];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "Normal";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "Late";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "Indeterminate";
                theset.data[2].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    theset.data[0].data[i] = Convert.ToDouble(rdr["normal"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["late"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["indeterminate"]);
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getEventsForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getEventsForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventsForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[6];
                //theset.xAxis = new string[duration];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "Interruption";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "Fault";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "Sag";
                theset.data[2].data = new double[duration];

                theset.data[3] = new eventDetail();
                theset.data[3].name = "Transient";
                theset.data[3].data = new double[duration];

                theset.data[4] = new eventDetail();
                theset.data[4].name = "Swell";
                theset.data[4].data = new double[duration];

                theset.data[5] = new eventDetail();
                theset.data[5].name = "Other";
                theset.data[5].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    //thedate, thecount, thename
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[i] = thedate.ToString("d");
                    theset.data[0].data[i] = Convert.ToDouble(rdr["interruptions"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["faults"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["sags"]);
                    theset.data[3].data[i] = Convert.ToDouble(rdr["transients"]);
                    theset.data[4].data[i] = Convert.ToDouble(rdr["swells"]);
                    theset.data[5].data[i] = Convert.ToDouble(rdr["others"]);
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getDisturbancesForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getDisturbancesForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectDisturbancesForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[6];
                //theset.xAxis = new string[duration];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "5";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "4";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "3";
                theset.data[2].data = new double[duration];

                theset.data[3] = new eventDetail();
                theset.data[3].name = "2";
                theset.data[3].data = new double[duration];

                theset.data[4] = new eventDetail();
                theset.data[4].name = "1";
                theset.data[4].data = new double[duration];

                theset.data[5] = new eventDetail();
                theset.data[5].name = "0";
                theset.data[5].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    //thedate, thecount, thename
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[i] = thedate.ToString("d");
                    theset.data[0].data[i] = Convert.ToDouble(rdr["5"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["4"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["3"]);
                    theset.data[3].data[i] = Convert.ToDouble(rdr["2"]);
                    theset.data[4].data[i] = Convert.ToDouble(rdr["1"]);
                    theset.data[5].data[i] = Convert.ToDouble(rdr["0"]);
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getCompletenessForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getCompletenessForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);
        int metercount = siteID.Split(',').Length - 1;

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectCompletenessForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[7];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "> 100%";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "98% - 100%";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "90% - 97%";
                theset.data[2].data = new double[duration];

                theset.data[3] = new eventDetail();
                theset.data[3].name = "70% - 89%";
                theset.data[3].data = new double[duration];

                theset.data[4] = new eventDetail();
                theset.data[4].name = "50% - 69%";
                theset.data[4].data = new double[duration];

                theset.data[5] = new eventDetail();
                theset.data[5].name = ">0% - 49%";
                theset.data[5].data = new double[duration];

                theset.data[6] = new eventDetail();
                theset.data[6].name = "0%";
                theset.data[6].data = new double[duration];


                int i = 0;

                while (rdr.Read())
                {
                    theset.data[0].data[i] = Convert.ToDouble(rdr["First"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["Second"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["Third"]);
                    theset.data[3].data[i] = Convert.ToDouble(rdr["Fourth"]);
                    theset.data[4].data[i] = Convert.ToDouble(rdr["Fifth"]);
                    theset.data[5].data[i] = Convert.ToDouble(rdr["Sixth"]);

                    Double composite = theset.data[0].data[i] + theset.data[1].data[i] + theset.data[2].data[i] + theset.data[3].data[i] + theset.data[4].data[i] + theset.data[5].data[i];

                    theset.data[6].data[i] = metercount - composite;
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getCorrectnessForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getCorrectnessForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);
        int metercount = siteID.Split(',').Length - 1;

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectCorrectnessForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[7];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "> 100%";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "98% - 100%";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "90% - 97%";
                theset.data[2].data = new double[duration];

                theset.data[3] = new eventDetail();
                theset.data[3].name = "70% - 89%";
                theset.data[3].data = new double[duration];

                theset.data[4] = new eventDetail();
                theset.data[4].name = "50% - 69%";
                theset.data[4].data = new double[duration];

                theset.data[5] = new eventDetail();
                theset.data[5].name = ">0% - 49%";
                theset.data[5].data = new double[duration];

                theset.data[6] = new eventDetail();
                theset.data[6].name = "0%";
                theset.data[6].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    theset.data[0].data[i] = Convert.ToDouble(rdr["First"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["Second"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["Third"]);
                    theset.data[3].data[i] = Convert.ToDouble(rdr["Fourth"]);
                    theset.data[4].data[i] = Convert.ToDouble(rdr["Fifth"]);
                    theset.data[5].data[i] = Convert.ToDouble(rdr["Sixth"]);

                    Double composite = theset.data[0].data[i] + theset.data[1].data[i] + theset.data[2].data[i] + theset.data[3].data[i] + theset.data[4].data[i] + theset.data[5].data[i];

                    theset.data[6].data[i] = metercount - composite;
                    i++;
                }
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

        return (theset);
    }    


    /// <summary>
    /// getCorrectnessForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getCorrectnessForPeriod2(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectCorrectnessForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[3];
                //theset.xAxis = new string[duration];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "Latched";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "Unreasonable";
                theset.data[1].data = new double[duration];

                theset.data[2] = new eventDetail();
                theset.data[2].name = "Noncongruent";
                theset.data[2].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    //thedate, thecount, thename
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[i] = thedate.ToString("d");
                    theset.data[0].data[i] = Convert.ToDouble(rdr["Latched"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["Unreasonable"]);
                    theset.data[2].data[i] = Convert.ToDouble(rdr["Noncongruent"]);
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getTrendingForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getTrendingForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectTrendingForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[2];
                //theset.xAxis = new string[duration];

                theset.data[0] = new eventDetail();
                theset.data[0].name = "Alarm";
                theset.data[0].data = new double[duration];

                theset.data[1] = new eventDetail();
                theset.data[1].name = "OffNormal";
                theset.data[1].data = new double[duration];

                int i = 0;

                while (rdr.Read())
                {
                    //thedate, thecount, thename
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[i] = thedate.ToString("d");
                    theset.data[0].data[i] = Convert.ToDouble(rdr["Alarm"]);
                    theset.data[1].data[i] = Convert.ToDouble(rdr["Offnormal"]);
                    i++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getFaultsForPeriod
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getFaultsForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        DateTime thedateto = DateTime.Parse(targetDateTo);

        int duration = thedateto.Subtract(thedatefrom).Days + 1;
        List<String> powerlineclasslist = new List<string>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();

            // Get Power Line Class Count
            SqlCommand cmd2 = new SqlCommand("dbo.selectPowerLineClasses", conn);
            cmd2.CommandType = CommandType.StoredProcedure;
            cmd2.Parameters.Add(new SqlParameter("@username", userName));
            cmd2.CommandTimeout = 300;
            rdr = cmd2.ExecuteReader();
            if (rdr.HasRows)
            {
                while (rdr.Read())
                {
                    powerlineclasslist.Add (Convert.ToString(rdr["class"]));
                }

            }

            rdr.Close();
            rdr = null;

            SqlCommand cmd = new SqlCommand("dbo.selectFaultsForMeterIDByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {

                theset.data = new eventDetail[powerlineclasslist.Count];
                ////theset.xAxis = new string[duration];
                int i = 0;

                foreach (var temp in powerlineclasslist)
                {

                    theset.data[i] = new eventDetail();
                    theset.data[i].name = temp + " kV";
                    theset.data[i].data = new double[duration];
                    i++;
                }

                int j = 0;

                while (rdr.Read())
                {
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[j] = thedate.ToString("d"); 

                    for ( i = 0; i < powerlineclasslist.Count; i++)
                    {
                        theset.data[i].data[j] = Convert.ToDouble(rdr["thecount"]);
                        if ( i < (powerlineclasslist.Count - 1) ) rdr.Read();
                    }

                    j++;
                }
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

        return (theset);
    }

    /// <summary>
    /// getCalendarForEvents
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getCalendarForEvents(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventsForCalendar", conn);
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
    /// getCalendarForCompleteness
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getCalendarForCompleteness(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventsForCalendar", conn);
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
    /// getCalendarForCompleteness
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getCalendarForCorrectness(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectEventsForCalendar", conn);
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
        /// getCalendarForBreakers
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getCalendarForBreakers(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectBreakersForCalendar", conn);
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
    /// getCalendarForTrending
    /// </summary>
    /// <param name="userName"></param>
    /// <returns></returns>
    /// 
    [WebMethod]
    public String getCalendarForTrending(String userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        String thedata = "";

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectTrendingForCalendar", conn);
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


    /// <summary>
    /// getDetailsForSitesBreakers
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesBreakers(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesBreakersDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesEventsDateRange
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesEventsDateRange(string siteID, string targetDateFrom, string targetDateTo, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesEventsDetailsByDateRange", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesEvents
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesEvents(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesEventsDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesEvents
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesDisturbances(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesDisturbancesDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesCompleteness
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesCompleteness(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesCompletenessDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesCorrectness
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesCorrectness(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesCorrectnessDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getDetailsForSitesFaults
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesFaults(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesFaultsDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
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
    /// getTrendingDetailsForSites
    /// </summary>
    /// <param name="siteID"></param>
    /// <param name="targetDate"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public String getDetailsForSitesTrending(string siteID, string targetDate, string userName)
    {

        String thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectSitesTrendingDetailsByDate", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(rdr);
            thedata = DataTable2JSON(dt);
            dt.Dispose();
        }
        catch (Exception e)
        {
            int i = 0;
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

    private static DateTime Round(DateTime dateTime, TimeSpan interval)
    {
        var halfIntervelTicks = (interval.Ticks + 1) >> 1;

        return dateTime.AddTicks(halfIntervelTicks - ((dateTime.Ticks + halfIntervelTicks) % interval.Ticks));
    }

    /// <summary>
    /// getTrendsforChannelIDDate
    /// </summary>
    /// <param name="ChannelID"></param>
    /// <param name="targetDate"></param>
    /// <returns></returns>
    [WebMethod]
    public eventSet getTrendsforChannelIDDate(string ChannelID, string targetDate)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        eventSet theset = new eventSet();
        String theSproc = "dbo.selectTrendingDataByChannelIDDate";

        List<string> thedates = new List<string>();
        List<double> minimum = new List<double>();
        List<double> maximum = new List<double>();
        List<double> average = new List<double>();

        List<double> alarmlimithigh = new List<double>();
        List<double> alarmlimitlow = new List<double>();
        List<double> offlimithigh = new List<double>();
        List<double> offlimitlow = new List<double>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand(theSproc, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
            cmd.Parameters.Add(new SqlParameter("@ChannelID", ChannelID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            //int i = 0;
            while (rdr.Read())
            {

                DateTime thetime = Round((DateTime)rdr["thedate"],new TimeSpan(0,0,1));
                thedates.Add(thetime.ToString());

                minimum.Add((double)rdr["theminimum"]);
                maximum.Add((double)rdr["themaximum"]);
                average.Add((double)rdr["theaverage"]);
                alarmlimithigh.Add((double)rdr["alarmlimithigh"]);

                //if (rdr["alarmlimitlow"] == DBNull.Value)
                //{
                //    int i = 0;
                //}
                //else
                //{
                    alarmlimitlow.Add((double)rdr["alarmlimitlow"]);
                //}

                offlimithigh.Add((double)rdr["offlimithigh"]);
                offlimitlow.Add((double)rdr["offlimitlow"]);
                //i++;

                //if (i > 999) break;
            }

        }
        catch (Exception e)
        {
            return (null);
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
