import { Component, ChangeDetectionStrategy, Inject, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { ScheduleService } from '../../schedule/shared/schedule.service';
import { EventService } from "./shared/event.service";
import { Event } from './shared/event';
import { Schedule } from '../../schedule/shared/schedule';
import { colors } from "./shared/colors";
import { EventDialog } from './dialogs/event.component';
import { EventDeleteDialog } from './dialogs/delete.component';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/user';
import { EventTitleFormatter } from './event-title-formatter.provider';
import EventUtils from './shared/event.utils';

@Component({
    selector: 'scheduler',
    styleUrls: [
        'scheduler.component.scss'],
    templateUrl: 'scheduler.component.html',
    providers: [EventService, {
        provide: CalendarEventTitleFormatter,
        useClass: EventTitleFormatter
    }]
})

export class SchedulerComponent implements OnInit {

    @Input() scheduleKey: string;

    loading = true;
    activeDayIsOpen: boolean = false;
    view: string = 'month';
    viewDate: Date = new Date();

    lunchSchedule: Schedule;

    actions: CalendarEventAction[] = [
        {
            label: '<i class="material-icons md-18">edit</i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleEditEvent(event);
            }
        },
        {
            label: '<i class="material-icons md-18">close</i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleDeleteEvent(event);
            }
        }
    ];

    events: CalendarEvent[];
    volunteers: User[];

    constructor(public auth: AuthService,
        private scheduleService: ScheduleService,
        private eventService: EventService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.fetchEvents();
        this.fetchVolunteers();
    }

    fetchEvents() {
        this.scheduleService.getSchedule(this.scheduleKey)
            .snapshotChanges()
            .subscribe(data => {
                var x = data.payload.toJSON();
                x["$key"] = data.key;
                this.lunchSchedule = x as Schedule;
                this.eventService.getScheduleEvents(this.lunchSchedule.$key)
                    .snapshotChanges()
                    .subscribe(data => {
                        this.events = [];
                        let events = [];
                        data.forEach(element => {
                            var x = element.payload.toJSON();
                            x["$key"] = element.key;
                            events.push(x as Event);
                        });
                        events.forEach((event) => {
                            this.events.push(EventUtils.mapToCalendarEvent(event));
                        });
                        this.events.forEach((event) => {
                            event["actions"] = this.actions;
                        });
                        this.refresh.next();
                        this.loading = false;
                    });
            });
    }

    fetchVolunteers() {
        this.auth.getAllVolunteers().subscribe(data => {
            this.volunteers = data;
        });
    }

    dayClicked({ date, events }: { date: Date; events: Array<CalendarEvent<{ film: Event }>>; }): void {
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

    refresh: Subject<any> = new Subject();

    eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent, user): void {
        event.start = newStart;
        event.end = newEnd;
        this.refresh.next();
        let result = EventUtils.mapFromCalendarEvent(event, this.scheduleKey, event["user"]);
        delete result["$key"];
        this.eventService.updateEvent(event.id, result)
            .then((data) => {
                this.openSnackBar('Schedule Updated', 'OKAY');
            })
            .catch((error) => {
                this.openSnackBar(error, 'OKAY');
            });
    }

    handleEditEvent(event: CalendarEvent): void {
        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
            data: { event: event, volunteers: this.volunteers }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                delete result["$key"];
                result["schedule_key"] = this.scheduleKey;
                this.eventService.updateEvent(event.id, result)
                    .then((data) => {
                        this.openSnackBar('Schedule Saved', 'OKAY');
                    })
                    .catch((error) => {
                        this.openSnackBar(error, 'OKAY');
                    });
            }
        });
    }

    handleDeleteEvent(event: CalendarEvent): void {
        let dialogRef = this.dialog.open(EventDeleteDialog, {
            width: '450px',
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.eventService.deleteEvent(event.id as string);
                this.events = this.events.filter(iEvent => iEvent !== event);
                this.openSnackBar('Schedule Removed', 'OKAY');
            }
        });
    }

    handleCreateEvent() {
        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
            data: { event: {}, volunteers: this.volunteers }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                delete result["$key"];
                result["schedule_key"] = this.scheduleKey;
                this.eventService.addEvent(result)
                    .then((data) => {
                        this.refresh.next();
                        this.openSnackBar('Schedule Added', 'OKAY');
                    });
            }
        });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }
}