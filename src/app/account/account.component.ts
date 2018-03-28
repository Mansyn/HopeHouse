import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

import { AuthService } from '../core/auth.service';
import { Event } from '../components/scheduler/shared/event';
import { EventService } from '../components/scheduler/shared/event.service';
import { Observable } from 'rxjs/Observable';
import { User } from '../core/user';

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
  events: Event[]

  user: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    private eventService: EventService,
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
        this.getUserEvents(user);
      }
    })
  }

  getUserEvents(user) {
    this.eventService.getUserEvents(user.uid)
      .snapshotChanges()
      .subscribe(data => {
        this.events = [];
        let events = [];
        data.forEach(element => {
          var x = element.payload.toJSON();
          x["$key"] = element.key;
          this.events.push(x as Event);
        });
      });
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
