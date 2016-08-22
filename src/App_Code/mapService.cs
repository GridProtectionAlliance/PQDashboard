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
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Services;
using System.Web.UI.WebControls;
using GSF.Collections;
using GSF.Configuration;
using GSF.Data;
using GSF.Drawing;
using GSF.Geo;
using GSF.NumericalAnalysis.Interpolation;
using openHistorian.XDALink;
using Org.BouncyCastle.Bcpg.OpenPgp;
using scale;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class mapService : WebService
{
    private string connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

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
        public double? Maximum;
        public double? Minimum;

        public double? Average;
        //{
        //    get
        //    {
        //        return (m_count > 0)
        //            ? m_sum / m_count
        //            : (double?)null;
        //    }
        //}

        public void Aggregate(double average)
        {
            m_sum += average;
            m_count++;
        }

        public double? GetAverage()
        {
            {
                return (m_count > 0)
                    ? m_sum / m_count
                    : (double?)null;
            }
        }


        private double m_sum;
        private int m_count;
    }

    public class TrendingDataLocationList
    {
        public List<TrendingDataLocations> Locations;
        public string Url;
        public double Latitude;
        public double Longitude;
        
        public TrendingDataLocationList()
        {
            Locations = new List<TrendingDataLocations>();
        }
    }

    public class ContourQuery
    {
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string MeasurementType { get; set; }
        public string DataType { get; set; }
        public string UserName { get; set; }

        private Lazy<DateTime> m_startDate;
        private Lazy<DateTime> m_endDate;

        public ContourQuery()
        {
            m_startDate = new Lazy<DateTime>(() => DateTime.Parse(StartDate));
            m_endDate = new Lazy<DateTime>(() => DateTime.Parse(EndDate));
        }

        public DateTime GetStartDate()
        {
            return m_startDate.Value;
        }

        public DateTime GetEndDate()
        {
            return m_endDate.Value;
        }
    }

    public class ContourInfo
    {
        public List<TrendingDataLocations> Locations { get; set; }
        public string URL { get; set; }
        public double[] ColorDomain { get; set; }
        public double[] ColorRange { get; set; }
        public double MinLatitude { get; set; }
        public double MaxLatitude { get; set; }
        public double MinLongitude { get; set; }
        public double MaxLongitude { get; set; }
        public string Date { get; set; }

    }

    private class ContourData
    {
        public string Key { get; set; }
        public byte[] ImageData { get; set; }
        public double[] ColorDomain { get; set; }
        public double[] ColorRange { get; set; }

        public string URL
        {
            get
            {
                return "./mapService.asmx/getContour?key=" + HttpUtility.UrlEncode(Key);
            }
        }
    }

    private class ContourTileData
    {
        public ManualResetEvent WaitHandle;

        public double MinLatitude { get; set; }
        public double MaxLatitude { get; set; }
        public double MinLongitude { get; set; }
        public double MaxLongitude { get; set; }

        public CoordinateReferenceSystem CRS { get; set; }
        public IDWFunc IDWFunction { get; set; }
        public Func<double, double> ColorFunction { get; set; }
    }

    private static MemoryCache s_contourDataCache = new MemoryCache("ContourDataCache");

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

    public class ContourAnimationsList
    {
        public List<ContourInfo> Infos;
        public string Date;


        public ContourAnimationsList()
        {
            Infos = new List<ContourInfo>();
        }
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
    public ContourInfo getLocationsTrendingData(ContourQuery contourQuery)
    {
        TrendingDataLocationList locationStates = new TrendingDataLocationList();

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        DateTime startDate = DateTime.Parse(contourQuery.StartDate);
        DateTime endDate = DateTime.Parse(contourQuery.EndDate);
        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrendingData" + contourQuery.MeasurementType, conn);
            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", startDate));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", endDate));
            cmd.Parameters.Add(new SqlParameter("@username", contourQuery.UserName));
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                TrendingDataLocations ourStatus = new TrendingDataLocations();
                ourStatus.Latitude = (double)rdr["Latitude"];
                ourStatus.Longitude = (double)rdr["Longitude"];
                ourStatus.name = (String)rdr["Name"];
                ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                ourStatus.id = (int)rdr["id"];
                locationStates.Locations.Add(ourStatus);
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

        double step = 0.9D / 4.0D;

        double[] colorDomain =
        {
            -1,
            0, 0,
            step, step,
            2 * step, 2 * step,
            3 * step, 3 * step,
            0.9, 0.9,
            1.1, 1.1,
            1.1 + step, 1.1 + step,
            1.1 + 2 * step, 1.1 + 2 * step,
            1.1 + 3 * step, 1.1 + 3 * step,
            2, 2,
            3
        };

        double[] colorRange =
        {
            0xAAFF0000,
            0xAAFF0000, 0xAAFFFF00,
            0xAAFFFF00, 0xAA00FF00,
            0xAA00FF00, 0xAA00FFFF,
            0xAA00FFFF, 0xAA0000FF,
            0xAA0000FF, 0x00000000,
            0x00000000, 0xAA0000FF,
            0xAA0000FF, 0xAA00FFFF,
            0xAA00FFFF, 0xAA00FF00,
            0xAA00FF00, 0xAAFFFF00,
            0xAAFFFF00, 0xAAFF0000,
            0xAAFF0000
        };
        
        return new ContourInfo()
        {
            Locations = locationStates.Locations,
            ColorDomain = colorDomain,
            ColorRange = colorRange,
        };
    }

    [WebMethod(EnableSession = true)]
    public void getContourTile()
    {
        ContourQuery contourQuery = new ContourQuery()
        {
            MeasurementType = HttpContext.Current.Request.QueryString["MeasurementType"],
            DataType = HttpContext.Current.Request.QueryString["DataType"],
            UserName = HttpContext.Current.Request.QueryString["Username"],
            StartDate = HttpContext.Current.Request.QueryString["StartDate"],
            EndDate = HttpContext.Current.Request.QueryString["EndDate"]
        };

        
        ContourTileData contourTileData = GetContourTileData(contourQuery);

        double minLat = contourTileData.MinLatitude;
        double maxLat = contourTileData.MaxLatitude;
        double minLng = contourTileData.MinLongitude;
        double maxLng = contourTileData.MaxLongitude;

        CoordinateReferenceSystem crs = contourTileData.CRS;
        IDWFunc idwFunction = contourTileData.IDWFunction;
        Func<double, double> colorFunction = contourTileData.ColorFunction;

        int tileX = Convert.ToInt32(HttpContext.Current.Request.QueryString["x"]);
        int tileY = Convert.ToInt32(HttpContext.Current.Request.QueryString["y"]);
        int zoom = Convert.ToInt32(HttpContext.Current.Request.QueryString["zoom"]);

        int tileSize = 256;
        int offsetX = tileSize * tileX;
        int offsetY = tileSize * tileY;
        uint[] pixelData = new uint[tileSize * tileSize];
        
        for (int x = 0; x < tileSize; x++)
        {
            GSF.Drawing.Point validationPixel = new GSF.Drawing.Point(offsetX + x, 0.0D);
            GeoCoordinate validationCoordinate = crs.Translate(validationPixel, zoom);

            if (validationCoordinate.Longitude < minLng || validationCoordinate.Longitude > maxLng)
                continue;

            for (int y = 0; y < tileSize; y++)
            {
                GSF.Drawing.Point offsetPixel = new GSF.Drawing.Point(offsetX + x, offsetY + y);
                GeoCoordinate pixelCoordinate = crs.Translate(offsetPixel, zoom);

                if (pixelCoordinate.Latitude < minLat || pixelCoordinate.Latitude > maxLat)
                    continue;

                double interpolatedValue = idwFunction(pixelCoordinate.Longitude, pixelCoordinate.Latitude);
                uint color = (uint)colorFunction(interpolatedValue);
                pixelData[y * tileSize + x] = color;
            }
        }

        using (Bitmap bitmap = BitmapExtensions.FromPixelData(256, pixelData))
        {
            HttpContext.Current.Response.ContentType = "image/png";
            HttpContext.Current.Response.AddHeader("Content-Disposition", string.Format("attachment;filename=tile{0}x{1}.png", tileX, tileY));
            bitmap.Save(HttpContext.Current.Response.OutputStream, ImageFormat.Png);
        }
    }

    [WebMethod(EnableSession = true)]
    public void getContour()
    {
        string key = HttpContext.Current.Request.QueryString["key"];
        ContourData contourData = (ContourData)s_contourDataCache.Get(key);

        if ((object)contourData == null)
        {
            HttpContext.Current.Response.StatusCode = (int)HttpStatusCode.NotFound;
            return;
        }

        HttpContext.Current.Response.ContentType = "image/png";
        HttpContext.Current.Response.AddHeader("Content-Disposition", "attachment;filename=contour.png");
        HttpContext.Current.Response.BinaryWrite(contourData.ImageData);
        HttpContext.Current.Response.End();
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
    public ContourInfo getContourAnimations(string targetDateFrom, string targetDateTo, string measurementType, string stepSize, string meterID, string dataType, string userName)
    {
        DataTable idTable;
        string historianServer;
        string historianInstance;
        ContourAnimationsList returnList = new ContourAnimationsList();
        DateTime dateFrom = DateTime.Parse(targetDateFrom);
        DateTime dateTo = DateTime.Parse(targetDateTo);
        returnList.Date = dateFrom.ToString();
        int numberOfIntervals = (int)(new TimeSpan(dateTo.Ticks - dateFrom.Ticks).TotalMinutes) / int.Parse(stepSize);

        //Parallel.For(0, numberOfIntervals, iter =>
        //{
        //DateTime dateIterFrom = dateFrom.AddMinutes(double.Parse(stepSize) * iter);
        //DateTime dateIterTo = dateIterFrom.AddMinutes(double.Parse(stepSize));

        ContourInfo list = new ContourInfo();
        list.Date = dateFrom.ToString();

        list.Locations = new List<TrendingDataLocations>();
        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            string query =
                "SELECT " +
                "    Channel.ID AS ChannelID, " +
                "    Meter.ID AS MeterID, " +
                "    Meter.Name AS MeterName, " +
                "    MeterLocation.Latitude, " +
                "    MeterLocation.Longitude, " +
                "    Channel.PerUnitValue " +
                "FROM " +
                "    Meter JOIN " +
                "    MeterLocation ON Meter.MeterLocationID = MeterLocation.ID LEFT OUTER JOIN " +
                "    ( " +
                "        SELECT " +
                "            Channel.ID, " +
                "            Channel.MeterID, " +
                "            Channel.PerUnitValue " +
                "        FROM " +
                "            Channel JOIN " +
                "            MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN " +
                "            MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN " +
                "            Phase ON Channel.PhaseID = Phase.ID " +
                "        WHERE " +
                "            MeasurementType.Name = {1} AND " +
                "            MeasurementCharacteristic.Name = 'RMS' AND " +
                "            Phase.Name IN ('AN', 'BN', 'CN', 'AB', 'BC', 'CA') " +
                "    ) Channel ON Channel.MeterID = Meter.ID " +
                "WHERE Meter.ID IN (SELECT * FROM authMeters({0}))";

            idTable = connection.RetrieveData(query, userName, measurementType);
            historianServer = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Server'") ?? "127.0.0.1";
            historianInstance = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Instance'") ?? "XDA";
        }

        list.Locations = idTable
            .Select()
            .DistinctBy(row => row.ConvertField<int>("MeterID"))
            .Select(row => new TrendingDataLocations()
            {
                id = row.ConvertField<int>("MeterID"),
                name = row.ConvertField<string>("MeterName"),
                Latitude = row.ConvertField<double>("Latitude"),
                Longitude = row.ConvertField<double>("Longitude")
            })
            .ToList();

        Dictionary<int, double?> nominalLookup = idTable
            .Select("ChannelID IS NOT NULL")
            .ToDictionary(row => row.ConvertField<int>("ChannelID"), row => row.ConvertField<double?>("PerUnitValue"));

        Dictionary<int, TrendingDataLocations> lookup = idTable
            .Select("ChannelID IS NOT NULL")
            .Select(row => new
            {
                ChannelID = row.ConvertField<int>("ChannelID"),
                MeterID = row.ConvertField<int>("MeterID")
            })
            .Join(list.Locations, obj => obj.MeterID, loc => loc.id, (obj, Locations) => new { obj.ChannelID, Locations })
            .ToDictionary(obj => obj.ChannelID, obj => obj.Locations);

        using (Historian historian = new Historian(historianServer, historianInstance))
        {
            foreach (TrendingDataPoint point in historian.Read(lookup.Keys, dateFrom, dateFrom))
            {
                TrendingDataLocations locations = lookup[point.ChannelID];
                double nominal = nominalLookup[point.ChannelID] ?? 1.0D;
                double value = point.Value / nominal;

                switch (point.SeriesID)
                {
                    case SeriesID.Minimum:
                        locations.Minimum = Math.Min(value, locations.Minimum ?? value);
                        break;

                    case SeriesID.Maximum:
                        locations.Maximum = Math.Max(value, locations.Maximum ?? value);
                        break;

                    case SeriesID.Average:
                        locations.Aggregate(value);
                        locations.Average = locations.GetAverage();
                        break;
                }
            }
        }


        //double maxLat = list.Locations.Max(x => x.Latitude) + GetLatFromMiles(50);
        //double minLat = list.Locations.Min(x => x.Latitude) - GetLatFromMiles(50);
        //double maxLng = list.Locations.Max(x => x.Longitude) + GetLngFromMiles(50, maxLat);
        //double minLng = list.Locations.Min(x => x.Longitude) - GetLngFromMiles(50, minLat);
        //int resolution = 1000;

        //Conversion xScale = new Linear()
        //    .domain(minLng, maxLng)
        //    .range(0, resolution);

        //Conversion yScale = new Linear()
        //    .domain(minLat, maxLat)
        //    .range(0, resolution);

        //Conversion lngScale = new Linear()
        //    .domain(0, resolution)
        //    .range(minLng, maxLng);

        //Conversion latScale = new Linear()
        //    .domain(0, resolution)
        //    .range(minLat, maxLat);

        double step = 0.9D / 4.0D;


        double[] colorDomain =
        {
                0, 0,
                step, step,
                2 * step, 2 * step,
                3 * step, 3 * step,
                0.9, 0.9,
                1.1, 1.1,
                1.1 + step, 1.1 + step,
                1.1 + 2 * step, 1.1 + 2 * step,
                1.1 + 3 * step, 1.1 + 3 * step,
                2, 2
            };

        double[] colorRange =
        {
                0xAAFF0000, 0xAAFFFF00,
                0xAAFFFF00, 0xAA00FF00,
                0xAA00FF00, 0xAA00FFFF,
                0xAA00FFFF, 0xAA0000FF,
                0xAA0000FF, 0x0,
                0x0, 0xAA0000FF,
                0xAA0000FF, 0xAA00FFFF,
                0xAA00FFFF, 0xAA00FF00,
                0xAA00FF00, 0xAAFFFF00,
                0xAAFFFF00, 0xAAFF0000
            };
        return new ContourInfo()
        {
            Locations = list.Locations,
            ColorDomain = colorDomain,
            ColorRange = colorRange
        };
    }

    //    Func<double, double> colorScale = new PiecewiseLinearFunction()
    //        .SetDomain(colorDomain)
    //        .SetRange(colorRange);

    //    uint[] pixelData = new uint[resolution * resolution];

    //    for (int yIndex = 0; yIndex < resolution; ++yIndex)
    //    {
    //        int y = yIndex;

    //        Parallel.For(0, resolution, xIndex =>
    //        {
    //            double sum = 0;
    //            double totalDistance = 0;
    //            int x = xIndex;

    //            foreach (TrendingDataLocations data in list.Locations)
    //            {
    //                double? value = null;

    //                switch (dataType)
    //                {
    //                    case "Average": value = data.Average; break;
    //                    case "Minimum": value = data.Minimum; break;
    //                    case "Maximum": value = data.Maximum; break;
    //                }

    //                if (value != null)
    //                {
    //                    var R = 6371e3; // metres
    //                    var lambda1 = lngScale(x) * Math.PI / 180.0D;
    //                    var lambda2 = data.Longitude * Math.PI / 180.0D;
    //                    var phi1 = latScale(y) * Math.PI / 180.0D;
    //                    var phi2 = data.Latitude * Math.PI / 180.0D;
    //                    var dPhi = phi2 - phi1;
    //                    var dLambda = lambda2 - lambda1;

    //                    var a = Math.Sin(dPhi / 2) * Math.Sin(dPhi / 2) +
    //                            Math.Cos(phi1) * Math.Cos(phi2) *
    //                            Math.Sin(dLambda / 2) * Math.Sin(dLambda / 2);

    //                    var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    //                    var distance = R * c;
    //                    var inverseDistance = 1 / distance;

    //                    totalDistance += inverseDistance;
    //                    sum += (double)value * inverseDistance;
    //                }
    //            }

    //            double interpolatedValue = sum / totalDistance;
    //            uint color = (uint)colorScale(interpolatedValue);
    //            pixelData[(resolution - y - 1) * resolution + x] = color;
    //        });
    //    }

    //    string path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "contour" + iter + ".png");
    //    using (Bitmap bitmap = BitmapExtensions.FromPixelData(resolution, pixelData))
    //    using (MemoryStream stream = new MemoryStream())
    //    {
    //        bitmap.Save(stream, ImageFormat.Png);

    //        ContourData contourData = new ContourData()
    //        {
    //            Key = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
    //            ImageData = stream.ToArray(),
    //            ColorDomain = colorDomain,
    //            ColorRange = colorRange
    //        };

    //        s_contourDataCache.Add(contourData.Key, contourData, new CacheItemPolicy() { SlidingExpiration = TimeSpan.FromMinutes(100) });

    //        returnList.Infos.Add(new ContourInfo()
    //        {
    //            Locations = list.Locations,
    //            Date = dateIterFrom.ToString(),
    //            URL = contourData.URL,
    //            ColorDomain = contourData.ColorDomain,
    //            ColorRange = contourData.ColorRange,
    //            MinLatitude = minLat,
    //            MaxLatitude = maxLat,
    //            MinLongitude = minLng,
    //            MaxLongitude = maxLng
    //        });
    //    }

    ////});

    //returnList.Infos = returnList.Infos.OrderBy(x => x.Date).ToList();
    //return (returnList);

    /// <summary>
    /// getColorScales
    /// </summary>
    /// <returns>List</returns>
    [WebMethod]
    public Dictionary<string, string> getColorScales()
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        Dictionary<string,string> colorScales = new Dictionary<string, string>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("SELECT * FROM dbo.ContourColorScale", conn);
            cmd.CommandType = CommandType.Text;
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                colorScales.Add(((int)rdr["ID"]).ToString(),(string)rdr["Name"]);
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
        return (colorScales);

    }

    private ContourTileData GetContourTileData(ContourQuery contourQuery)
    {
        string key = new ConnectionStringParser().ComposeConnectionString(contourQuery);
        ContourTileData contourTileData = new ContourTileData();
        CacheItemPolicy cacheItemPolicy = new CacheItemPolicy() { SlidingExpiration = TimeSpan.FromMinutes(1) };

        contourTileData = (ContourTileData)s_contourDataCache.AddOrGetExisting(key, contourTileData, cacheItemPolicy) ?? contourTileData;

        if ((object)contourTileData.IDWFunction != null && (object)contourTileData.ColorFunction != null)
            return contourTileData;

        using (ManualResetEvent waitHandle = new ManualResetEvent(false))
        {
            ManualResetEvent cachedWaitHandle = Interlocked.CompareExchange(ref contourTileData.WaitHandle, waitHandle, null);

            try
            {
                if ((object)cachedWaitHandle != null)
                {
                    cachedWaitHandle.WaitOne();
                    return contourTileData;
                }
            }
            catch (ObjectDisposedException)
            {
                return contourTileData;
            }

            List<TrendingDataLocations> locations = new List<TrendingDataLocations>();

            using (SqlConnection conn = new SqlConnection(connectionstring))
            using (SqlCommand cmd = new SqlCommand("dbo.selectMeterLocationsTrendingData" + contourQuery.MeasurementType, conn))
            {
                conn.Open();
                cmd.Parameters.Add(new SqlParameter("@EventDateFrom", contourQuery.StartDate));
                cmd.Parameters.Add(new SqlParameter("@EventDateTo", contourQuery.EndDate));
                cmd.Parameters.Add(new SqlParameter("@username", contourQuery.UserName));
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;

                using (IDataReader rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        TrendingDataLocations ourStatus = new TrendingDataLocations();
                        ourStatus.Latitude = (double)rdr["Latitude"];
                        ourStatus.Longitude = (double)rdr["Longitude"];
                        ourStatus.name = (string)rdr["Name"];
                        ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                        ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                        ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                        ourStatus.id = (int)rdr["id"];
                        locations.Add(ourStatus);
                    }
                }
            }

            CoordinateReferenceSystem crs = new EPSG3857();
            List<double> xList = new List<double>();
            List<double> yList = new List<double>();
            List<double> valueList = new List<double>();

            locations
                .Select(location =>
                {
                    GeoCoordinate Coordinate = new GeoCoordinate(location.Latitude, location.Longitude);

                    double? Value =
                        (contourQuery.DataType == "Average") ? location.Average :
                        (contourQuery.DataType == "Minimum") ? location.Minimum :
                        (contourQuery.DataType == "Maximum") ? location.Maximum :
                        null;

                    return new { Coordinate, Value };
                })
                .Where(obj => (object)obj.Value != null)
                .ToList()
                .ForEach(obj =>
                {
                    xList.Add(obj.Coordinate.Longitude);
                    yList.Add(obj.Coordinate.Latitude);
                    valueList.Add(obj.Value.GetValueOrDefault());
                });

            IDWFunc idwFunction = new InverseDistanceWeightingFunction()
                .SetXCoordinates(xList.ToArray())
                .SetYCoordinates(yList.ToArray())
                .SetValues(valueList.ToArray())
                .SetDistanceFunction((x1, y1, x2, y2) =>
                {
                    GeoCoordinate coordinate1 = new GeoCoordinate(y1, x1);
                    GeoCoordinate coordinate2 = new GeoCoordinate(y2, x2);
                    return crs.Distance(coordinate1, coordinate2);
                });

            double step = 0.9D / 4.0D;

            double[] colorDomain =
            {
                -1,
                0, 0,
                step, step,
                2 * step, 2 * step,
                3 * step, 3 * step,
                0.9, 0.9,
                1.1, 1.1,
                1.1 + step, 1.1 + step,
                1.1 + 2 * step, 1.1 + 2 * step,
                1.1 + 3 * step, 1.1 + 3 * step,
                2, 2,
                3
            };

            double[] colorRange =
            {
                0xAAFF0000,
                0xAAFF0000, 0xAAFFFF00,
                0xAAFFFF00, 0xAA00FF00,
                0xAA00FF00, 0xAA00FFFF,
                0xAA00FFFF, 0xAA0000FF,
                0xAA0000FF, 0x00000000,
                0x00000000, 0xAA0000FF,
                0xAA0000FF, 0xAA00FFFF,
                0xAA00FFFF, 0xAA00FF00,
                0xAA00FF00, 0xAAFFFF00,
                0xAAFFFF00, 0xAAFF0000,
                0xAAFF0000
            };

            Func<double, double> colorFunction = new PiecewiseLinearFunction()
                .SetDomain(colorDomain)
                .SetRange(colorRange);

            contourTileData.MinLatitude = locations.Min(location => location.Latitude) - GetLatFromMiles(50.0D);
            contourTileData.MaxLatitude = locations.Max(location => location.Latitude) + GetLatFromMiles(50.0D);
            contourTileData.MinLongitude = locations.Min(location => location.Longitude) - GetLngFromMiles(50.0D, 0.0D);
            contourTileData.MaxLongitude = locations.Max(location => location.Longitude) + GetLngFromMiles(50.0D, 0.0D);

            contourTileData.CRS = crs;
            contourTileData.IDWFunction = idwFunction;
            contourTileData.ColorFunction = colorFunction;

            waitHandle.Set();

            return contourTileData;
        }
    }

    public double GetLngFromMiles(double miles, double latitude)
    {
        return miles / 69.1710411 / Math.Cos(latitude * (Math.PI / 180));
    }

    public double GetLatFromMiles(double miles)
    {
        return miles / 68.6863716;
    }

    public double GetMilesFromLng(double deg, double latitude)
    {
        return deg * 69.1710411 * Math.Cos(latitude * (Math.PI / 180));
    }

    public double GetMilesFromLat(double deg)
    {
        return deg * 68.6863716;
    }
}