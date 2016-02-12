using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.EnterpriseServices;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;

public partial class FaultSpecifics : System.Web.UI.Page
{
    public String postedFaultType = "";
    public String postedDeltaTime = "";
    public String postedStartTime = "";
    public String postedInceptionTime = "";
    public String postedDurationPeriod = "";
    public String postedFaultCurrent = "";
    public String postedDistanceMethod = "";
    public String postedSingleEndedDistance = "";
    public String postedEventId = "";
    public String postedMeterId = "";
    public String postedMeterName = "";
    public String postedDoubleEndedDistance = "";
    public String postedDoubleEndedConfidence = "";

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                postedEventId = Request["eventId"];
                using (EventTypeTableAdapter eventTypeAdapter = new EventTypeTableAdapter())
                using (EventTableAdapter eventAdapter = new EventTableAdapter())
                using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
                using (FaultSummaryTableAdapter summaryInfo = new FaultSummaryTableAdapter())

                {
                    try
                    {
                        eventAdapter.Connection.ConnectionString = connectionstring;
                        eventTypeAdapter.Connection.ConnectionString = connectionstring;
                        summaryInfo.Connection.ConnectionString = connectionstring;
                        MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(postedEventId)).First();
                        FaultLocationData.FaultSummaryDataTable thesummarydatatable = summaryInfo.GetDataBy(Convert.ToInt32(postedEventId));

                        FaultLocationData.FaultSummaryRow thesummary = Enumerable.OrderBy(thesummarydatatable
                                //.Where(row => row.EventID == int.Parse(postedEventId) && row.IsSelectedAlgorithm == 1 /*&& row.IsValid == 1 && row.IsSuppressed == 0)
                                .Where(row => row.EventID == int.Parse(postedEventId) && row.IsSelectedAlgorithm == 1 && row.IsSuppressed == 0)
                                .Select(x => x), y => y.Inception)
                            .First();

                        if (thesummary == null)
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
                        }
                        else
                        {
                            postedFaultType = thesummary.FaultType;
                            postedInceptionTime = thesummary.Inception.TimeOfDay.ToString();
                            postedDurationPeriod = (thesummary.DurationSeconds * 1000).ToString("##.###", CultureInfo.InvariantCulture) + "msec (" + thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles)";
                            postedFaultCurrent = thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)";
                            postedDistanceMethod = thesummary.Algorithm;
                            postedSingleEndedDistance = thesummary.Distance.ToString("####.###", CultureInfo.InvariantCulture) + " miles";
                            double deltatime = (thesummary.Inception - theevent.StartTime).Ticks / 10000000.0;
                            postedDeltaTime = deltatime.ToString();
                        }

                    postedStartTime = theevent.StartTime.TimeOfDay.ToString();

                    Meter themeter = meterInfo.Meters.Single(m => m.ID == theevent.MeterID);

                    postedMeterName = themeter.Name + " - " + themeter.AssetKey;
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
                        postedFaultType = "";
                        postedInceptionTime = "";
                        postedDurationPeriod = "";
                        postedFaultCurrent = "";
                        postedDistanceMethod = "";
                        postedSingleEndedDistance = "";
                        postedEventId = "";
                        postedMeterId = "";
                        postedMeterName = "";
                        postedDeltaTime = "";
                        postedStartTime = "";
                        postedDoubleEndedDistance = "";
                        postedDoubleEndedConfidence = "";
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
    }
}