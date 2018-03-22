import { Component } from '@angular/core'
import { MatIconModule } from '@angular/material';
import { AuthService } from '../../core/auth.service';
import * as _ from 'lodash';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

    userRoles: Array<string>;

    constructor(public auth: AuthService) {
        auth.user$.map(user => {
            return this.userRoles = _.keys(_.get(user, 'roles'))
        })
            .subscribe()
    }

    get isVolunteer(): boolean {
        const allowed = ['volunteer', 'admin']
        return this.matchingRole(allowed)
    }

    canAccessSchedule() {
        return this.isVolunteer;
    }

    /// Helper to determine if any matching roles exist
    private matchingRole(allowedRoles): boolean {
        return !_.isEmpty(_.intersection(allowedRoles, this.userRoles))
    }

}