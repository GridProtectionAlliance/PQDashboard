using System;
using System.Collections.Generic;
using System.Configuration;
using System.EnterpriseServices;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;

public partial class OpenSEEStack : System.Web.UI.Page
{
    public String postedEventId = "";
    public String postedEventName = "";
    public String postedMeterId = "";
    public String postedDate = "";
    public String postedEventDate = "";
    public String postedMeterName = "";
    public String postedLineName = "";

    public String postedInceptionTime = "";
    public String EndTime = "";
    public String postedFaultCurrent = "";
    public String postedDurationPeriod = "";
    public String postedShowFaultCurves = "";
    public String postedShowBreakerDigitals = "";

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                if (Request["faultcurves"] == null)
                {
                    postedShowFaultCurves = "1";
                }
                else
                {
                    postedShowFaultCurves = Request["faultcurves"];
                }

                if (Request["breakerdigitals"] != null)
                {
                    postedShowBreakerDigitals = Request["breakerdigitals"];
                }

                postedShowFaultCurves = Request["faultcurves"];
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

                        postedMeterId = theevent.MeterID.ToString();
                        postedDate = theevent.StartTime.ToShortDateString();
                        postedEventId = theevent.ID.ToString();
                        postedEventDate = theevent.StartTime.TimeOfDay.ToString();
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
                            .Where(row => row.EventID == int.Parse(postedEventId) && row.IsSelectedAlgorithm == 1)
                            .OrderBy(row => row.IsSuppressed)
                            .ThenBy(row => row.Inception)
                            .First();

                        postedInceptionTime = thesummary.Inception.TimeOfDay.ToString();
                        //postedDurationPeriod = (thesummary.DurationSeconds * 1000).ToString("##.###", CultureInfo.InvariantCulture) + "msec (" + thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles)";
                        postedDurationPeriod =  thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles";
                        postedFaultCurrent = thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)";
                        }

                    }
                    catch (Exception ex)
                    {
                    postedLineName = "";
                    postedEventId = "";
                    postedEventName = "";
                    postedMeterId = "";
                    postedDate = "";
                    postedEventDate = "";
                    postedMeterName = "";
                    postedInceptionTime = "";
                    postedDurationPeriod = "";
                    postedFaultCurrent = "";
                    }
                }
            }
        }
    }
}