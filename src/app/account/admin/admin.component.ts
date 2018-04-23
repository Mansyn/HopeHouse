import { Component, Inject, AfterViewInit, ViewChild, OnDestroy } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatTabChangeEvent, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'

import { UserProfile } from '../../core/user'
import { AuthService } from '../../core/auth.service'
import { Schedule } from '../../schedule/shared/schedule'
import { ScheduleService } from '../../schedule/shared/schedule.service'
import { Location } from '../../schedule/shared/location'
import { LocationService } from '../../schedule/shared/location.service'
import { SelectionModel } from '@angular/cdk/collections'
import { VolunteerDialog } from './dialogs/volunteer.component'
import { UserDialog } from './dialogs/user.component'
import { ScheduleDialog } from './dialogs/schedule.component'
import { ScheduleDeleteDialog } from './dialogs/schedule-delete.component'
import { ProfileService } from '../../core/profile.service'

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements AfterViewInit, OnDestroy {

    destroy$: Subject<boolean> = new Subject<boolean>()

    @ViewChild(MatSort) user_sort: MatSort
    @ViewChild(MatPaginator) user_paginator: MatPaginator
    @ViewChild(MatSort) schedule_sort: MatSort
    @ViewChild(MatPaginator) schedule_paginator: MatPaginator

    tabIndex = 0
    user_displayedColumns = ['select', 'displayName', 'email', 'phoneNumber', 'roles']
    user_dataSource = new MatTableDataSource<UserProfile>()
    user_selection = new SelectionModel<UserProfile>(false, [])
    schedule_displayedColumns = ['select', 'title', 'location', 'color']
    schedule_dataSource = new MatTableDataSource<Schedule>()
    schedule_selection = new SelectionModel<Schedule>(false, [])
    locations: Location[]

    constructor(
        public auth: AuthService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private scheduleService: ScheduleService,
        private profileService: ProfileService,
        private locationService: LocationService
    ) { }

    ngAfterViewInit() {
        const userProfiles$ = this.profileService.getProfilesData()
        const users$ = this.auth.getAllUsers()

        combineLatest(
            userProfiles$, users$,
            (userProfilesData, usersData) => {
                let users = usersData.map((user) => {
                    return {
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        photoURL: user.photoURL,
                        roles: user.roles,
                        profile: userProfilesData.find(p => p.user_uid == user.uid)
                    } as UserProfile
                })
                this.user_dataSource.data = users
            }).takeUntil(this.destroy$).subscribe()
        this.user_dataSource.paginator = this.user_paginator;
        this.user_dataSource.sort = this.user_sort;

        this.scheduleService.getSchedules()
            .snapshotChanges()
            .takeUntil(this.destroy$)
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
                    this.auth.updateUser(target, add);
                });
                this.openSnackBar(add ? 'Volunteer Set' : 'Volunteer Removed', 'OKAY');
                this.user_selection.clear();
            }
        });
    }

    userDialog(): void {
        let target = this.user_selection.selected[0]

        let dialogRef = this.dialog.open(UserDialog, {
            width: '450px',
            data: { user: target }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                result.uid = target.uid
                this.auth.updateUser(result, this.isRole('volunteer'))
                let updatedProfile = { user_uid: target.uid, name: result.displayName, phoneNumber: result.phoneNumber }
                this.profileService.updateProfile(target.profile.uid, updatedProfile)
                this.openSnackBar('User Saved', 'OKAY')
                this.user_selection.clear()
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
        this.locationService.getLocations()
            .snapshotChanges()
            .takeUntil(this.destroy$)
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

    ngOnDestroy() {
        this.destroy$.next(true)
        this.destroy$.unsubscribe()
    }
}