import { CalendarEventAction } from 'angular-calendar'
import { Event, RecurringCalendarEvent } from './event'
import { UserProfile } from '../../../core/user'

import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment;
import RRule from 'rrule'

export default class EventUtils {

    static mapToCalendarEvent(event: Event, user: UserProfile): RecurringCalendarEvent {

        let byweekday = []
        if (event.by_weekday) {
            let tempWeekDay = event.by_weekday.split(",");

            for (let day in tempWeekDay) {
                byweekday.push(parseInt(tempWeekDay[day], 10))
            }
        }

        let calendarEvent = {
            id: event.$key,
            start: new Date(event.start),
            end: new Date(event.end),
            title: user.profile.name + ' &ndash; ' + event.type + ' ' + this.getSlot(event.start),
            user: event.user,
            color: {
                primary: user.profile.color,
                secondary: user.profile.color
            },
            rrule: {
                freq: event.frequency,
                bymonth: event.by_month,
                bymonthday: event.by_monthday,
                byweekday: event.by_weekday ? byweekday : null
            },
            meta: {
                schedule_key: event.schedule_key,
                type: event.type ? event.type : 'Serving'
            }
        }

        return calendarEvent;
    }

    static mapFromCalendarEvent(calendarevent: RecurringCalendarEvent, schedule_key: string, userid: string): Event {

        let event = {
            $key: '',
            schedule_key: schedule_key,
            title: calendarevent.title,
            user: userid,
            start: moment(calendarevent.start).format(),
            end: moment(calendarevent.end).format(),
            type: calendarevent.meta.type,
            primary: calendarevent.color.primary,
            secondary: calendarevent.color.secondary,
            frequency: calendarevent.rrule.freq,
            by_month: calendarevent.rrule.bymonth,
            by_monthday: calendarevent.rrule.bymonthday,
            by_weekday: calendarevent.rrule.byweekday.join(','),
            timeStamp: moment().format()
        }

        return event;
    }

    static filterPastCalendarEvents(events: RecurringCalendarEvent[]) {
        let now = new Date()
        let futureEvents = []
        events.sort((a, b) => {
            if (a.start < b.start) return -1;
            else if (a.start > b.start) return 1;
            else return 0;
        }).forEach(element => {
            if (element.start > now) {
                futureEvents.push(element)
            }
        })
        return futureEvents
    }

    static filterPastEvents(events: Event[]) {
        let now = moment().format()
        let futureEvents = []
        events.sort((a, b) => {
            if (a.start < b.start) return -1;
            else if (a.start > b.start) return 1;
            else return 0;
        }).forEach(element => {
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
            frequency: form.frequency,
            by_month: form.bymonth,
            by_monthday: form.bymonthday,
            by_weekday: form.byweekday.join(','),
            type: form.type,
            timeStamp: moment().format()
        }

        return event;
    }

    static formSlots(day) {
        let slots = []
        switch (day.day()) {
            case 3:
                slots = [
                    { value: '12:00', viewValue: 'Lunch' },
                    { value: '16:00', viewValue: 'Dinner' }
                ]
                break
            case 1:
            case 2:
            case 4:
            case 5:
            case 6:
                slots = [
                    { value: '12:00', viewValue: 'Lunch' },
                    { value: '17:00', viewValue: 'Dinner' }
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
            case '17:00':
                slot = 'Dinner'
                break
        }
        return slot
    }

    static getRuleValues() {
        return [{ name: 'DAILY', value: 3 }, { name: 'WEEKLY', value: 2 }, { name: 'MONTHLY', value: 1 }, { name: 'YEARLY', value: 0 }]
    }
}