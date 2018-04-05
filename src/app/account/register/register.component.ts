import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: FormGroup
  working: boolean

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.working = false
    this.buildForm()
  }

  buildForm() {
    this.form = this.fb.group({
      'displayName': ['', Validators.compose([Validators.maxLength(30), Validators.required])],
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
    return `+${num}`
  }

  onRegister(form: FormGroup) {
    if (this.form.valid) {
      this.working = true
      let form = this.form.value
      let email = form.email
      let password = form.password
      let displayName = form.displayName
      let phone = this.e164()
      // this.afAuth.auth.createUserWithEmailAndPassword(form.value.email, form.value.password)
      //   .then((response) => {
      //     response.displayName = form.value.displayName
      //     this.auth.updateUser(response, true)
      //     this.router.navigate(['/account'])
      //   })
      //   .catch(function (error) {
      //     // Handle Errors here.
      //     var errorCode = error.code;
      //     var errorMessage = error.message;
      //     if (errorCode == 'auth/weak-password') {
      //       this.openSnackBar('Password is too weak.', 'OKAY');
      //     } else if (errorCode == 'auth/email-already-in-use') {
      //       this.openSnackBar('Email already in use', 'OKAY');
      //     }
      //     else {
      //       this.openSnackBar(errorMessage, 'OKAY');
      //     }
      //     this.working = false;
      //     console.log(error);
      //   });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
