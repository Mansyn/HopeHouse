import { Component, ChangeDetectionStrategy, Inject, OnInit, Input, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'
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
} from 'date-fns'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'

import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarEventTitleFormatter } from 'angular-calendar'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'

import { ScheduleService } from '../../schedule/shared/schedule.service'
import { EventService } from "./shared/event.service"
import { Event } from './shared/event'
import { Schedule } from '../../schedule/shared/schedule'
import { colors } from "./shared/colors"
import { EventDialog } from './dialogs/event.component'
import { EventDeleteDialog } from './dialogs/delete.component'
import { AuthService } from '../../core/auth.service'
import { ProfileService } from '../../core/profile.service'
import { User, UserProfile } from '../../core/user'
import { EventTitleFormatter } from './event-title-formatter.provider'
import EventUtils from './shared/event.utils'

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'

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

    @Input() scheduleKey: string

    private unsubscribe = new Subject<void>()
    destroy$: Subject<boolean> = new Subject<boolean>()

    loading = true
    isAdmin = false
    activeDayIsOpen: boolean = false
    view: string = 'week'
    viewDate: Date = new Date()

    calendarEvents: CalendarEvent[] = []
    events: Event[] = []
    volunteers: User[] = []
    schedule: Schedule
    userRef: User

    actions: CalendarEventAction[] = [
        // {
        //     label: '<i class="material-icons md-18">edit</i>',
        //     onClick: ({ event }: { event: CalendarEvent }): void => {
        //         this.handleEditEvent(event)
        //     }
        // },
        {
            label: '<i class="material-icons md-18">close</i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleDeleteEvent(event)
            }
        }
    ];

    constructor(
        private router: Router,
        public auth: AuthService,
        private scheduleService: ScheduleService,
        private eventService: EventService,
        private profileService: ProfileService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.auth.user$
            .subscribe(user => {
                if (user && user.uid) {
                    this.fetchEvents(user)
                } else {
                    this.router.navigate(['/account/login'])
                }
            })
    }

    fetchEvents(user: User) {
        this.userRef = user
        this.isAdmin = this.auth.isAdmin(user)

        const schedule$ = this.scheduleService.getScheduleSnapshot(this.scheduleKey)
        const events$ = this.eventService.getScheduleEventsSnapshot(this.scheduleKey)
        const userProfiles$ = this.profileService.getProfilesData()
        const users$ = this.auth.getAllUsers()

        combineLatest(
            schedule$, events$, userProfiles$, users$,
            (scheduleData, eventsData, userProfilesData, usersData) => {

                // schedule
                let schedule = scheduleData.payload.toJSON()
                schedule['$key'] = scheduleData.key
                this.schedule = schedule as Schedule

                // events
                this.calendarEvents = []
                this.events = []
                eventsData.forEach(_event => {
                    var event = _event.payload.toJSON()
                    event['$key'] = _event.key
                    this.events.push(event as Event)
                })
                this.events.forEach((event) => {
                    this.calendarEvents.push(EventUtils.mapToCalendarEvent(event))
                })
                this.calendarEvents.forEach((event) => {
                    let target = this.events.find(e => e.$key == event.id)
                    event['actions'] = (this.isAdmin || target.user == this.userRef.uid) ? this.actions : []
                })
                this.refresh.next()
                this.loading = false
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
                if (this.isAdmin) {
                    this.volunteers = users
                } else {
                    this.volunteers = []
                    this.volunteers.push(users.find(e => e.uid == this.userRef.uid))
                }
            }
        ).takeUntil(this.destroy$).subscribe()
    }

    dayClicked({ date, events }: { date: Date; events: Array<CalendarEvent<{ film: Event }>>; }): void {
        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0
            ) {
                this.activeDayIsOpen = false
            } else {
                this.activeDayIsOpen = true
                this.viewDate = date
            }
        }
    }

    refresh: Subject<any> = new Subject()

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
        let target = this.events.find(e => e.$key == event.id)
        if (this.isAdmin || target.user == this.userRef.uid) {
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
                            this.openSnackBar(error, 'OKAY')
                        })
                }
            })
        }
    }

    handleDeleteEvent(event: CalendarEvent): void {
        let target = this.events.find(e => e.$key == event.id)
        if (this.isAdmin || target.user == this.userRef.uid) {
            let dialogRef = this.dialog.open(EventDeleteDialog, {
                width: '450px',
                data: { event: event }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.eventService.deleteEvent(event.id as string);
                    this.calendarEvents = this.calendarEvents.filter(iEvent => iEvent !== event);
                    this.openSnackBar('Schedule Removed', 'OKAY');
                }
            })
        }
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

    public ngOnDestroy() {
        this.unsubscribe.next()
        this.unsubscribe.complete()
    }
}