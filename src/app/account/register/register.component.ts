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
export class RegisterComponent {

  form: FormGroup
  email: string
  password: string
  working: boolean

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    public auth: AuthService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar) {
    this.working = false;
    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.email, Validators.required])],
      'password': ['', Validators.required]
    })
  }

  register() {
    if (this.form.valid) {
      let _this = this;
      this.working = true;
      this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password)
        .then((response) => {
          _this.auth.updateUser(response)
          _this.router.navigate(['/account'])
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
            _this.openSnackBar('Password is too weak.', 'OKAY');
          } else if (errorCode == 'auth/email-already-in-use') {
            _this.openSnackBar('Email already in use', 'OKAY');
          }
          else {
            _this.openSnackBar(errorMessage, 'OKAY');
          }
          _this.working = false;
          console.log(error);
        });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
