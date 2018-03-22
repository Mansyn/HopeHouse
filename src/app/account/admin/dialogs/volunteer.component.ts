import { Inject, Component } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
    selector: 'volunteer-dialog',
    template: `<h1 mat-dialog-title>
                <span *ngIf="data.add">Add Volunteer</span>
                <span *ngIf="!data.add">Remove Volunteer</span>
                </h1>
             <div mat-dialog-content>
               <p *ngIf="data.add">Are you sure you want to set user(s) to volunteer?</p>
               <p *ngIf="!data.add">Are you sure you want to remove user(s) from volunteer?</p>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
               <button mat-button [mat-dialog-close]="false">Cancel</button>
             </div>`
})
export class VolunteerDialog {

    constructor(
        public dialogRef: MatDialogRef<VolunteerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }
}