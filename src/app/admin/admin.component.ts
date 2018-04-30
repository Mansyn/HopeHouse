import { Component, Inject, AfterViewInit, ViewChild, OnDestroy } from '@angular/core'
import { ResponseContentType } from '@angular/http'
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatTabChangeEvent, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'
import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { SelectionModel } from '@angular/cdk/collections'

import { UserProfile, Profile, User } from '../core/user'
import { AuthService } from '../core/auth.service'
import { Schedule } from '../schedule/shared/schedule'
import { ScheduleService } from '../schedule/shared/schedule.service'
import { Location } from '../schedule/shared/location'
import { LocationService } from '../schedule/shared/location.service'
import { VolunteerDialog } from './dialogs/volunteer.component'
import { UserDialog } from './dialogs/user.component'
import { ScheduleDialog } from './dialogs/schedule.component'
import { ScheduleDeleteDialog } from './dialogs/schedule-delete.component'
import { ProfileService } from '../core/profile.service'
import { ViewScheduleDialog } from './dialogs/schedule-view.component'
import { ExcelService } from '../utilities/services/excel.service'
import { EventService } from '../components/scheduler/shared/event.service'
import EventUtils from "../components/scheduler/shared/event.utils"

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
        private eventService: EventService,
        private profileService: ProfileService,
        private locationService: LocationService,
        private excelService: ExcelService
    ) { }

    ngAfterViewInit() {
        const userProfiles$ = this.profileService.getProfilesSnapshot()
        const users$ = this.auth.getAllUsers()

        combineLatest(
            userProfiles$, users$,
            (userProfilesData, usersData) => {
                let userProfiles = []
                userProfilesData.forEach((_profile) => {
                    var profile = _profile.payload.toJSON()
                    profile.uid = _profile.key
                    userProfiles.push(profile as Profile)
                })
                let users = usersData.map((user) => {
                    return {
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        photoURL: user.photoURL,
                        roles: user.roles,
                        profile: userProfiles.find(p => p.user_uid == user.uid)
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
        filterValue = filterValue.trim()
        filterValue = filterValue.toLowerCase()
        this.user_dataSource.filter = filterValue
    }

    locationName(key: string) {
        if (this.locations) {
            let location = this.locations.find(x => x.$key == key)
            return location ? location.name : ''
        } else {
            return ''
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

    viewScheduleDialog(): void {
        let target = this.schedule_selection.selected[0];

        let dialogRef = this.dialog.open(ViewScheduleDialog, {
            width: '600px',
            data: { schedule: target, users: this.user_dataSource.data }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.user_selection.clear();
            }
        });
    }

    downloadSchedule() {
        let targetSchedule = this.schedule_selection.selected[0];

        this.eventService.getScheduleEventsValue(targetSchedule.$key)
            .subscribe(_events => {
                let events: any[] = []

                EventUtils.filterPastEvents(_events).forEach(_event => {
                    let event = {
                        Volunteer: this.findUser(_event.user).profile.name,
                        Date: this.formatDateDisplay(_event.start, _event.end)
                    }
                    events.push(event)
                })

                this.excelService.exportAsExcelFile(events, targetSchedule.title)
            })

    }

    formatDateDisplay(start, end) {
        return moment(start).format('MMMM Do h:mm A') + ' to ' + moment(end).format('h:mm A')
    }

    findUser(userId: string): UserProfile {
        return this.user_dataSource.data.find(u => u.uid == userId)
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