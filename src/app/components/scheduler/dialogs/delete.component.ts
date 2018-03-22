import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
    selector: 'event-delete-dialog',
    template: `<h1 mat-dialog-title>
                <span>Remove Event</span>
                </h1>
             <div mat-dialog-content>
               <p>Are you sure you want to remove event from the schedule?</p>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class EventDeleteDialog {

    constructor(
        public dialogRef: MatDialogRef<EventDeleteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }
}