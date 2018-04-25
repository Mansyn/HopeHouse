import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { Subject } from "rxjs/Subject";

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

import { colors } from "../shared/colors";
import { AuthService } from "../../../core/auth.service";
import { User } from "../../../core/user";
import EventUtils from "../shared/event.utils";

@Component({
    selector: 'event-dialog',
    templateUrl: 'event.component.html',
    styleUrls: ['./event.component.scss']
})
export class EventDialog {

    refresh: Subject<any> = new Subject()
    today = moment()

    slots = []

    create: boolean
    form: FormGroup

    filterSunday = (d: Date): boolean => {
        const day = moment(d).day()
        // Prevent Sunday from being selected.
        return day !== 0
    }

    constructor(public auth: AuthService,
        public dialogRef: MatDialogRef<EventDialog>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.buildForm(data)
    }

    buildForm(data: any) {
        this.create = data.event.$key == null
        if (!data.event.color) {
            data.event.color = {
                'primary': colors.red.primary,
                'secondary': colors.red.secondary
            }
        }
        let eventDay = moment(data.event.start)
        this.slots = EventUtils.formSlots(eventDay)
        this.form = this.fb.group({
            'user': [data.event.user || null, Validators.required],
            'date': [data.event.start || null, Validators.required],
            'slot': [eventDay.format('hh:mm') || null, Validators.required],
            'primary': [data.event.color.primary, Validators.required],
            'secondary': [data.event.color.secondary, Validators.required]
        })
    }



    saveEvent() {
        if (this.form.valid) {
            let form = this.form.value
            let event = EventUtils.mapFromFormToEvent(form, this.data.scheduleKey)

            if (!this.create) {
                event["id"] = this.data.event.id
            }

            this.dialogRef.close(event)
        }
    }
}