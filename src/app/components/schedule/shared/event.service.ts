import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Event } from './event';
import 'rxjs/add/operator/map';

@Injectable()
export class EventService {

    events: AngularFireList<Event[]> = null;

    constructor(private db: AngularFireDatabase) {
        this.events = this.db.list('events') as AngularFireList<Event[]>;
    }

    getEvents() {
        this.events = this.db.list('events') as AngularFireList<Event[]>;
        return this.events;
    }

    getScheduleEvents(schedule_key: string) {
        let events = [
            { id: 1, start_date: "2018-03-07 00:00", end_date: "2018-03-07 13:00", text: "Event 1" },
            { id: 2, start_date: "2018-03-09 00:00", end_date: "2018-03-09 13:00", text: "Event 2" }
        ];
        return events;
    }

    getEvent(key) {
        return this.db.object('/events/' + key);
    }

    addEvent(newEvent) {
        return this.events.push(newEvent);
    }

    updateEvent(key, updateEvent) {
        return this.events.update(key, updateEvent);
    }

    deleteEvent(key: string) {
        return this.events.remove(key)
    }
}
