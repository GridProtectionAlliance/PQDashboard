//******************************************************************************************************
//  OpenSEECSVDownload.ashx.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  11/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF.Data;
using GSF.Data.Model;
using GSF.Threading;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using CancellationToken = System.Threading.CancellationToken;

namespace PQDashboard
{
    /// <summary>
    /// Summary description for OpenSEECSVDownload
    /// </summary>
    public class OpenSEECSVDownload : IHttpHandler
    {
        #region [Members]

        // Nested Types
        private class HttpResponseCancellationToken : CompatibleCancellationToken
        {
            private readonly HttpResponse m_reponse;

            public HttpResponseCancellationToken(HttpResponse response) : base(CancellationToken.None)
            {
                m_reponse = response;
            }

            public override bool IsCancelled => !m_reponse.IsClientConnected;
        }

        const string CsvContentType = "text/csv";

        #endregion

        #region [Properties]

        /// <summary>
        /// Gets a value indicating whether another request can use the <see cref="IHttpHandler"/> instance.
        /// </summary>
        /// <returns>
        /// <c>true</c> if the <see cref="IHttpHandler"/> instance is reusable; otherwise, <c>false</c>.
        /// </returns>
        public bool IsReusable => false;

        /// <summary>
        /// Determines if client cache should be enabled for rendered handler content.
        /// </summary>
        /// <remarks>
        /// If rendered handler content does not change often, the server and client will use the
        /// <see cref="IHostedHttpHandler.GetContentHash"/> to determine if the client needs to refresh the content.
        /// </remarks>
        public bool UseClientCache => false;

        public string Filename { get; private set; }
        #endregion

        #region [Methods]

        public void ProcessRequest(HttpContext context)
        {
            HttpResponse response = HttpContext.Current.Response;
            HttpResponseCancellationToken cancellationToken = new HttpResponseCancellationToken(response);
            NameValueCollection requestParameters = context.Request.QueryString;


            try
            {
                Filename = requestParameters["Meter"] + "_" + requestParameters["EventType"] + "_Event_" + requestParameters["eventID"] + ".csv";
                response.ClearContent();
                response.Clear();
                response.AddHeader("Content-Type", CsvContentType);
                response.AddHeader("Content-Disposition", "attachment;filename=" + Filename);
                response.BufferOutput = true;

                WriteTableToStream(requestParameters, response.OutputStream, response.Flush, cancellationToken);
            }

            catch (Exception e)
            {
                LogExceptionHandler?.Invoke(e);
                throw;
            }
            finally
            {
                response.End();
            }
        }

        public Task ProcessRequestAsync(HttpRequestMessage request, HttpResponseMessage response, CancellationToken cancellationToken)
        {
            NameValueCollection requestParameters = request.RequestUri.ParseQueryString();

            response.Content = new PushStreamContent((stream, content, context) =>
            {
                try
                {
                    Filename = requestParameters["Meter"] + "_" + requestParameters["EventType"] + "_Event_" + requestParameters["eventID"] + ".csv";
                    WriteTableToStream(requestParameters, stream, null, cancellationToken);
                }
                catch (Exception e)
                {
                    LogExceptionHandler?.Invoke(e);
                    throw;
                }
                finally
                {
                    stream.Close();
                }
            },
            new MediaTypeHeaderValue(CsvContentType));

            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = Filename
            };

            return Task.CompletedTask;
        }

        private void WriteTableToStream(NameValueCollection requestParameters, Stream responseStream, Action flushResponse, CompatibleCancellationToken cancellationToken)
        {
            if (requestParameters["type"] == "csv")
                ExportToCSV(responseStream, requestParameters);
            else if (requestParameters["type"] == "stats")
                ExportStatsToCSV(responseStream, requestParameters);
        }

        // Converts the data group row of CSV data.
        private string ToCSV(Dictionary<string, DataSeries> dict, int index)
        {
            IEnumerable<string> row = new List<string>() { dict[dict.Keys.First()].DataPoints[index].Time.ToString("MM/dd/yyyy HH:mm:ss.fffffff") };
            row = row.Concat(dict.Keys.Select(x => {
                if (dict[x].DataPoints.Count > index)
                    return dict[x].DataPoints[index].Value.ToString();
                else
                    return string.Empty;
            }));
            return string.Join(",", row);
        }

        // Converts the data group row of CSV data.
        private string GetCSVHeader(Dictionary<string, DataSeries> dict)
        {
            IEnumerable<string> headers = new List<string>() { "TimeStamp" };
//            dataSeries.First().SeriesInfo.SeriesType.
            headers = headers.Concat(dict.Keys);
            return string.Join(",", headers);
        }


        public void ExportToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            Dictionary<string, DataSeries> dict = BuildDataSeries(requestParameters);
            if (dict.Keys.Count() == 0) return;

            using (StreamWriter writer = new StreamWriter(returnStream))
            {
                // Write the CSV header to the file
                writer.WriteLine(GetCSVHeader(dict));

                // Write data to the file
                for (int i = 0; i < dict[dict.Keys.First()].DataPoints.Count; ++i)
                    writer.WriteLine(ToCSV(dict, i));
            }
        }

        public void ExportStatsToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventId"]);
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (StreamWriter writer = new StreamWriter(returnStream))
            {
                DataTable dataTable = connection.RetrieveData("SELECT * FROM OpenSEEScalarStatView WHERE EventID = {0}", eventId);
                DataRow row = dataTable.AsEnumerable().First();
                Dictionary<string, string>  dict = row.Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName, c => row[c].ToString());

                if (dict.Keys.Count() == 0) return;

                // Write the CSV header to the file
                writer.WriteLine(string.Join(",", dict.Keys));
                writer.WriteLine(string.Join(",", dict.Values));
            }
        }

        public Dictionary<string, DataSeries> BuildDataSeries(NameValueCollection requestParameters) {
            using(AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                int eventID = int.Parse(requestParameters["eventID"]);
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                DateTime startDate = requestParameters.AllKeys.ToList().IndexOf("startDate") >= 0 ? DateTime.Parse(requestParameters["startDate"]) : evt.StartTime;
                DateTime endDate = requestParameters.AllKeys.ToList().IndexOf("endDate") >= 0 ? DateTime.Parse(requestParameters["endDate"]) : evt.EndTime;

                Meter meter = (new TableOperations<Meter>(connection)).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

                return QueryEventData(connection, meter, startDate, endDate);

            }
        }

        private Dictionary<string, DataSeries> QueryEventData(AdoDataConnection connection, Meter meter, DateTime startTime, DateTime endTime)
        {
            double freq = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0D;
            byte[] timeDomainData = connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID IN (SELECT EventDataID FROM Event WHERE MeterID = {0} AND StartTime >= {1} AND EndTime <= {2})", meter.ID, ToDateTime2(connection, startTime), ToDateTime2(connection, endTime));
            Dictionary<string, DataSeries> dict = new Dictionary<string, DataSeries>();
            DataGroup dataGroup = ToDataGroup(meter, timeDomainData);
            foreach (DataSeries dataSeries in dataGroup.DataSeries)
                dict.Add(dataSeries.SeriesInfo.Channel.Name, dataSeries);

            VICycleDataGroup viCycleDataGroup = Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup), freq);
            foreach (CycleDataGroup cycleDataGroup in viCycleDataGroup.CycleDataGroups) {
                DataGroup dg = cycleDataGroup.ToDataGroup();
                string channelName = dg.DataSeries.First().SeriesInfo.Channel.Name;
                dict.Add(channelName + " RMS", cycleDataGroup.RMS);
                dict.Add(channelName + " Angle", cycleDataGroup.Phase);
            }
            return dict;
        }

        private DataGroup ToDataGroup(Meter meter, byte[] data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            return dataGroup;
        }

        private IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
        {
            using (IDbCommand command = connection.Connection.CreateCommand())
            {
                IDbDataParameter parameter = command.CreateParameter();
                parameter.DbType = DbType.DateTime2;
                parameter.Value = dateTime;
                return parameter;
            }
        }
        #endregion

        #region [Static]
        public static Action<Exception> LogExceptionHandler;

        #endregion

    }



}