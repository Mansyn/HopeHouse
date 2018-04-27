import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { User, Profile } from './user';
import { ProfileService } from './profile.service';
import 'rxjs/add/operator/take'
import { colors } from '../components/scheduler/shared/colors';

@Injectable()
export class AuthService {

  user$: Observable<User>;

  // only for admin use
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.user$ = this.afAuth.authState
      .switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return Observable.of(null)
        }
      })
  }

  updateUser(response, isVolunteer) {
    const user: User = {
      uid: response.uid,
      displayName: response.displayName,
      email: response.email,
      phoneNumber: response.phoneNumber,
      photoURL: response.photoURL,
      roles: {}
    }
    this.updateUserData(user, isVolunteer);
  }

  registerUser(response, name, phoneNumber) {
    const user: User = {
      uid: response.uid,
      displayName: name,
      email: response.email,
      phoneNumber: phoneNumber,
      photoURL: response.photoURL,
      roles: {}
    }
    this.updateUserData(user, true);
  }

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    var provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user, true)
        this.updateOauthUserProfile(credential.user)
      })
  }

  private updateOauthUserProfile(user) {
    let profile = {
      user_uid: user.uid,
      name: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      color: colors.red.secondary
    }
    this.profileService.getUserProfile(user.uid)
      .subscribe(response => {
        if (response.length == 0) {
          this.profileService.addProfile(profile)
        } else {
          let _profile = response[0].payload.toJSON()
          let targetProfile = _profile as Profile

          targetProfile.name = targetProfile.name ? targetProfile.name : (user.displayName || '')
          targetProfile.phoneNumber = targetProfile.phoneNumber ? targetProfile.phoneNumber : (user.phoneNumber || '')

          this.profileService.updateProfile(response[0].key, targetProfile)
        }
      })
  }

  signOut() {
    this.afAuth.auth.signOut()
  }

  private updateUserData(user, volunteer) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      roles: {
        subscriber: true,
        volunteer: volunteer
      }
    }
    return userRef.set(data, { merge: true })
  }

  ///// Role-based Authorization //////

  canRead(user: User): boolean {
    const allowed = ['admin', 'volunteer', 'subscriber']
    return this.checkAuthorization(user, allowed)
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'volunteer']
    return this.checkAuthorization(user, allowed)
  }

  isAdmin(user: User): boolean {
    const allowed = ['admin']
    return this.checkAuthorization(user, allowed)
  }

  canDelete(user: User): boolean {
    const allowed = ['admin']
    return this.checkAuthorization(user, allowed)
  }

  // determines if user has matching role
  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) return false
    for (const role of allowedRoles) {
      if (user.roles[role]) {
        return true
      }
    }
    return false
  }

  getAllUsers() {
    this.usersCollection = this.afs.collection<User>('users')
    this.users = this.usersCollection.valueChanges()
    return this.users;
  }

  getAllVolunteers() {
    this.usersCollection = this.afs.collection('users', ref => ref.where('roles.volunteer', '==', true));
    this.users = this.usersCollection.valueChanges();
    return this.users;
  }
}
