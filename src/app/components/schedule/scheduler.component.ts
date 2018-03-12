import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

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
        '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css',
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
            end: addDays(new Date(), 1),
            title: 'An event with no end date',
            color: colors.red,
            actions: this.actions
        },
        {
            start: subDays(endOfMonth(new Date()), 3),
            end: addDays(endOfMonth(new Date()), 3),
            title: 'A long event that spans 2 months',
            color: colors.blue,
            actions: this.actions
        }
    ];

    constructor(private scheduleService: ScheduleService, private eventService: EventService, public dialog: MatDialog, public snackBar: MatSnackBar) { }

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

    handleEditEvent(event: CalendarEvent): void {

        let dialogRef = this.dialog.open(EventDialog, {
            width: '600px',
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.eventService.updateEvent(event, result)
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

    }

    handleCreateEvent() {

    }

    eventClicked(event: CalendarEvent<{ film: Event }>): void {
        window.open(
            `https://www.themoviedb.org/movie/${event.meta.film}`,
            '_blank'
        );
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }
}

@Component({
    selector: 'event-dialog',
    template: `<h1 mat-dialog-title>
                    <span *ngIf="create">Create Event</span>
                    <span *ngIf="!create">Edit Event</span>
                </h1>
                <div mat-dialog-content>
                <form [formGroup]="form">
                    <mat-form-field class="full-width">
                        <input matInput placeholder="Title" type="text" [formControl]="form.controls['title']" [(ngModel)]="data.event.title">
                        <mat-error *ngIf="form.controls['title'].hasError('required')">
                            Title is required
                        </mat-error>
                        <mat-error *ngIf="form.controls['title'].hasError('maxlength')">
                            Title is cannot exceed 25 characters
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="full-width">
                        <mat-placeholder>Start</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="startDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #startDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [formControl]="form.controls['start']" [matDatetimepicker]="startDatetimePicker" required autocomplete="false">
                    </mat-form-field>
                    <mat-form-field class="full-width">
                        <mat-placeholder>End</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="endDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #endDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [formControl]="form.controls['end']" [matDatetimepicker]="endDatetimePicker" required autocomplete="false">
                    </mat-form-field>
                </form>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-button (click)="saveEvent()" [disabled]="!form.valid" color="primary">Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class EventDialog {

    create: boolean
    form: FormGroup

    constructor(public dialogRef: MatDialogRef<EventDialog>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.create = data.event.$key == null;
        this.form = this.fb.group({
            'title': [data.event.title || null, Validators.compose([Validators.maxLength(25), Validators.required])],
            'start': [data.event.start || null, Validators.required],
            'end': [data.event.end || null, Validators.required]
        })
    }

    saveEvent() {
        if (this.form.valid) {
            let now = new Date().toDateString();

            let event = {
                title: this.data.event.title,
                start: this.data.event.start,
                end: this.data.event.end,
                timeStamp: now
            }

            this.dialogRef.close(event);
        }
    }
}