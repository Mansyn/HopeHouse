import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material"
import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment

import { ScheduleService } from "../../schedule/shared/schedule.service"
import { EventService } from "../../components/scheduler/shared/event.service"
import { Schedule } from "../../schedule/shared/schedule"
import { Event } from "../../components/scheduler/shared/event"
import { User } from "../../core/user"
import { AuthService } from "../../core/auth.service"
import { ProfileService } from "../../core/profile.service"
import UserUtils from "../../core/user.utils"
import EventUtils from "../../components/scheduler/shared/event.utils"

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'

@Component({
    selector: 'view-schedule-dialog',
    templateUrl: './schedule-view.component.html'
})
export class ViewScheduleDialog {

    destroy$: Subject<boolean> = new Subject<boolean>()

    schedule: Schedule
    users: User[]

    constructor(
        public dialogRef: MatDialogRef<ViewScheduleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public auth: AuthService,
        private profileService: ProfileService,
        private scheduleService: ScheduleService,
        private eventService: EventService
    ) {
        this.users = data.users
        this.getScheduleData(data.schedule.$key)
    }

    getScheduleData(key) {
        const schedules$ = this.scheduleService.getScheduleSnapshot(key)
        const events$ = this.eventService.getScheduleEventsSnapshot(key)
        const userProfiles$ = this.profileService.getProfilesData()
        const users$ = this.auth.getAllUsers()

        combineLatest(
            schedules$, events$, userProfiles$, users$,
            (scheduleData, eventsData, userProfilesData, usersData) => {
                let users = usersData.map((user) => {
                    return UserUtils.mapToUserProfile(user, userProfilesData.find(p => p.user_uid == user.uid))
                })

                let _events = []
                let calendarEvents = []
                let _schedules = []
                eventsData.forEach(_event => {
                    var event = _event.payload.toJSON()
                    event["$key"] = _event.key
                    _events.push(event as Event)
                })
                let schedule = scheduleData.payload.toJSON()
                schedule['$key'] = scheduleData.key
                let userEvents = _events.filter(x => x.schedule_key == scheduleData.key)
                userEvents.forEach((event) => {
                    let targetUser = users.find(u => u.uid == event.user)
                    if (targetUser) {
                        calendarEvents.push(EventUtils.mapToCalendarEvent(event, targetUser))
                    }
                })
                schedule['events'] = EventUtils.filterPastCalendarEvents(calendarEvents)
                if (schedule['events'].length > 0) {
                    _schedules.push(schedule as Schedule)
                }
                this.schedule = schedule
            }
        ).takeUntil(this.destroy$).subscribe()
    }

    formatDateDisplay(start, end) {
        return moment(start).format('dddd, MMMM Do h:mm A') + ' to ' + moment(end).format('h:mm A')
    }
}