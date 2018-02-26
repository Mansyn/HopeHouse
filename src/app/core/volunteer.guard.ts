import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { tap, map, take } from 'rxjs/operators';

@Injectable()
export class VolunteerGuard implements CanActivate {

  // determines if user is admin or editor
  constructor(private auth: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => user && (user.roles.admin ? true : false || user.roles.volunteer ? true : false)),
      tap(isAdmin => {
        if (!isAdmin) {
          console.error('Access denied - Volunteers only')
        }
      })
    );

  }
}
