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
        private scheduleService: ScheduleService,
        private eventService: EventService
    ) {
        this.users = data.users
        this.getScheduleData(data.schedule.$key)
    }

    getScheduleData(key) {
        const schedules$ = this.scheduleService.getScheduleSnapshot(key)
        const events$ = this.eventService.getScheduleEventsSnapshot(key)

        combineLatest(
            schedules$, events$,
            (scheduleData, eventsData) => {
                let _events = []
                let _schedules = []
                eventsData.forEach(_event => {
                    var event = _event.payload.toJSON()
                    event["$key"] = _event.key
                    _events.push(event as Event)
                })
                let schedule = scheduleData.payload.toJSON()
                schedule['$key'] = scheduleData.key
                let userEvents = _events.filter(x => x.schedule_key == scheduleData.key)
                schedule['events'] = this.filterPastEvents(userEvents)
                if (schedule['events'].length > 0) {
                    _schedules.push(schedule as Schedule)
                }
                this.schedule = schedule
            }
        ).takeUntil(this.destroy$).subscribe()
    }

    findUser(userId: string): User {
        return this.users.find(u => u.uid == userId)
    }

    filterPastEvents(events: Event[]) {
        let now = moment().format()
        let futureEvents = []
        events.forEach(element => {
            if (element.start > now) {
                futureEvents.push(element)
            }
        })
        return futureEvents
    }

    formatDateDisplay(start, end) {
        return moment(start).format('dddd, MMMM Do h:mm a') + ' to ' + moment(end).format('h:mm a')
    }
}