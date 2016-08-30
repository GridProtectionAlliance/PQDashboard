//******************************************************************************************************
//  TrendingDataPoint.cs - Gbtc
//
//  Copyright © 2015, Grid Protection Alliance.  All Rights Reserved.
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
//  08/23/2015 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;

namespace openHistorian.XDALink
{
    public class TrendingDataPoint
    {
        #region [ Members ]

        // Fields
        private int m_channelID;
        private SeriesID m_seriesID;
        private DateTime m_timestamp;
        private double m_value;

        #endregion

        #region [ Properties ]

        public int ChannelID
        {
            get
            {
                return m_channelID;
            }
            set
            {
                m_channelID = value;
            }
        }

        public SeriesID SeriesID
        {
            get
            {
                return m_seriesID;
            }
            set
            {
                m_seriesID = value;
            }
        }

        public DateTime Timestamp
        {
            get
            {
                return m_timestamp;
            }
            set
            {
                m_timestamp = value;
            }
        }

        public double Value
        {
            get
            {
                return m_value;
            }
            set
            {
                m_value = value;
            }
        }

        #endregion
    }
}
