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
        var rootRef = this.db.database.ref();
        var eventsRef = rootRef.child('events');
        var scheduleEvents = eventsRef.equalTo('schedule_key', schedule_key);

        return scheduleEvents;
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
