using System;
using System.Collections.Generic;
using System.Configuration;
using System.EnterpriseServices;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.MeterDataTableAdapters;

public partial class _OpenNav : System.Web.UI.Page
{
    public String postedEventId = "";
    public String postedMeterId = "";
    public String postedDateFrom = "";
    public String postedDateTo = "";
    public String postedEventType = "";
    public String postedEventDate = "";
    public String username = "";

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        String sessionID = Session.SessionID;
        try
        {
            username = System.Security.Principal.WindowsIdentity.GetCurrent().Name;

            username = HttpContext.Current.User.Identity.Name;

            username = Request.ServerVariables.Get("AUTH_USER");

            if (username == "")
            {
                username = "External";
            }

            username = Regex.Replace(username,".*\\\\(.*)", "$1",RegexOptions.None);
        }
        catch (Exception ex)
        {
            username = "";
        }
    }


}