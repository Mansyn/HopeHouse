import { NgModule, Component, ViewEncapsulation, enableProdMode } from '@angular/core';
import { Service } from './schedule.service';
import { Schedule } from './shared/schedule';
import { Event } from './shared/event';

import DataSource from 'devextreme/data/data_source';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'schedule',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './schedule.component.html',
  styleUrls: [
    './schedule.component.scss',
    '../../../node_modules/devextreme/dist/css/dx.spa.css',
    '../../../node_modules/devextreme/dist/css/dx.common.css',
    '../../../node_modules/devextreme/dist/css/dx.light.css'],
  providers: [Service]
})
export class ScheduleComponent {
  dataSource: any;
  currentDate: Date = new Date(2016, 7, 2, 11, 30);
  resourcesDataSource: Schedule[];

  constructor(service: Service) {
    this.dataSource = new DataSource({
      store: service.getData()
    });

    this.resourcesDataSource = service.getEmployees();
  }

  static getCurrentTraining(index, employeeID) {
    var currentTraining,
      result = (index + employeeID) % 3;

    switch (result) {
      case 0:
        currentTraining = 'abs-background';
        break;
      case 1:
        currentTraining = 'step-background';
        break;
      case 2:
        currentTraining = 'fitball-background';
        break;
      default:
        currentTraining = '';
    }

    return currentTraining;
  }

  static isWeekEnd(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  }

  dataCellTemplate(cellData, index, container) {
    var employeeID = cellData.groups.employeeID,
      dataCellElement = container,
      currentTraining = ScheduleComponent.getCurrentTraining(index, employeeID);

    if (ScheduleComponent.isWeekEnd(cellData.startDate)) {
      dataCellElement.classList.add("employee-weekend-" + employeeID);
    }

    var element = document.createElement("div");

    element.classList.add("day-cell", currentTraining, "employee-" + employeeID);
    element.textContent = cellData.text;

    return element;
  }
}