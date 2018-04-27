import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { Subject } from 'rxjs/Subject';
import { colors } from '../../components/scheduler/shared/colors';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  form: FormGroup
  working: boolean = false
  password: string
  regError: string
  destroy$: Subject<boolean> = new Subject<boolean>()

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.auth.user$
      .takeUntil(this.destroy$)
      .subscribe(user => {
        if (user) {
          this.router.navigate(['/account'])
        }
      })
    this.buildForm()
  }

  buildForm() {
    this.form = this.fb.group({
      'name': ['', Validators.compose([Validators.maxLength(30), Validators.required])],
      'email': ['', Validators.compose([Validators.email, Validators.required])],
      'password': ['', Validators.required],
      'area': this.validateMinMax(3, 3),
      'prefix': this.validateMinMax(3, 3),
      'line': this.validateMinMax(4, 4)
    })
  }

  validateMinMax(min, max) {
    return ['', [
      Validators.required,
      Validators.minLength(min),
      Validators.maxLength(max),
      Validators.pattern('[0-9]+')
    ]]
  }

  e164() {
    let form = this.form.value
    let num = form.area + form.prefix + form.line
    return `${num}`
  }

  onRegister(form: FormGroup) {
    if (this.form.valid) {
      this.working = true
      let self = this
      let form = this.form.value
      this.afAuth.auth.createUserWithEmailAndPassword(form.email, form.password)
        .then((user) => {
          self.auth.registerUser(user, form.name, this.e164())
          let profile = {
            user_uid: user.uid,
            name: form.name,
            phoneNumber: self.e164(),
            color: colors.red.secondary
          }
          this.profileService.addProfile(profile)
            .then(response => {
              self.working = false
              self.router.navigate(['/account'])
            })
        })
        .catch(function (error) {
          // Registration Errors
          self.password = ''
          var errorCode = error.code
          var errorMessage = error.message
          if (errorCode == 'auth/weak-password') {
            self.openSnackBar('Password is too weak.', 'OKAY')
            self.regError = 'Password is too weak'
          } else if (errorCode == 'auth/email-already-in-use') {
            self.openSnackBar('Email already in use', 'OKAY')
          }
          else {
            self.openSnackBar(errorMessage, 'OKAY')
          }
          self.working = false
          console.log(error)
        });
    }
  }

  googleRegister() {
    this.auth.googleLogin()
  }

  facebookRegister() {
    this.auth.facebookLogin()
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
