import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScheduleService } from '../schedule/shared/schedule.service';
import { Schedule } from '../schedule/shared/schedule';
import { LocationService } from '../schedule/shared/location.service';

@Component({
  selector: 'schedule',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements AfterViewInit {

  locations: any;
  schedules: Schedule[];

  constructor(private scheduleService: ScheduleService, private locationService: LocationService) { }

  ngAfterViewInit() {
    this.scheduleService.getSchedules()
      .snapshotChanges()
      .subscribe(data => {
        let schedules = [];
        data.forEach(element => {
          var y = element.payload.toJSON();
          y["$key"] = element.key;
          schedules.push(y as Schedule);
        });

        this.schedules = schedules;
      });
    this.fetchLocations();
  }

  locationName(key: string) {
    if (this.locations) {
      let location = this.locations.find(x => x.$key == key);
      return location ? location.name : '';
    } else {
      return '';
    }
  }


  fetchLocations() {
    this.locationService.getLocations().snapshotChanges()
      .subscribe(data => {
        let locations = [];
        data.forEach(element => {
          var y = element.payload.toJSON();
          y["$key"] = element.key;
          locations.push(y as Location);
        });

        this.locations = locations;
      });
  }

}
