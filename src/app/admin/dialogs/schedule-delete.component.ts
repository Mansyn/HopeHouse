import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: 'schedule-delete-dialog',
  template: `<h1 mat-dialog-title>
              <span>Remove Schedule</span>
              </h1>
           <div mat-dialog-content>
             <p>Are you sure you want to remove {{data.count}} {{data.count > 1 ? 'articles' : 'article'}}?</p>
           </div>
           <div mat-dialog-actions align="end">
             <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
             <button mat-button [mat-dialog-close]="false">Cancel</button>
           </div>`
})
export class ScheduleDeleteDialog {
  constructor(public dialogRef: MatDialogRef<ScheduleDeleteDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }
}