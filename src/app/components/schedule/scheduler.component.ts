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
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { ScheduleService } from './shared/schedule.service';
import { EventService } from "./shared/event.service";
import { Event } from "./shared/event";
import { Schedule } from "./shared/schedule";
import { colors } from "./colors";

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

    lunchkey: string = '-L6YBHfPcs5DMTbzyTxo';
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

        this.scheduleService.getSchedule(this.lunchkey)
            .snapshotChanges()
            .subscribe(data => {
                var x = data.payload.toJSON();
                x["$key"] = data.key;
                this.lunchSchedule = x as Schedule;
                this.eventService.getScheduleEvents(this.lunchSchedule.$key).once('value')
                    .then((snapshot) => {
                        snapshot.forEach(function (eventSnapshot) {
                            var x = eventSnapshot
                        });
                    });
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

    refresh: Subject<any> = new Subject();

    handleEditEvent(event: CalendarEvent): void {

        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
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

        let newEvent = {
            schedule_key: this.lunchkey
        }

        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
            data: { event: newEvent }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.eventService.addEvent(event)
                    .then((data) => {
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
                    <mat-form-field class="half-width">
                        <mat-placeholder>Start</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="startDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #startDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [formControl]="form.controls['start']" [(ngModel)]="data.event.start" [matDatetimepicker]="startDatetimePicker" required autocomplete="false">
                    </mat-form-field>
                    <mat-form-field class="half-width">
                        <mat-placeholder>End</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="endDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #endDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [formControl]="form.controls['end']" [(ngModel)]="data.event.end" [matDatetimepicker]="endDatetimePicker" required autocomplete="false">
                    </mat-form-field>
                    <mat-form-field class="half-width">
                        <input matInput placeholder="Primary Color" type="color" [formControl]="form.controls['primary']" [(ngModel)]="data.event.color.primary" (change)="refresh.next()">
                        <mat-error *ngIf="form.controls['primary'].hasError('required')">
                            Primary Color is required
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="half-width">
                        <input matInput placeholder="Secondary Color" type="color" [formControl]="form.controls['secondary']" [(ngModel)]="data.event.color.secondary" (change)="refresh.next()">
                        <mat-error *ngIf="form.controls['secondary'].hasError('required')">
                            Secondary Color is required
                        </mat-error>
                    </mat-form-field>
                </form>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-raised-button (click)="saveEvent()" [disabled]="!form.valid" color="primary">Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class EventDialog {

    create: boolean
    form: FormGroup

    constructor(public dialogRef: MatDialogRef<EventDialog>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.create = data.event.$key == null;
        if (!data.event.color) {
            data.event.color = {
                'primary': colors.red.primary,
                'secondary': colors.red.secondary
            }
        }
        this.form = this.fb.group({
            'title': [data.event.title || null, Validators.compose([Validators.maxLength(25), Validators.required])],
            'start': [data.event.start || null, Validators.required],
            'end': [data.event.end || null, Validators.required],
            'primary': [data.event.color.primary, Validators.required],
            'secondary': [data.event.color.secondary, Validators.required]
        })
    }

    refresh: Subject<any> = new Subject();

    saveEvent() {
        if (this.form.valid) {
            let now = new Date().toDateString();

            let event = {
                schedule_key: this.data.event.schedule_key,
                title: this.data.event.title,
                start: this.data.event.start,
                end: this.data.event.end,
                primary: this.data.event.color.primary,
                secondary: this.data.event.color.secondary,
                timeStamp: now
            }

            this.dialogRef.close(event);
        }
    }
}