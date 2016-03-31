//******************************************************************************************************
//  OpenSEE.aspx.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  12/18/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web.Script.Serialization;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;

public partial class OpenSEE : System.Web.UI.Page
{
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