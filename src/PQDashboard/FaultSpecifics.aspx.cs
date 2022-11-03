using System;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using GSF.Configuration;
using GSF.Data;
using GSF.Data.Model;
using System.Web.UI;
using openXDA.Model;
public partial class FaultSpecifics : Page
{
    public string postedFaultType = "";
    public string postedDeltaTime = "";
    public string postedStartTime = "";
    public string postedInceptionTime = "";
    public string postedDurationPeriod = "";
    public string postedFaultCurrent = "";
    public string postedDistanceMethod = "";
    public string postedSingleEndedDistance = "";
    public string postedEventId = "";
    public string postedMeterId = "";
    public string postedMeterName = "";
    public string postedDoubleEndedDistance = "";
    public string postedDoubleEndedConfidence = "";
    public string postedExceptionMessage = "";

    string connectionstring = ConfigurationFile.Current.Settings["dbOpenXDA"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                postedEventId = Request["eventId"];

                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    try
                    {
                        Event theevent = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(postedEventId));
                        FaultSummary thesummary = (new TableOperations<FaultSummary>(connection)).QueryRecordWhere("EventID = {0} AND IsSelectedAlgorithm = 1", Convert.ToInt32(postedEventId));

                        if ((object)thesummary == null)
                        {
                            postedFaultType = "Invalid";
                            postedInceptionTime = "Invalid";
                            postedDurationPeriod = "Invalid";
                            postedFaultCurrent = "Invalid";
                            postedDistanceMethod = "Invalid";
                            postedSingleEndedDistance = "Invalid";
                            postedDeltaTime = "Invalid";
                            postedDoubleEndedDistance = "Invalid";
                            postedDoubleEndedConfidence = "Invalid";
                            return;
                        }

                        postedFaultType = thesummary.FaultType;
                        postedInceptionTime = thesummary.Inception.TimeOfDay.ToString();
                        postedDurationPeriod = (thesummary.DurationSeconds * 1000).ToString("##.###", CultureInfo.InvariantCulture) + "msec (" + thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles)";
                        postedFaultCurrent = thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)";
                        postedDistanceMethod = thesummary.Algorithm;
                        postedSingleEndedDistance = thesummary.Distance.ToString("####.###", CultureInfo.InvariantCulture) + " miles";
                        double deltatime = (thesummary.Inception - theevent.StartTime).Ticks / 10000000.0;
                        postedDeltaTime = deltatime.ToString();
                        postedStartTime = theevent.StartTime.TimeOfDay.ToString();
                        postedMeterName = connection.ExecuteScalar<string>("SELECT Name From Meter WHERE ID = {0}", theevent.MeterID);
                        postedMeterId = theevent.MeterID.ToString();

                        conn = new SqlConnection(connectionstring);
                        conn.Open();
                        SqlCommand cmd = new SqlCommand("dbo.selectDoubleEndedFaultDistanceForEventID", conn);
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@EventID", postedEventId));
                        cmd.CommandTimeout = 300;
                        rdr = cmd.ExecuteReader();

                        if (rdr.HasRows)
                        {
                            while (rdr.Read())
                            {
                                postedDoubleEndedDistance = ((double)rdr["Distance"]).ToString("####.###", CultureInfo.InvariantCulture) + " miles";
                                postedDoubleEndedConfidence = ((double)rdr["Angle"]).ToString("####.####", CultureInfo.InvariantCulture) + " degrees";
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        postedExceptionMessage = ex.Message;
                    }
                    finally
                    {
                        if (rdr != null)
                            rdr.Dispose();

                        if (conn != null)
                            conn.Dispose();
                    }
                }
            }
        }
    }
}