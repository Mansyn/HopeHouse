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
        this.events = this.db.list('events', ref => ref.orderByChild('schedule_key').equalTo(schedule_key)) as AngularFireList<Event[]>;
        return this.events;
    }

    getUserEvents(uid: string) {
        this.events = this.db.list('events', ref => ref.orderByChild('user').equalTo(uid)) as AngularFireList<Event[]>;
        return this.events;
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
