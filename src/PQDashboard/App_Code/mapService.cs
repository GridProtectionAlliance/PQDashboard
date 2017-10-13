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
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI.WebControls;
using GSF.Collections;
using GSF.Configuration;
using GSF.Data;
using GSF.Data.Model;
using GSF.Drawing;
using GSF.Geo;
using GSF.NumericalAnalysis.Interpolation;
using GSF.Threading;
using GSF.Web.Model;
using openHistorian.XDALink;
using PQDashboard;
using PQDashboard.Model;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class mapService : WebService
{
    private static string connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

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

    //public class TrendingDataLocation
    //{
    //    public int ID;
    //    public string Name;
    //    public double Latitude;
    //    public double Longitude;
    //    public double? Maximum;
    //    public double? Minimum;
    //    public double? Average;
    //    public List<double?> Data;

    //    public TrendingDataLocation()
    //    {
    //        Data = new List<double?>();
    //    }

    //    public void Aggregate(double average)
    //    {
    //        m_sum += average;
    //        m_count++;
    //    }

    //    public double? GetAverage()
    //    {
    //        return (m_count > 0)
    //            ? m_sum / m_count
    //            : (double?)null;
    //    }

    //    private double m_sum;
    //    private int m_count;
    //}

    //public class ContourQuery
    //{
    //    public string ColorScaleName { get; set; }
    //    public string Meters { get; set; }
    //    public string StartDate { get; set; }
    //    public string EndDate { get; set; }
    //    public string DataType { get; set; }
    //    public string UserName { get; set; }
    //    public int Resolution { get; set; }
    //    public int StepSize { get; set; }
    //    public bool IncludeWeather { get; set; }
    //    public string MeterIds { get; set; }
    //    private Lazy<DateTime> m_startDate;
    //    private Lazy<DateTime> m_endDate;

    //    public ContourQuery()
    //    {
    //        DateTimeStyles styles = DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal;
    //        m_startDate = new Lazy<DateTime>(() => DateTime.SpecifyKind(DateTime.Parse(StartDate, null, styles), DateTimeKind.Unspecified));
    //        m_endDate = new Lazy<DateTime>(() => DateTime.SpecifyKind(DateTime.Parse(EndDate, null, styles), DateTimeKind.Unspecified));
    //        Resolution = -1;
    //        StepSize = -1;
    //    }

    //    public DateTime GetStartDate()
    //    {
    //        return m_startDate.Value;
    //    }

    //    public DateTime GetEndDate()
    //    {
    //        return m_endDate.Value;
    //    }
    //}

    //public class ContourAnimationInfo
    //{
    //    public int AnimationID { get; set; }
    //    public List<ContourInfo> Infos { get; set; }
    //    public double[] ColorDomain { get; set; }
    //    public double[] ColorRange { get; set; }
    //    public double MinLatitude { get; set; }
    //    public double MaxLatitude { get; set; }
    //    public double MinLongitude { get; set; }
    //    public double MaxLongitude { get; set; }
    //}

    //public class ContourInfo
    //{
    //    public List<TrendingDataLocation> Locations { get; set; }
    //    public string URL { get; set; }
    //    public string Date { get; set; }
    //    public double[] ColorDomain { get; set; }
    //    public double[] ColorRange { get; set; }
    //}

    //private class ContourTileData
    //{
    //    public ManualResetEvent WaitHandle;

    //    public double MinLatitude { get; set; }
    //    public double MaxLatitude { get; set; }
    //    public double MinLongitude { get; set; }
    //    public double MaxLongitude { get; set; }

    //    public IDWFunc IDWFunction { get; set; }
    //    public Func<double, double> ColorFunction { get; set; }
    //}

    public class MeterLocations
    {
        public string Data;
        public Dictionary<string, string> Colors;
    }

    private class ProgressCounter
    {
        private int m_progress;
        private int m_total;

        public ProgressCounter(int total)
        {
            m_total = total;
        }

        public int Progress
        {
            get
            {
                return Interlocked.CompareExchange(ref m_progress, 0, 0) * 100 / m_total;
            }
        }

        public void Increment()
        {
            Interlocked.Increment(ref m_progress);
        }
    }

    private static MemoryCache s_contourDataCache = new MemoryCache("ContourDataCache");
    private static ConcurrentDictionary<int, ICancellationToken> s_cancellationTokens = new ConcurrentDictionary<int, ICancellationToken>();
    private static ConcurrentDictionary<int, ProgressCounter> s_progressCounters = new ConcurrentDictionary<int, ProgressCounter>();

    private static CoordinateReferenceSystem s_crs = new EPSG3857();
    private static LongSynchronizedOperation s_cleanUpAnimationOperation = new LongSynchronizedOperation(CleanUpAnimation);

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
        List<TrendingDataLocation> locations = new List<TrendingDataLocation>();
        DataTable colorScale;

        using (AdoDataConnection conn = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        using (IDbCommand cmd = conn.Connection.CreateCommand())
        {
            DataTable meterIds;
            string meters;
            string filterExpression = "";
            if (contourQuery.MeterIds == 0.ToString())
            {
                meterIds = conn.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID =  (SELECT ID FROM UserAccount WHERE Name = '{contourQuery.UserName}')))");
            }
            else
            {
                int meterGroupId = conn.ExecuteScalar<int>("Select MeterGroupID FROM DeviceFilter WHERE ID = {0}", contourQuery.MeterIds);
                filterExpression = conn.ExecuteScalar<string>("Select FilterExpression FROM DeviceFilter WHERE ID = {0}", int.Parse(contourQuery.MeterIds));

                if (meterGroupId == 0)
                    meterIds = conn.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID = (SELECT ID FROM UserAccount WHERE Name = '{contourQuery.UserName}')))");
                else
                    meterIds = conn.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID = {meterGroupId})");
            }

            if (filterExpression != "")
                meters = string.Join(",", meterIds.Select(filterExpression).Select(x => int.Parse(x["ID"].ToString())));
            else
                meters = string.Join(",", meterIds.Select().Select(x => int.Parse(x["ID"].ToString())));

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", contourQuery.GetStartDate()));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", contourQuery.GetEndDate()));
            cmd.Parameters.Add(new SqlParameter("@colorScaleName", contourQuery.ColorScaleName));
            cmd.Parameters.Add(new SqlParameter("@meterIds", meters));
            cmd.CommandText = "dbo.selectMeterLocationsTrendingData";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;

            using (IDataReader rdr = cmd.ExecuteReader())
            {
                while (rdr.Read())
                {
                    TrendingDataLocation ourStatus = new TrendingDataLocation();
                    ourStatus.Latitude = (double)rdr["Latitude"];
                    ourStatus.Longitude = (double)rdr["Longitude"];
                    ourStatus.Name = (string)rdr["Name"];
                    ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                    ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                    ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                    ourStatus.ID = (int)rdr["id"];
                    ourStatus.Data.Add(ourStatus.Average);
                    ourStatus.Data.Add(ourStatus.Maximum);
                    ourStatus.Data.Add(ourStatus.Minimum);
                    locations.Add(ourStatus);
                }
            }

            string query =
                "SELECT " +
                "    ContourColorScalePoint.Value, " +
                "    ContourColorScalePoint.Color " +
                "FROM " +
                "    ContourColorScale JOIN " +
                "    ContourColorScalePoint ON ContourColorScalePoint.ContourColorScaleID = ContourColorScale.ID " +
                "WHERE ContourColorScale.Name = {0} " +
                "ORDER BY ContourColorScalePoint.OrderID";

            colorScale = conn.RetrieveData(query, contourQuery.ColorScaleName);
        }

        double[] colorDomain = colorScale
            .Select()
            .Select(row => row.ConvertField<double>("Value"))
            .ToArray();

        double[] colorRange = colorScale
            .Select()
            .Select(row => (double)(uint)row.ConvertField<int>("Color"))
            .ToArray();

        return new ContourInfo()
        {
            Locations = locations,
            ColorDomain = colorDomain,
            ColorRange = colorRange,
        };
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
    public List<string> getMeterIDsForArea(double ax, double ay, double bx, double by, string userName)
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

    [WebMethod]
    public void getContourTile()
    {
        ContourQuery contourQuery = new ContourQuery()
        {
            StartDate = HttpContext.Current.Request.QueryString["StartDate"],
            EndDate = HttpContext.Current.Request.QueryString["EndDate"],
            ColorScaleName = HttpContext.Current.Request.QueryString["ColorScaleName"],
            DataType = HttpContext.Current.Request.QueryString["DataType"],
            UserName = HttpContext.Current.Request.QueryString["Username"],
            Meters = HttpContext.Current.Request.QueryString["Meters"],
            MeterIds = HttpContext.Current.Request.QueryString["MeterIds"]

        };

        ContourTileData contourTileData = GetContourTileData(contourQuery);

        double minLat = contourTileData.MinLatitude;
        double maxLat = contourTileData.MaxLatitude;
        double minLng = contourTileData.MinLongitude;
        double maxLng = contourTileData.MaxLongitude;

        CoordinateReferenceSystem crs = s_crs;
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

    private List<TrendingDataLocation> GetFrameFromDailySummary(ContourQuery contourQuery)
    {
        List<TrendingDataLocation> locations = new List<TrendingDataLocation>();

        using (AdoDataConnection conn = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        using (DataContext dataContext = new DataContext(conn))
        using (IDbCommand cmd = conn.Connection.CreateCommand())
        {

            var meters = dataContext.Table<Meter>().QueryRecordsWhere ("ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID =  (SELECT ID FROM UserAccount WHERE Name = {0})))", contourQuery.UserName);

            if (!string.IsNullOrEmpty(contourQuery.Meters))
            {
                const int byteSize = 8;

                // Meter selections are stored as a base-64 string without padding, using '-' instead of '+' and '_' instead of '/'
                string padding = "A===".Remove(3 - (contourQuery.Meters.Length + 3) % 4);
                string base64 = contourQuery.Meters.Replace('-', '+').Replace('_', '/') + padding;
                byte[] meterSelections = Convert.FromBase64String(base64);
                var ids = string.Join("", meterSelections.Select(x => Convert.ToString(x, 2)));


                // The resulting byte array is a simple set of bitflags ordered by meter ID and packed into the most significant bits.
                // In order to properly interpret the bytes, we must first order the data by meter ID to determine the location of
                // each meter's bitflag. Then we can filter out the unwanted data from the original list of meters
                meters = meters
                    .OrderBy(meter => meter.ID)
                    .Where((meter, index) => (meterSelections[index / byteSize] & (0x80 >> (index % byteSize))) > 0)
                    .ToList();
            }

            cmd.Parameters.Add(new SqlParameter("@EventDateFrom", contourQuery.GetStartDate()));
            cmd.Parameters.Add(new SqlParameter("@EventDateTo", contourQuery.GetEndDate()));
            cmd.Parameters.Add(new SqlParameter("@colorScaleName", contourQuery.ColorScaleName));
            cmd.Parameters.Add(new SqlParameter("@meterIds", string.Join(",", meters.Select(x => x.ID))));
            cmd.CommandText = "dbo.selectMeterLocationsTrendingData";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 300;

            using (IDataReader rdr = cmd.ExecuteReader())
            {
                while (rdr.Read())
                {
                    TrendingDataLocation ourStatus = new TrendingDataLocation();
                    ourStatus.Latitude = (double)rdr["Latitude"];
                    ourStatus.Longitude = (double)rdr["Longitude"];
                    ourStatus.Name = (string)rdr["Name"];
                    ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                    ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                    ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                    ourStatus.ID = (int)rdr["id"];
                    locations.Add(ourStatus);
                }
            }
        }


        return locations;
    }

    private List<List<TrendingDataLocation>> GetFramesFromHistorian(ContourQuery contourQuery)
    {
        DataTable idTable;
        string historianServer;
        string historianInstance;

        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        using(DataContext dataContext = new DataContext(connection))
        {
            var meters = dataContext.Table<Meter>().QueryRecordsWhere("ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID =  (SELECT ID FROM UserAccount WHERE Name = {0})))", contourQuery.UserName);

            if (!string.IsNullOrEmpty(contourQuery.Meters))
            {
                const int byteSize = 8;

                // Meter selections are stored as a base-64 string without padding, using '-' instead of '+' and '_' instead of '/'
                string padding = "A===".Remove(3 - (contourQuery.Meters.Length + 3) % 4);
                string base64 = contourQuery.Meters.Replace('-', '+').Replace('_', '/') + padding;
                byte[] meterSelections = Convert.FromBase64String(base64);
                var ids = string.Join("", meterSelections.Select(x => Convert.ToString(x, 2)));


                // The resulting byte array is a simple set of bitflags ordered by meter ID and packed into the most significant bits.
                // In order to properly interpret the bytes, we must first order the data by meter ID to determine the location of
                // each meter's bitflag. Then we can filter out the unwanted data from the original list of meters
                meters = meters
                    .OrderBy(meter => meter.ID)
                    .Where((meter, index) => (meterSelections[index / byteSize] & (0x80 >> (index % byteSize))) > 0)
                    .ToList();
            }


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
                "    Channel ON " +
                "        Channel.MeterID = Meter.ID AND " +
                "        Channel.ID IN (SELECT ChannelID FROM ContourChannel WHERE ContourColorScaleName = {1}) " +
                "WHERE Meter.ID IN (" + string.Join(",", meters.Select(x => x.ID)) + ")";

            idTable = connection.RetrieveData(query, contourQuery.UserName, contourQuery.ColorScaleName);
            historianServer = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Server'") ?? "127.0.0.1";
            historianInstance = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Instance'") ?? "XDA";
        }

        //if (!string.IsNullOrEmpty(contourQuery.Meters))
        //{
        //    const int byteSize = 8;

        //    // Meter selections are stored as a base-64 string without padding, using '-' instead of '+' and '_' instead of '/'
        //    string padding = "A===".Remove(3 - (contourQuery.Meters.Length + 3) % 4);
        //    string base64 = contourQuery.Meters.Replace('-', '+').Replace('_', '/') + padding;
        //    byte[] meterSelections = Convert.FromBase64String(base64);

        //    // The resulting byte array is a simple set of bitflags ordered by meter ID and packed into the most significant bits.
        //    // In order to properly interpret the bytes, we must first group and order the data by meter ID to determine the location
        //    // of each meter's bitflag. Then we can filter out the unwanted data from the original table of IDs
        //    idTable.Select()
        //        .Select((Row, Index) => new { Row, Index })
        //        .GroupBy(obj => obj.Row.ConvertField<int>("MeterID"))
        //        .OrderBy(grouping => grouping.Key)
        //        .Where((grouping, index) => (meterSelections[index / byteSize] & (0x80 >> (index % byteSize))) == 0)
        //        .SelectMany(grouping => grouping)
        //        .OrderByDescending(obj => obj.Index)
        //        .ToList()
        //        .ForEach(obj => idTable.Rows.RemoveAt(obj.Index));
        //}

        List<DataRow> meterRows = idTable
            .Select()
            .DistinctBy(row => row.ConvertField<int>("MeterID"))
            .ToList();

        DateTime startDate = contourQuery.GetStartDate();
        DateTime endDate = contourQuery.GetEndDate();
        int stepSize = contourQuery.StepSize;

        // The frames to be included are those whose timestamps fall
        // within the range which is specified by startDate and
        // endDate. We start by aligning startDate and endDate with
        // the nearest frame timestamps which fall within that range
        int startTimeOffset = (int)Math.Ceiling((startDate - startDate.Date).TotalMinutes / stepSize);
        startDate = startDate.Date.AddMinutes(startTimeOffset * stepSize);

        int endTimeOffset = (int)Math.Floor((endDate - endDate.Date).TotalMinutes / stepSize);
        endDate = endDate.Date.AddMinutes(endTimeOffset * stepSize);

        // Since each frame includes data from all timestamps between
        // the previous frame's timestamp and its own timestamp, we
        // must include one additional frame of data before startDate
        startDate = startDate.AddMinutes(-stepSize);
        
        int frameCount = (int)((endDate - startDate).TotalMinutes / stepSize);

        List<Dictionary<int, TrendingDataLocation>> frames = Enumerable.Repeat(meterRows, frameCount)
            .Select(rows => rows.Select(row => new TrendingDataLocation()
            {
                ID = row.ConvertField<int>("MeterID"),
                Name = row.ConvertField<string>("MeterName"),
                Latitude = row.ConvertField<double>("Latitude"),
                Longitude = row.ConvertField<double>("Longitude")
            }))
            .Select(locations => locations.ToDictionary(location => location.ID))
            .ToList();

        Dictionary<int, double?> nominalLookup = idTable
            .Select("ChannelID IS NOT NULL")
            .ToDictionary(row => row.ConvertField<int>("ChannelID"), row => row.ConvertField<double?>("PerUnitValue"));

        Dictionary<int, List<TrendingDataLocation>> lookup = idTable
            .Select("ChannelID IS NOT NULL")
            .Select(row =>
            {
                int meterID = row.ConvertField<int>("MeterID");

                return new
                {
                    ChannelID = row.ConvertField<int>("ChannelID"),
                    Frames = frames.Select(locationLookup => locationLookup[meterID]).ToList()
                };
            })
            .ToDictionary(obj => obj.ChannelID, obj => obj.Frames);

        using (Historian historian = new Historian(historianServer, historianInstance))
        {
            foreach (openHistorian.XDALink.TrendingDataPoint point in historian.Read(lookup.Keys, startDate, endDate))
            {
                List<TrendingDataLocation> locations = lookup[point.ChannelID];

                // Use ceiling to sort data into the next nearest frame.
                // Subtract 1 because startDate was shifted to include one additional frame of data
                int frameIndex = (int)Math.Ceiling((point.Timestamp - startDate).TotalMinutes / stepSize) - 1;

                if (frameIndex < 0 || frameIndex >= locations.Count)
                    continue;

                TrendingDataLocation frame = locations[frameIndex];

                double nominal = nominalLookup[point.ChannelID] ?? 1.0D;
                double value = point.Value / nominal;

                switch (point.SeriesID)
                {
                    case SeriesID.Minimum:
                        frame.Minimum = Math.Min(value, frame.Minimum ?? value);
                        break;

                    case SeriesID.Maximum:
                        frame.Maximum = Math.Max(value, frame.Maximum ?? value);
                        break;

                    case SeriesID.Average:
                        frame.Aggregate(value);
                        frame.Average = frame.GetAverage();
                        break;
                }
            }
        }

        return frames
            .Select(frame => frame.Values.ToList())
            .ToList();
    }

    private PiecewiseLinearFunction GetColorScale(ContourQuery contourQuery)
    {
        DataTable colorScale;

        using (AdoDataConnection conn = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            string query =
                "SELECT " +
                "    ContourColorScalePoint.Value, " +
                "    ContourColorScalePoint.Color " +
                "FROM " +
                "    ContourColorScale JOIN " +
                "    ContourColorScalePoint ON ContourColorScalePoint.ContourColorScaleID = ContourColorScale.ID " +
                "WHERE ContourColorScale.Name = {0} " +
                "ORDER BY ContourColorScalePoint.OrderID";

            colorScale = conn.RetrieveData(query, contourQuery.ColorScaleName);
        }

        double[] colorDomain = colorScale
            .Select()
            .Select(row => row.ConvertField<double>("Value"))
            .ToArray();

        double[] colorRange = colorScale
            .Select()
            .Select(row => (double)(uint)row.ConvertField<int>("Color"))
            .ToArray();

        return new PiecewiseLinearFunction()
            .SetDomain(colorDomain)
            .SetRange(colorRange);
    }

    private InverseDistanceWeightingFunction GetIDWFunction(ContourQuery contourQuery, List<TrendingDataLocation> locations = null)
    {
        CoordinateReferenceSystem crs = new EPSG3857();
        List<double> xList = new List<double>();
        List<double> yList = new List<double>();
        List<double> valueList = new List<double>();

        if ((object)locations == null)
            locations = GetFrameFromDailySummary(contourQuery);

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

        if (valueList.Count == 0)
        {
            xList.Add(0.0D);
            yList.Add(0.0D);

            using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
            {
                valueList.Add(connection.ExecuteScalar<double>("SELECT NominalValue FROM ContourColorScale WHERE Name = {0}", contourQuery.ColorScaleName));
            }
        }

        return new InverseDistanceWeightingFunction()
            .SetXCoordinates(xList.ToArray())
            .SetYCoordinates(yList.ToArray())
            .SetValues(valueList.ToArray())
            .SetDistanceFunction((x1, y1, x2, y2) =>
            {
                GeoCoordinate coordinate1 = new GeoCoordinate(y1, x1);
                GeoCoordinate coordinate2 = new GeoCoordinate(y2, x2);
                return crs.Distance(coordinate1, coordinate2);
            });
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
    public ContourAnimationInfo getContourAnimations(ContourQuery contourQuery)
    {
        List<List<TrendingDataLocation>> frames = GetFramesFromHistorian(contourQuery);
        PiecewiseLinearFunction colorScale = GetColorScale(contourQuery);
        Func<double, double> colorFunc = colorScale;

        // The actual startDate is the timestamp of the
        // first frame after contourQuery.GetStartDate()
        DateTime startDate = contourQuery.GetStartDate();
        int stepSize = contourQuery.StepSize;
        int startTimeOffset = (int)Math.Ceiling((startDate - startDate.Date).TotalMinutes / stepSize);
        startDate = startDate.Date.AddMinutes(startTimeOffset * stepSize);
        double latDif = frames.Min(frame => frame.Max(location => location.Latitude)) - frames.Min(frame => frame.Min(location => location.Latitude));
        double lonDif = frames.Min(frame => frame.Max(location => location.Longitude)) - frames.Min(frame => frame.Min(location => location.Longitude));

        double minLat = frames.Min(frame => frame.Min(location => location.Latitude)) - (latDif * 0.1D);
        double maxLat = frames.Min(frame => frame.Max(location => location.Latitude)) + (latDif * 0.1D);
        double minLng = frames.Min(frame => frame.Min(location => location.Longitude)) - (lonDif * 0.1D);
        double maxLng = frames.Min(frame => frame.Max(location => location.Longitude)) + (lonDif * 0.1D);

        GeoCoordinate topLeft = new GeoCoordinate(maxLat, minLng);
        GeoCoordinate bottomRight = new GeoCoordinate(minLat, maxLng);
        GSF.Drawing.Point topLeftPoint = s_crs.Translate(topLeft, contourQuery.Resolution);
        GSF.Drawing.Point bottomRightPoint = s_crs.Translate(bottomRight, contourQuery.Resolution);

        topLeftPoint = new GSF.Drawing.Point(Math.Floor(topLeftPoint.X), Math.Floor(topLeftPoint.Y));
        bottomRightPoint = new GSF.Drawing.Point(Math.Ceiling(bottomRightPoint.X), Math.Ceiling(bottomRightPoint.Y));
        topLeft = s_crs.Translate(topLeftPoint, contourQuery.Resolution);
        bottomRight = s_crs.Translate(bottomRightPoint, contourQuery.Resolution);

        int width = (int)(bottomRightPoint.X - topLeftPoint.X + 1);
        int height = (int)(bottomRightPoint.Y - topLeftPoint.Y + 1);

        int animationID;
        string timeZoneID = null;

        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            connection.ExecuteNonQuery("INSERT INTO ContourAnimation(ColorScaleName, StartTime, EndTime, StepSize) VALUES({0}, {1}, {2}, {3})", contourQuery.ColorScaleName, contourQuery.GetStartDate(), contourQuery.GetEndDate(), contourQuery.StepSize);
            animationID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");

            if (contourQuery.IncludeWeather)
                timeZoneID = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'XDATimeZone'");
        }

        GSF.Threading.CancellationToken cancellationToken = new GSF.Threading.CancellationToken();
        s_cancellationTokens[animationID] = cancellationToken;

        ProgressCounter progressCounter = new ProgressCounter(frames.Count);
        s_progressCounters[animationID] = progressCounter;

        Action<int> createFrame = i =>
        {
            List<TrendingDataLocation> frame = frames[i];
            IDWFunc idwFunction = GetIDWFunction(contourQuery, frame);
            uint[] pixelData;

            if (contourQuery.IncludeWeather)
            {
                TimeZoneInfo tzInfo = !string.IsNullOrEmpty(timeZoneID)
                    ? TimeZoneInfo.FindSystemTimeZoneById(timeZoneID)
                    : TimeZoneInfo.Local;

                // Weather data is only available in 5-minute increments
                DateTime frameTime = TimeZoneInfo.ConvertTimeToUtc(startDate.AddMinutes(stepSize * i), tzInfo);
                double minutes = (frameTime - frameTime.Date).TotalMinutes;
                int weatherMinutes = (int)Math.Ceiling(minutes / 5) * 5;

                NameValueCollection queryString = HttpUtility.ParseQueryString(string.Empty);
                queryString["service"] = "WMS";
                queryString["request"] = "GetMap";
                queryString["layers"] = "nexrad-n0r-wmst";
                queryString["format"] = "image/png";
                queryString["transparent"] = "true";
                queryString["version"] = "1.1.1";
                queryString["time"] = frameTime.Date.AddMinutes(weatherMinutes).ToString("o");
                queryString["height"] = height.ToString();
                queryString["width"] = width.ToString();
                queryString["srs"] = "EPSG:3857";

                GSF.Drawing.Point topLeftProjected = s_crs.Projection.Project(topLeft);
                GSF.Drawing.Point bottomRightProjected = s_crs.Projection.Project(bottomRight);
                queryString["bbox"] = string.Join(",", topLeftProjected.X, bottomRightProjected.Y, bottomRightProjected.X, topLeftProjected.Y);

                string weatherURL = "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?" + queryString.ToString();

                using (WebClient client = new WebClient())
                using (MemoryStream stream = new MemoryStream(client.DownloadData(weatherURL)))
                using (Bitmap bitmap = new Bitmap(stream))
                {
                    pixelData = bitmap.ToPixelData();
                }
            }
            else
            {
                pixelData = new uint[width * height];
            }

            if (cancellationToken.IsCancelled)
                return;

            for (int x = 0; x < width; x++)
            {
                if (cancellationToken.IsCancelled)
                    return;

                for (int y = 0; y < height; y++)
                {
                    if (cancellationToken.IsCancelled)
                        return;

                    if (pixelData[y * width + x] > 0)
                        continue;

                    GSF.Drawing.Point offsetPixel = new GSF.Drawing.Point(topLeftPoint.X + x, topLeftPoint.Y + y);
                    GeoCoordinate pixelCoordinate = s_crs.Translate(offsetPixel, contourQuery.Resolution);
                    double interpolatedValue = idwFunction(pixelCoordinate.Longitude, pixelCoordinate.Latitude);
                    pixelData[y * width + x] = (uint)colorFunc(interpolatedValue);
                }
            }

            if (cancellationToken.IsCancelled)
                return;

            using (Bitmap bitmap = BitmapExtensions.FromPixelData(width, pixelData))
            using (MemoryStream stream = new MemoryStream())
            {
                bitmap.Save(stream, ImageFormat.Png);

                using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
                {
                    connection.ExecuteNonQuery("INSERT INTO ContourAnimationFrame VALUES({0}, {1}, {2})", animationID, i, stream.ToArray());
                }
            }

            progressCounter.Increment();
        };

        Task.Run(() =>
        {
            ICancellationToken token;
            ProgressCounter counter;
            Parallel.For(0, frames.Count, createFrame);
            s_cancellationTokens.TryRemove(animationID, out token);
            s_progressCounters.TryRemove(animationID, out counter);

            if (cancellationToken.IsCancelled)
            {
                using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
                {
                    connection.ExecuteNonQuery("DELETE FROM ContourAnimationFrame WHERE ContourAnimationID = {0}", animationID);
                    connection.ExecuteNonQuery("DELETE FROM ContourAnimation WHERE ID = {0}", animationID);
                }
            }
        });

        s_cleanUpAnimationOperation.TryRunOnceAsync();

        return new ContourAnimationInfo()
        {
            AnimationID = animationID,
            ColorDomain = colorScale.Domain,
            ColorRange = colorScale.Range,
            MinLatitude = bottomRight.Latitude,
            MaxLatitude = topLeft.Latitude,
            MinLongitude = topLeft.Longitude,
            MaxLongitude = bottomRight.Longitude,
            Infos = frames.Select((frame, index) => new ContourInfo()
            {
                Locations = frame,
                URL = string.Format("./mapService.asmx/getContourAnimationFrame?animation={0}&frame={1}", animationID, index),
                Date = contourQuery.GetStartDate().AddMinutes(index * contourQuery.StepSize).ToString()
            }).ToList()
        };
    }

    private static void CleanUpAnimation()
    {
        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            connection.ExecuteNonQuery("DELETE FROM ContourAnimationFrame WHERE ContourAnimationID IN (SELECT ID FROM ContourAnimation WHERE AccessedOn < {0})", yesterday);
            connection.ExecuteNonQuery("DELETE FROM ContourAnimation WHERE AccessedOn < {0}", yesterday);
        }
    }

    [WebMethod]
    public void getContourAnimationFrame()
    {
        int animationID = Convert.ToInt32(HttpContext.Current.Request.QueryString["animation"]);
        int frameIndex = Convert.ToInt32(HttpContext.Current.Request.QueryString["frame"]);
        byte[] frameImage;

        using (AdoDataConnection connection = new AdoDataConnection(connectionstring, typeof(SqlConnection), typeof(SqlDataAdapter)))
        {
            frameImage = connection.ExecuteScalar<byte[]>("SELECT FrameImage FROM ContourAnimationFrame WHERE ContourAnimationID = {0} AND FrameIndex = {1}", animationID, frameIndex);
        }

        HttpContext.Current.Response.ContentType = "image/png";
        HttpContext.Current.Response.AddHeader("Content-Disposition", string.Format("inline;filename=ContourFrame{0}x{1}.png", animationID, frameIndex));
        HttpContext.Current.Response.BinaryWrite(frameImage);
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

    [WebMethod]
    public int GetProgress(int taskID)
    {
        ProgressCounter progressCounter;

        if (s_progressCounters.TryGetValue(taskID, out progressCounter))
            return progressCounter.Progress;

        return 100;
    }

    [WebMethod]
    public void CancelCall(int taskID)
    {
        ICancellationToken cancellationToken;

        if (s_cancellationTokens.TryGetValue(taskID, out cancellationToken))
            cancellationToken.Cancel();
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

                List<TrendingDataLocation> locations = GetFrameFromDailySummary(contourQuery);
                Func<double, double> colorFunction = GetColorScale(contourQuery);
                IDWFunc idwFunction = GetIDWFunction(contourQuery, locations);

                if (locations.Any())
                {
                    double latDif = locations.Max(location => location.Latitude) - locations.Min(location => location.Latitude);
                    double lonDif = locations.Max(location => location.Longitude) - locations.Min(location => location.Longitude);
                    contourTileData.MinLatitude = locations.Min(location => location.Latitude) - (latDif * 0.1D);
                    contourTileData.MaxLatitude = locations.Max(location => location.Latitude) + (latDif * 0.1D);
                    contourTileData.MinLongitude = locations.Min(location => location.Longitude) - (lonDif * 0.1D);
                    contourTileData.MaxLongitude = locations.Max(location => location.Longitude) + (lonDif * 0.1D);
                }

                contourTileData.IDWFunction = idwFunction;
                contourTileData.ColorFunction = colorFunction;

                return contourTileData;
            }
            finally
            {
                waitHandle.Set();
            }
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