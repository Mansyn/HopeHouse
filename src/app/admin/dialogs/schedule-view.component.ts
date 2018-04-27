import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material"

@Component({
    selector: 'view-schedule-dialog',
    templateUrl: './schedule-view.component.html'
})
export class ViewScheduleDialog {

    constructor(
        public dialogRef: MatDialogRef<ViewScheduleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        let i = data
    }
}