import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { AngularFireAuth } from 'angularfire2/auth'
import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment
import * as _ from 'lodash'

import { AuthService } from '../core/auth.service'
import { Event } from '../components/scheduler/shared/event'
import { EventService } from '../components/scheduler/shared/event.service'
import { Observable } from 'rxjs/Observable'
import { User } from '../core/user'
import { Schedule } from '../schedule/shared/schedule'
import { ScheduleService } from '../schedule/shared/schedule.service'

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [EventService]
})
export class AccountComponent {

  form: FormGroup
  email: string
  password: string
  working: boolean
  events: Event[] = []
  schedules: Schedule[] = []

  user: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    private eventService: EventService,
    private scheduleService: ScheduleService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar) {
    this.working = false
    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.email, Validators.required])],
      'password': ['', Validators.required]
    })
    afAuth.authState.subscribe(user => {
      console.log(user);
      if (user) {
        this.getUserEvents(user)
        this.fetchSchedules()
      }
    })
  }

  getUserEvents(user) {
    this.eventService.getUserEvents(user.uid)
      .snapshotChanges()
      .subscribe((data) => {
        data.forEach(element => {
          var x = element.payload.toJSON()
          x["$key"] = element.key
          this.events.push(x as Event)
        })
      }, )
  }

  fetchSchedules() {
    this.scheduleService.getSchedules()
      .snapshotChanges()
      .subscribe(data => {
        let schedules = []
        data.forEach(element => {
          var y = element.payload.toJSON()
          y['$key'] = element.key;
          let userEvents = this.events.filter(x => x.schedule_key == element.key)
          y['events'] = this.filterPastEvents(userEvents)
          if (y['events'].length > 0) {
            schedules.push(y as Schedule)
          }
        })
        this.schedules = schedules
      });
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

  findSchedule(key) {
    if (this.schedules.length)
      return ''

    return this.schedules.find(x => x.$key == key)
  }

  formatDateTime(mom) {
    return moment(mom).format('lll')
  }

  login() {
    if (this.form.valid) {
      this.working = true;
      this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
        .then((response) => {
          this.working = false
        })
        .catch(function (error) {
          // Handle Errors here.
          this.openSnackBar(error.message, 'OKAY')
          this.working = false
          console.log(error)
        });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
