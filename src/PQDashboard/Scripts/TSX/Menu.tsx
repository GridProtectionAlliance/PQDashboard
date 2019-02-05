//******************************************************************************************************
//  Menu.tsx - Gbtc
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
//  05/14/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as _ from "lodash";
import './../jquery-ui.js';

export default class HarmonicStats extends React.Component<any, any>{
    props: {
        eventID: number,
        pointsButtonText: string,
        tooltipButtonText: string,
        phasorButtonText: string,
        statButtonText: string,
        harmonicButtonText: string,
        postedMeterName: string,
        postedEventName: string,
        startDate: string,
        endDate: string,
        callback: Function,
        exportCallback: Function
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        ($("#menu") as any).accordion({
            active: false,
            collapsible: true
        });
    }

    render() {

        return (
            <div id="menu">
                <h5>Menu</h5>
                <div>
                    <input className="smallbutton" type="button" value={this.props.pointsButtonText} onClick={() => this.showhidePoints()} />
                    <input className="smallbutton" type="button" value={this.props.tooltipButtonText} onClick={() => this.showhideTooltip()} />
                    <input className="smallbutton" type="button" value={this.props.phasorButtonText} onClick={() => this.showhidePhasor()} />
                    <input className="smallbutton" type="button" value={this.props.statButtonText} onClick={this.showhideStats.bind(this)} />
                    <input className="smallbutton" type="button" value="Export CSV" onClick={this.props.exportCallback.bind(this, "csv")} />
                    <input className="smallbutton" type="button" value="Export Comtrade" onClick={this.exportComtrade.bind(this)} />
                    <input style={{ display: (this.props.postedEventName == "Snapshot" ? null : 'none') }} className="smallbutton" type="button" value={this.props.harmonicButtonText} onClick={this.showhideHarmonics.bind(this)} />
                </div>
            </div>
        );
    }

    showhidePoints() {
        if (this.props.pointsButtonText == "Show Points") {
            this.props.callback({ pointsButtonText: "Hide Points" });
            $('#accumulatedpoints').show();
        } else {
            this.props.callback({ pointsButtonText: "Show Points" });
            $('#accumulatedpoints').hide();
        }
    }

    showhideTooltip() {
        if (this.props.tooltipButtonText == "Show Tooltip") {
            this.props.callback({ tooltipButtonText: "Hide Tooltip" });
            $('#unifiedtooltip').show();
            $('.legendCheckbox').show();

        } else {
            this.props.callback({ tooltipButtonText: "Show Tooltip" });
            $('#unifiedtooltip').hide();
            $('.legendCheckbox').hide();
        }
    }

    showhidePhasor() {
        if (this.props.phasorButtonText == "Show Phasor") {
            this.props.callback({ phasorButtonText: "Hide Phasor" });
            $('#phasor').show();
        } else {
            this.props.callback({ phasorButtonText: "Show Phasor" });
            $('#phasor').hide();
        }
    }

    showhideStats() {
        if (this.props.statButtonText == "Show Stats") {
            this.props.callback({ statButtonText: "Hide Stats" });
            $('#scalarstats').show();
        } else {
            this.props.callback({ statButtonText: "Show Stats" });
            $('#scalarstats').hide();
        }
    }

    showhideHarmonics() {
        if (this.props.harmonicButtonText == "Show Harmonics") {
            this.props.callback({ harmonicButtonText: "Hide Harmonics" });
            $('#harmonicstats').show();
        } else {
            this.props.callback({ harmonicButtonText: "Show Harmonics" });
            $('#harmonicstats').hide();
        }
    }

    exportComtrade() {
        window.open(`/OpenSEEComtradeDownload.ashx?eventID=${this.props.eventID}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.postedMeterName}` +
            `&EventType=${this.props.postedEventName}`);
    }
}
