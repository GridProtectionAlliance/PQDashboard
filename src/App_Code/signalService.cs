﻿//******************************************************************************************************
//  signalService.cs - Gbtc
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
//  03/24/2016 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Data;
using System.Web.Services;
using FaultData.DataAnalysis;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using EventDataTableAdapter = FaultData.Database.MeterDataTableAdapters.EventDataTableAdapter;
using System.Data.Linq;
using GSF.Data;
using System.Data.SqlClient;

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

public class FlotSeries
{
    public string ChannelName;
    public string ChannelDescription;
    public string MeasurementType;
    public string MeasurementCharacteristic;
    public string Phase;
    public string SeriesType;
    public List<double[]> DataPoints = new List<double[]>();
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

    private static string ConnectionString = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    public signalService()
    {
        int i = 1;
        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    private static readonly List<FlotSeries> CycleDataInfo = new List<FlotSeries>();

    static signalService()
    {
        char measurementTypeDesignation;

        foreach (string measurementType in new string[] { "Voltage", "Current" })
        {
            foreach (string phase in new string[] { "AN", "BN", "CN" })
            {
                foreach (string measurementCharacteristic in new string[] { "RMS", "AngleFund", "WaveAmplitude", "WaveError" })
                {
                    if (measurementType == "Current")
                        measurementTypeDesignation = 'I';
                    else
                        measurementTypeDesignation = measurementType[0];

                    CycleDataInfo.Add(new FlotSeries()
                    {
                        ChannelName = string.Concat(measurementTypeDesignation, phase, " ", measurementCharacteristic),
                        ChannelDescription = string.Concat(phase, " ", measurementType, " ", measurementCharacteristic),
                        MeasurementType = measurementType,
                        MeasurementCharacteristic = measurementCharacteristic,
                        Phase = phase,
                        SeriesType = "Values"
                    });
                }
            }
        }
    }

    private static List<Series> GetWaveformInfo(Table<Series> seriesTable, int meterID, int lineID)
    {
        return seriesTable
            .Where(series => series.Channel.MeterID == meterID)
            .Where(series => series.Channel.LineID == lineID)
            .OrderBy(series => series.ID)
            .ToList();
    }

    private static List<string> GetFaultCurveInfo(AdoDataConnection connection, int eventID)
    {
        const string query =
            "SELECT Algorithm " +
            "FROM FaultCurve LEFT OUTER JOIN FaultLocationAlgorithm ON Algorithm = MethodName " +
            "WHERE EventID = {0} " +
            "ORDER BY CASE WHEN ExecutionOrder IS NULL THEN 1 ELSE 0 END, ExecutionOrder";

        DataTable table = connection.RetrieveData(query, eventID);

        return table.Rows
            .Cast<DataRow>()
            .Select(row => row.Field<string>("Algorithm"))
            .ToList();
    }

    public static List<FlotSeries> GetFlotInfo(int eventID)
    {
        using (DbAdapterContainer dbAdapterContainer = new DbAdapterContainer(ConnectionString))
        using (AdoDataConnection connection = new AdoDataConnection(dbAdapterContainer.Connection, typeof(SqlDataAdapter), false))
        {
            EventTableAdapter eventAdapter = dbAdapterContainer.GetAdapter<EventTableAdapter>();
            MeterInfoDataContext meterInfo = dbAdapterContainer.GetAdapter<MeterInfoDataContext>();
            FaultLocationInfoDataContext faultInfo = dbAdapterContainer.GetAdapter<FaultLocationInfoDataContext>();

            MeterData.EventRow eventRow = eventAdapter.GetDataByID(eventID).FirstOrDefault();

            if ((object)eventRow == null)
                return new List<FlotSeries>();

            return GetWaveformInfo(meterInfo.Series, eventRow.MeterID, eventRow.LineID)
                .Select(ToFlotSeries)
                .Concat(CycleDataInfo)
                .Concat(GetFaultCurveInfo(connection, eventID).Select(ToFlotSeries))
                .ToList();
        }
    }

    private static FlotSeries ToFlotSeries(Series series)
    {
        return new FlotSeries()
        {
            ChannelName = series.Channel.Name,
            ChannelDescription = series.Channel.Description,
            MeasurementType = series.Channel.MeasurementType.Name,
            MeasurementCharacteristic = series.Channel.MeasurementCharacteristic.Name,
            Phase = series.Channel.Phase.Name,
            SeriesType = series.SeriesType.Name
        };
    }

    private static FlotSeries ToFlotSeries(string faultLocationAlgorithm)
    {
        return new FlotSeries()
        {
            ChannelName = faultLocationAlgorithm,
            ChannelDescription = faultLocationAlgorithm,
            MeasurementType = "Distance",
            MeasurementCharacteristic = "FaultDistance",
            Phase = "None",
            SeriesType = "Values"
        };
    }

    [WebMethod]
    public List<FlotSeries> GetFlotData(int eventID, List<int> seriesIndexes)
    {
        List<FlotSeries> flotSeriesList = new List<FlotSeries>();

        using (DbAdapterContainer dbAdapterContainer = new DbAdapterContainer(ConnectionString))
        using (AdoDataConnection connection = new AdoDataConnection(dbAdapterContainer.Connection, typeof(SqlDataAdapter), false))
        {
            EventTableAdapter eventAdapter = dbAdapterContainer.GetAdapter<EventTableAdapter>();
            EventDataTableAdapter eventDataAdapter = dbAdapterContainer.GetAdapter<EventDataTableAdapter>();
            FaultCurveTableAdapter faultCurveAdapter = dbAdapterContainer.GetAdapter<FaultCurveTableAdapter>();
            MeterInfoDataContext meterInfo = dbAdapterContainer.GetAdapter<MeterInfoDataContext>();
            FaultLocationInfoDataContext faultLocationInfo = dbAdapterContainer.GetAdapter<FaultLocationInfoDataContext>();

            MeterData.EventRow eventRow = eventAdapter.GetDataByID(eventID).FirstOrDefault();
            Meter meter = meterInfo.Meters.First(m => m.ID == eventRow.MeterID);

            List<Series> waveformInfo = GetWaveformInfo(meterInfo.Series, eventRow.MeterID, eventRow.LineID);
            List<string> faultCurveInfo = GetFaultCurveInfo(connection, eventID);
            DateTime epoch = new DateTime(1970, 1, 1);

            Lazy<Dictionary<int, DataSeries>> waveformData = new Lazy<Dictionary<int, DataSeries>>(() =>
            {
                return ToDataGroup(meter, eventDataAdapter.GetTimeDomainData(eventRow.EventDataID)).DataSeries
                    .ToDictionary(dataSeries => dataSeries.SeriesInfo.ID);
            });

            Lazy<DataGroup> cycleData = new Lazy<DataGroup>(() => ToDataGroup(meter, eventDataAdapter.GetFrequencyDomainData(eventRow.EventDataID)));

            Lazy<Dictionary<string, DataSeries>> faultCurveData = new Lazy<Dictionary<string, DataSeries>>(() =>
            {
                return faultCurveAdapter
                    .GetDataBy(eventRow.ID)
                    .Select(faultCurve => new
                    {
                        Algorithm = faultCurve.Algorithm,
                        DataGroup = ToDataGroup(meter, faultCurve.Data)
                    })
                    .Where(obj => obj.DataGroup.DataSeries.Count > 0)
                    .ToDictionary(obj => obj.Algorithm, obj => obj.DataGroup[0]);
            });

            foreach (int index in seriesIndexes)
            {
                DataSeries dataSeries = null;
                FlotSeries flotSeries = null;

                int waveformIndex = index;
                int cycleIndex = waveformIndex - waveformInfo.Count;
                int faultCurveIndex = cycleIndex - CycleDataInfo.Count;

                if (waveformIndex < waveformInfo.Count)
                {
                    if (!waveformData.Value.TryGetValue(waveformInfo[index].ID, out dataSeries))
                        continue;

                    flotSeries = ToFlotSeries(waveformInfo[index]);
                }
                else if (cycleIndex < CycleDataInfo.Count)
                {
                    if (cycleIndex >= cycleData.Value.DataSeries.Count)
                        continue;

                    dataSeries = cycleData.Value[cycleIndex];

                    flotSeries = new FlotSeries()
                    {
                        MeasurementType = CycleDataInfo[cycleIndex].MeasurementType,
                        MeasurementCharacteristic = CycleDataInfo[cycleIndex].MeasurementCharacteristic,
                        Phase = CycleDataInfo[cycleIndex].Phase,
                        SeriesType = CycleDataInfo[cycleIndex].SeriesType
                    };
                }
                else if (faultCurveIndex < faultCurveInfo.Count)
                {
                    string algorithm = faultCurveInfo[faultCurveIndex];

                    if (!faultCurveData.Value.TryGetValue(algorithm, out dataSeries))
                        continue;

                    flotSeries = ToFlotSeries(faultCurveInfo[faultCurveIndex]);
                }
                else
                {
                    continue;
                }

                foreach (DataPoint dataPoint in dataSeries.DataPoints)
                {
                    if (!double.IsNaN(dataPoint.Value))
                        flotSeries.DataPoints.Add(new double[] { dataPoint.Time.Subtract(epoch).TotalMilliseconds, dataPoint.Value });
                }

                flotSeriesList.Add(flotSeries);
            }
        }

        return flotSeriesList;
    }

    public DataGroup ToDataGroup(Meter meter, byte[] data)
    {
        DataGroup dataGroup = new DataGroup();
        dataGroup.FromData(meter, data);
        return dataGroup;
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
            faultSegmentTableAdapter.Connection.ConnectionString = ConnectionString;

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
        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(ConnectionString))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter eventDataAdapter = new EventDataTableAdapter())
        {
            eventAdapter.Connection.ConnectionString = ConnectionString;
            eventDataAdapter.Connection.ConnectionString = ConnectionString;

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
        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(ConnectionString))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter eventDataAdapter = new EventDataTableAdapter())

        {
            eventAdapter.Connection.ConnectionString = ConnectionString;
            eventDataAdapter.Connection.ConnectionString = ConnectionString;

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

                    if (theseries.SeriesInfo.Channel.MeasurementType.Name.Equals("Digital"))
                    {
                        if (theseries.SeriesInfo.Channel.MeasurementCharacteristic.Name == "None")
                            continue;

                        measurementType = "D";
                        phasename = theseries.SeriesInfo.Channel.Description;
                    }

                    if (DataType != null)
                    {
                        if (measurementType != DataType)
                        {
                            continue;
                        }
                    }

                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Min") continue;
                    if (theseries.SeriesInfo.SeriesType.Name.Substring(0, 3) == "Max") continue;

                    theset.Yaxis0name = "Current";

                    if (measurementType == "V")
                    {
                        theset.Yaxis0name = "Voltage";
                    }

                    if (measurementType == "D")
                    {
                        theset.Yaxis0name = "Breakers";
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

        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(ConnectionString))
        using (FaultSummaryTableAdapter summaryInfo = new FaultSummaryTableAdapter())
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (FaultCurveTableAdapter faultCurveAdapter = new FaultCurveTableAdapter())
        {
            faultCurveAdapter.Connection.ConnectionString = ConnectionString;
            eventAdapter.Connection.ConnectionString = ConnectionString;
            summaryInfo.Connection.ConnectionString = ConnectionString;

            theset.Yaxis0name = "Miles";
            theset.Yaxis1name = "";

            MeterData.EventRow theevent = eventAdapter.GetDataByID(Convert.ToInt32(EventInstanceID)).First();
            Meter themeter = meterInfo.Meters.Single(m => theevent.MeterID == m.ID);
            Line theline = meterInfo.Lines.Single(l => theevent.LineID == l.ID);

            FaultLocationData.FaultSummaryRow thesummary = (FaultLocationData.FaultSummaryRow)summaryInfo.GetDataBy(Convert.ToInt32(EventInstanceID)).Select("IsSelectedAlgorithm = 1").FirstOrDefault();

            if ((object)thesummary == null)
                return theset;

            FaultCurves = faultCurveAdapter.GetDataBy(Convert.ToInt32(EventInstanceID)).ToList();

            if (FaultCurves.Count == 0) return (theset);

            faultCurves = FaultCurves.Select(ToDataSeries).ToList();

            foreach (DataSeries faultCurve in faultCurves)
            {
                FixFaultCurve(faultCurve, theline);
            }

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

        if (MeasurementName != "Voltage" && MeasurementName != "Current")
            return theset;

        using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(ConnectionString))
        using (EventTableAdapter eventAdapter = new EventTableAdapter())
        using (EventDataTableAdapter cycleDataAdapter = new EventDataTableAdapter())
        {
            cycleDataAdapter.Connection.ConnectionString = ConnectionString;
            eventAdapter.Connection.ConnectionString = ConnectionString;

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
