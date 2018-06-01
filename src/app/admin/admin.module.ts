import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'

import {
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule
} from '@angular/material';

// app
import { AdminRoutingModule } from './admin-routing.module'
import { AdminComponent } from './admin.component';
import { VolunteerDialog } from './dialogs/volunteer.component';
import { UserDialog } from './dialogs/user.component';
import { ViewScheduleDialog } from './dialogs/schedule-view.component';
import { ScheduleDialog } from './dialogs/schedule.component';
import { ScheduleDeleteDialog } from './dialogs/schedule-delete.component';

// utilities
import { PipesModule } from '../utilities/pipes/pipes.module'

@NgModule({
    imports: [
        AdminRoutingModule,
        PipesModule,
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatToolbarModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule
    ],
    declarations: [
        AdminComponent,
        VolunteerDialog,
        UserDialog,
        ViewScheduleDialog,
        ScheduleDialog,
        ScheduleDeleteDialog
    ],
    entryComponents: [
        VolunteerDialog,
        UserDialog,
        ViewScheduleDialog,
        ScheduleDialog,
        ScheduleDeleteDialog
    ]
})
export class AdminModule { }
