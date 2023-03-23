using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Linq;
using System.Data.SqlClient;
using System.Linq;
using FaultData.DataAnalysis;
using GSF.Configuration;
using GSF.Data;
using GSF.Data.Model;
using openXDA.Model;
namespace PQDashboard
{
    public class SignalCode
    {
        #region [ Members ]
        private const double MaxFaultDistanceMultiplier = 1.25D;
        private const double MinFaultDistanceMultiplier = -0.1D;
        private double m_systemFrequency;

        public class eventSet
        {
            public string Yaxis0name;
            public string Yaxis1name;
            public string[] xAxis;
            public List<signalDetail> data;
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

        public enum FlotSeriesType
        {
            Waveform,
            Cycle,
            Fault
        }

        public class FlotSeries
        {
            public FlotSeriesType FlotType;
            public int SeriesID;
            public string ChannelName;
            public string ChannelDescription;
            public string MeasurementType;
            public string MeasurementCharacteristic;
            public string Phase;
            public string SeriesType;
            public List<double[]> DataPoints = new List<double[]>();

            public FlotSeries Clone()
            {
                FlotSeries clone = (FlotSeries)MemberwiseClone();
                clone.DataPoints = new List<double[]>();
                return clone;
            }
        }

        #endregion

        #region [ Constructors ]

        public SignalCode()
        {
            int i = 1;
            using(AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                m_systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0D;
            }
            //Uncomment the following line if using designed components 
            //InitializeComponent(); 
        }

        #endregion

        #region [ Properties ]
        public double SystemFrequency {
            get
            {
                return m_systemFrequency;
            }
        }
        #endregion

        #region [ Methods ]
        public List<FlotSeries> GetFlotData(int eventID, List<int> seriesIndexes)
        {
            List<FlotSeries> flotSeriesList = new List<FlotSeries>();

            using (AdoDataConnection connection = CreateDbConnection())
            {
                TableOperations<Meter> meterTable = new TableOperations<Meter>(connection);
                TableOperations<Event> eventTable = new TableOperations<Event>(connection);
                TableOperations<FaultCurve> faultCurveTable = new TableOperations<FaultCurve>(connection);

                Event evt = eventTable.QueryRecordWhere("ID = {0}", eventID);
                Meter meter = meterTable.QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, connection.AdapterType, false);

                List<FlotSeries> flotInfo = GetFlotInfo(eventID);
                DateTime epoch = new DateTime(1970, 1, 1);

                Lazy<DataGroup> dataGroup = new Lazy<DataGroup>(() => ToDataGroup(meter, ChannelData.DataFromEvent(evt.ID, meter.ConnectionFactory)));
                Dictionary<int, DataSeries> waveformData = dataGroup.Value.DataSeries.ToDictionary(dataSeries => dataSeries.SeriesInfo.ID);


                Lazy<DataGroup> cycleData = new Lazy<DataGroup>(() => (Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup.Value), SystemFrequency).ToDataGroup()));

                Lazy<Dictionary<string, DataSeries>> faultCurveData = new Lazy<Dictionary<string, DataSeries>>(() =>
                {
                    return faultCurveTable
                        .QueryRecordsWhere("EventID = {0}", evt.ID)
                        .Select(faultCurve => new
                        {
                            Algorithm = faultCurve.Algorithm,
                            DataGroup = ToDataGroup(meter, new List<byte[]>(1) { faultCurve.Data })
                        })
                        .Where(obj => obj.DataGroup.DataSeries.Count > 0)
                        .ToDictionary(obj => obj.Algorithm, obj => obj.DataGroup[0]);
                });

                foreach (int index in seriesIndexes)
                {
                    DataSeries dataSeries = null;
                    FlotSeries flotSeries;

                    if (index >= flotInfo.Count)
                        continue;

                    flotSeries = flotInfo[index];

                    if (flotSeries.FlotType == FlotSeriesType.Waveform)
                    {
                        if (!waveformData.TryGetValue(flotSeries.SeriesID, out dataSeries))
                            continue;
                    }
                    else if (flotSeries.FlotType == FlotSeriesType.Cycle)
                    {
                        dataSeries = cycleData.Value.DataSeries
                            .Where(series => series.SeriesInfo.Channel.MeasurementType.Name == flotSeries.MeasurementType)
                            .Where(series => series.SeriesInfo.Channel.Phase.Name == flotSeries.Phase)
                            .Skip(flotSeries.SeriesID)
                            .FirstOrDefault();

                        if ((object)dataSeries == null)
                            continue;
                    }
                    else if (flotSeries.FlotType == FlotSeriesType.Fault)
                    {
                        string algorithm = flotSeries.ChannelName;

                        if (!faultCurveData.Value.TryGetValue(algorithm, out dataSeries))
                            continue;
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

        public DataGroup ToDataGroup(Meter meter, List<byte[]> data)
        {
            DataGroup dataGroup = new DataGroup();

            dataGroup.FromData(meter, data);
            return dataGroup;
        }

        public AdoDataConnection AdoDataConnectionFactory()
        {
            return new AdoDataConnection("SystemSettings");
        }

        public eventSet getSignalDataByID(string EventInstanceID)
        {
            return (FetchMeterEventDataByID(EventInstanceID));
        }


        public eventSet getFaultCurveDataByID(string EventInstanceID)
        {
            return (FetchMeterEventFaultCurveByID(EventInstanceID));
        }

        private eventSet FetchMeterEventDataByID(string EventInstanceID)
        {
            eventSet theset = new eventSet();
            theset.data = new List<signalDetail>();
            DataGroup eventDataGroup = new DataGroup();
            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            {
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(EventInstanceID));
                Meter meter = (new TableOperations<Meter>(connection)).QueryRecordWhere("ID = {0}", evt.MeterID);
                Line line = (new TableOperations<Line>(connection)).QueryRecordWhere("ID = {0}", evt.AssetID);
                
                theset.Yaxis0name = "Voltage";
                theset.Yaxis1name = "Current";


                //eventDataAdapter.GetTimeDomainData(evt.EventDataID);

                eventDataGroup.FromData(meter, ChannelData.DataFromEvent(evt.ID, () => new AdoDataConnection("SystemSettings")));

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
                    foreach (DataPoint thepoint in eventDataGroup.DataSeries[i].DataPoints)
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

        public eventSet getSignalDataByIDAndType(string EventInstanceID, String DataType)
        {
            eventSet theset = new eventSet();
            theset.data = new List<signalDetail>();
            DataGroup eventDataGroup = new DataGroup();
            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            {
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(EventInstanceID));
                Meter meter = (new TableOperations<Meter>(connection)).QueryRecordWhere("ID = {0}", evt.MeterID);
                Line line = (new TableOperations<Line>(connection)).QueryRecordWhere("ID = {0}", evt.AssetID);
                EventData eventData = (new TableOperations<EventData>(connection)).QueryRecordWhere("ID = {0}", evt.EventDataID);


                eventDataGroup.FromData(meter, ChannelData.DataFromEvent(evt.ID, () => new AdoDataConnection("SystemSettings")));

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
            List<FaultCurve> FaultCurves;

            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            {
                theset.Yaxis0name = "Miles";
                theset.Yaxis1name = "";

                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(EventInstanceID));
                Meter meter = (new TableOperations<Meter>(connection)).QueryRecordWhere("ID = {0}", evt.MeterID);
                Line line = (new TableOperations<Line>(connection)).QueryRecordWhere("ID = {0}", evt.AssetID);
                EventData eventData = (new TableOperations<EventData>(connection)).QueryRecordWhere("ID = {0}", evt.EventDataID);
                FaultSummary thesummary = (new TableOperations<FaultSummary>(connection)).QueryRecordWhere("EventID = {0} AND IsSelectedAlgorithm = 1", Convert.ToInt32(EventInstanceID));

                if ((object)thesummary == null)
                    return theset;

                FaultCurves = (new TableOperations<FaultCurve>(connection)).QueryRecordsWhere("EventID = {0]", Convert.ToInt32(EventInstanceID)).ToList();

                if (!FaultCurves.Any()) return (theset);

                faultCurves = FaultCurves.Select(ToDataSeries).ToList();

                foreach (DataSeries faultCurve in faultCurves)
                {
                    FixFaultCurve(faultCurve, line);
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

                    if (theset.xAxis == null)
                        theset.xAxis = new string[datacount];

                    //theset.data[i] = new signalDetail();
                    signalDetail theitem = new signalDetail();

                    theitem.name = FaultCurves[i].Algorithm;
                    theitem.data = new double[datacount];
                    theitem.type = "line";
                    theitem.yAxis = 0;

                    int j = 0;
                    DateTime beginticks = theseries.DataPoints[0].Time;

                    foreach (DataPoint thepoint in theseries.DataPoints)
                    {
                        double elapsed = thepoint.Time.Subtract(beginticks).TotalSeconds;

                        if (theset.xAxis[j] == null)
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
        private DataSeries ToDataSeries(FaultCurve faultCurve)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(new List<byte[]>(1) { faultCurve.Data });
            return dataGroup[0];
        }

        /// <summary>
        /// ToDataSeries
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private DataGroup ToDataSeries(Meter meter, List<ChannelData> eventData)
        {
            DataGroup dataGroup = ToDataGroup(meter, eventData.Select(item => item.TimeDomainData).ToList());
            return dataGroup;
        }

        /// <summary>
        /// FixFaultCurve
        /// </summary>
        /// <param name="faultCurve"></param>
        /// <param name="line"></param>
        private void FixFaultCurve(DataSeries faultCurve, Line line)
        {
            double maxFaultDistance = MaxFaultDistanceMultiplier * line.Segments.Select(item => item.Length).Sum();
            double minFaultDistance = MinFaultDistanceMultiplier * line.Segments.Select(item => item.Length).Sum();

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
            DataGroup cycleCurves;
            List<ChannelData> cycleDataRows;

            if (MeasurementName != "Voltage" && MeasurementName != "Current")
                return theset;

            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            {
                theset.Yaxis0name = MeasurementName;
                theset.Yaxis1name = "";

                Event theevent = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", Convert.ToInt32(EventInstanceID));
                Meter themeter = (new TableOperations<Meter>(connection)).QueryRecordWhere("ID = {0}", theevent.MeterID);
                Line line = (new TableOperations<Line>(connection)).QueryRecordWhere("ID = {0}", theevent.AssetID);

                cycleDataRows = (new TableOperations<ChannelData>(connection)).QueryRecordsWhere("EventID = {0}", theevent.ID).ToList();
                cycleCurves = ToDataSeries(themeter, cycleDataRows);

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
                Dictionary<string, DataSeries> seriesNameLookup = cycleCurves.DataSeries
                    .Select((series, index) => new { Name = seriesNames[index], Series = series })
                    .ToDictionary(obj => obj.Name, obj => obj.Series);

                int i = 0;
                if (cycleCurves != null)
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


        #endregion

        #region [ Static }
        private static string ConnectionString = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;


        private static readonly List<FlotSeries> CycleDataInfo = new List<FlotSeries>();

        static SignalCode()
        {
            foreach (string phase in new string[] { "AN", "BN", "CN", "AB", "BC", "CA" })
            {
                int seriesID = 0;

                foreach (string measurementCharacteristic in new string[] { "RMS", "AngleFund", "WaveAmplitude", "WaveError" })
                {
                    string measurementType = "Voltage";
                    char measurementTypeDesignation = 'V';

                    CycleDataInfo.Add(new FlotSeries()
                    {
                        FlotType = FlotSeriesType.Cycle,
                        SeriesID = seriesID++,
                        ChannelName = string.Concat(measurementTypeDesignation, phase, " ", measurementCharacteristic),
                        ChannelDescription = string.Concat(phase, " ", measurementType, " ", measurementCharacteristic),
                        MeasurementType = measurementType,
                        MeasurementCharacteristic = measurementCharacteristic,
                        Phase = phase,
                        SeriesType = "Values"
                    });
                }
            }

            foreach (string phase in new string[] { "AN", "BN", "CN", "RES" })
            {
                int seriesID = 0;

                foreach (string measurementCharacteristic in new string[] { "RMS", "AngleFund", "WaveAmplitude", "WaveError" })
                {
                    string measurementType = "Current";
                    char measurementTypeDesignation = 'I';

                    CycleDataInfo.Add(new FlotSeries()
                    {
                        FlotType = FlotSeriesType.Cycle,
                        SeriesID = seriesID++,
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

        private static List<Series> GetWaveformInfo(AdoDataConnection connection, int meterID, int lineID)
        {
            TableOperations<Series> seriesTable = new TableOperations<Series>(connection);

            List<Series> seriesList = seriesTable
                .QueryRecords("ID", new RecordRestriction("ChannelID IN (SELECT ID FROM Channel WHERE MeterID = {0} AND LineID = {1})", meterID, lineID))
                .ToList();

            foreach (Series series in seriesList)
                series.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

            return seriesList;
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
            using (AdoDataConnection connection = CreateDbConnection())
            {
                TableOperations<Event> eventTable = new TableOperations<Event>(connection);

                Event evt = eventTable.QueryRecordWhere("ID = {0}", eventID);

                if ((object)evt == null)
                    return new List<FlotSeries>();

                List<Series> waveformInfo = GetWaveformInfo(connection, evt.MeterID, evt.AssetID);

                var lookup = waveformInfo
                    .Where(info => info.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    .Where(info => new string[] { "Instantaneous", "Values" }.Contains(info.SeriesType.Name))
                    .Select(info => new { MeasurementType = info.Channel.MeasurementType.Name, Phase = info.Channel.Phase.Name })
                    .Distinct()
                    .ToDictionary(info => info);

                IEnumerable<FlotSeries> cycleDataInfo = CycleDataInfo
                    .Where(info => lookup.ContainsKey(new { info.MeasurementType, info.Phase }))
                    .Select(info => info.Clone());

                return waveformInfo
                    .Select(ToFlotSeries)
                    .Concat(cycleDataInfo)
                    .Concat(GetFaultCurveInfo(connection, eventID).Select(ToFlotSeries))
                    .ToList();
            }
        }

        private static FlotSeries ToFlotSeries(Series series)
        {
            return new FlotSeries()
            {
                FlotType = FlotSeriesType.Waveform,
                SeriesID = series.ID,
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
                FlotType = FlotSeriesType.Fault,
                ChannelName = faultLocationAlgorithm,
                ChannelDescription = faultLocationAlgorithm,
                MeasurementType = "Distance",
                MeasurementCharacteristic = "FaultDistance",
                Phase = "None",
                SeriesType = "Values"
            };
        }

        private static AdoDataConnection CreateDbConnection()
        {
            return new AdoDataConnection(ConnectionString, typeof(SqlConnection), typeof(SqlDataAdapter));
        }

        #endregion




    }
}