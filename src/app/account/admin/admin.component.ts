import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatTabChangeEvent, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import _ from 'lodash';

import { AuthService } from '../../core/auth.service';
import { ScheduleService } from '../../components/schedule/shared/schedule.service';
import { User } from '../../core/user';
import { Schedule } from '../../components/schedule/shared/schedule';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements AfterViewInit {

    @ViewChild(MatSort) user_sort: MatSort;
    @ViewChild(MatPaginator) user_paginator: MatPaginator;
    @ViewChild(MatSort) schedule_sort: MatSort;
    @ViewChild(MatPaginator) schedule_paginator: MatPaginator;

    tabIndex = 0;
    user_displayedColumns = ['select', 'displayName', 'email', 'roles'];
    user_dataSource = new MatTableDataSource<User>();
    user_selection = new SelectionModel<User>(true, []);
    schedule_displayedColumns = ['select', 'title', 'description', 'color'];
    schedule_dataSource = new MatTableDataSource<Schedule>();
    schedule_selection = new SelectionModel<Schedule>(false, []);

    constructor(public auth: AuthService, public dialog: MatDialog, public snackBar: MatSnackBar, private _scheduleService: ScheduleService) { }

    ngAfterViewInit() {
        this.auth.getAllUsers().subscribe(data => {
            this.user_dataSource.data = data;
        });
        this.user_dataSource.paginator = this.user_paginator;
        this.user_dataSource.sort = this.user_sort;

        this._scheduleService.getSchedules()
            .snapshotChanges()
            .subscribe(data => {
                let schedules = [];
                data.forEach(element => {
                    var y = element.payload.toJSON();
                    y["$key"] = element.key;
                    schedules.push(y as Schedule);
                });

                this.schedule_dataSource.data = schedules;
            });
        this.schedule_dataSource.paginator = this.schedule_paginator;
        this.schedule_dataSource.sort = this.schedule_sort;
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.user_selection.clear();
        this.schedule_selection.clear();
        this.tabIndex = tabChangeEvent.index;
        console.log('tab => ', tabChangeEvent.index);
    }

    user_isAllSelected() {
        const numSelected = this.user_selection.selected.length;
        const numRows = this.user_dataSource.data.length;
        return numSelected == numRows;
    }

    user_masterToggle() {
        this.user_isAllSelected() ?
            this.user_selection.clear() :
            this.user_dataSource.data.forEach(row => this.user_selection.select(row));
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.user_dataSource.filter = filterValue;
    }

    volunteerDialog(add: boolean): void {
        let targets = this.user_selection.selected;

        let dialogRef = this.dialog.open(VolunteerDialog, {
            width: '350px',
            data: { add: add }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                targets.forEach((target) => {
                    this.auth.setUserVolunteer(target, add);
                });
                this.openSnackBar(add ? 'Volunteer Set' : 'Volunteer Removed', 'OKAY');
                this.user_selection.clear();
            }
        });
    }

    scheduleDialog(): void {
        let isNew = this.schedule_selection.selected.length == 0;
        let target = isNew ? (new Schedule) : this.schedule_selection.selected[0];

        let dialogRef = this.dialog.open(ScheduleDialog, {
            width: '450px',
            data: { schedule: target }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                if (isNew) {
                    this._scheduleService.addSchedule(result)
                        .then((data) => {
                            this.openSnackBar('Schedule Saved', 'OKAY');
                        });
                } else {
                    this._scheduleService.updateSchedule(this.schedule_selection.selected[0].$key, result)
                        .then((data) => {
                            this.openSnackBar('Schedule Saved', 'OKAY');
                        })
                        .catch((error) => {
                            this.openSnackBar(error, 'OKAY');
                        });
                }

                this.schedule_selection.clear();
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
    selector: 'volunteer-dialog',
    template: `<h1 mat-dialog-title>
                <span *ngIf="data.add">Add Volunteer</span>
                <span *ngIf="!data.add">Remove Volunteer</span>
                </h1>
             <div mat-dialog-content>
               <p *ngIf="data.add">Are you sure you want to set user(s) to volunteer?</p>
               <p *ngIf="!data.add">Are you sure you want to remove user(s) from volunteer?</p>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class VolunteerDialog {

    constructor(
        public dialogRef: MatDialogRef<VolunteerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        var i = data;
    }
}

@Component({
    selector: 'schedule-dialog',
    template: `<h1 mat-dialog-title>
                    <span *ngIf="create">Create Schedule</span>
                    <span *ngIf="!create">Edit Schedule</span>
                </h1>
                <div mat-dialog-content>
                <form [formGroup]="form">
                    <mat-form-field class="full-width">
                        <input matInput placeholder="Title" type="text" [formControl]="form.controls['title']" [(ngModel)]="data.schedule.title">
                        <mat-error *ngIf="form.controls['title'].hasError('required')">
                            Title is required
                        </mat-error>
                        <mat-error *ngIf="form.controls['title'].hasError('maxlength')">
                            Title is cannot exceed 25 characters
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="full-width">
                        <input matInput placeholder="Description" type="text" [formControl]="form.controls['description']" [(ngModel)]="data.schedule.description">
                        <mat-error *ngIf="form.controls['description'].hasError('required')">
                            Description is required
                        </mat-error>
                    </mat-form-field>
                    <mat-form-field class="full-width">
                        <input matInput placeholder="Color" type="text" [formControl]="form.controls['color']" [(ngModel)]="data.schedule.color">
                        <mat-error *ngIf="form.controls['color'].hasError('required')">
                            Color is required
                        </mat-error>
                    </mat-form-field>
                </form>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-button (click)="saveSchedule()" [disabled]="!form.valid" color="primary">Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class ScheduleDialog {

    create: boolean
    form: FormGroup

    constructor(public dialogRef: MatDialogRef<ScheduleDialog>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.create = data.schedule.$key == null;
        this.form = this.fb.group({
            'title': [data.schedule.title || null, Validators.compose([Validators.maxLength(25), Validators.required])],
            'color': [data.schedule.color || null, Validators.required],
            'description': [data.schedule.description || null, Validators.required]
        })
    }

    saveSchedule() {
        if (this.form.valid) {
            let now = new Date().toDateString();

            let schedule = {
                title: this.data.schedule.title,
                color: this.data.schedule.color,
                description: this.data.schedule.description,
                timeStamp: now,
                active: true
            }

            this.dialogRef.close(schedule);
        }
    }
}