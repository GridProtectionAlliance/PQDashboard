using System;
using System.Web.UI;
using GSF.Configuration;
using GSF.Data;
using GSF.Data.Model;
using openXDA.Model;

public partial class PQI : Page
{
    public String postedDate = "";
    public String postedMeterId = "";
    public String postedMeterName = "";
    public int postedEventId;

    String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["eventid"] != null)
            {
                postedEventId = Convert.ToInt32(Request["eventid"]);

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    try
                    {
                        Event theevent = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(postedEventId));

                        postedDate = theevent.StartTime.ToShortDateString() + " " + theevent.StartTime.TimeOfDay.ToString();
                        postedMeterId = theevent.MeterID.ToString();
                        postedMeterName = connection.ExecuteScalar<string>("SELECT Name From Meter WHERE ID = {0}", theevent.MeterID);
                    }

                    catch (Exception ex)
                    {
                        postedDate = "";
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