import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatTabChangeEvent, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { User } from '../../core/user';
import { AuthService } from '../../core/auth.service';
import { Schedule } from '../../schedule/shared/schedule';
import { ScheduleService } from '../../schedule/shared/schedule.service';
import { Location } from '../../schedule/shared/location';
import { LocationService } from '../../schedule/shared/location.service';
import { SelectionModel } from '@angular/cdk/collections';
import { VolunteerDialog } from './dialogs/volunteer.component';
import { ScheduleDialog } from './dialogs/schedule.component';
import { ScheduleDeleteDialog } from './dialogs/schedule-delete.component';

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
    user_selection = new SelectionModel<User>(false, []);
    schedule_displayedColumns = ['select', 'title', 'location', 'color'];
    schedule_dataSource = new MatTableDataSource<Schedule>();
    schedule_selection = new SelectionModel<Schedule>(false, []);
    locations: Location[];

    constructor(public auth: AuthService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private scheduleService: ScheduleService,
        private locationService: LocationService) { }

    ngAfterViewInit() {
        this.auth.getAllUsers().subscribe(data => {
            this.user_dataSource.data = data;
        });
        this.user_dataSource.paginator = this.user_paginator;
        this.user_dataSource.sort = this.user_sort;

        this.scheduleService.getSchedules()
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
        this.fetchLocations();
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.user_selection.clear();
        this.schedule_selection.clear();
        this.tabIndex = tabChangeEvent.index;
        console.log('tab => ', tabChangeEvent.index);
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.user_dataSource.filter = filterValue;
    }

    locationName(key: string) {
        if (this.locations) {
            let location = this.locations.find(x => x.$key == key);
            return location ? location.name : '';
        } else {
            return '';
        }
    }

    isRole(role: string) {
        let found = false;
        switch (role) {
            case 'admin':
                found = this.user_selection.selected[0].roles.admin;
                break;
            case 'volunteer':
                found = this.user_selection.selected[0].roles.volunteer;
                break;
        }
        return found;
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
            data: { schedule: target, locations: this.locations }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                if (isNew) {
                    this.scheduleService.addSchedule(result)
                        .then((data) => {
                            this.openSnackBar('Schedule Saved', 'OKAY');
                        });
                } else {
                    this.scheduleService.updateSchedule(this.schedule_selection.selected[0].$key, result)
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

    articleDeleteDialog(): void {
        let targets = this.schedule_selection.selected;

        let dialogRef = this.dialog.open(ScheduleDeleteDialog, {
            width: '400px',
            data: { count: targets.length }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                targets.forEach((target) => {
                    this.scheduleService.deleteSchedule(target.$key);
                });
                this.openSnackBar(
                    targets.length + ' schedule deleted',
                    'OKAY'
                );
                this.schedule_selection.clear();
            }
        });
    }

    fetchLocations() {
        this.locationService.getLocations().snapshotChanges()
            .subscribe(data => {
                let locations = [];
                data.forEach(element => {
                    var y = element.payload.toJSON();
                    y["$key"] = element.key;
                    locations.push(y as Location);
                });

                this.locations = locations;
            });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }

    createLocation() {
        let now = new Date().toDateString();

        let location = {
            name: 'Middletown: Women\'s Shelter',
            address: '1300 Girard Ave, Middletown, OH 45044',
            phone: '513-217-5056',
            active: true
        }

        this.locationService.addLocation(location)
            .then((data) => {
                this.openSnackBar('Location Saved', 'OKAY');
            });
    }
}