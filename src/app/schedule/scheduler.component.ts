import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import {
    isSameMonth,
    isSameDay,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    startOfDay,
    endOfDay,
    format,
    subDays,
    addDays,
    addHours
} from 'date-fns';

import { CalendarEvent, CalendarEventAction } from 'angular-calendar';

import { ScheduleService } from './shared/schedule.service';
import { EventService } from "./shared/event.service";
import { Event } from "./shared/event";
import { Schedule } from "./shared/schedule";

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};

@Component({
    selector: 'scheduler',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        '../../../node_modules/bootstrap/dist/css/bootstrap.min.css',
        'scheduler.component.scss'],
    templateUrl: 'scheduler.component.html',
    providers: [EventService]
})

export class SchedulerComponent implements OnInit {

    view: string = 'month';
    viewDate: Date = new Date();
    activeDayIsOpen: boolean = true;

    lunchSchedule: Schedule;

    actions: CalendarEventAction[] = [
        {
            label: '<i class="fa fa-fw fa-pencil"></i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                //this.handleEvent('Edited', event);
            }
        },
        {
            label: '<i class="fa fa-fw fa-times"></i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.events = this.events.filter(iEvent => iEvent !== event);
                //this.handleEvent('Deleted', event);
            }
        }
    ];

    events: CalendarEvent[] = [
        {
            start: subDays(startOfDay(new Date()), 1),
            end: addDays(new Date(), 1),
            title: 'A 3 day event',
            color: colors.red,
            actions: this.actions
        },
        {
            start: startOfDay(new Date()),
            title: 'An event with no end date',
            color: colors.yellow,
            actions: this.actions
        },
        {
            start: subDays(endOfMonth(new Date()), 3),
            end: addDays(endOfMonth(new Date()), 3),
            title: 'A long event that spans 2 months',
            color: colors.blue
        },
        {
            start: addHours(startOfDay(new Date()), 2),
            end: new Date(),
            title: 'A draggable and resizable event',
            color: colors.yellow,
            actions: this.actions,
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        }
    ];

    constructor(private scheduleService: ScheduleService, private eventService: EventService) { }

    ngOnInit() {
        const getStart: any = {
            month: startOfMonth,
            week: startOfWeek,
            day: startOfDay
        }[this.view];

        const getEnd: any = {
            month: endOfMonth,
            week: endOfWeek,
            day: endOfDay
        }[this.view];

        this.scheduleService.getSchedule('-L6YBHfPcs5DMTbzyTxo')
            .snapshotChanges()
            .subscribe(data => {
                var x = data.payload.toJSON();
                x["$key"] = data.key;
                this.lunchSchedule = x as Schedule;
            });
    }

    dayClicked({
        date,
        events
    }: {
            date: Date;
            events: Array<CalendarEvent<{ film: Event }>>;
        }): void {
        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0
            ) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }

    add() {

    }

    eventClicked(event: CalendarEvent<{ film: Event }>): void {
        window.open(
            `https://www.themoviedb.org/movie/${event.meta.film}`,
            '_blank'
        );
    }
}