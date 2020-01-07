//******************************************************************************************************
//  MultiselectWindow.tsx - Gbtc
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
//  03/13/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

/// <reference path="../openSee.d.ts" />

import { groupBy } from 'lodash';
import * as React from 'react';

export default class MultiselectWindow extends React.Component<{ data: Array<iListObject>, style?: object, className?: string, stateSetter: Function, comparedEvents: Array<number>}>{
    constructor(props, context) {
        super(props, context);
    }

    handleClicks(e) {
        this.props.stateSetter({ comparedEvents: $(this.refs.list).find('input[type="checkbox"]:checked').toArray().filter((a: HTMLInputElement) => a.value != "on").map((a: HTMLInputElement) => parseInt(a.value)) });
    }

    render() {
        var groups = groupBy(this.props.data, 'group'); 

        var formStyle = (this.props.style == undefined ? {} : this.props.style);

        if (formStyle['backgroundColor'] == undefined) formStyle['backgroundColor'] = 'white';
        if (formStyle['borderRadius'] == undefined) formStyle['borderRadius'] = '10px';
        if (formStyle['border'] == undefined) formStyle['border'] = '1px solid #000000';
        if (formStyle['padding'] == undefined) formStyle['padding'] = '10px';
        if (formStyle['width'] == undefined) formStyle['width'] = '90%';
        if (formStyle['height'] == undefined) formStyle['height'] = '100%';

        if (formStyle['marginLeft'] == undefined) formStyle['marginLeft'] = '5%';
        if (formStyle['marginRight'] == undefined) formStyle['marginRight'] = '5%';
        if (formStyle['overflow'] == undefined) formStyle['overflow'] = 'auto';

        var style = {};
        style['marginTop'] = '10px';
        style['width'] = '100%';
        style['height'] = '100%';

        return (
            <div style={style}> 
                <form style={formStyle}>
                    <ul ref="list" style={{listStyleType: 'none', padding: 0}}>
                        {Object.keys(groups).map((key, index) => <Group key={index} name={key} children={(groups[key] as Array<iListObject>)} callback={this.handleClicks.bind(this)}/>)}
                    </ul>
                </form>
            </div>
        );
    }
}

const Group = (props: {name: string, children: Array<iListObject>, callback: Function}, context): any => {
    if (props.name == "undefined")
        return props.children.map(c => <ListItem key={"undefined" + c.label} name={c.label} value={c.value} callback={props.callback} data={c} />);
    return [<li key={props.name}>{props.name}<ul style={{ listStyleType: 'none' }}>{props.children.map(c => <ListItem key={props.name + c.label} value={c.value} name={c.label} callback={props.callback} data={c} />)}</ul></li>];
}

const ListItem = (props: { name: string, value: number, callback: Function, data: iListObject}, context)=> {
    return <li key={props.data.group + props.name}><label><input type="checkbox" value={props.value} onClick={() => props.callback()} defaultChecked={props.data.selected}/> {props.name}</label></li>
}