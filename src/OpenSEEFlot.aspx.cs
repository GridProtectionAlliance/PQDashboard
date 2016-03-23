using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Web.Script.Serialization;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using GSF.Data;

public partial class OpenSEEFlot : System.Web.UI.Page
{
    private class ChannelInfo
    {
        public string MeasurementType;
        public string MeasurementCharacteristic;
        public string Phase;
        public string SeriesType;
    }

    public string postedSeriesList = "";

    public string postedEventId = "";
    public string postedEventName = "";
    public string postedMeterId = "";
    public string postedDate = "";
    public string postedEventDate = "";
    public string postedEventMilliseconds = "";
    public string postedMeterName = "";
    public string postedLineName = "";
    public string postedLineLength = "";

    public string postedStartTime = "";
    public string postedMagnitude = "";
    public string postedDurationPeriod = "";
    public string postedShowFaultCurves = "";
    public string postedShowBreakerDigitals = "";

    public string postedErrorMessage = "";

    string connectionString = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                if (Request["faultcurves"] == null)
                    postedShowFaultCurves = Request["faultcurves"];

                if (Request["breakerdigitals"] != null)
                    postedShowBreakerDigitals = Request["breakerdigitals"];

                postedShowFaultCurves = Request["faultcurves"];
                postedEventId = Request["eventId"];

                using (DbAdapterContainer dbAdapterContainer = new DbAdapterContainer(connectionString))
                {
                    try
                    {
                        EventTypeTableAdapter eventTypeAdapter = dbAdapterContainer.GetAdapter<EventTypeTableAdapter>();
                        EventTableAdapter eventAdapter = dbAdapterContainer.GetAdapter<EventTableAdapter>();
                        MeterInfoDataContext meterInfo = dbAdapterContainer.GetAdapter<MeterInfoDataContext>();
                        FaultSummaryTableAdapter summaryInfo = dbAdapterContainer.GetAdapter<FaultSummaryTableAdapter>();
                        DisturbanceTableAdapter disturbanceAdapter = dbAdapterContainer.GetAdapter<DisturbanceTableAdapter>();

                        MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(postedEventId)).First();

                        JavaScriptSerializer serializer = new JavaScriptSerializer();

                        postedSeriesList = serializer.Serialize(signalService.GetFlotInfo(theevent.ID));

                        postedMeterId = theevent.MeterID.ToString();
                        postedDate = theevent.StartTime.ToShortDateString();
                        postedEventId = theevent.ID.ToString();
                        postedEventDate = theevent.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff");
                        postedEventMilliseconds = theevent.StartTime.Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString();
                        postedMeterName = meterInfo.Meters.Single(m => m.ID == theevent.MeterID).Name;

                        MeterData.EventTypeDataTable eventTypes = eventTypeAdapter.GetData();

                        postedLineName = meterInfo.MeterLines.Where(row => row.LineID == theevent.LineID)
                            .Where(row => row.MeterID == theevent.MeterID)
                            .Select(row => row.LineName)
                            .FirstOrDefault() ?? "";

                        postedLineLength = meterInfo.Lines
                            .Where(row => row.ID == theevent.LineID)
                            .Select(row => row.Length)
                            .AsEnumerable()
                            .Select(length => length.ToString())
                            .FirstOrDefault() ?? "";

                        postedEventName = eventTypes
                            .Where(row => row.ID == theevent.EventTypeID)
                            .Select(row => row.Name)
                            .DefaultIfEmpty("")
                            .Single();

                        if (postedEventName.Equals("Fault"))
                        {
                            FaultLocationData.FaultSummaryDataTable thesummarydatatable = summaryInfo.GetDataBy(Convert.ToInt32(postedEventId));

                            FaultLocationData.FaultSummaryRow thesummary = thesummarydatatable
                                .Where(row => row.IsSelectedAlgorithm == 1)
                                .OrderBy(row => row.IsSuppressed)
                                .ThenBy(row => row.Inception)
                                .FirstOrDefault();

                            if ((object)thesummary != null)
                            {
                                postedStartTime = thesummary.Inception.TimeOfDay.ToString();
                                postedDurationPeriod = thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles";
                                postedMagnitude = thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)";
                            }
                        }
                        else if (new[] { "Sag", "Swell" }.Contains(postedEventName))
                        {
                            MeterData.DisturbanceDataTable disturbanceTable = disturbanceAdapter.GetDataBy(theevent.ID);

                            MeterData.DisturbanceRow disturbance = disturbanceTable
                                .Where(row => row.EventTypeID == theevent.EventTypeID)
                                .OrderBy(row => row.StartTime)
                                .FirstOrDefault();

                            if ((object)disturbance != null)
                            {
                                postedStartTime = disturbance.StartTime.TimeOfDay.ToString();
                                postedDurationPeriod = disturbance.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles";

                                if (disturbance.PerUnitMagnitude != -1.0e308)
                                    postedMagnitude = disturbance.PerUnitMagnitude.ToString("N3", CultureInfo.InvariantCulture) + " pu (RMS)";
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        postedErrorMessage = ex.Message;
                    }
                }
            }
        }
    }
}