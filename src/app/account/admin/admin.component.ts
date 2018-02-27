import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { AuthService } from '../../core/auth.service';
import { User } from '../../core/user';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements AfterViewInit {

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns = ['select', 'displayName', 'email'];
    dataSource = new MatTableDataSource<User>();
    selection = new SelectionModel<User>(true, []);

    constructor(public auth: AuthService, public dialog: MatDialog, public snackBar: MatSnackBar) { }

    ngAfterViewInit() {
        this.auth.getAllUsers().subscribe(data => {
            this.dataSource.data = data;
            console.log(this.dataSource.data);
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected == numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    volunteerDialog(): void {
        let targets = this.selection.selected;

        let dialogRef = this.dialog.open(VolunteerDialog, {
            width: '350px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                targets.forEach((target) => {
                    this.auth.setUserVolunteer(target, true);
                });
                this.openSnackBar('Volunteer Set', 'OKAY');
                this.selection.clear();
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
    template: `<h1 mat-dialog-title>Volunteer</h1>
             <div mat-dialog-content>
               <p>Are you sure you want to set user(s) to volunteer?</p>
             </div>
             <div mat-dialog-actions align="end">
               <button mat-button [mat-dialog-close]="false">Cancel</button>
               <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Ok</button>
             </div>`
})
export class VolunteerDialog {

    constructor(
        public dialogRef: MatDialogRef<VolunteerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }
}