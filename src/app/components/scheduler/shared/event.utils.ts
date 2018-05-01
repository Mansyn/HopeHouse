import { CalendarEvent, CalendarEventAction } from 'angular-calendar'
import { Event } from './event'
import { UserProfile } from '../../../core/user'

import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment;

export default class EventUtils {

    static mapToCalendarEvent(event: Event, user: UserProfile): CalendarEvent {

        let calendarEvent = {
            id: event.$key,
            start: new Date(event.start),
            end: new Date(event.end),
            title: user.profile.name + ' - ' + this.getSlot(event.start),
            user: event.user,
            color: {
                primary: user.profile.color,
                secondary: user.profile.color
            }
        }

        return calendarEvent;
    }

    static mapFromCalendarEvent(calendarevent: CalendarEvent, schedule_key: string, userid: string): Event {

        let event = {
            $key: '',
            schedule_key: schedule_key,
            title: calendarevent.title,
            user: userid,
            start: moment(calendarevent.start).format(),
            end: moment(calendarevent.end).format(),
            primary: calendarevent.color.primary,
            secondary: calendarevent.color.secondary,
            timeStamp: moment().format()
        }

        return event;
    }

    static filterPastEvents(events: Event[]) {
        let now = moment().format()
        let futureEvents = []
        events.forEach(element => {
            if (element.start > now) {
                futureEvents.push(element)
            }
        })
        return futureEvents
    }

    static mapFromFormToEvent(form: any, schedule_key: string, user: UserProfile): Event {

        let slotMoment = moment(form.slot, 'HH:mm')
        let _moment = moment(form.date).hour(slotMoment.get('hour')).minute(slotMoment.get('minutes'))

        let event = {
            $key: '',
            schedule_key: schedule_key,
            user: form.user,
            start: _moment.format(),
            end: _moment.add(1, 'hours').format(),
            primary: user.profile.color,
            secondary: user.profile.color,
            timeStamp: moment().format()
        }

        return event;
    }

    static formSlots(day) {
        let slots = []
        switch (day.day()) {
            case 2:
                slots = [
                    { value: '12:00', viewValue: 'Lunch' },
                    { value: '16:00', viewValue: 'Dinner' }
                ]
                break
            case 1:
            case 3:
            case 4:
            case 5:
            case 6:
                slots = [
                    { value: '12:00', viewValue: 'Lunch' },
                    { value: '17:30', viewValue: 'Dinner' }
                ]
                break
            default:
                slots = []
                break
        }
        return slots
    }

    static getSlot(day) {
        let slot = ''
        switch (moment(day).format('HH:mm')) {
            case '12:00':
                slot = 'Lunch'
                break
            case '16:00':
            case '17:30':
                slot = 'Dinner'
                break
        }
        return slot
    }
}