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
using GSF.Configuration;


public partial class PQI : System.Web.UI.Page
{
    public String postedDate = "";
    public String postedMeterId = "";
    public String postedMeterName = "";
    public String postedEventId = "";

    String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventid"] != null)
            {
                postedEventId = Request["eventid"];
                using (EventTableAdapter eventAdapter = new EventTableAdapter())
                using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
                {
                    try
                    {
                        eventAdapter.Connection.ConnectionString = connectionstring;
                        MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(postedEventId)).First();
                        Meter themeter = meterInfo.Meters.Single(m => m.ID == theevent.MeterID);

                        postedDate = theevent.StartTime.ToShortDateString() + " " + theevent.StartTime.TimeOfDay.ToString();
                        postedMeterId = theevent.MeterID.ToString();
                        postedMeterName = themeter.Name;
                    }

                    catch (Exception ex)
                    {
                        postedDate = "";
                        postedEventId = "";
                        postedMeterId = "";
                        postedMeterName = "";
                    }
                    finally
                    {

                    }
                }
            }
        }
    }
}