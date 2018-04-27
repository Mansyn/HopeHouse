import './polyfills';

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
  MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
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
import { ProfileService } from './core/profile.service';

/* Sub Components */
import { DisableControlDirective } from './utilities/directives/disable-control.directive';
import { FocusDirective } from './utilities/directives/focus.directive'
import { PhonePipe } from './utilities/pipes/phone.pipe'

/* My Components */
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './admin/admin.component';
import { VolunteerDialog } from './admin/dialogs/volunteer.component';
import { UserDialog } from './admin/dialogs/user.component';
import { ViewScheduleDialog } from './admin/dialogs/schedule-view.component';
import { ScheduleDialog } from './admin/dialogs/schedule.component';
import { ScheduleDeleteDialog } from './admin/dialogs/schedule-delete.component';
import { ContactComponent } from './contact/contact.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { EventDialog } from './components/scheduler/dialogs/event.component';
import { EventDeleteDialog } from './components/scheduler/dialogs/delete.component';
import { SchedulesComponent } from './schedules/schedules.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { RegisterComponent } from './account/register/register.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LoginComponent } from './account/login/login.component';

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
    UserDialog,
    ViewScheduleDialog,
    ScheduleDialog,
    EventDialog,
    EventDeleteDialog,
    SchedulesComponent,
    ScheduleComponent,
    RegisterComponent,
    FileUploadComponent,
    DisableControlDirective,
    FocusDirective,
    PhonePipe,
    LoginComponent
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
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
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
    CalendarModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  entryComponents: [VolunteerDialog, UserDialog, ViewScheduleDialog, ScheduleDialog, EventDialog, EventDeleteDialog],
  providers: [AngularFirestore, ScheduleService, ScheduleDeleteDialog, LocationService, ProfileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
