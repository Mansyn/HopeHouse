import { Component, Inject } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material"
import { Subject } from "rxjs/Subject"

import * as _moment from 'moment'
import { default as _rollupMoment } from 'moment'
const moment = _rollupMoment || _moment

import { colors } from "../shared/colors"
import { AuthService } from "../../../core/auth.service"
import { User } from "../../../core/user"
import EventUtils from "../shared/event.utils"
import { EventType } from "../shared/event"

@Component({
    selector: 'event-dialog',
    templateUrl: 'event.component.html',
    styleUrls: ['./event.component.scss']
})
export class EventDialog {

    refresh: Subject<any> = new Subject()
    today = new Date()

    slots = []

    create: boolean
    form: FormGroup
    typeValues = ['Serving', 'Supplying']
    typeValue: string
    slotValue: any

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
        this.slots = EventUtils.formSlots(data.event.start ? moment(data.event.start) : moment())
        this.slotValue = data.event.start ? moment(data.event.start).format('HH:mm') : null
        this.typeValue = data.event.meta.type ? data.event.meta.type : this.typeValues[0]
        this.form = this.fb.group({
            'user': [data.event.user || null, Validators.required],
            'type': [this.typeValue, Validators.required],
            'date': [data.event.start || null, Validators.required],
            'slot': [this.slotValue, Validators.required]
        })
    }

    inputDate(event: MatDatepickerInputEvent<Date>) {
        this.slots = EventUtils.formSlots(moment(event.value))
        this.slotValue = null
    }

    saveEvent() {
        if (this.form.valid) {
            let form = this.form.value
            let event = EventUtils.mapFromFormToEvent(form, this.data.scheduleKey, this.data.volunteers.find(p => p.uid == form.user))

            if (!this.create) {
                event["id"] = this.data.event.id
            }

            this.dialogRef.close(event)
        }
    }
}