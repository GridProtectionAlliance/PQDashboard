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
import * as _ from 'lodash';

const AngleIcon: React.FunctionComponent<{ ascending: boolean }> = (props) => <span style={{ width: 10, height: 10, margin: 3 }} className={"fa fa-angle-" + (props.ascending ? 'up' : 'down')}></span>

export interface TableProps<T> {
    cols: Array<{ key: keyof(T) | null, label: string, headerStyle?: React.CSSProperties, rowStyle?: React.CSSProperties, content?(item: T, key: keyof(T), style: React.CSSProperties): React.ReactNode }>,
    data: Array<T>,
    onClick: (data: { col: keyof (T), row: T, data: T[keyof(T)] }, event: any) => void,
    sortField: string,
    ascending: boolean,
    onSort(data: { col: keyof (T), asending: boolean}): void,
    tableClass?: string,
    tableStyle?: React.CSSProperties,
    theadStyle?: React.CSSProperties,
    theadClass?: string,
    tbodyStyle?: React.CSSProperties,
    tbodyClass?: string,
    selected?(data: T): boolean,
    rowStyle?: React.CSSProperties,
}

export default class Table<T> extends React.Component<TableProps<T>, {}> {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    render() {
        var rowComponents = this.generateRows();
        var headerComponents = this.generateHeaders();
        return (
            <table className={(this.props.tableClass != undefined ? this.props.tableClass : '')} style={this.props.tableStyle}>
                <thead style={this.props.theadStyle}>{headerComponents}</thead>
                <tbody style={this.props.tbodyStyle}>{rowComponents}</tbody>
            </table>
        );
    }

    generateHeaders() {
        if (this.props.cols.length == 0) return null;

        var cells = this.props.cols.map((colData, index) => {
            var style;
            if (colData.headerStyle != undefined) {
                style = colData.headerStyle;
            }
            else
                style = {};

            if (style.cursor == undefined)
                style.cursor = 'pointer';

            return <th key={index} style={style} onClick={(e) => this.handleSort({ col: colData.key, ascending: this.props.ascending }, e)}>{colData.label}{(this.props.sortField == colData.key ? <AngleIcon ascending={this.props.ascending} /> : null)}</th>
        });

        return <tr>{cells}</tr>;
    }

    generateRows() {
        if (this.props.data.length == 0) return null;

        return this.props.data.map((item, index) => {
            var cells = this.props.cols.map(colData => {
                var style = _.clone(colData.rowStyle);
                return <td
                    key={index.toString() + item[colData.key] + colData.key}
                    style={style}
                    onClick={this.handleClick.bind(this, { col: colData.key, row: item, data: item[colData.key] })}
                >
                    {colData.content != undefined ? colData.content(item, colData.key, style) : item[colData.key]}
                </td>
            });

            var style;

            if (this.props.rowStyle != undefined) {
                style = _.clone(this.props.rowStyle);
            }
            else
                style = {};

            if (style.cursor == undefined)
                style.cursor = 'pointer';

            if (this.props.selected(item))
                style.backgroundColor = 'yellow';

            return <tr style={style} key={index.toString()}>{cells}</tr>;
        });
    }

    handleClick(data: { col: keyof(T), row: T, data: any }, event) {
        this.props.onClick(data, event);
    }

    handleSort(data, event) {
        this.props.onSort(data);
    }
};
