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

@Component({
    selector: 'event-dialog',
    templateUrl: 'event.component.html',
})
export class EventDialog {

    today = new Date();

    minStartDate;
    maxStartDate;
    minEndDate;
    maxEndDate;

    create: boolean
    form: FormGroup

    constructor(public auth: AuthService,
        public dialogRef: MatDialogRef<EventDialog>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.create = data.event.$key == null;
        if (!data.event.color) {
            data.event.color = {
                'primary': colors.red.primary,
                'secondary': colors.red.secondary
            }
        }
        this.form = this.fb.group({
            'title': [data.event.title || null, Validators.compose([Validators.maxLength(25), Validators.required])],
            'user': [data.event.user || null, Validators.required],
            'start': [data.event.start || null, Validators.required],
            'end': [data.event.end || null, Validators.required],
            'primary': [data.event.color.primary, Validators.required],
            'secondary': [data.event.color.secondary, Validators.required]
        })
    }

    refresh: Subject<any> = new Subject();

    changeStart(type: string, event: MatDatepickerInputEvent<Date>) {
        this.minEndDate = event.value;
    }

    changeEnd(type: string, event: MatDatepickerInputEvent<Date>) {
        this.maxStartDate = event.value;
    }

    saveEvent() {
        if (this.form.valid) {
            let now = new Date().toDateString();

            let event = {
                schedule_key: this.data.event.schedule_key,
                title: this.data.event.title,
                user: this.data.event.user,
                start: moment(this.data.event.start).format(),
                end: moment(this.data.event.end).format(),
                primary: this.data.event.color.primary,
                secondary: this.data.event.color.secondary,
                timeStamp: now
            }

            if (!this.create) {
                event["id"] = this.data.event.id;
            }

            this.dialogRef.close(event);
        }
    }
}