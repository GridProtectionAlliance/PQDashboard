using System;
using System.Configuration;
using System.Globalization;
using System.Linq;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;

public partial class OpenSEEStack : System.Web.UI.Page
{
    public string postedEventId = "";
    public string postedEventName = "";
    public string postedMeterId = "";
    public string postedDate = "";
    public string postedEventDate = "";
    public string postedMeterName = "";
    public string postedLineName = "";

    public string postedStartTime = "";
    public string EndTime = "";
    public string postedMagnitude = "";
    public string postedDurationPeriod = "";
    public string postedShowFaultCurves = "";
    public string postedShowBreakerDigitals = "";

    string connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                if (Request["faultcurves"] == null)
                    postedShowFaultCurves = "1";
                else
                    postedShowFaultCurves = Request["faultcurves"];

                if (Request["breakerdigitals"] != null)
                    postedShowBreakerDigitals = Request["breakerdigitals"];

                postedShowFaultCurves = Request["faultcurves"];
                postedEventId = Request["eventId"];

                using (EventTypeTableAdapter eventTypeAdapter = new EventTypeTableAdapter())
                using (EventTableAdapter eventAdapter = new EventTableAdapter())
                using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
                using (FaultSummaryTableAdapter summaryInfo = new FaultSummaryTableAdapter())
                using (DisturbanceTableAdapter disturbanceAdapter = new DisturbanceTableAdapter())
                {
                    try
                    {
                        eventAdapter.Connection.ConnectionString = connectionstring;
                        eventTypeAdapter.Connection.ConnectionString = connectionstring;
                        summaryInfo.Connection.ConnectionString = connectionstring;
                        disturbanceAdapter.Connection.ConnectionString = connectionstring;

                        MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(postedEventId)).First();

                        postedMeterId = theevent.MeterID.ToString();
                        postedDate = theevent.StartTime.ToShortDateString();
                        postedEventId = theevent.ID.ToString();
                        postedEventDate = theevent.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff");
                        postedMeterName = meterInfo.Meters.Single(m => m.ID == theevent.MeterID).Name;

                        MeterData.EventTypeDataTable eventTypes = eventTypeAdapter.GetData();

                        postedLineName = meterInfo.MeterLines.Where(row => row.LineID == theevent.LineID)
                            .Where(row => row.MeterID == theevent.MeterID)
                            .Select(row => row.LineName).First();

                        postedEventName = eventTypes
                            .Where(row => row.ID == theevent.EventTypeID)
                            .Select(row => row.Name)
                            .DefaultIfEmpty("")
                            .Single();

                        if (postedEventName.Equals("Fault"))
                        {
                            FaultLocationData.FaultSummaryDataTable thesummarydatatable = summaryInfo.GetDataBy(Convert.ToInt32(postedEventId));

                            FaultLocationData.FaultSummaryRow thesummary = thesummarydatatable
                                //.Where(row => row.EventID == int.Parse(postedEventId) && row.IsSelectedAlgorithm == 1 /*&& row.IsValid == 1 && row.IsSuppressed == 0)
                                .Where(row => row.IsSelectedAlgorithm == 1)
                                .OrderBy(row => row.IsSuppressed)
                                .ThenBy(row => row.Inception)
                                .First();

                            postedStartTime = thesummary.Inception.TimeOfDay.ToString();
                            //postedDurationPeriod = (thesummary.DurationSeconds * 1000).ToString("##.###", CultureInfo.InvariantCulture) + "msec (" + thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles)";
                            postedDurationPeriod = thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles";
                            postedMagnitude = thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)";
                        }
                        else if (new[] { "Sag", "Swell" }.Contains(postedEventName))
                        {
                            MeterData.DisturbanceDataTable disturbanceTable = disturbanceAdapter.GetDataBy(theevent.ID);

                            MeterData.DisturbanceRow disturbance = disturbanceTable
                                .Where(row => row.EventTypeID == theevent.EventTypeID)
                                .OrderBy(row => row.StartTime)
                                .First();

                            postedStartTime = disturbance.StartTime.TimeOfDay.ToString();
                            postedDurationPeriod = disturbance.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles";
                            postedMagnitude = disturbance.Magnitude.ToString("N2", CultureInfo.InvariantCulture) + " Volts (RMS)";
                        }
                        else
                        {
                            postedStartTime = theevent.StartTime.TimeOfDay.ToString();
                        }
                    }
                    catch
                    {
                        postedLineName = "";
                        postedEventId = "";
                        postedEventName = "";
                        postedMeterId = "";
                        postedDate = "";
                        postedEventDate = "";
                        postedMeterName = "";
                        postedStartTime = "";
                        postedDurationPeriod = "";
                        postedMagnitude = "";
                    }
                }
            }
        }
    }
}