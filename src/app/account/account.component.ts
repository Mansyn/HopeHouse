import { Component, Renderer, OnInit, OnDestroy } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { AngularFireAuth } from 'angularfire2/auth'
import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment

import { AuthService } from '../core/auth.service'
import { Event } from '../components/scheduler/shared/event'
import { EventService } from '../components/scheduler/shared/event.service'
import { Observable } from 'rxjs/Observable'
import { User, Profile } from '../core/user'
import { Schedule } from '../schedule/shared/schedule'
import { ScheduleService } from '../schedule/shared/schedule.service'
import { ProfileService } from '../core/profile.service'

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [EventService]
})
export class AccountComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>()

  events: Event[] = []
  schedules: Schedule[] = []

  user: Observable<User>
  nameEditing: boolean = false
  phoneEditing: boolean = false

  userRef: User
  profileRef: Profile
  nameRef: string = ''
  phoneNumberRef: string = ''

  constructor(
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private router: Router,
    public renderer: Renderer,
    public auth: AuthService,
    private profileService: ProfileService,
    private eventService: EventService,
    private scheduleService: ScheduleService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.auth.user$
      .takeUntil(this.destroy$)
      .subscribe(user => {
        if (user && user.uid) {
          this.getUserData(user)
        } else {
          this.router.navigate(['/account/login'])
        }
      })
  }

  getUserData(user) {
    const userProfile$ = this.profileService.getUserProfile(user.uid)
    const schedules$ = this.scheduleService.getScheduleSnapShot()
    const userEvents$ = this.eventService.getUserEventsData(user.uid)

    combineLatest(
      userProfile$, schedules$, userEvents$,
      (profileData, scheduleData, eventsData) => {
        // profile
        let _profile = profileData[0].payload.toJSON()
        _profile["$key"] = profileData[0].key
        this.profileRef = _profile as Profile
        this.nameRef = this.profileRef.name
        this.phoneNumberRef = this.profileRef.phoneNumber

        // events
        this.events = []
        this.schedules = []
        let _schedules = []
        eventsData.forEach(_event => {
          var event = _event.payload.toJSON()
          event["$key"] = _event.key
          this.events.push(event as Event)
        })
        scheduleData.forEach(_schedule => {
          let schedule = _schedule.payload.toJSON()
          schedule['$key'] = _schedule.key
          let userEvents = this.events.filter(x => x.schedule_key == _schedule.key)
          schedule['events'] = this.filterPastEvents(userEvents)
          if (schedule['events'].length > 0) {
            _schedules.push(schedule as Schedule)
          }
        })
        this.schedules = _schedules
      }
    ).takeUntil(this.destroy$).subscribe()
  }

  toggleName(showInput) {
    this.nameEditing = !this.nameEditing
    if (!this.nameEditing) {
      if (this.profileRef.name.length) {
        this.updateProfile()
      } else {
        this.profileRef.name = this.nameRef
      }
    }
  }

  togglePhone(showInput) {
    this.phoneEditing = !this.phoneEditing
    if (!this.phoneEditing) {
      if (this.profileRef.phoneNumber.length == 10) {
        this.updateProfile()
      } else {
        this.profileRef.phoneNumber = this.phoneNumberRef
      }
    }
  }

  private updateProfile() {
    let targetProfile = Object.assign({}, this.profileRef)
    delete targetProfile['$key']
    this.profileService.updateProfile(this.profileRef['$key'], targetProfile)
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

  formatDateDisplay(start, end) {
    return moment(start).format('dddd - MMMM Do h:mm A') + ' to ' + moment(end).format('h:mm A')
  }

  signout() {
    let that = this
    this.afAuth.auth.signOut().then(function () {
      that.router.navigate(['/home'])
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true)
    this.destroy$.unsubscribe()
  }
}
