import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import _ from 'lodash';

import { AuthService } from '../../core/auth.service';
import { User } from '../../core/user';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements AfterViewInit {

    @ViewChild(MatSort) user_sort: MatSort;
    @ViewChild(MatPaginator) user_paginator: MatPaginator;

    displayedColumns = ['select', 'displayName', 'email', 'roles'];
    user_dataSource = new MatTableDataSource<User>();
    user_selection = new SelectionModel<User>(true, []);

    constructor(public auth: AuthService, public dialog: MatDialog, public snackBar: MatSnackBar) { }

    ngAfterViewInit() {
        this.auth.getAllUsers().subscribe(data => {
            this.user_dataSource.data = data;
            console.log(this.user_dataSource.data);
        });
        this.user_dataSource.paginator = this.user_paginator;
        this.user_dataSource.sort = this.user_sort;
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.user_selection.selected.length;
        const numRows = this.user_dataSource.data.length;
        return numSelected == numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear user_selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.user_selection.clear() :
            this.user_dataSource.data.forEach(row => this.user_selection.select(row));
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.user_dataSource.filter = filterValue;
    }

    volunteerDialog(add: boolean): void {
        let targets = this.user_selection.selected;

        let dialogRef = this.dialog.open(VolunteerDialog, {
            width: '350px',
            data: { add: add }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                targets.forEach((target) => {
                    this.auth.setUserVolunteer(target, add);
                });
                this.openSnackBar(add ? 'Volunteer Set' : 'Volunteer Removed', 'OKAY');
                this.user_selection.clear();
            }
        });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }
}

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
               <button mat-button [mat-dialog-close]="false">Cancel</button>
               <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
             </div>`
})
export class VolunteerDialog {

    constructor(
        public dialogRef: MatDialogRef<VolunteerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: boolean) { }
}