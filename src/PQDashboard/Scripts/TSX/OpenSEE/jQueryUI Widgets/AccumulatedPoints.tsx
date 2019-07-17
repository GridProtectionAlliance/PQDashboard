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
import { clone } from "lodash";
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
    //height: '260px'
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
    props: { pointsTable: Array<{ arrayIndex: number, theseries: string, thetime: number, thevalue: any, deltatime: number, deltavalue: any }>, callback: Function, postedData: any}
    constructor(props) {
        super(props);

        this.state = {
            selectedPoint: -1
        };
    }

    componentDidMount() {
        ($("#accumulatedpoints") as any).draggable({ scroll: false, handle: '#accumulatedpointshandle', containment: 'document' });
    }


    render() {
        var rows = this.props.pointsTable.map(a => Row(a, this.props.postedData.postedSystemFrequency, (obj) => this.setState(obj), this.state.selectedPoint))
        return (
            <div id="accumulatedpoints" className="ui-widget-content" style={outerDiv}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="accumulatedpointshandle" className={handle}></div>
                    <div style={{ overflowY: 'scroll' }}>
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr><td>Series</td><td>Time</td><td>Value</td><td>Delta Time</td><td>Delta Value</td></tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ margin: '5px', textAlign: 'right' }}>
                        <input className="btn btn-primary" type="button" value="Remove" onClick={() => this.removePoint()} />
                        <input className="btn btn-primary" type="button" value="Pop" onClick={() => this.popAccumulatedPoints()} />
                        <input className="btn btn-primary" type="button" value="Clear" onClick={() => this.clearAccumulatedPoints()} />
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
        var data = clone(this.props.pointsTable);
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
        var data = clone(this.props.pointsTable);
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
}

const Row = (row: { arrayIndex: number, theseries: string, thetime: number, thevalue: any, deltatime: number, deltavalue: any }, systemFrequency: number, stateSetter: Function, arrayIndex) => {
    function showTime(thetime) {
        return <span>{ thetime.toFixed(7) } sec<br/>{(thetime * Number(systemFrequency)).toFixed(2)} cycles</span>;
    }

    function showDeltaTime(deltatime) {
        return <span>{deltatime.toFixed(7)} sec<br />{(deltatime * Number(systemFrequency)).toFixed(2)} cycles</span>;
    }

    return (
        <tr key={row.arrayIndex} onClick={(e) => stateSetter({ selectedPoint: row.arrayIndex })} style={{backgroundColor: (row.arrayIndex == arrayIndex ? 'yellow': null)}}>
            <td>{row.theseries}</td>
            <td>{showTime(row.thetime)}</td>
            <td>{row.thevalue}</td>
            <td>{showDeltaTime(row.deltatime)}</td>
            <td>{row.deltavalue}</td>

        </tr>
    );
}

