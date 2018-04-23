import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Location } from './location';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocationService {

    locations: AngularFireList<Location[]> = null;

    constructor(private db: AngularFireDatabase) {
        this.locations = this.db.list('locations') as AngularFireList<Location[]>;
    }

    getLocations() {
        this.locations = this.db.list('locations') as AngularFireList<Location[]>;
        return this.locations;
    }

    getLocationsSnapShot(): Observable<any> {
        return this.db.list('locations').snapshotChanges()
    }

    getLocationsValue(): Observable<any> {
        return this.db.list('locations').valueChanges()
    }

    getLocation(key) {
        return this.db.object('/locations/' + key);
    }

    addLocation(newLocation) {
        return this.locations.push(newLocation);
    }

    updateLocation(key, updateLocation) {
        return this.locations.update(key, updateLocation);
    }

    deleteLocation(key: string) {
        return this.locations.remove(key)
    }
}
