import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { Event } from './event';

export default class EventUtils {

    static mapToCalendarEvent(event: Event): CalendarEvent {

        let calendarEvent = {
            id: event.$key,
            start: new Date(event.start),
            end: new Date(event.end),
            title: event.title,
            color: {
                primary: event.primary,
                secondary: event.secondary
            }
        }

        return calendarEvent;
    }
}