import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { Event } from './event';

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

export default class EventUtils {

    static mapToCalendarEvent(event: Event): CalendarEvent {

        let calendarEvent = {
            id: event.$key,
            start: new Date(event.start),
            end: new Date(event.end),
            title: event.title,
            user: event.user,
            color: {
                primary: event.primary,
                secondary: event.secondary
            },
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        }

        return calendarEvent;
    }

    static mapFromCalendarEvent(calendarevent: CalendarEvent, schedule_key: string, userid: string): Event {

        let event = {
            $key: '',
            schedule_key: schedule_key,
            title: calendarevent.title,
            user: userid,
            start: moment(calendarevent.start).format(),
            end: moment(calendarevent.end).format(),
            primary: calendarevent.color.primary,
            secondary: calendarevent.color.secondary,
            timeStamp: moment().format()
        }

        return event;
    }
}