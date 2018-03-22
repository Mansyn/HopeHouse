import { LOCALE_ID, Inject } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';

export class EventTitleFormatter extends CalendarEventTitleFormatter {
    constructor(@Inject(LOCALE_ID) private locale: string) {
        super();
    }

    // you can override any of the methods defined in the parent class

    month(event: CalendarEvent): string {
        return `${event.title} &mdash; ${new DatePipe(this.locale).transform(
            event.start,
            'h:mm a',
            this.locale
        )} to ${new DatePipe(this.locale).transform(
            event.end,
            'h:mm a',
            this.locale
        )}`;
    }

    week(event: CalendarEvent): string {
        return `${event.title} &mdash; ${new DatePipe(this.locale).transform(
            event.start,
            'h:mm a',
            this.locale
        )} to ${new DatePipe(this.locale).transform(
            event.end,
            'h:mm a',
            this.locale
        )}`;
    }

    day(event: CalendarEvent): string {
        return `${event.title}`;
    }
}