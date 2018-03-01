import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatSortModule,
  MatToolbarModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material'

import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { DxSchedulerModule, DxTemplateModule } from 'devextreme-angular';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';

/* My Components */
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './account/admin/admin.component';
import { VolunteerDialog } from './account/admin/admin.component';
import { ScheduleDialog } from './account/admin/admin.component';
import { ContactComponent } from './contact/contact.component';
import { ScheduleComponent } from './schedule/schedule.component';

/* Services */
import { SchedulesService } from './schedule/shared/schedule.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminComponent,
    NavbarComponent,
    FooterComponent,
    AccountComponent,
    ContactComponent,
    ScheduleComponent,
    VolunteerDialog,
    ScheduleDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpModule,
    CoreModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    DxSchedulerModule,
    DxTemplateModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  entryComponents: [VolunteerDialog, ScheduleDialog],
  providers: [AngularFirestore, SchedulesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
