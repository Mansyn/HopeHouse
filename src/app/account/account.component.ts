import { Component, OnInit, Renderer } from '@angular/core'
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
export class AccountComponent implements OnInit {

  form: FormGroup
  working: boolean
  events: Event[] = []
  schedules: Schedule[] = []

  user: Observable<User>
  userRef: User
  settingsform: FormGroup
  nameEditing: boolean = false
  phoneEditing: boolean = false

  displayNameRef: string
  phoneNumberRef: string

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public renderer: Renderer,
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
  }

  ngOnInit(): void {
    this.getUserEvents()
  }

  toggleName(showInput) {
    this.nameEditing = !this.nameEditing
    if (!this.nameEditing) {
      if (this.userRef.displayName.length) {
        this.auth.updateUserProfile(this.userRef)
      } else {
        this.userRef.displayName = this.displayNameRef
      }
    }
  }

  togglePhone(showInput) {
    this.phoneEditing = !this.phoneEditing
    if (!this.phoneEditing) {
      if (this.userRef.phoneNumber.length == 10) {
        this.auth.updateUserProfile(this.userRef)
      } else {
        this.userRef.phoneNumber = this.phoneNumberRef
      }
    }
  }

  getUserEvents() {
    this.auth.user$.subscribe(user => {
      this.userRef = user
      if (user) {
        this.displayNameRef = user.displayName || ''
        this.phoneNumberRef = user.phoneNumber || ''
        let isVolunteer = this.auth.canEdit(user)
        if (isVolunteer) {
          this.eventService.getUserEvents(user.uid)
            .snapshotChanges()
            .subscribe((data) => {
              this.events = []
              data.forEach(element => {
                var x = element.payload.toJSON()
                x["$key"] = element.key
                this.events.push(x as Event)
                this.scheduleService.getSchedules()
                  .snapshotChanges()
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
        this.settingsform = this.fb.group({
          'displayName': [this.userRef.displayName, Validators.compose([Validators.maxLength(30), Validators.required])],
          'phoneNumber': [this.userRef.phoneNumber, Validators.compose([Validators.maxLength(10), Validators.required])]
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

  login() {
    if (this.form.valid) {
      this.working = true
      let form = this.form.value
      this.afAuth.auth.signInWithEmailAndPassword(form.email, form.password)
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

  signout() {
    this.auth.signOut()
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
