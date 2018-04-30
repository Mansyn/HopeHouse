import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Event } from './event';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Schedule } from '../../../schedule/shared/schedule';

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

    getEventsSnapshot(): Observable<any> {
        return this.db.list('events').snapshotChanges()
    }

    getScheduleEvents(schedule_key: string) {
        this.events = this.db.list('events', ref => ref.orderByChild('schedule_key').equalTo(schedule_key)) as AngularFireList<Event[]>;
        return this.events;
    }

    getScheduleEventsSnapshot(schedule_key: string): Observable<any> {
        return this.db.list('events', ref => ref.orderByChild('schedule_key').equalTo(schedule_key)).snapshotChanges()
    }

    getScheduleEventsValue(schedule_key: string): Observable<any> {
        return this.db.list('events', ref => ref.orderByChild('schedule_key').equalTo(schedule_key)).valueChanges()
    }

    getUserEvents(uid: string) {
        this.events = this.db.list('events', ref => ref.orderByChild('user').equalTo(uid)) as AngularFireList<Event[]>;
        return this.events;
    }

    getUserEventsData(uid: string): Observable<any> {
        let userevents = this.db.list('events', ref => ref.orderByChild('user').equalTo(uid)).snapshotChanges()
        return userevents
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
