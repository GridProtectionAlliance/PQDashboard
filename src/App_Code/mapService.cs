//******************************************************************************************************
//  mapService.cs - Gbtc
//
//==================================================================
//  Copyright © 2014 Electric Power Research Institute, Inc. 
//  The embodiments of this Program and supporting materials may be ordered from:

//                Electric Power Software Center (EPSC)
//                9625 Research Drive
//                Charlotte, NC 28262 USA
//                Phone: 1-800-313-3774
//                Email: askepri@epri.com
//  THIS NOTICE MAY NOT BE REMOVED FROM THE PROGRAM BY ANY USER THEREOF.
//==================================================================
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  05/02/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Web.UI.WebControls;
using GSF.Collections;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class mapService : System.Web.Services.WebService
{

    private String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    public class siteGeocoordinates
    {
        public double latitude;
        public double longitude;
    }

    public class MeterID
    {
        public string name;
        public int id;
    }

    public class locationStatus
    {
        public string name;
        public int id;
        public int status;
        public siteGeocoordinates location;
        public string datetime;
    }

    public class TrendingDataLocations
    {
        public int id;
        public string name;
        public double Latitude;
        public double Longitude;
        public double? Average;
        public double? Maximum;
        public double? Minimum;
    }

    public class ContourAnimations
    {
        public int id;
        public string Date;
        public double? Minimum;
        public double? Maximum;
        public double? Average;
        public double? Longitude;
        public double? Latitude;
        public string name;
    }

    [WebMethod]
    public List<MeterID> getMeters(string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<MeterID> meterIDs = new List<MeterID>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeters", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                MeterID metersId = new MeterID();
                metersId.name = (string)rdr["name"];
                metersId.id = (int)rdr["id"];
                meterIDs.Add(metersId);
            }
        }
        finally
        {
            if (conn != null)
                conn.Close();

            if (rdr != null)
                rdr.Close();
        }
        return (meterIDs);
    }

    /// <summary>
    /// getMeterIDsForArea (Dragged Rect on Map)
    /// </summary>
    /// <param name="ax"></param>
    /// <param name="ay"></param>
    /// <param name="bx"></param>
    /// <param name="by"></param>
    /// <param name="userName"></param>
    /// <returns></returns>

    [WebMethod]
    public List<String> getMeterIDsForArea(double ax, double ay, double bx, double by, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<String> theMeterIDs = new List<String>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterIDsForArea", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("@ax", ax));
            cmd.Parameters.Add(new SqlParameter("@ay", ay));
            cmd.Parameters.Add(new SqlParameter("@bx", bx));
            cmd.Parameters.Add(new SqlParameter("@by", by));
            cmd.Parameters.Add(new SqlParameter("@username", userName));

            rdr = cmd.ExecuteReader();
            if (rdr.HasRows)
            {
                while (rdr.Read())
                {
                    theMeterIDs.Add((String)rdr["TheMeterID"].ToString());
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

        return (theMeterIDs);
    }

    /// <summary>
    /// getLocationsHeatmapSags 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsHeatmapSwell(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMaximumSwell", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }

    /// <summary>
    /// getLocationsHeatmapSags 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsHeatmapSags(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }

    /// <summary>
    /// getLocationsEvents 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod (EnableSession = true)]
    public List<locationStatus> getLocationsEvents(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsEvents", conn);
            //SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }

    /// <summary>
    /// getLocationsEventsHeatmapCounts 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <param name="severityFilter"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsEventsHeatmapCounts(string targetDateFrom, string targetDateTo, string userName, string severityFilter)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsEvents", conn);
            //SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];

                IDictionary<string, int> dict = new Dictionary<string, int>();
                dict["Interruption"] = 1;
                dict["Fault"] = 1;
                dict["Sag"] = 1;
                dict["Transient"] = 1;
                dict["Swell"] = 1;
                dict["Other"] = 1;


                if (severityFilter == "undefined")
                    severityFilter = "Interruption,Fault,Sag,Transient,Swell,Other";
                string[] codes = severityFilter.Split(',');
                int sum = 0;
                foreach (string s in codes)
                {
                    if (s != "")
                        sum += (int)rdr[s]*dict[s];
                }
                ourStatus.status = sum;

                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }


    /// <summary>
    /// getLocationsDisturbances 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsDisturbances(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsDisturbances", conn);
            //SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Disturbance_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }

    /// <summary>
    /// getLocationsDisturbancesHeatmapCounts 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <param name="severityFilter"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsDisturbancesHeatmapCounts(string targetDateFrom, string targetDateTo, string userName, string severityFilter )
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsDisturbances", conn);
            //SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];

                if (severityFilter == "undefined")
                    severityFilter = "5,4,3,2,1,0";
                string[] codes = severityFilter.Split(',');
                int sum = 0;
                foreach (string s in codes)
                {
                    if(s != "")
                        sum += (int)rdr[s] * (int.Parse(s) + 1);
                }
                ourStatus.status = sum;
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }


    /// <summary>
    /// getLocationsCorrectness 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsCorrectness(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsCorrectness", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }


    /// <summary>
    /// getLocationsCompleteness 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsCompleteness(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsCompleteness", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }

    /// <summary>
    /// getLocationsTrending 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<locationStatus> getLocationsFaults(string targetDateFrom, string targetDateTo, string userName )
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsFaults", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }

    /// <summary>
    /// getHeatmapLocationsTrending 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<locationStatus> getHeatmapLocationsTrending(string targetDateFrom, string meterIDs, string userName)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };
        Random rand = new Random();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectHeatmapMeterLocationsTrending", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDate", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@MeterID", meterIDs));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.id = (int)rdr["MeterID"];
                ourStatus.status = (int)rdr["Value"];
                ourStatus.datetime = (String)((DateTime)rdr["thedate"]).ToString("MM/dd/yy HH:mm:ss");
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }

    /// <summary>
    /// getLocationsTrending 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<locationStatus> getLocationsTrending(string targetDateFrom, string targetDateTo, string userName)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrending", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["AlarmCount"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }


    /// <summary>
    /// getLocationsTrendingData 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="measurementType"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<TrendingDataLocations> getLocationsTrendingData(string targetDateFrom, string measurementType,  string targetDateTo, string userName)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<TrendingDataLocations> locationStates = new List<TrendingDataLocations> { };
        
       

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrendingData" + measurementType, conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                TrendingDataLocations ourStatus = new TrendingDataLocations();
                ourStatus.Latitude = (double)rdr["Latitude"];
                ourStatus.Longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["Name"];
                ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?) null:(double)rdr["Average"]);
                ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                ourStatus.id = (int)rdr["ID"];
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }

    /// <summary>
    /// getLocationsDisturbancesHeatmapCounts 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <param name="severityFilter"></param>
    /// <returns></returns>
    [WebMethod(EnableSession = true)]
    public List<locationStatus> getLocationsTrendingHeatmapCounts(string targetDateFrom, string targetDateTo, string userName, string severityFilter)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrending", conn);
            //SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsMinimumSags", conn);

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();

            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];

                if (severityFilter == "undefined")
                    severityFilter = "Alarm,Offnormal";
                string[] codes = severityFilter.Split(',');
                int sum = 0;
                foreach (string s in codes)
                {
                    if (s != "")
                        sum += (int)rdr[s];
                }
                ourStatus.status = sum;
                ourStatus.id = (int)rdr["ID"];
                locationStates.Add(ourStatus);
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

        return (locationStates);
    }

    /// <summary>
    /// getLocationsBreakers 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<locationStatus> getLocationsBreakers(string targetDateFrom, string targetDateTo, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<locationStatus> locationStates = new List<locationStatus> { };

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsBreakers", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                locationStatus ourStatus = new locationStatus();
                ourStatus.location = new siteGeocoordinates();
                ourStatus.location.latitude = (double)rdr["Latitude"];
                ourStatus.location.longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["name"];
                ourStatus.status = (int)rdr["Event_Count"];
                ourStatus.id = (int)rdr["id"];
                locationStates.Add(ourStatus);
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
        return (locationStates);
    }

    /// <summary>
    /// getContourAnimations 
    /// </summary>
    /// <param name="targetDateFrom"></param>
    /// <param name="targetDateTo"></param>
    /// <param name="meterID"></param>
    /// <param name="userName"></param>
    /// <returns></returns>
    [WebMethod]
    public List<ContourAnimations> getContourAnimations(string targetDateFrom, string targetDateTo, string stepSize, string meterID, string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<ContourAnimations> returnList = new List<ContourAnimations> { };
        DateTime dateFrom = DateTime.Parse(targetDateFrom);
        DateTime dateTo = DateTime.Parse(targetDateTo);
        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrendingDataVoltageAnimation", conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", dateFrom));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", dateTo));
            cmd.Parameters.Add(new SqlParameter("@MeterID", meterID));
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.Parameters.Add(new SqlParameter("@StepSize", stepSize));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                ContourAnimations ca = new ContourAnimations();
                ca.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                ca.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                ca.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                ca.Date = (String)((DateTime)rdr["Date"]).ToString("MM/dd/yy HH:mm:ss");
                ca.id = (int)rdr["ID"];
                ca.Latitude = (double)rdr["Latitude"];
                ca.Longitude = (double)rdr["Longitude"];
                ca.name = (string)rdr["Name"];
                returnList.Add(ca);
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
        return (returnList);
    }

}