import { Component, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Subject } from "rxjs/Subject";

@Component({
    selector: 'schedule-dialog',
    templateUrl: './schedule.component.html'
})
export class ScheduleDialog {

    create: boolean
    form: FormGroup

    constructor(public dialogRef: MatDialogRef<ScheduleDialog>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.create = data.schedule.$key == null;
        this.form = this.fb.group({
            'location': [data.schedule.location || null, Validators.required],
            'title': [data.schedule.title || null, Validators.compose([Validators.maxLength(25), Validators.required])],
            'color': [data.schedule.color || null, Validators.required],
            'description': [data.schedule.description || null, Validators.required],
            //'image': [data.schedule.image || null, Validators.required]
        })
    }

    refresh: Subject<any> = new Subject();

    onSubmit() {
        if (this.form.valid) {
            let form = this.form.value
            let now = new Date().toDateString();

            let schedule = {
                location: form.location,
                title: form.title,
                color: form.color,
                description: form.description,
                // image: form.image,
                timeStamp: now,
                active: true
            }

            this.dialogRef.close(schedule);
        }
    }
}