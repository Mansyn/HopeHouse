import { Component, OnInit, OnDestroy } from '@angular/core'

import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import { combineLatest } from 'rxjs/observable/combineLatest'

import { ScheduleService } from '../schedule/shared/schedule.service'
import { LocationService } from '../schedule/shared/location.service'
import { Schedule } from '../schedule/shared/schedule'
import { Location } from '../schedule/shared/location'

@Component({
  selector: 'schedule',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit, OnDestroy {

  locations: Location[] = []
  schedules: Schedule[] = []
  loaded: boolean = false

  destroy$: Subject<boolean> = new Subject<boolean>()

  constructor(
    private scheduleService: ScheduleService,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    const schedules$ = this.scheduleService.getScheduleSnapShot()
    const locations$ = this.locationService.getLocationsSnapShot()

    combineLatest(
      schedules$, locations$,
      (schedulesData, locationsData) => {
        schedulesData.forEach(_schedule => {
          var schedule = _schedule.payload.toJSON()
          schedule["$key"] = _schedule.key
          this.schedules.push(schedule as Schedule)
        })
        locationsData.forEach(_location => {
          var location = _location.payload.toJSON()
          location["$key"] = _location.key
          this.locations.push(location as Location)
        })
        this.loaded = true
      }
    ).takeUntil(this.destroy$).subscribe()
  }

  locationName(key: string) {
    if (this.locations) {
      let location = this.locations.find(x => x.$key == key);
      return location ? location.name : '';
    } else {
      return '';
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true)
    this.destroy$.unsubscribe()
  }
}
