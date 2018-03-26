import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/* Angular Material */
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatSortModule,
  MatToolbarModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material'
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';

/* Angular Calendar */
import { CalendarModule } from 'angular-calendar';

/* Firebase */
import { AngularFireModule } from 'angularfire2';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

/* My Config */
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

/* Services */
import { ScheduleService } from './schedule/shared/schedule.service';
import { LocationService } from './schedule/shared/location.service';

/* My Components */
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './account/admin/admin.component';
import { VolunteerDialog } from './account/admin/dialogs/volunteer.component';
import { ScheduleDialog } from './account/admin/dialogs/schedule.component';
import { ScheduleDeleteDialog } from './account/admin/dialogs/schedule-delete.component';
import { ContactComponent } from './contact/contact.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { EventDialog } from './components/scheduler/dialogs/event.component';
import { EventDeleteDialog } from './components/scheduler/dialogs/delete.component';
import { SchedulesComponent } from './schedules/schedules.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminComponent,
    NavbarComponent,
    FooterComponent,
    AccountComponent,
    ContactComponent,
    SchedulerComponent,
    ScheduleDeleteDialog,
    VolunteerDialog,
    ScheduleDialog,
    EventDialog,
    EventDeleteDialog,
    SchedulesComponent,
    ScheduleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    CoreModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatMomentDatetimeModule,
    MatDatetimepickerModule,
    CalendarModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  entryComponents: [VolunteerDialog, ScheduleDialog, EventDialog, EventDeleteDialog],
  providers: [AngularFirestore, ScheduleService, ScheduleDeleteDialog, LocationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
