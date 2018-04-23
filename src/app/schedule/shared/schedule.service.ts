import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Schedule } from './schedule';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScheduleService {

    schedules: AngularFireList<Schedule[]> = null;

    constructor(private db: AngularFireDatabase) {
        this.schedules = this.db.list('schedules') as AngularFireList<Schedule[]>;
    }

    getSchedules() {
        this.schedules = this.db.list('schedules') as AngularFireList<Schedule[]>
        return this.schedules
    }

    getScheduleSnapShot(): Observable<any> {
        return this.db.list('schedules').snapshotChanges()
    }

    getScheduleValue(): Observable<any> {
        return this.db.list('schedules').valueChanges()
    }

    getSchedule(key) {
        return this.db.object('/schedules/' + key);
    }

    addSchedule(newSchedule) {
        return this.schedules.push(newSchedule);
    }

    updateSchedule(key, updateSchedule) {
        return this.schedules.update(key, updateSchedule);
    }

    deleteSchedule(key: string) {
        return this.schedules.remove(key)
    }
}
