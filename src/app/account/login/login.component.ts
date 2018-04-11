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
    afAuth.auth.onAuthStateChanged(function (user) {
      // onAuthStateChanged listener triggers every time the user ID token changes.  
      // This could happen when a new user signs in or signs out.  
      // It could also happen when the current user ID token expires and is refreshed.  
      if (user && user.uid != this.currentUid) {
        // Update the UI when a new user signs in.  
        // Otherwise ignore if this is a token refresh.  
        // Update the current user UID.  
        this.router.navigate(['/account'])
      } else {
        // Sign out operation. Reset the current user UID.  
        this.currentUid = null;
        console.log("no user signed in");
      }
    }

    // this.auth.user$
    //   .takeUntil(this.unsubscribe)
    //   .subscribe(user => {
    //     if (user) {
    //       this.router.navigate(['/account'])
    //     }
    //   })
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
