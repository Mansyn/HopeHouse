import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ScheduleService } from './shared/schedule.service';
import { EventService } from "./shared/event.service";
import { Event } from "./shared/event";
import { Schedule } from "./shared/schedule";

import "dhtmlx-scheduler";
import { } from "@types/dhtmlxscheduler";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'scheduler',
    styleUrls: ['scheduler.component.scss'],
    templateUrl: 'scheduler.component.html',
    providers: [EventService]
})

export class SchedulerComponent implements OnInit {
    @ViewChild("scheduler_here") schedulerContainer: ElementRef;

    lunchSchedule: Schedule;

    constructor(private scheduleService: ScheduleService, private eventService: EventService) { }

    ngOnInit() {
        this.scheduleService.getSchedule('-L6YBHfPcs5DMTbzyTxo')
            .snapshotChanges()
            .subscribe(data => {
                var x = data.payload.toJSON();
                x["$key"] = data.key;
                this.lunchSchedule = x as Schedule;
            });

        scheduler.config.xml_date = "%Y-%m-%d %H:%i";

        scheduler.init(this.schedulerContainer.nativeElement, new Date());

        scheduler.attachEvent("onEventAdded", (id, ev) => {
            this.eventService.addEvent(this.serializeEvent(ev, true))
                .then((response) => {
                    if (response.key != id) {
                        scheduler.changeEventId(id, response.key);
                    }
                })
        });

        scheduler.attachEvent("onEventChanged", (id, ev) => {
            this.eventService.updateEvent(this.lunchSchedule.$key, this.serializeEvent(ev));
        });

        scheduler.attachEvent("onEventDeleted", (id) => {
            this.eventService.deleteEvent(id);
        });

        scheduler.parse(this.eventService.getScheduleEvents('-L6YBHfPcs5DMTbzyTxo'), "json");

    }

    private serializeEvent(data: any, insert: boolean = false): Event {
        var result = {};

        for (let i in data) {
            if (i.charAt(0) == "$" || i.charAt(0) == "_") continue;
            if (insert && i == "id") continue;
            if (data[i] instanceof Date) {
                result[i] = scheduler.templates.xml_format(data[i]);
            } else {
                result[i] = data[i];
            }
        }
        return result as Event;
    }
}