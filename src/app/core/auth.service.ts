import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { User } from './user';

@Injectable()
export class AuthService {

  user$: Observable<User>;

  // only for admin use
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router) {
    //// Get auth data, then get firestore user document || null
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

  updateUserProfile(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    let targetUser: User = user
    targetUser.displayName = user.displayName
    targetUser.phoneNumber = user.phoneNumber

    return userRef.set(targetUser, { merge: true })
  }

  registerUser(response, isVolunteer, displayName, phoneNumber) {
    const user: User = {
      uid: response.uid,
      displayName: displayName,
      email: response.email,
      phoneNumber: phoneNumber,
      photoURL: response.photoURL,
      roles: {}
    }
    this.updateUserData(user, isVolunteer);
  }

  googleRegister() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.oAuthRegister(provider);
  }

  facebookRegister() {
    var provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthRegister(provider);
  }

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    var provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthRegister(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user, true)
      })
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user, true)
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

  // private loadUserData(user) {
  //   // Sets user data to firestore on login
  //   const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
  //   const data: User = {
  //     uid: user.uid,
  //     displayName: user.displayName,
  //     email: user.email,
  //     phoneNumber: user.phoneNumber,
  //     photoURL: user.photoURL,
  //     roles: {
  //       subscriber: true,
  //       volunteer: volunteer
  //     }
  //   }
  //   return userRef.set(data, { merge: true })
  // }

  ///// Role-based Authorization //////

  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber']
    return this.checkAuthorization(user, allowed)
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor']
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
    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();
    return this.users;
  }

  getAllVolunteers() {
    this.usersCollection = this.afs.collection('users', ref => ref.where('roles.volunteer', '==', true));
    this.users = this.usersCollection.valueChanges();
    return this.users;
  }
}
