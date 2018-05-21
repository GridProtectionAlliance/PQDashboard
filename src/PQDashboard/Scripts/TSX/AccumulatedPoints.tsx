//******************************************************************************************************
//  AccumulatedPoints.tsx - Gbtc
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
//  05/11/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";
import './../jquery-ui.js';
import './../PrimeUI/primeui.js';

declare var postedSystemFrequency: any;

export default class Points extends React.Component<any, any>{
    constructor(props) {
        super(props);

        this.state = {
            selectedPoint: -1
        };


    }

    componentDidMount() {
        var ctrl = this;
        ($("#accumulatedpoints") as any).draggable({ scroll: false, handle: '#accumulatedpointshandle' });
        this.buildTable(this.props);

    }

    buildTable(props) {
        var ctrl = this;
        ($('#accumulatedpointscontent') as any).puidatatable({
            stickyHeader: false,
            selectionMode: 'single',
            rowSelect: function (event, data) {
                ctrl.setState({ selectedPoint: data.arrayIndex });
            },
            columns: [
                { field: 'theseries', headerText: 'Series' },
                { field: 'thetime', headerText: 'Time', content: function (data) { return ctrl.showTime(data) } },
                { field: 'thevalue', headerText: 'Value' },
                { field: 'deltatime', headerText: 'Delta Time', content: function (data) { return ctrl.showDeltaTime(data) } },
                { field: 'deltavalue', headerText: 'Delta Value' }
            ],
            datasource: props.pointsTable
        });
    }
    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props.pointsTable, nextProps.pointsTable))) {           
            ($('#accumulatedpointscontent') as any).puidatatable('reset');
            this.buildTable(nextProps);
        }

    }

    render() {
        return (
            <div id="accumulatedpoints" className="ui-widget-content" style={{ position: 'absolute', top:'0', width: '520px', height: '260px', display: 'none' }}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="accumulatedpointshandle"></div>
                    <div style={{ overflowY: 'scroll', height: '200px' }}><div id="accumulatedpointscontent" style={{ height: '100%' }}></div></div>
                    <div style={{ margin: '5px', textAlign: 'right' }}>
                        <input className="smallbutton" type="button" value="Remove" onClick={() => this.removePoint()} />
                        <input className="smallbutton" type="button" value="Pop" onClick={() => this.popAccumulatedPoints()} />
                        <input className="smallbutton" type="button" value="Clear" onClick={() => this.clearAccumulatedPoints()} />
                    </div>
                    <button className="CloseButton" style={{ top: '2px', right: '2px' }} onClick={() => {
                        $('#accumulatedpoints').hide();
                        $('#showpoints').val('Show Points');
                    }}>X</button>
                </div>

            </div>

        );
    }

    removePoint() {
        var data = _.clone(this.props.pointsTable);
        var selectedPoint = this.state.selectedPoint;

        if (selectedPoint === data.length - 1) {
            data.pop();
        }
        else if (this.state.selectedPoint == 0) {

            data[1].deltatime = 0;
            data[1].deltavalue = (0.0).toFixed(3);
            for (var i = selectedPoint + 1; i < data.length; ++i)
                data[i].arrayIndex--;
            data.splice(selectedPoint, 1);


        }
        else if (selectedPoint === -1) {

        }
        else {
            data[selectedPoint + 1].deltatime = data[selectedPoint + 1].thetime - data[selectedPoint - 1].thetime;
            data[selectedPoint + 1].deltavalue = (data[selectedPoint + 1].thevalue - data[selectedPoint - 1].thevalue).toFixed(3);
            for (var i = selectedPoint + 1; i < data.length; ++i)
                data[i].arrayIndex--;
            data.splice(selectedPoint, 1);
        }
        selectedPoint = -1;

        this.props.callback({
            PointsTable: data
        });
        this.setState({ selectedPoint: selectedPoint});
    }

    popAccumulatedPoints() {
        var data = _.clone(this.props.pointsTable);
        if (data.length > 0)
            data.pop();

        this.props.callback({
            PointsTable: data
        });      

    }

    clearAccumulatedPoints() {
        this.props.callback({
            PointsTable: []
        });


    }

    showTime(rowdata) {
        var html = rowdata.thetime.toFixed(7) + " sec<br>" + (rowdata.thetime * postedSystemFrequency).toFixed(2) + " cycles";
        return html;
    }

    showDeltaTime(rowdata) {
        var html = rowdata.deltatime.toFixed(7) + " sec<br>" + (rowdata.deltatime * postedSystemFrequency).toFixed(2) + " cycles";
        return html;
    }


}
