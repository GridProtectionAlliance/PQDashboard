using System;
using System.Activities.Expressions;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Data;
using System.Web;
using System.Web.Services;
using FaultData.DataAnalysis;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using GSF;
using GSF.COMTRADE;
using GSF.EMAX;
using GSF.IO;
using GSF.PQDIF.Logical;
using GSF.SELEventParser;
using EventDataTableAdapter = FaultData.Database.MeterDataTableAdapters.EventDataTableAdapter;

public class eventSet
{
    public string Yaxis0name;
    public string Yaxis1name;
    public string[] xAxis;
    public List <signalDetail> data;
    public List<faultSegmentDetail> detail;
}

public class signalDetail
{
    public bool visible = true;
    public bool showInLegend = true;
    public bool showInTooltip = true;
    public string name;
    public string type;
    public int yAxis;
    public double[] data;
}

public class faultSegmentDetail
{
    public string type;
    public int StartSample;
    public int EndSample;
}

/// <summary>
/// Summary description for WebService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]

// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]

public class signalService : System.Web.Services.WebService {

    private const double MaxFaultDistanceMultiplier = 1.25D;
    private const double MinFaultDistanceMultiplier = -0.1D;

    String connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    public signalService()
    {
        int i = 1;
        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    /// <summary>
    /// FetchFaultSegmentDetails
    /// </summary>
    /// <param name="EventInstanceID"></param>
    /// <param name="theset"></param>
    /// <returns></returns>
    private eventSet FetchFaultSegmentDetails(string EventInstanceID, eventSet theset)
    {
        List<faultSegmentDetail> thedetails = new List<faultSegmentDetail>();
        FaultLocationData.FaultSegmentDataTable segments;

        theset.detail = thedetails;

        using (FaultSegmentTableAdapter faultSegmentTableAdapter = new FaultSegmentTableAdapter())
        {
            faultSegmentTableAdapter.Connection.ConnectionString = connectionstring;

            segments = faultSegmentTableAdapter.GetDataBy(Convert.ToInt32(EventInstanceID));

            foreach (FaultLocationData.FaultSegmentRow seg in segments)
            {
            faultSegmentDetail thedetail = new faultSegmentDetail();

            thedetail.type = "Start";
            thedetail.StartSample = seg.StartSample;
            thedetail.EndSample = seg.StartSample + 8;
            thedetails.Add(thedetail);

            faultSegmentDetail thedetail2 = new faultSegmentDetail();

            thedetail2.type = "End";
            thedetail2.StartSample = seg.EndSample - 8;
            thedetail2.EndSample = seg.EndSample;
            thedetails.Add(thedetail2);
            }
        }

        return (theset);
    }

    [WebMethod]
    public eventSet getSignalDataByID(string EventInstanceID)
    {
        return (FetchMeterEventDataByID(EventInstanceID));
    }


    [WebMethod]
    public eventSet getFaultCurveDataByID(string EventInstanceID)
    {
        return (FetchMeterEventFaultCurveByID(EventInstanceID));
    }

    private eventSet FetchMeterEventDataByID(string EventInstanceID)
    {
        eventSet theset = new eventSet();
        theset.data = new List<signalDetail>();
        MeterData.EventDataTable events;
        DataGroup eventDataGroup = new DataGroup();
        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter eventDataAdapter = new EventDataTableAdapter())
        {
            eventAdapter.Connection.ConnectionString = connectionstring;
            eventDataAdapter.Connection.ConnectionString = connectionstring;

            events = eventAdapter.GetDataByID(Convert.ToInt32(EventInstanceID));
            theset.Yaxis0name = "Voltage";
            theset.Yaxis1name = "Current";

            foreach (MeterData.EventRow evt in events)
            {
                Meter meter = meterInfo.Meters.Single(m => m.ID == evt.MeterID);

                FaultData.Database.Line line = meterInfo.Lines.Single(l => l.ID == evt.LineID);

                //eventDataAdapter.GetTimeDomainData(evt.EventDataID);

                eventDataGroup.FromData(meter, eventDataAdapter.GetTimeDomainData(evt.EventDataID));

                int i = 0;

                foreach (DataSeries theseries in eventDataGroup.DataSeries)
                {
                    int datacount = eventDataGroup.DataSeries[i].DataPoints.Count();
                    theset.xAxis = new string[datacount];

                    signalDetail theitem = new signalDetail();

                    string measurementType = "I"; // Assume Current, sorry this is ugly

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Voltage"))
                    {
                        measurementType = "V";
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Power"))
                    {
                        measurementType = "P";
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Energy"))
                    {
                        measurementType = "E";
                    }

                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Min") continue;
                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Max") continue;

                    //theitem.name = theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) + " " + measurementType + theseries.SeriesInfo.Channel.Phase.Name;
                    theitem.name = measurementType + theseries.SeriesInfo.Channel.Phase.Name;
                    theitem.data = new double[datacount];
                    theitem.type = "line";
                    theitem.yAxis = 0;

                    if (theitem.name.Contains("Angle"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                        theitem.showInLegend = false;
                    }

                    if (theitem.name.Contains("RMS"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                    }

                    if (theitem.name.Contains("RES"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                    }

                    if (theitem.name.Contains("Peak"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Current"))
                    {
                        theitem.yAxis = 1;
                    }

                    int j = 0;
                    DateTime beginticks = eventDataGroup.DataSeries[i].DataPoints[0].Time;
                    foreach (FaultData.DataAnalysis.DataPoint thepoint in eventDataGroup.DataSeries[i].DataPoints)
                    {
                        double elapsed = thepoint.Time.Subtract(beginticks).TotalSeconds;
                        theset.xAxis[j] = elapsed.ToString();
                        theitem.data[j] = thepoint.Value;
                        j++;
                    }
                    i++;

                    theset.data.Add(theitem);
                }
                break;
            }
        }
        return (theset);
    }

/// <summary>
/// Webmethod that returns EventSet for Event
/// </summary>
/// <param name="EventInstanceID"></param>
/// <param name="DataType"></param>
/// <returns></returns>
/// 
/// 
[WebMethod]
public eventSet getSignalDataByIDAndType(string EventInstanceID, String DataType)    
    {
        eventSet theset = new eventSet();
        theset.data = new List<signalDetail>();
        MeterData.EventDataTable events;
        DataGroup eventDataGroup = new DataGroup();
        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter eventDataAdapter = new EventDataTableAdapter())

        {
            eventAdapter.Connection.ConnectionString = connectionstring;
            eventDataAdapter.Connection.ConnectionString = connectionstring;

            events = eventAdapter.GetDataByID(Convert.ToInt32(EventInstanceID));

            foreach (MeterData.EventRow evt in events)
            {
                Meter meter = meterInfo.Meters.Single(m => m.ID == evt.MeterID);

                FaultData.Database.Line line = meterInfo.Lines.Single(l => l.ID == evt.LineID);

                eventDataGroup.FromData(meter, eventDataAdapter.GetTimeDomainData(evt.EventDataID));

                //eventDataGroup.FromData(meter, evt.Data);

                int i = -1;

                int datacount = eventDataGroup.DataSeries[0].DataPoints.Count();
                theset.xAxis = new string[datacount];

                foreach (DataSeries theseries in eventDataGroup.DataSeries)
                {
                    i++;


                    signalDetail theitem = new signalDetail();

                    string measurementType = "I"; // Assume Current, sorry this is ugly
                    string phasename = theseries.SeriesInfo.Channel.Phase.Name;

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Voltage"))
                    {
                        measurementType = "V";
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Power"))
                    {
                        measurementType = "P";
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Energy"))
                    {
                        measurementType = "E";
                    }

                    if (DataType != null)
                    {
                        if (measurementType != DataType)
                        {
                            continue;
                        }
                    }

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Digital"))
                    {
                        measurementType = "D";
                        int thechannelid  = theseries.SeriesInfo.Channel.ID;
                        Channel thechannel = theseries.SeriesInfo.Channel.MeasurementType.Channels.First(m => m.ID == thechannelid);
                        phasename = thechannel.Description;
                    }

                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Min") continue;
                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Max") continue;

                    theset.Yaxis0name = "Current";

                    if (measurementType == "V")
                    {
                        theset.Yaxis0name = "Voltage";
                    }

                    //theitem.name = theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) + " " + measurementType + theseries.SeriesInfo.Channel.Phase.Name;
                    theitem.name = measurementType + phasename;
                    theitem.data = new double[datacount];
                    theitem.type = "line";
                    theitem.yAxis = 0;

                    if (theitem.name.Contains("IRES"))
                    {
                    theitem.showInTooltip = false;
                    theitem.visible = false;
                    }

                    int j = 0;
                    DateTime beginticks = eventDataGroup.DataSeries[i].DataPoints[0].Time;
                    foreach (FaultData.DataAnalysis.DataPoint thepoint in eventDataGroup.DataSeries[i].DataPoints)
                    {
                        double elapsed = thepoint.Time.Subtract(beginticks).TotalSeconds;
                        theset.xAxis[j] = elapsed.ToString();
                        theitem.data[j] = thepoint.Value;
                        j++;
                    }
                    theset.data.Add(theitem);
                }
                break;
            }
        }

        //theset = FetchFaultSegmentDetails(EventInstanceID, theset);

    eventSet thereturnset = FetchMeterEventCycleData(EventInstanceID, theset.Yaxis0name, theset);

    return (thereturnset);
    }

    private eventSet FetchMeterEventFaultCurveByID(string EventInstanceID)
    {
        eventSet theset = new eventSet();
        theset.data = new List<signalDetail>();
        theset.Yaxis0name = "Miles";
        theset.Yaxis1name = "";

        if (EventInstanceID == "0") return (theset);

        DataGroup eventDataGroup = new DataGroup();
        List<DataSeries> faultCurves;
        List<FaultLocationData.FaultCurveRow> FaultCurves;

        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
        using (FaultSummaryTableAdapter summaryInfo = new FaultSummaryTableAdapter())
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (FaultCurveTableAdapter faultCurveAdapter = new FaultCurveTableAdapter())
        {
            faultCurveAdapter.Connection.ConnectionString = connectionstring;
            eventAdapter.Connection.ConnectionString = connectionstring;
            summaryInfo.Connection.ConnectionString = connectionstring;

            theset.Yaxis0name = "Miles";
            theset.Yaxis1name = "";

            MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(EventInstanceID)).First();
            Meter themeter = meterInfo.Meters.Single(m => theevent.MeterID == m.ID);
            Line theline = meterInfo.Lines.Single(l => theevent.LineID == l.ID);

            FaultCurves = faultCurveAdapter.GetDataBy(Convert.ToInt32(EventInstanceID)).ToList();

            if (FaultCurves.Count == 0) return (theset);

            faultCurves = FaultCurves.Select(ToDataSeries).ToList();

            foreach (DataSeries faultCurve in faultCurves)
            {
                FixFaultCurve(faultCurve, theline);
            }

            FaultLocationData.FaultSummaryRow thesummary = (FaultLocationData.FaultSummaryRow)summaryInfo.GetDataBy(Convert.ToInt32(EventInstanceID)).Select("IsSelectedAlgorithm = 1").First();

            double CyclesPerSecond = thesummary.DurationCycles / thesummary.DurationSeconds;
            List<faultSegmentDetail> thedetails = new List<faultSegmentDetail>();
            theset.detail = thedetails;

            faultSegmentDetail thedetail = new faultSegmentDetail();

            thedetail.type = "" + thesummary.Inception.TimeOfDay.ToString();//; + "-" + new TimeSpan(thesummary.Inception.TimeOfDay.Ticks + thesummary.DurationSeconds).ToString();
            thedetail.StartSample = thesummary.CalculationCycle;
            thedetail.EndSample = thesummary.CalculationCycle + 8;
            thedetails.Add(thedetail);

            //faultSegmentDetail thedetail2 = new faultSegmentDetail();

            //thedetail2.type = "";
            //thedetail2.StartSample = thesummary.CalculationCycle + (int)(Math.Round((faultCurves.First().SampleRate) / CyclesPerSecond));
            //thedetail2.EndSample = thedetail2.StartSample - 4;
            //thedetails.Add(thedetail2);

            int i = 0;

            foreach (DataSeries theseries in faultCurves)
            {
                int datacount = theseries.DataPoints.Count();
                theset.xAxis = new string[datacount];
                //theset.data[i] = new signalDetail();
                signalDetail theitem = new signalDetail();

                theitem.name = FaultCurves[i].Algorithm;
                theitem.data = new double[datacount];
                theitem.type = "line";
                theitem.yAxis = 0;

                int j = 0;
                DateTime beginticks = theseries.DataPoints[0].Time;
                foreach (FaultData.DataAnalysis.DataPoint thepoint in theseries.DataPoints)
                {
                    double elapsed = thepoint.Time.Subtract(beginticks).TotalSeconds;
                    theset.xAxis[j] = elapsed.ToString();
                    theitem.data[j] = thepoint.Value;
                    j++;
                }
                i++;
                theset.data.Add(theitem);
            }
        }
        return (theset);
    }

    /// <summary>
    /// ToDataSeries
    /// </summary>
    /// <param name="faultCurve"></param>
    /// <returns></returns>
    private DataSeries ToDataSeries(FaultLocationData.FaultCurveRow faultCurve)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(faultCurve.Data);
            return dataGroup[0];
        }

    /// <summary>
    /// ToDataSeries
    /// </summary>
    /// <param name="faultCurve"></param>
    /// <returns></returns>
    private DataGroup ToDataSeries(MeterData.EventDataRow faultCurve)
    {
        DataGroup dataGroup = new DataGroup();
        dataGroup.FromData(faultCurve.FrequencyDomainData);
        return dataGroup;
    }

    /// <summary>
    /// FixFaultCurve
    /// </summary>
    /// <param name="faultCurve"></param>
    /// <param name="line"></param>
    private void FixFaultCurve(DataSeries faultCurve, Line line)
    {
        double maxFaultDistance = MaxFaultDistanceMultiplier * line.Length;
        double minFaultDistance = MinFaultDistanceMultiplier * line.Length;

        foreach (DataPoint dataPoint in faultCurve.DataPoints)
        {
            if (double.IsNaN(dataPoint.Value))
                dataPoint.Value = 0.0D;
            else if (dataPoint.Value > maxFaultDistance)
                dataPoint.Value = maxFaultDistance;
            else if (dataPoint.Value < minFaultDistance)
                dataPoint.Value = minFaultDistance;
        }
    }



    /// <summary>
    /// FetchMeterEventCycleData
    /// </summary>
    /// <param name="EventInstanceID"></param>
    /// <param name="MeasurementName"></param>
    /// <param name="theset"></param>
    /// <returns></returns>
    private eventSet FetchMeterEventCycleData(string EventInstanceID, string MeasurementName, eventSet theset)
    {
        DataGroup eventDataGroup = new DataGroup();
        List<DataGroup> cycleCurves;
        List<MeterData.EventDataRow> cycleDataRows;

        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter cycleDataAdapter = new EventDataTableAdapter())
        {
            cycleDataAdapter.Connection.ConnectionString = connectionstring;
            eventAdapter.Connection.ConnectionString = connectionstring;

            theset.Yaxis0name = MeasurementName;
            theset.Yaxis1name = "";

            MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(EventInstanceID)).First();
            Meter themeter = meterInfo.Meters.Single(m => theevent.MeterID == m.ID);
            Line theline = meterInfo.Lines.Single(l => theevent.LineID == l.ID);

            cycleDataRows = cycleDataAdapter.GetDataBy(Convert.ToInt32(EventInstanceID)).ToList();
            cycleCurves = cycleDataRows.Select(ToDataSeries).ToList();

            //RMS, Phase angle, Peak, and Error
            //VAN, VBN, VCN, IAN, IBN, ICN, IR

            char typeChar = MeasurementName == "Voltage" ? 'V' : 'I';

            // Defines the names of the series that will be added to theset in the order that they will appear
            string[] seriesOrder = new string[] { "RMS", "Peak", "Angle" }
                .SelectMany(category => new string[] { "AN", "BN", "CN" }.Select(phase => string.Format("{0} {1}{2}", category, typeChar, phase)))
                .ToArray();

            // Defines the names of the series as they appear in cycleCurves
            string[] seriesNames =
            {
                "RMS VAN", "Angle VAN", "Peak VAN", "Error VAN",
                "RMS VBN", "Angle VBN", "Peak VBN", "Error VBN",
                "RMS VCN", "Angle VCN", "Peak VCN", "Error VCN",
                "RMS IAN", "Angle IAN", "Peak IAN", "Error IAN",
                "RMS IBN", "Angle IBN", "Peak IBN", "Error IBN",
                "RMS ICN", "Angle ICN", "Peak ICN", "Error ICN",
                "RMS IR", "Angle IR", "Peak IR", "Error IR"
            };

            // Lookup table to find a DataSeries by name
            Dictionary<string, DataSeries> seriesNameLookup = cycleCurves[0].DataSeries
                .Select((series, index) => new { Name = seriesNames[index], Series = series })
                .ToDictionary(obj => obj.Name, obj => obj.Series);

            int i = 0;
            if (cycleCurves.Count > 0)
            {
                foreach (string seriesName in seriesOrder)
                {
                    DataSeries theseries = seriesNameLookup[seriesName];

                    int datacount = theseries.DataPoints.Count();
                    signalDetail theitem = new signalDetail();

                    theitem.name = seriesName;
                    theitem.data = new double[datacount];
                    theitem.type = "line";
                    theitem.yAxis = 0;

                    if (theitem.name.Contains("Angle"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                        theitem.showInLegend = false;
                    }

                    if (theitem.name.Contains("RMS"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                    }

                    if (theitem.name.Contains("Peak"))
                    {
                        theitem.showInTooltip = false;
                        theitem.visible = false;
                    }

                    int j = 0;
                    DateTime beginticks = theseries.DataPoints[0].Time;
                    foreach (FaultData.DataAnalysis.DataPoint thepoint in theseries.DataPoints)
                    {
                        double elapsed = thepoint.Time.Subtract(beginticks).TotalSeconds;
                        //theset.xAxis[j] = elapsed.ToString();
                        theitem.data[j] = thepoint.Value;
                        j++;
                    }

                    theset.data.Add(theitem);
                }
            }
        }
        return (theset);
    }
}
