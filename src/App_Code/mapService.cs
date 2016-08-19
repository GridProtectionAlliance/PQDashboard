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
using System.Threading.Tasks;
using System.Web.Services;
using System.Web.UI.WebControls;
using GSF.Collections;
using GSF.Data;
using GSF.Drawing;
using openHistorian.XDALink;
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

        public double? Average
        {
            get
            {
                return (m_count > 0)
                    ? m_sum / m_count
                    : (double?)null;
            }
        }

        public void Aggregate(double average)
        {
            m_sum += average;
            m_count++;
        }

        private double m_sum;
        private int m_count;
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
    public List<List<double>> getLocationsTrendingData(string targetDateFrom, string measurementType, string targetDateTo, string userName, string dataType)
    {
        List<TrendingDataLocations> locationStates;

        DataTable idTable;
        string historianServer;
        string historianInstance;

        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            string query =
                "SELECT " +
                "   Channel.ID AS ChannelID, " +
                "   Meter.ID AS MeterID, " +
                "   Meter.Name AS MeterName, " +
                "   MeterLocation.Latitude, " +
                "   MeterLocation.Longitude, " +
                "   Channel.PerUnitValue " +
                "FROM " +
                "   Channel JOIN " +
                "   Meter ON Channel.MeterID = Meter.ID JOIN " +
                "   MeterLocation ON Meter.MeterLocationID = MeterLocation.ID JOIN " +
                "   MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN " +
                "   MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN " +
                "   Phase ON Channel.PhaseID = Phase.ID " +
                "WHERE " +
                "   Meter.ID IN (SELECT * FROM authMeters({0})) AND " +
                "   MeasurementType.Name = {1} AND " +
                "   MeasurementCharacteristic.Name = 'RMS' AND " +
                "   Phase.Name IN ('AN', 'BN', 'CN', 'AB', 'BC', 'CA')";

            idTable = connection.RetrieveData(query, userName, measurementType);
            historianServer = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Server'") ?? "127.0.0.1";
            historianInstance = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Instance'") ?? "XDA";
        }

        locationStates = idTable
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
            .Select()
            .ToDictionary(row => row.ConvertField<int>("ChannelID"), row => row.ConvertField<double?>("PerUnitValue"));

        Dictionary<int, TrendingDataLocations> lookup = idTable
            .Select()
            .Select(row => new
            {
                ChannelID = row.ConvertField<int>("ChannelID"),
                MeterID = row.ConvertField<int>("MeterID")
            })
            .Join(locationStates, obj => obj.MeterID, loc => loc.id, (obj, Locations) => new { obj.ChannelID, Locations })
            .ToDictionary(obj => obj.ChannelID, obj => obj.Locations);

        using (Historian historian = new Historian(historianServer, historianInstance))
        {
            foreach (TrendingDataPoint point in historian.Read(lookup.Keys, DateTime.Parse(targetDateFrom), DateTime.Parse(targetDateTo)))
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
                        break;
                }
            }
        }

        double maxLat = locationStates.Max(x => x.Latitude) + GetLatFromMiles(50);
        double minLat = locationStates.Min(x => x.Latitude) - GetLatFromMiles(50);
        double maxLng = locationStates.Max(x => x.Longitude) + GetLngFromMiles(50, maxLat);
        double minLng = locationStates.Min(x => x.Longitude) - GetLngFromMiles(50, minLat);
        int resolution = 1000;

        Conversion xScale = new Linear()
            .domain(minLng, maxLng)
            .range(0, resolution);

        Conversion yScale = new Linear()
            .domain(minLat, maxLat)
            .range(0, resolution);

        Conversion lngScale = new Linear()
            .domain(0, resolution)
            .range(minLng, maxLng);

        Conversion latScale = new Linear()
            .domain(0, resolution)
            .range(minLat, maxLat);

        double step = 0.9D / 4.0D;

        Conversion colorScale = new Linear()
            .domain(
                0, 0,
                step, step,
                2 * step, 2 * step,
                3 * step, 3 * step,
                0.9, 0.9,
                1.1, 1.1,
                1.1 + step, 1.1 + step,
                1.1 + 2 * step, 1.1 + 2 * step,
                1.1 + 3 * step, 1.1 + 3 * step,
                2, 2)
            .range(
                0xAAFF0000, 0xAAFFFF00,
                0xAAFFFF00, 0xAA00FF00,
                0xAA00FF00, 0xAA00FFFF,
                0xAA00FFFF, 0xAA0000FF,
                0xAA0000FF, 0x0,
                0x0, 0xAA0000FF,
                0xAA0000FF, 0xAA00FFFF,
                0xAA00FFFF, 0xAA00FF00,
                0xAA00FF00, 0xAAFFFF00,
                0xAAFFFF00, 0xAAFF0000);

        uint[] pixelData = new uint[resolution * resolution];

        for (int yIndex = 0; yIndex < resolution; ++yIndex)
        {
            int y = yIndex;

            Parallel.For(0, resolution, xIndex =>
            {
                double sum = 0;
                double totalDistance = 0;
                int x = xIndex;

                foreach (TrendingDataLocations data in locationStates)
                {
                    double? value = null;

                    switch (dataType)
                    {
                        case "Average": value = data.Average; break;
                        case "Minimum": value = data.Minimum; break;
                        case "Maximum": value = data.Maximum; break;
                    }

                    if (value != null)
                    {
                        var R = 6371e3; // metres
                        var lambda1 = lngScale(x) * Math.PI / 180.0D;
                        var lambda2 = data.Longitude * Math.PI / 180.0D;
                        var phi1 = latScale(y) * Math.PI / 180.0D;
                        var phi2 = data.Latitude * Math.PI / 180.0D;
                        var dPhi = phi2 - phi1;
                        var dLambda = lambda2 - lambda1;

                        var a = Math.Sin(dPhi / 2) * Math.Sin(dPhi / 2) +
                                Math.Cos(phi1) * Math.Cos(phi2) *
                                Math.Sin(dLambda / 2) * Math.Sin(dLambda / 2);

                        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                        var distance = R * c;
                        var inverseDistance = 1 / distance;

                        totalDistance += inverseDistance;
                        sum += (double)value * inverseDistance;
                    }
                }

                double interpolatedValue = sum / totalDistance;
                uint color = (uint)colorScale(interpolatedValue);
                pixelData[(resolution - y - 1) * resolution + x] = color;
            });
        }

        using (Bitmap bitmap = BitmapExtensions.FromPixelData(resolution, pixelData))
        {
            // TODO: Cache the image and make it available through a temporary URL
            string dir = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            bitmap.Save(Path.Combine(dir, "contour.png"), ImageFormat.Png);
        }

        // Unlock the browser
        throw new Exception();

        // TODO: Return the temporary URL so the client can display the image on the map
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