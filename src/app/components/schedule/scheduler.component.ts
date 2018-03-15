import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
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
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { ScheduleService } from './shared/schedule.service';
import { EventService } from "./shared/event.service";
import { Event } from "./shared/event";
import { Schedule } from "./shared/schedule";
import { colors } from "./shared/colors";
import EventUtils from './shared/event.utils';

@Component({
    selector: 'scheduler',
    styleUrls: [
        '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css',
        'scheduler.component.scss'],
    templateUrl: 'scheduler.component.html',
    providers: [EventService]
})

export class SchedulerComponent implements OnInit {

    lunchkey: string = '-L6YBHfPcs5DMTbzyTxo';

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

    constructor(private scheduleService: ScheduleService,
        private eventService: EventService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.fetchEvents();
    }

    fetchEvents() {
        this.scheduleService.getSchedule(this.lunchkey)
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

    handleEditEvent(event: CalendarEvent): void {
        event["schedule_key"] = this.lunchkey;

        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
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
        let newEvent = {
            schedule_key: this.lunchkey
        }

        let dialogRef = this.dialog.open(EventDialog, {
            width: '650px',
            data: { event: newEvent }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
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

@Component({
    selector: 'event-dialog',
    template: `<h1 mat-dialog-title>
                    <span *ngIf="create">Create Event</span>
                    <span *ngIf="!create">Edit Event</span>
                </h1>
                <div mat-dialog-content>
                <form [formGroup]="form">
                    <mat-form-field class="full-width m-b-20">
                        <input matInput placeholder="Title" type="text" [formControl]="form.controls['title']" [(ngModel)]="data.event.title">
                        <mat-error *ngIf="form.controls['title'].hasError('required')">
                            Title is required
                        </mat-error>
                        <mat-error *ngIf="form.controls['title'].hasError('maxlength')">
                            Title is cannot exceed 25 characters
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="half-width m-b-20">
                        <mat-placeholder>Start</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="startDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #startDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [min]="minStartDate" [max]="maxStartDate" [formControl]="form.controls['start']" [(ngModel)]="data.event.start" [matDatetimepicker]="startDatetimePicker" required autocomplete="false" (dateChange)="changeStart('change', $event)">
                        <mat-error *ngIf="form.controls['start'].hasError('required')">
                            Start Date is required
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="half-width m-b-20">
                        <mat-placeholder>End</mat-placeholder>
                        <mat-datetimepicker-toggle [for]="endDatetimePicker" matSuffix></mat-datetimepicker-toggle>
                        <mat-datetimepicker #endDatetimePicker type="datetime" openOnFocus="true" timeInterval="5"></mat-datetimepicker>
                        <input matInput [min]="minEndDate" [max]="maxEndDate" [formControl]="form.controls['end']" [(ngModel)]="data.event.end" [matDatetimepicker]="endDatetimePicker" required autocomplete="false" (dateChange)="changeEnd('change', $event)">
                        <mat-error *ngIf="form.controls['end'].hasError('required')">
                            End Date is required
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="half-width m-b-20">
                        <input matInput placeholder="Primary Color" type="color" [formControl]="form.controls['primary']" [(ngModel)]="data.event.color.primary" (change)="refresh.next()">
                        <mat-error *ngIf="form.controls['primary'].hasError('required')">
                            Primary Color is required
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="half-width m-b-20">
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

    today = new Date();

    minStartDate;
    maxStartDate;
    minEndDate;
    maxEndDate;

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

    changeStart(type: string, event: MatDatepickerInputEvent<Date>) {
        this.minEndDate = event.value;
    }

    changeEnd(type: string, event: MatDatepickerInputEvent<Date>) {
        this.maxStartDate = event.value;
    }

    saveEvent() {
        if (this.form.valid) {
            let now = new Date().toDateString();

            let event = {
                schedule_key: this.data.event.schedule_key,
                title: this.data.event.title,
                start: moment(this.data.event.start).format(),
                end: moment(this.data.event.end).format(),
                primary: this.data.event.color.primary,
                secondary: this.data.event.color.secondary,
                timeStamp: now
            }

            if (!this.create) {
                event["id"] = this.data.event.id;
            }

            this.dialogRef.close(event);
        }
    }
}

@Component({
    selector: 'event-delete-dialog',
    template: `<h1 mat-dialog-title>
                <span>Remove Event</span>
                </h1>
             <div mat-dialog-content>
               <p>Are you sure you want to remove event from the schedule?</p>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class EventDeleteDialog {

    constructor(
        public dialogRef: MatDialogRef<EventDeleteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }
}