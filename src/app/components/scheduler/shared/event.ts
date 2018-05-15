import { CalendarEvent } from "angular-calendar";

export class Event {
    $key: string;
    schedule_key: string;
    user: string;
    start: string;
    end: string;
    type: string;
    primary: string;
    secondary: string;
    frequency: number;
    by_month?: number;
    by_monthday?: number;
    by_weekday?: string;
    timeStamp: string;
}

export interface RecurringCalendarEvent<MetaType = any> {
    id?: string | number;
    start: Date;
    end?: Date;
    title: string;
    color?: EventColor;
    actions?: EventAction[];
    allDay?: boolean;
    cssClass?: string;
    resizable?: {
        beforeStart?: boolean;
        afterEnd?: boolean;
    };
    rrule?: {
        freq: RRule.Frequency;
        bymonth?: number;
        bymonthday?: number;
        byweekday?: RRule.Weekday[];
    };
    draggable?: boolean;
    meta?: MetaType;
}

export interface EventColor {
    primary: string;
    secondary: string;
}
export interface EventAction {
    label: string;
    cssClass?: string;
    onClick({ event }: {
        event: CalendarEvent;
    }): any;
}