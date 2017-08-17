using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Eventing.Reader;
using System.Web;
using GSF.Configuration;

public partial class FaultLocation : System.Web.UI.Page
{
    public string postedEventId = "";

    public string vsql = "select faulttime, linename, stationid, lineassetkey, faulttype, durationcycles, faultdistance, lineid, stationname, CurrentMagnitude from web_report_event where id="; // eventid
    public string zsql = "select length, r1, x1, r0, x0 from web_report_line where id="; // lineid
    public string sql1 = "select * from faultsummary where faultnumber = 1 and eventid = ";// eventid
    public string hSql = "select top 100 faulttime, faulttype, maxdist, mindist, id from web_report_events_valid where lineid='{0}' order by faulttime desc";
    public string openSeeURL = "openSeeStackNav.aspx?eventId=";

    private String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    // A secton
    public string FaultInceptionTime = "No Data";
    public string FaultDuration = "No Data";
    public string FaultType = "Unknown";
    public string FaultCurrent = "No Data";
    public string Location = "No Data";
    public String NearestStructure = "No Data";
    public String View = "No Data";
    public String LineID = "";
    public String stationid = "No Data";
    public String lineassetkey = "No Data";
    public double faultdistance = 0;
    public String milesurl = "No Data";
    public String baseFFURL = "No Data";
    public String postedDoubleEndedDistance = "No Data";
    public String postedDoubleEndedConfidence = "No Data";

    public string FaultCountTotal = "No Data";
    public string FaultCount = "Unknown";

    public double FaultCountTotalPercentage = 0;
    public double FaultCountPercentage = 0;

    // B Section
    public List<string> row1 = new List<string>();
    public List<string> row2 = new List<string>();

    // C section
    public String[,] Algorithms = new String [4,5];

    // D section
    public List<List<string>> history = new List<List<string>>();

 
    protected void Page_Load(object sender, EventArgs e)
    {

        if (Request["eventId"] == null)
        {
            int i = 0;
            for (i = 0; i <= 12; i++) row1.Add("");
            for (i = 0; i <= 12; i++) row2.Add("");
            for (i = 0; i <= 4; i++)
            {
                Algorithms[0, i] = "";
                Algorithms[1, i] = "";
                Algorithms[2, i] = "";
                Algorithms[3, i] = "";
            }
            return;
        }

        SectionA();
        SectionB();
        SectionC();
        SectionD();
        SectionE();
        GetDoubleEndedDistances( postedEventId );
        openSeeURL += postedEventId;
    }

    public void GetDoubleEndedDistances( string theEventID )
    {


        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
            {

            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectDoubleEndedFaultDistanceForEventID", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@EventID", theEventID));

            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
                if (rdr.HasRows)
                {
                while (rdr.Read())
                    {
                        postedDoubleEndedDistance = ((double)rdr["Distance"]).ToString("F3") + " miles";
                        postedDoubleEndedConfidence = ((double)rdr["Angle"]).ToString("F3") + " degrees";
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
    }

    public void SectionE()
    {
        
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectFaultHistoryByLineIDType", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@LineID", LineID));
            cmd.Parameters.Add(new SqlParameter("@FaultType", FaultType));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            double temp1 = 0;
            double temp2 = 0;


            if (rdr.HasRows)
            {

                while (rdr.Read())
                {
                    //thedate, thecount, thename
                    //DateTime thedate = (DateTime)rdr["thedate"];
                    //theset.xAxis[i] = thedate.ToString("d");


                    temp1 = Convert.ToDouble(rdr["total"]);
                    temp2 =  Convert.ToDouble(rdr["faultcount"]);

                    break;
                }
            }

            if ((temp1 == 0) || (temp2 == 0)) return;

            FaultCountTotal = temp1.ToString();
            FaultCount = temp2.ToString();

            FaultCountTotalPercentage = temp2 * 100 / temp1;
            FaultCountPercentage = 0; // numtimesloc*100/totaltimes



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
    }
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public void SectionD()
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (LineID.Equals(String.Empty)) return;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = String.Format(hSql, LineID);
            cmd.CommandType = CommandType.Text;
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int i = 0;

            if (rdr.HasRows)
            {
                while (rdr.Read())
                {
                    List<string> temp = new List<string>();

                    DateTime thedatetime = (DateTime)rdr["faulttime"];
                    string thenewstring = thedatetime.ToShortDateString() + " " + thedatetime.TimeOfDay.ToString();
                   

                    temp.Add((string)thenewstring);
                    temp.Add((string)rdr["faulttype"]);

                    double tempdouble = (double)rdr["maxdist"];
                    temp.Add((string)tempdouble.ToString("F2"));
                    tempdouble = (double)rdr["mindist"];
                    temp.Add((string)tempdouble.ToString("F2"));
                    temp.Add((string)rdr["id"].ToString());

                    history.Add(temp);
                }
            }

            rdr.Close();
            rdr = null;
            conn.Close();
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
    }



    public void SectionC()
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (postedEventId.Equals(String.Empty)) return;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = sql1 + postedEventId;
            cmd.CommandType = CommandType.Text;
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();

            int i = 0;

            if (rdr.HasRows)
            {
                while (rdr.Read())
                {
                    double temp = 0;
                    Algorithms[0, i] = (string)rdr["Algorithm"].ToString();
                    temp = (double)rdr["Distance"];
                    Algorithms[1, i] = temp.ToString("F3");
                    Algorithms[2, i] = rdr["IsValid"].ToString();;
                    Algorithms[3, i] = rdr["IsSelectedAlgorithm"].ToString();
                    i++;
                }
            }

            rdr.Close();
            rdr = null;
            conn.Close();
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
    }


    public void SectionB()
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (LineID.Equals(String.Empty)) return;

                try
                {
                    conn = new SqlConnection(connectionstring);
                    conn.Open();
                    SqlCommand cmd = new SqlCommand();
                    cmd.Connection = conn;
                    cmd.CommandText = zsql + LineID;
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandTimeout = 300;

                    rdr = cmd.ExecuteReader();

                    if (rdr.HasRows)
                    {
                        while (rdr.Read())
                        {
                            double temp = 0;

                            double length = (double)rdr["length"];
                            double r1 = (double)rdr["r1"];
                            double x1 = (double)rdr["x1"];
                            double r0 = (double)rdr["r0"];
                            double x0 = (double)rdr["x0"];

                            double rs = (r1 * 2 + r0) / 3;
                            double xs = (x1 * 2 + x0) / 3;
                            double zs = Math.Sqrt(Math.Pow(rs, 2) + Math.Pow(xs , 2));
                            double angS = Math.Atan(xs / rs) * 180 / 3.1415;

                            /////////////////////////////////////////////////////////////////
                            row1.Add(length.ToString("F4"));

                            temp = Math.Sqrt(Math.Pow(r1, 2) + Math.Pow(x1, 2));
                            row1.Add(temp.ToString("F3"));

                            temp = Math.Atan(x1 / r1) * 180 / 3.1415;
                            row1.Add(temp.ToString("F3"));

                            temp = r1;
                            row1.Add(temp.ToString("F4"));

                            temp = x1;
                            row1.Add(temp.ToString("F4"));

                            ///////////////////////////////////////////////////////////////////////

                            // sqr(z(3,0)^2+z(4,0)^2)
                            temp = Math.Sqrt(Math.Pow(r0, 2) + Math.Pow(x0, 2));
                            row1.Add(temp.ToString("F3"));

                            //atn(z(4,0)/z(3,0))*180/3.1415
                            temp = Math.Atan(x0 / r0) * 180 / 3.1415;
                            row1.Add(temp.ToString("F3"));

                            temp = r0;
                            row1.Add(temp.ToString("F4"));

                            temp = x0;
                            row1.Add(temp.ToString("F4"));

                            ///////////////////////////////////////////////////////////////////////

                            temp = zs;
                            row1.Add(temp.ToString("F3"));

                            temp = angS;
                            row1.Add(temp.ToString("F3"));

                            temp = rs;
                            row1.Add(temp.ToString("F4"));

                            temp = xs;
                            row1.Add(temp.ToString("F4"));

                            ///////////////////////////////////////////////////////////////////////

                            temp = Math.Sqrt(Math.Pow(r1, 2) + Math.Pow(x1 , 2)) / length;
                            row2.Add(temp.ToString("F3"));

                            temp = r1 / length;
                            row2.Add(temp.ToString("F4"));

                            temp = x1 / length;
                            row2.Add(temp.ToString("F4"));

                            //

                            temp = Math.Sqrt(Math.Pow(r0, 2) + Math.Pow(x0, 2)) / length;
                            row2.Add(temp.ToString("F3"));


                            temp = r0 / length;
                            row2.Add(temp.ToString("F4"));


                            temp = x0 / length;
                            row2.Add(temp.ToString("F4"));

                            //

                            temp = zs / length;
                            row2.Add(temp.ToString("F3"));

                            temp = rs / length;
                            row2.Add(temp.ToString("F4"));

                            temp = xs / length;
                            row2.Add(temp.ToString("F4"));

                            break;
                        }
                    }

                    rdr.Close();
                    rdr = null;
                    conn.Close();
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
    }


    public void SectionA()
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (Request["eventId"] != null)
        {
            postedEventId = Request["eventId"];

            try
            {
                conn = new SqlConnection(connectionstring);
                conn.Open();
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                cmd.CommandText = vsql + postedEventId;
                cmd.CommandType = CommandType.Text;
                cmd.CommandTimeout = 300;

                rdr = cmd.ExecuteReader();

                if (rdr.HasRows)
                {
                    while (rdr.Read())
                    {
                        DateTime thedatetime = (DateTime)rdr["faulttime"];
                        FaultInceptionTime = thedatetime.ToShortDateString() + " " + thedatetime.TimeOfDay.ToString();
                        double durationcycles = (double)rdr["durationcycles"];
                        FaultDuration = durationcycles.ToString("F2") + " cycles / " + (durationcycles * 16.6).ToString("F2") + "ms";
                        FaultType = rdr["faulttype"].ToString();
                        double faultcurrent = (double)rdr["CurrentMagnitude"];
                        FaultCurrent = faultcurrent.ToString("F2") + " Amps";
                        faultdistance = (double)rdr["faultdistance"];
                        string stationname = rdr["stationname"].ToString();
                        stationid = rdr["stationid"].ToString();
                        string linename = rdr["linename"].ToString();
                        lineassetkey = rdr["lineassetkey"].ToString();
                        Location = faultdistance.ToString("F2") + " miles from " + stationname + "(" + stationid + ") on " + linename + " (" + lineassetkey + ")";
                        LineID = rdr["lineid"].ToString(); 

                        milesurl = "milesjump.asp?Station=" + stationid + "&Line=" + lineassetkey + "&Mileage=" + faultdistance.ToString();
                        baseFFURL = "http://chaptpsnet.cha.tva.gov:8025/TLI/StructureCrawler/FaultFinder.asp?Station=" + stationid + "&Line=" + lineassetkey + "&Mileage=" + faultdistance;
                        break;
                    }
                }

                rdr.Close();
                rdr = null;
                conn.Close();
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
        }
        
    }
}