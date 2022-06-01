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
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Web.Services;
using GSF.Configuration;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class mapService : WebService
{
    private static string connectionstring = ConfigurationFile.Current.Settings["dbOpenXDA"]["ConnectionString"].Value;

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
        public double Latitude;
        public double Longitude;
        public string datetime;
        public List<int> data;
        public locationStatus()
        {
            data = new List<int>();
        }
    }

    public class LocationStatusList
    {
        public List<locationStatus> Locations;
        public double[] ColorDomain;
        public double[] ColorRange;
        
        public LocationStatusList()
        {
            Locations = new List<locationStatus>();
        } 
    }

    public class MeterLocations
    {
        public string Data;
        public Dictionary<string, string> Colors;
    }

    /// <summary>
    /// getColorScales
    /// </summary>
    /// <returns>List</returns>
    [WebMethod]
    public List<string> getColorScales()
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<string> colorScales = new List<string>();

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
                colorScales.Add((string)rdr["Name"]);
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


}