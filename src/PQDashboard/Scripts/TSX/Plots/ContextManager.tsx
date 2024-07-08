import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import moment from 'moment';
import { Plot, Bar, BarGroup } from '@gpa-gemstone/react-graph';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { ReactTable } from '@gpa-gemstone/react-table';
import { PQDashboard } from '../global';
import { renderTableWrapper } from '../DetailTables/TableWrapper';


interface IProps {
    TimeContext: PQDashboard.TimeContext,
    SetTimeContext: (timeContext: PQDashboard.TimeContext) => void,
    XLimits: [number, number]
    SetXLimits: (limits: [number, number]) => void;
}

const contexts = ['custom', 'day', 'hour', 'minute', 'second'];

export const ContextManager = (props: IProps) => {

    const handleTimeContext = (leftToRight: boolean) => {
        if (leftToRight) {
            if (contexts.indexOf(props.TimeContext) < contexts.length - 1) {
                const newContext = contexts[contexts.indexOf(props.TimeContext) + 1] as PQDashboard.TimeContext
                props.SetTimeContext(newContext);
                updateUrlParams('context', newContext)
                return newContext
            }
        }
        else {
            if (contexts.indexOf(props.TimeContext) > 0) {
                const newContext = contexts[contexts.indexOf(props.TimeContext) - 1] as PQDashboard.TimeContext
                props.SetTimeContext(newContext);
                updateUrlParams('context', newContext);

                if (newContext === 'custom')
                    props.SetXLimits(getTimeRangeFromDatePicker(newContext))
                else
                    props.SetXLimits(stepDomainOut(newContext, props.XLimits));

                return newContext
            }
        }
    }

    return (
        <>
            {props.TimeContext != 'custom' ?
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button className="btn" onClick={() => props.SetXLimits(moveTimeDomainBackwards(props.TimeContext, props.XLimits))}><ReactIcons.ArrowBackward Size={7} /></button>
                    <span onClick={() => handleTimeContext(false)}>Step Out</span>
                    <button className="btn" onClick={() => props.SetXLimits(moveTimeDomainForward(props.TimeContext, props.XLimits))}><ReactIcons.ArrowForward Size={7} /></button>
                </div>
                : null}
        </>

    )

}

//temporary function to get startDate and endDate via dateRangePicker
function getTimeRangeFromDatePicker(timeContext): [number, number] {
    let startTime = 0;
    let endTime = 0;

    if (timeContext == "custom") {
        startTime = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().valueOf();
        endTime = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().valueOf();
    }

    return [startTime, endTime];
}

const stepDomainOut = (timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] => {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && contexts.includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

const moveTimeDomainForward = (timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] => {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && contexts.includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).add(1, `${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

function moveTimeDomainBackwards(timeContext: PQDashboard.TimeContext, domain: [number, number] | null): [number, number] {
    if (domain == null) return [0, 0]
    let newStartTime: number = domain[0];
    let newEndTime: number = domain[1];

    if (timeContext != 'custom' && ['day', 'hour', 'minute', 'second'].includes(timeContext)) {
        newStartTime = moment(domain[0]).utc().startOf(`${timeContext}`).subtract(1, `${timeContext}`).valueOf();
        newEndTime = moment(newStartTime).utc().endOf(`${timeContext}`).valueOf();
    }
    updateUrlParams('contextDate', getFormattedDate(newStartTime, timeContext));
    return [newStartTime, newEndTime]
}

function updateUrlParams(param, value) {
    const urlParams = new URLSearchParams(window.location.search);

    const paramValue = value.toLowerCase();
    urlParams.set(param, paramValue);
    history.pushState(null, '', "?" + urlParams.toString());
}

export const getFormattedDate = (date, timeContext): string => {
    if (date == null) return "";
    if (timeContext == "day")
        return moment(date).utc().format('YYYY-MM-DDTHH:00') + 'Z';
    else if (timeContext == "hour")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    else if (timeContext == "minute")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else if (timeContext == "second")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else
        return moment(date).utc().format('YYYY-MM-DDT00:00:00') + 'Z';
}