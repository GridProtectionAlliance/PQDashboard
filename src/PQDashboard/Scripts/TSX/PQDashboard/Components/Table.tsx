//******************************************************************************************************
//  Table.tsx - Gbtc
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
//  08/02/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { clone } from 'lodash';

export interface TableProps {
    cols: Array<{ key: string, label: string, headerStyle?: React.CSSProperties, colStyle?: React.CSSProperties, content?(item: any, key: string, style: React.CSSProperties): void }>,
    data: Array<any>,
    onClick: Function,
    sortField: string,
    ascending: boolean,
    onSort(data: any): void,
    tableClass?: string,
    tableStyle?: React.CSSProperties,
    theadStyle?: React.CSSProperties,
    theadClass?: string,
    tbodyStyle?: React.CSSProperties,
    tbodyClass?: string,
    selected?(data:any): boolean,
    rowStyle?: React.CSSProperties,
}

const Table: React.FunctionComponent <TableProps> = (props) => {

    function generateHeaders() {
        if (props.cols.length == 0) return null;

        var cells = props.cols.map(colData => {
            var style: React.CSSProperties;
            if (colData.headerStyle != undefined) {
                style = colData.headerStyle;
            }
            else
                style = {};

            if (style.cursor == undefined)
                style.cursor = 'pointer';

            return <th key={colData.key} style={style} onClick={() => handleSort({ col: colData.key, ascending: props.ascending })}>{colData.label}{(props.sortField == colData.key ? <AngleIcon ascending={props.ascending} /> : null)}</th>
        });

        return <tr>{cells}</tr>;
    }

    function generateRows() {
        if (props.data.length == 0) return null;

        return props.data.map((item, index) => {
            var cells = props.cols.map(colData => {
                var style = clone(colData.colStyle);
                return <td
                    key={index.toString() + item[colData.key] + colData.key}
                    style={style}
                    onClick={() => handleClick({ col: colData.key, row: item, data: item[colData.key] })}
                >
                    {colData.content != undefined ? colData.content(item, colData.key, style) : item[colData.key]}
                </td>
            });

            var style: React.CSSProperties;
            if (item.rowStyle != undefined) {
                style = item.rowStyle;
            }
            else
                style = {};


            style.cursor = 'pointer';
            style.backgroundColor = (props.selected != undefined && props.selected(item) ? 'yellow' : 'inherit');

            return <tr style={style} key={index.toString()}>{cells}</tr>;
        });
    }

    function handleClick(data) {
        props.onClick(data);
    }

    function handleSort(data) {
        props.onSort(data);
    }

    var rowComponents = generateRows();
    var headerComponents = generateHeaders();
    return (
        <table className={(props.tableClass != undefined ? props.tableClass : '')} style={props.tableStyle}>
            <thead style={props.theadStyle}>{headerComponents}</thead>
            <tbody style={props.tbodyStyle}>{rowComponents}</tbody>
        </table>
    );

};

const AngleIcon: React.FunctionComponent<{ ascending: boolean }> = (props) => <span style={{width: 10, height: 10, margin: 3}}className={"fa fa-angle-" + (props.ascending ? 'up' : 'down')}></span>
export default Table;