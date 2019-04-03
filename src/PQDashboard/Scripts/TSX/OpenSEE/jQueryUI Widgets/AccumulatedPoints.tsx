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
import * as _ from "lodash";
import { style } from "typestyle";


// styles
const outerDiv: React.CSSProperties = {
    minWidth: '200px',
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
    backgroundColor: 'white',
    width: '520px',
    height: '260px'
};

const handle = style({
    width: '100 %',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});

export default class Points extends React.Component<any, any>{
    constructor(props) {
        super(props);

        this.state = {
            selectedPoint: -1
        };
    }

    componentDidMount() {
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
            <div id="accumulatedpoints" className="ui-widget-content" style={outerDiv}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="accumulatedpointshandle" className={handle}></div>
                    <div style={{ overflowY: 'scroll', height: '200px' }}><div id="accumulatedpointscontent" style={{ height: '100%' }}></div></div>
                    <div style={{ margin: '5px', textAlign: 'right' }}>
                        <input className="smallbutton" type="button" value="Remove" onClick={() => this.removePoint()} />
                        <input className="smallbutton" type="button" value="Pop" onClick={() => this.popAccumulatedPoints()} />
                        <input className="smallbutton" type="button" value="Clear" onClick={() => this.clearAccumulatedPoints()} />
                    </div>
                    <button className={closeButton} style={{ top: '2px', right: '2px' }} onClick={() => {
                        this.props.callback({ pointsButtonText: "Show Points" });
                        $('#accumulatedpoints').hide();
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
        var html = rowdata.thetime.toFixed(7) + " sec<br>" + (rowdata.thetime * Number(this.props.postedData.postedSystemFrequency)).toFixed(2) + " cycles";
        return html;
    }

    showDeltaTime(rowdata) {
        var html = rowdata.deltatime.toFixed(7) + " sec<br>" + (rowdata.deltatime * Number(this.props.postedData.postedSystemFrequency)).toFixed(2) + " cycles";
        return html;
    }
}
