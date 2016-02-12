using System;
using System.Collections.Generic;
using System.Configuration;
using System.EnterpriseServices;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.MeterDataTableAdapters;

public partial class OpenSEELines : System.Web.UI.Page
{
    public String postedEventId = "";
    public String postedEventName = "";
    public String postedMeterId = "";
    public String postedLineId = "";
    public String postedDate = "";
    public String postedEventDate = "";
    public String postedMeterName = "";

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                postedEventId = Request["eventId"];
                using (EventTypeTableAdapter eventTypeAdapter = new EventTypeTableAdapter())
                using (EventTableAdapter eventAdapter = new EventTableAdapter())
                using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
                {
                    try
                    {
                        eventAdapter.Connection.ConnectionString = connectionstring;
                        eventTypeAdapter.Connection.ConnectionString = connectionstring;

                        MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(postedEventId)).First();

                        postedMeterId = theevent.MeterID.ToString();
                        postedDate = theevent.StartTime.ToShortDateString();
                        postedEventDate = theevent.StartTime.TimeOfDay.ToString();
                        postedMeterName = meterInfo.Meters.Single(m => m.ID == theevent.MeterID).Name;
                        postedLineId = theevent.LineID.ToString();

                        MeterData.EventTypeDataTable eventTypes = eventTypeAdapter.GetData();

                        postedEventName = eventTypes
                            .Where(row => row.ID == theevent.EventTypeID)
                            .Select(row => row.Name)
                            .DefaultIfEmpty("")
                            .Single(); 
                    }
                    catch (Exception ex)
                    {
                    postedEventId = "";
                    postedEventName = "";
                    postedMeterId = "";
                    postedLineId = "";
                    postedDate = "";
                    postedEventDate = "";
                    postedMeterName = "";
                    }
                }
            }
        }
    }
}