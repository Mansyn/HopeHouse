import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { AuthService } from '../../core/auth.service'
import { AngularFireAuth } from 'angularfire2/auth'
import { Router } from '@angular/router'

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  currentUid: string
  form: FormGroup
  working: boolean = false
  private unsubscribe = new Subject<void>()

  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService, private afAuth: AngularFireAuth) {
    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.email, Validators.required])],
      'password': ['', Validators.required]
    })
    this.auth.user$
      .takeUntil(this.unsubscribe)
      .subscribe(user => {
        if (user) {
          this.router.navigate(['/account'])
        }
      })
  }

  login() {
    if (this.form.valid) {
      this.working = true
      let form = this.form.value
      this.afAuth.auth.signInWithEmailAndPassword(form.email, form.password)
        .then((response) => {
          this.working = false
          this.router.navigate(['/account'])
        })
        .catch(function (error) {
          // Handle Errors here.
          this.openSnackBar(error.message, 'OKAY')
          this.working = false
          console.log(error)
        });
    }
  }

  public ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
