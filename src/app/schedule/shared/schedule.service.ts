import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Schedule } from './schedule';
import 'rxjs/add/operator/map';

@Injectable()
export class SchedulesService {

    schedules: AngularFireList<Schedule[]> = null;

    constructor(private db: AngularFireDatabase) {
        this.schedules = this.db.list('schedules') as AngularFireList<Schedule[]>;
    }

    getSchedules() {
        this.schedules = this.db.list('schedules') as AngularFireList<Schedule[]>;
        return this.schedules;
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
