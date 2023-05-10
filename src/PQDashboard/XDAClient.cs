//******************************************************************************************************
//  XDAClient.cs - Gbtc
//
//  Copyright © 2022, Grid Protection Alliance.  All Rights Reserved.
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
//  06/09/2022 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using GSF.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using openXDA.APIAuthentication;

namespace PQDashboard
{
    public class HIDSPoint
    {
        public string Tag { get; set; }
        public double Minimum { get; set; }
        public double Maximum { get; set; }
        public double Average { get; set; }
        public uint QualityFlags { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class XDAClient
    {
        #region [ Members ]

        // Constants
        private const string SystemSettingQueryFormat =
            "SELECT AltText1 " +
            "FROM ValueList " +
            "WHERE " +
            "    Text = {0} AND " +
            "    GroupID = (SELECT ID FROM ValueListGroup WHERE Name = 'System')";

        #endregion

        #region [ Constructors ]

        public XDAClient(Func<AdoDataConnection> connectionFactory)
        {
            using (AdoDataConnection connection = connectionFactory())
            {
                BaseURL = Query(connection, "XDAInstance");
                XDAUser = Query(connection, "XDAUser");
                XDAPassword = Query(connection, "XDAPassword");
            }
        }

        public XDAClient(AdoDataConnection connection)
        {
            BaseURL = Query(connection, "XDAInstance");
            XDAUser = Query(connection, "XDAUser");
            XDAPassword = Query(connection, "XDAPassword");
        }

        #endregion

        #region [ Properties ]

        public string BaseURL { get; }
        private string XDAUser { get; }
        private string XDAPassword { get; }

        #endregion

        #region [ Methods ]

        public async Task QueryHIDSPointsAsync(object query, Action<HIDSPoint> process, CancellationToken cancellationToken = default(CancellationToken))
        {
            Func<HIDSPoint, Task> processAsync = point =>
            {
                process(point);
                return Task.CompletedTask;
            };

            await QueryHIDSPointsAsync(query, processAsync, cancellationToken);
        }

        public Task QueryHIDSPointsAsync(object query, Func<HIDSPoint, Task> processAsync, CancellationToken cancellationToken = default(CancellationToken)) =>
            QueryHIDSPointsAsync(query, (point, token) => processAsync(point), cancellationToken);

        public async Task QueryHIDSPointsAsync(object query, Func<HIDSPoint, CancellationToken, Task> processAsync, CancellationToken cancellationToken = default(CancellationToken))
        {
            string url = $"{BaseURL}/api/hids/QueryPoints";
            APIQuery apiQuery = new APIQuery(XDAUser, XDAPassword, BaseURL);

            Action<HttpRequestMessage> configure = request =>
            {
                request.Method = HttpMethod.Post;

                string json = JObject
                    .FromObject(query)
                    .ToString(Formatting.None);

                MediaTypeHeaderValue contentType = new MediaTypeHeaderValue("application/json");
                contentType.CharSet = "utf-8";

                StringContent content = new StringContent(json);
                content.Headers.ContentType = contentType;
                request.Content = content;
            };

            using (HttpResponseMessage response = await apiQuery.SendWebRequestAsync(configure, "/api/hids/QueryPoints", HttpCompletionOption.ResponseHeadersRead, cancellationToken))
            using (Stream stream = await response.Content.ReadAsStreamAsync())
            using (TextReader reader = new StreamReader(stream))
            {
                while (true)
                {
                    string line = reader.ReadLine();

                    if (line == null)
                        break;

                    if (line == string.Empty)
                        continue;

                    HIDSPoint point = JObject
                        .Parse(line)
                        .ToObject<HIDSPoint>();

                    await processAsync(point, cancellationToken);
                }
            }
        }

        #endregion

        #region [ Static ]

        // Static Methods
        private static string Query(AdoDataConnection connection, string field) =>
            connection.ExecuteScalar<string>(SystemSettingQueryFormat, (object)field);

        #endregion
    }
}