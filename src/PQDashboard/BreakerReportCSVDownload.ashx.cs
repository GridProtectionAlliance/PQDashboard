//******************************************************************************************************
//  BreakerReportCSVDownload.ashx.cs - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  07/09/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
using GSF.Threading;
using openXDA.Reports;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using CancellationToken = System.Threading.CancellationToken;

namespace PQDashboard
{
    public class BreakerReportCSVDownload : IHttpHandler
    {
        #region [ Members ]

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

        private const string allQuery =
@"
            SELECT 
                MAX(BreakerOperation.TripCoilEnergized) as LastOperationDate, 
                BreakerOperation.BreakerNumber,
                COUNT(BreakerOperation.ID) as Total,
                MaximoBreaker.AssetNum,
                MeterLine.LineName,
                -- last timing info
                (SELECT Name from Phase WHERE ID = (SELECT TOP 1 PhaseID FROM BreakerOperation as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized)) as LastPhase,
                (SELECT TOP 1 BreakerTiming FROM BreakerOperation as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastWaveformTiming,
                (SELECT TOP 1 StatusTiming FROM BreakerOperation as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastStatusTiming,
                MaximoBreaker.BreakerSpeed as MfrSpeed,
                (SELECT Name from BreakerOperationType WHERE ID = (SELECT TOP 1 BreakerOperationTypeID FROM BreakerOperation as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized)) as OperationTiming,
                (SELECT TOP 1 CASE WHEN StatusTiming < BreakerTiming THEN 'Status' ELSE 'Waveform' END FROM BreakerOperation as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastMethod,
                -- last slow
                COUNT(BOLate.ID) as TotalLateOperation,
                MAX(BOLate.TripCoilEnergized) as LastLateOperation,
                    -- mfr info
                MaximoBreaker.Manufacturer,
                MaximoBreaker.SerialNum,
                MaximoBreaker.MfrYear,
                MaximoBreaker.ModelNum,
                MaximoBreaker.InterruptCurrentRating,
                MaximoBreaker.ContinuousAmpRating
            FROM 
                BreakerOperation LEFT JOIN
                BreakerOperation as BOLate ON BreakerOperation.ID = BOLate.ID AND BOLate.BreakerOperationTypeID = (SELECT ID FROM BreakerOperationType WHERE Name = 'Late') JOIN
                MeterLine ON (SELECT LineID FROM Channel WHERE ID = (SELECT TOP 1 ChannelID FROM BreakerChannel WHERE BreakerChannel.BreakerNumber = BreakerOperation.BreakerNumber)) = MeterLine.LineID AND (SELECT MeterID FROM Channel WHERE ID = (SELECT TOP 1 ChannelID FROM BreakerChannel WHERE BreakerChannel.BreakerNumber = BreakerOperation.BreakerNumber)) = MeterLine.MeterID LEFT JOIN
                MaximoBreaker ON BreakerOperation.BreakerNumber = SUBSTRING(MaximoBreaker.BreakerNum, PATINDEX('%[^0]%', MaximoBreaker.BreakerNum + '.'), LEN(MaximoBreaker.BreakerNum))
            WHERE
                Cast(BreakerOperation.TripCoilEnergized as Date) BETWEEN {0} AND {1}
            GROUP BY 
                BreakerOperation.BreakerNumber,
                MaximoBreaker.AssetNum,
                MeterLine.LineName,
                MaximoBreaker.Manufacturer,
                MaximoBreaker.SerialNum,
                MaximoBreaker.MfrYear,
                MaximoBreaker.ModelNum,
                MaximoBreaker.InterruptCurrentRating,
                MaximoBreaker.ContinuousAmpRating,
                MaximoBreaker.BreakerSpeed
            ORDER BY 
                LastOperationDate
        ";

        private const string testAllQuery = @"
            SELECT 
                        MAX(BreakerOperation.TripCoilEnergized) as LastOperationDate, 
                        BreakerOperation.BreakerNumber,
                        COUNT(BreakerOperation.ID) as Total,
                        MaximoBreaker.[Breaker Number] as AssetNum,
                        MaximoBreaker.[Line Name] as LineName,
                        -- last timing info
                        (SELECT Name from Phase WHERE ID = (SELECT TOP 1 PhaseID FROM GTCBreakerOperationsTable as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized)) as LastPhase,
                        (SELECT TOP 1 BreakerTiming FROM GTCBreakerOperationsTable as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastWaveformTiming,
                        (SELECT TOP 1 StatusTiming FROM GTCBreakerOperationsTable as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastStatusTiming,
                        MaximoBreaker.[Breaker Mfr Speed] as MfrSpeed,
                        (SELECT Name from BreakerOperationType WHERE ID = (SELECT TOP 1 BreakerOperationTypeID FROM GTCBreakerOperationsTable as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized)) as OperationTiming,
                        (SELECT TOP 1 CASE WHEN StatusTiming < BreakerTiming THEN 'Status' ELSE 'Waveform' END FROM GTCBreakerOperationsTable as bo WHERE bo.BreakerNumber = BreakerOperation.BreakerNumber ORDER BY TripCoilEnergized) as LastMethod,
                        -- last slow
                        COUNT(BOLate.ID) as TotalLateOperation,
                        MAX(BOLate.TripCoilEnergized) as LastLateOperation,
                            -- mfr info
                        MaximoBreaker.Manufacturer,
                        MaximoBreaker.[Serial Number] as SerialNum,
                        MaximoBreaker.[Mfr Year] as MfrYear,
                        MaximoBreaker.[Model Number] as ModelNum,
                        MaximoBreaker.[Interrupt current Rating (A)] as InterruptCurrentRating,
                        MaximoBreaker.[ Continuous Amp Rating (A)] as ContinuousAmpRating
                    FROM 
                        GTCBreakerOperationsTable as BreakerOperation LEFT JOIN
                        GTCBreakerOperationsTable as BOLate ON BreakerOperation.ID = BOLate.ID AND BOLate.BreakerOperationTypeID = (SELECT ID FROM BreakerOperationType WHERE Name = 'Late') LEFT JOIN
                        MaximoBreakerInfo as MaximoBreaker ON BreakerOperation.BreakerNumber = SUBSTRING(MaximoBreaker.[Breaker Number], PATINDEX('%[^0]%', MaximoBreaker.[Breaker Number] + '.'), LEN(MaximoBreaker.[Breaker Number]))
			        WHERE
                        Cast(BreakerOperation.TripCoilEnergized as Date) BETWEEN {0} AND {1}
                    GROUP BY 
                        BreakerOperation.BreakerNumber,
                        MaximoBreaker.[Breaker Number],
                        MaximoBreaker.[Line Name],
                        MaximoBreaker.Manufacturer,
                        MaximoBreaker.[Serial Number],
                        MaximoBreaker.[Mfr Year],
			            MaximoBreaker.[Breaker Mfr Speed],
                        MaximoBreaker.[Model Number],
                        MaximoBreaker.[Interrupt current Rating (A)],
                        MaximoBreaker.[ Continuous Amp Rating (A)]    
                    ORDER BY 
                        LastOperationDate
                ";

        private const string individualQuery =
@"
                    SELECT
	                    BreakerOperation.TripCoilEnergized as Time,
	                    BreakerOperation.BreakerNumber,
	                    MeterLine.LineName,
	                    Phase.Name as Phase,
	                    BreakerOperation.BreakerTiming as WaveformTiming,
	                    BreakerOperation.StatusTiming as StatusTiming,
	                    MaximoBreaker.BreakerSpeed,
	                    MaximoBreaker.BreakerSpeed * 1.12 as SpeedBandwidth,
	                    MaximoBreaker.BreakerSpeed * 0.12 as Bandwidth,
	                    BreakerOperationType.Name as OperationTiming,
	                    MaximoBreaker.Manufacturer,
	                    MaximoBreaker.SerialNum,
	                    MaximoBreaker.MfrYear,
	                    MaximoBreaker.ModelNum,
	                    MaximoBreaker.InterruptCurrentRating,
	                    MaximoBreaker.ContinuousAmpRating,
	                    MIN(ROUND(FaultSummary.PrefaultCurrent, 0)) as PrefaultCurrent,
	                    MAX(ROUND(FaultSummary.CurrentMagnitude, 0)) as MaxCurrent
                    FROM
	                    BreakerOperation JOIN
	                    BreakerOperationType ON BreakerOperation.BreakerOperationTypeID = BreakerOperationType.ID JOIN
	                    Phase ON Phase.ID = BreakerOperation.PhaseID JOIN
	                    Event ON BreakerOperation.EventID = Event.ID JOIN
	                    MeterLINE ON Event.MeterID = MeterLine.MeterID AND Event.LineID = MeterLine.LineID JOIN
	                    MaximoBreaker ON BreakerOperation.BreakerNumber = SUBSTRING(MaximoBreaker.BreakerNum, PATINDEX('%[^0]%', MaximoBreaker.BreakerNum + '.'), LEN(MaximoBreaker.BreakerNum)) LEFT JOIN
	                    FaultSummary ON Event.ID = FaultSummary.EventID AND FaultSummary.IsSelectedAlgorithm = 1
                    WHERE
	                    BreakerOperation.BreakerNumber = {0} AND
                        CAST(BreakerOperation.TripCoilEnergized as Date) BETWEEN {1} AND {2}
                    GROUP BY
	                    BreakerOperation.TripCoilEnergized,
	                    BreakerOperation.BreakerNumber,
	                    MeterLine.LineName,
	                    Phase.Name,
	                    BreakerOperation.BreakerTiming,
	                    BreakerOperation.StatusTiming,
	                    MaximoBreaker.BreakerSpeed,
	                    MaximoBreaker.BreakerSpeed * 1.12,
	                    MaximoBreaker.BreakerSpeed * 0.12,
	                    BreakerOperationType.Name,
	                    MaximoBreaker.Manufacturer,
	                    MaximoBreaker.SerialNum,
	                    MaximoBreaker.MfrYear,
	                    MaximoBreaker.ModelNum,
	                    MaximoBreaker.InterruptCurrentRating,
	                    MaximoBreaker.ContinuousAmpRating
                    ORDER BY
                        Time
                ";

        private const string testIndividualQuery = @"
            SELECT 
                * 
            FROM 
                IndividualBreakerQuery  
            WHERE
	            BreakerNumber = {0} AND
                Cast(Time as Date) BETWEEN {1} AND {2} 
            ORDER BY Time
        ";


        #endregion

        #region [ Properties ]

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

        #region [ Methods ]

        public void ProcessRequest(HttpContext context)
        {
            HttpResponse response = HttpContext.Current.Response;
            HttpResponseCancellationToken cancellationToken = new HttpResponseCancellationToken(response);
            NameValueCollection requestParameters = context.Request.QueryString;
            string breaker = requestParameters["breaker"];
            DateTime fromDate = DateTime.Parse(requestParameters["fromDate"]);
            DateTime toDate = DateTime.Parse(requestParameters["toDate"]);

            try
            {
                Filename = (breaker == "0"? "AllBreakers": breaker) + "_" + fromDate.ToString("MM/dd/yyyy") + "_" + toDate.ToString("MM/dd/yyyy") + ".csv";
                response.ClearContent();
                response.Clear();
                response.AddHeader("Content-Type", CsvContentType);
                response.AddHeader("Content-Disposition", "attachment;filename=" + Filename);
                response.BufferOutput = true;

                WriteTableToStream(breaker, fromDate, toDate, response.OutputStream, response.Flush, cancellationToken);
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

            string breaker = requestParameters["breaker"];
            DateTime fromDate = DateTime.Parse(requestParameters["fromDate"]);
            DateTime toDate = DateTime.Parse(requestParameters["toDate"]);

            response.Content = new PushStreamContent((stream, content, context) =>
            {
                try
                {
                    Filename = (breaker == "0" ? "AllBreakers" : breaker) + "_" + fromDate.ToString("MM/dd/yyyy") + "_" + toDate.ToString("MM/dd/yyyy") + ".csv";
                    WriteTableToStream(breaker, fromDate, toDate, stream, null, cancellationToken);
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

        private void WriteTableToStream(string breaker, DateTime fromDate, DateTime toDate, Stream responseStream, Action flushResponse, CompatibleCancellationToken cancellationToken)
        {
            if(breaker == "0")
                ExportAllToCSV(responseStream, fromDate, toDate);
            else
                ExportIndividualToCSV(responseStream, breaker, fromDate, toDate);

        }

        // Converts the data group row of CSV data.
        private string ToCSV(DataTable table, DataRow row)
        {
            IEnumerable<string> columns = table.Columns.Cast<DataColumn>().Select(x => "\"" + row[x.ColumnName ]+ "\"");
            return string.Join(",", columns);
        }

        // Converts the data group row of CSV data.
        private string GetCSVHeader(DataTable table)
        {
            IEnumerable<string> headers = table.Columns.Cast<DataColumn>().Select(x => "\"" + x.ColumnName + "\"");
            return string.Join(",", headers);
        }

        public void ExportAllToCSV(Stream returnStream, DateTime fromDate, DateTime toDate)
        {
            DataTable table = QueryAllData(fromDate, toDate);
            if (table.Rows.Count == 0) return;

            using (StreamWriter writer = new StreamWriter(returnStream))
            {
                // Write the CSV header to the file
                writer.WriteLine(GetCSVHeader(table));

                // Write data to the file
                foreach (DataRow row in table.Rows)
                    writer.WriteLine(ToCSV(table, row));
            }
        }

        public void ExportIndividualToCSV(Stream returnStream, string breaker, DateTime fromDate, DateTime toDate)
        {
            DataTable table = QueryIndividualData(breaker, fromDate, toDate);
            if (table.Rows.Count == 0) return;

            using (StreamWriter writer = new StreamWriter(returnStream))
            {
                // Write the CSV header to the file
                writer.WriteLine(GetCSVHeader(table));

                // Write data to the file
                foreach (DataRow row in table.Rows)
                    writer.WriteLine(ToCSV(table, row));
            }
        }


        public DataTable QueryAllData(DateTime fromDate, DateTime toDate)
        {
            AllBreakersReport report = new AllBreakersReport(fromDate, toDate);
            return report.DataTable;
        }

        public DataTable QueryIndividualData(string breaker, DateTime fromDate, DateTime toDate)
        {
            IndividualBreakerReport report = new IndividualBreakerReport(breaker, fromDate, toDate);
            return report.TimingDataTable;
        }
#endregion

#region [ Static ]

        public static Action<Exception> LogExceptionHandler;

#endregion
    }
}