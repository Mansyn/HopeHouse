import { Component, Renderer } from '@angular/core'
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
import { User, Profile } from '../core/user'
import { Schedule } from '../schedule/shared/schedule'
import { ScheduleService } from '../schedule/shared/schedule.service'
import { ProfileService } from '../core/profile.service'

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [EventService]
})
export class AccountComponent {

  private unsubscribe = new Subject<void>()

  events: Event[] = []
  schedules: Schedule[] = []

  user: Observable<User>
  nameEditing: boolean = false
  phoneEditing: boolean = false

  userRef: User
  profileRef: Profile
  nameRef: string = ''
  phoneNumberRef: string = ''

  constructor(private fb: FormBuilder,
    private router: Router,
    public renderer: Renderer,
    public auth: AuthService,
    private profileService: ProfileService,
    private eventService: EventService,
    private scheduleService: ScheduleService,
    public snackBar: MatSnackBar) {
    this.auth.user$
      .takeUntil(this.unsubscribe)
      .subscribe(user => {
        if (user) {
          this.getUser()
        }
      })
  }

  toggleName(showInput) {
    this.nameEditing = !this.nameEditing
    if (!this.nameEditing) {
      if (this.profileRef.name.length) {
        this.profileService.updateProfile(this.profileRef.uid, this.profileRef)
      } else {
        this.profileRef.name = this.nameRef
      }
    }
  }

  togglePhone(showInput) {
    this.phoneEditing = !this.phoneEditing
    if (!this.phoneEditing) {
      if (this.profileRef.phoneNumber.length == 10) {
        this.profileService.updateProfile(this.profileRef.uid, this.profileRef)
      } else {
        this.profileRef.phoneNumber = this.phoneNumberRef
      }
    }
  }

  getUser() {
    this.auth.user$
      .takeUntil(this.unsubscribe)
      .subscribe(user => {
        this.userRef = user
        this.profileService.getUserProfile(user.uid)
          .snapshotChanges()
          .takeUntil(this.unsubscribe)
          .subscribe(profile => {
            var p = profile[0].payload.toJSON()
            p['uid'] = profile[0].key
            this.profileRef = p as Profile
            this.nameRef = this.profileRef.name
            this.phoneNumberRef = this.profileRef.phoneNumber
          })
        let isVolunteer = this.auth.canEdit(user)
        if (isVolunteer) {
          this.eventService.getUserEvents(user.uid)
            .snapshotChanges()
            .takeUntil(this.unsubscribe)
            .subscribe((data) => {
              this.events = []
              data.forEach(element => {
                var x = element.payload.toJSON()
                x["$key"] = element.key
                this.events.push(x as Event)
                this.scheduleService.getSchedules()
                  .snapshotChanges()
                  .takeUntil(this.unsubscribe)
                  .subscribe(data => {
                    this.schedules = []
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
                  })
              })
            })
        }
      })
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

  signout() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.auth.signOut()
    this.router.navigate(['/account/login'])
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  public ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
